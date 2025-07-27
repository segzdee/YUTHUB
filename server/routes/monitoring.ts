import { Router } from 'express';
import { memoryMonitor } from '../middleware/memoryOptimization';
import { performanceOptimizer } from '../middleware/performanceOptimization';
import { errorTracker } from '../middleware/errorHandling';
import { getPoolStats } from '../db';

const router = Router();

// Memory monitoring endpoints
router.get('/memory', (req, res) => {
  const memoryStats = memoryMonitor.getMemoryStats();
  const memoryTrends = memoryMonitor.getMemoryTrends();

  res.json({
    current: memoryStats,
    trends: memoryTrends,
    formatted: {
      heapUsed: `${(memoryStats.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memoryStats.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(memoryStats.external / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(memoryStats.rss / 1024 / 1024).toFixed(2)}MB`,
    },
  });
});

// Performance monitoring endpoints
router.get('/performance', (req, res) => {
  const performanceMetrics = performanceOptimizer.getPerformanceMetrics();

  res.json({
    metrics: performanceMetrics,
    timestamp: new Date().toISOString(),
  });
});

// Error tracking endpoints
router.get('/errors', (req, res) => {
  const errorMetrics = errorTracker.getErrorMetrics();

  res.json({
    errors: errorMetrics,
    timestamp: new Date().toISOString(),
  });
});

// Database pool monitoring
router.get('/database', (req, res) => {
  const poolStats = getPoolStats();

  res.json({
    pool: poolStats,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  const memoryStats = memoryMonitor.getMemoryStats();
  const poolStats = getPoolStats();

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      memory: memoryStats.heapUsed < 150 * 1024 * 1024 ? 'healthy' : 'warning',
      database: poolStats.totalConnections < 12 ? 'healthy' : 'warning',
      uptime: process.uptime(),
    },
  };

  const isHealthy = Object.values(health.services).every(
    service => service === 'healthy' || typeof service === 'number'
  );

  res.status(isHealthy ? 200 : 503).json(health);
});

// System metrics endpoint
router.get('/system', (req, res) => {
  const memoryStats = memoryMonitor.getMemoryStats();
  const memoryTrends = memoryMonitor.getMemoryTrends();
  const performanceMetrics = performanceOptimizer.getPerformanceMetrics();
  const errorMetrics = errorTracker.getErrorMetrics();
  const poolStats = getPoolStats();

  res.json({
    system: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      cpuUsage: process.cpuUsage(),
      processId: process.pid,
    },
    memory: {
      current: memoryStats,
      trends: memoryTrends,
    },
    performance: performanceMetrics,
    errors: errorMetrics,
    database: poolStats,
    timestamp: new Date().toISOString(),
  });
});

// Clear caches endpoint
router.post('/clear-caches', (req, res) => {
  performanceOptimizer.clearCache();
  errorTracker.clearMetrics();

  res.json({
    message: 'Caches cleared successfully',
    timestamp: new Date().toISOString(),
  });
});

export default router;
