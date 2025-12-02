import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import compression from 'compression';
import morgan from 'morgan';
import { setupSecurity, errorHandler as securityErrorHandler } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';
import healthRoutes from './routes/health.js';
import { setupWebSocket } from './websocket.js';
import { initializeScheduledJobs } from './jobs/scheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup security middleware
setupSecurity(app);

// Health check routes (before auth)
app.use('/api/health', healthRoutes);

// API routes
app.use('/api', apiRoutes);

// Login endpoint redirect (for compatibility)
app.get('/api/login', (req, res) => {
  res.redirect('/login');
});

// Serve static files from the dist/public directory
const staticPath = path.join(__dirname, '../dist/public');
app.use(express.static(staticPath));

// Handle React routing - return index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return notFoundHandler(req, res);
  }
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Global error handler (must be last)
app.use(errorHandler);

// Setup WebSocket server with Socket.IO
setupWebSocket(server);

// Initialize scheduled background jobs
initializeScheduledJobs();

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏠 YUTHUB Housing Platform API Server                  ║
║                                                           ║
║   Server running on: http://0.0.0.0:${PORT}                 ║
║   WebSocket: Socket.IO on port ${PORT}                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
║                                                           ║
║   Features:                                               ║
║   ✅ JWT Authentication                                   ║
║   ✅ Role-Based Access Control                           ║
║   ✅ Organization Isolation                              ║
║   ✅ Real-time WebSocket Updates                         ║
║   ✅ Stripe Webhooks                                     ║
║   ✅ Scheduled Background Jobs                           ║
║   ✅ Audit Logging                                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
