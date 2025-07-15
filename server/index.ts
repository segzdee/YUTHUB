import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketManager } from "./websocket";
import { apiRateLimit } from "./middleware/rateLimiter";
import { sanitizeInput } from "./middleware/inputSanitization";
import { backgroundJobScheduler } from "./jobs/backgroundJobs";
import { handleComputeLifecycle, monitorPoolHealth, getPoolStats } from "./db";
import { ComputeLifecycleManager, requestTrackingMiddleware } from "./middleware/computeLifecycle";

const app = express();

// CORS configuration for production and development
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://www.yuthub.com',
      'https://yuthub.com',
      'https://app.yuthub.com',
      'https://admin.yuthub.com'
    ]
  : [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://27891fa9-b276-4e4e-a11a-60ce998c53b2-00-2uromwtwyow5n.janeway.replit.dev'
    ];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));

// Security middleware
// Temporarily disable global rate limiting for development
// app.use(apiRateLimit);
app.use(sanitizeInput);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add request tracking middleware
app.use(requestTrackingMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize compute lifecycle management
  handleComputeLifecycle();
  
  // Initialize enhanced compute lifecycle manager
  const lifecycleManager = ComputeLifecycleManager.getInstance();
  lifecycleManager.setupSignalHandlers();
  
  const server = await registerRoutes(app);
  
  // Setup WebSocket for real-time updates
  // Initialize WebSocket manager
  const wsManager = WebSocketManager.getInstance();
  wsManager.initialize(server);

  // Start background job scheduler
  backgroundJobScheduler.start();

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Structured error logging
    console.error('Server Error:', {
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      },
      timestamp: new Date().toISOString(),
      status,
    });

    // Send user-friendly error response
    res.status(status).json({ 
      message: status === 500 ? "Internal Server Error" : message,
      status,
      timestamp: new Date().toISOString(),
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
