// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Disable HTTPS for development to fix web server access
process.env.HTTPS_ENABLED = 'false';

import cors from 'cors';
import express from 'express';
import { handleComputeLifecycle } from './db';
import {
  createSecureServer,
  getServerPort,
  setupSSLRedirect,
  setupSecurityHeaders,
  validateSSLCertificate,
} from './https';
import { backgroundJobScheduler } from './jobs/backgroundJobs';
import {
  ComputeLifecycleManager,
  requestTrackingMiddleware,
} from './middleware/computeLifecycle';
import {
  errorHandlingMiddleware,
  notFoundHandler,
} from './middleware/errorHandling';
import { sanitizeInput } from './middleware/inputSanitization';
import { RateLimiter, rateLimiters } from './middleware/rateLimiter';
import {
  cleanupMemory,
  memoryLimitMiddleware,
  memoryTrackingMiddleware,
  startMemoryMonitoring,
} from './middleware/memoryOptimization';
import {
  cacheMiddleware,
  performanceTrackingMiddleware,
  queryOptimizationMiddleware,
} from './middleware/performanceOptimization';
import { registerRoutes } from './routes';
import { log, serveStatic, setupVite } from './vite';
import { WebSocketManager } from './websocket';
import { loadSubscriptionInfo } from './middleware/subscriptionMiddleware';
import {
  extractTokenMiddleware,
  tenantContextMiddleware,
} from './middleware/enhancedAuthMiddleware';
import billingRoutes from './routes/billing';

const app = express();

// CORS configuration for production and development
const corsOrigins =
  process.env.NODE_ENV === 'production'
    ? [
        'https://yuthub.replit.app',
        'https://yuthub.com',
        'https://www.yuthub.com',
        'https://app.yuthub.com',
        'https://admin.yuthub.com',
      ]
    : [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5000',
        'https://yuthub.replit.app',
      ];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, postman, etc.)
      if (!origin) return callback(null, true);

      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Replit preview domains in development
      if (
        process.env.NODE_ENV === 'development' &&
        origin.includes('.replit.dev')
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours
  })
);

// Security middleware
// Rate limiting configuration - enabled for all environments
const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests default
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  message: 'Too many requests from this IP, please try again later.',
};

// Apply appropriate rate limits based on environment
if (process.env.NODE_ENV === 'production') {
  // Strict rate limiting in production
  app.use('/api/auth', rateLimiters.auth.middleware());
  app.use('/api/password-reset', rateLimiters.passwordReset.middleware());
  app.use('/api/upload', rateLimiters.upload.middleware());
  app.use('/api', new RateLimiter({
    windowMs: rateLimitConfig.windowMs,
    maxRequests: rateLimitConfig.maxRequests,
    message: rateLimitConfig.message,
  }).middleware());
} else {
  // More lenient rate limiting in development/staging
  app.use('/api/auth', new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // More attempts allowed in dev
    message: 'Too many authentication attempts',
  }).middleware());
  app.use('/api', new RateLimiter({
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 60, // 1 req/sec average
    message: 'Rate limit exceeded in development',
  }).middleware());
}

console.log(`🛡️ Rate limiting enabled (${process.env.NODE_ENV} mode)`);
app.use(sanitizeInput);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request tracking middleware
app.use(requestTrackingMiddleware);

// Load subscription info for authenticated requests
app.use(loadSubscriptionInfo);

// Enhanced authentication middleware - extract JWT and tenant context
app.use(extractTokenMiddleware);
app.use(tenantContextMiddleware);

// Add memory and performance monitoring
app.use(memoryTrackingMiddleware);
app.use(performanceTrackingMiddleware);

// Add memory limit protection for high-memory endpoints
app.use('/api/platform-admin', memoryLimitMiddleware(120 * 1024 * 1024)); // 120MB limit
app.use('/api/reports', memoryLimitMiddleware(100 * 1024 * 1024)); // 100MB limit

// Add response caching for static endpoints
app.use(
  '/api/properties',
  cacheMiddleware({ maxSize: 500, ttl: 2 * 60 * 1000 })
); // 2 minutes
app.use('/api/metrics', cacheMiddleware({ maxSize: 100, ttl: 30 * 1000 })); // 30 seconds

// Add query optimization hints
app.use('/api', queryOptimizationMiddleware);

// Setup SSL redirect and security headers
setupSSLRedirect(app);
setupSecurityHeaders(app);

// Mount billing routes (before auth to handle Stripe webhooks)
app.use('/api/billing', billingRoutes);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
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

  // Validate SSL certificate if configured
  if (process.env.HTTPS_ENABLED === 'true') {
    console.log('🔍 Validating SSL certificate...');
    if (validateSSLCertificate()) {
      console.log('✅ SSL certificate validation passed');
    } else {
      console.log(
        '⚠️  SSL certificate validation failed, falling back to HTTP'
      );
    }
  }

  // Create HTTPS server if SSL is enabled
  let server;
  if (process.env.HTTPS_ENABLED === 'true') {
    server = createSecureServer(app);
    await registerRoutes(app, server);
  } else {
    server = await registerRoutes(app);
  }

  // Setup WebSocket for real-time updates
  // Initialize WebSocket manager
  const wsManager = WebSocketManager.getInstance();
  wsManager.initialize(server);

  // Start background job scheduler
  backgroundJobScheduler.start();

  // Initialize memory monitoring
  startMemoryMonitoring();

  // Setup periodic memory cleanup
  setInterval(
    () => {
      cleanupMemory();
    },
    5 * 60 * 1000
  ); // Every 5 minutes

  console.log('🚀 Server optimization completed');

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Error handling middleware (must be last, after Vite setup)
  app.use(errorHandlingMiddleware);
  app.use(notFoundHandler);

  // Get server configuration (SSL or HTTP)
  const { port, isSSL } = getServerPort();

  // For Replit, always use port 5000 regardless of SSL configuration
  const finalPort = 5000;

  console.log(
    `🌐 Server configuration: ${isSSL ? 'HTTPS' : 'HTTP'} on port ${finalPort}`
  );

  server.listen(
    finalPort,
    process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0',
    () => {
      log(`serving on port ${finalPort} (${isSSL ? 'HTTPS' : 'HTTP'} mode)`);
    }
  );
})();
