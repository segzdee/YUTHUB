import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { setupSecurity, errorHandler as securityErrorHandler } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { csrfTokenGenerator, csrfProtection, getCsrfToken } from './middleware/csrf.js';
import apiRoutes from './routes/index.js';
import healthRoutes from './routes/health.js';
import { setupWebSocket } from './websocket.js';
import { initializeScheduledJobs } from './jobs/scheduler.js';
import { log } from './utils/logger.js';
import {
  initializeMonitoring,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  shutdown as shutdownMonitoring,
} from './utils/monitoring.js';

dotenv.config();

// Initialize monitoring first
initializeMonitoring();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Sentry request tracking (must be first)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup security middleware
setupSecurity(app);

// CSRF Protection
app.use(csrfTokenGenerator);
app.get('/api/csrf-token', getCsrfToken);
app.use('/api', csrfProtection);

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

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

// Global error handler (must be last)
app.use(errorHandler);

// Setup WebSocket server with Socket.IO
setupWebSocket(server);

// Initialize scheduled background jobs
initializeScheduledJobs();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  log.info(`${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    server.close(() => {
      log.info('HTTP server closed');
    });

    // Flush monitoring events
    await shutdownMonitoring(2000);

    // Give time for cleanup
    setTimeout(() => {
      log.info('Graceful shutdown complete');
      process.exit(0);
    }, 1000);
  } catch (error) {
    log.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server.listen(PORT, '0.0.0.0', () => {
  log.info('Server starting', {
    port: PORT,
    environment: process.env.NODE_ENV,
    features: [
      'JWT Authentication',
      'CSRF Protection',
      'Role-Based Access Control',
      'Organization Isolation',
      'Real-time Updates',
      'Structured Logging',
      'Error Monitoring',
    ],
  });

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
║   ✅ CSRF Protection                                      ║
║   ✅ Role-Based Access Control                           ║
║   ✅ Organization Isolation                              ║
║   ✅ Structured Logging                                   ║
║   ✅ Error Monitoring                                     ║
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
