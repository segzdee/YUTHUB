import compression from 'compression';
import { NextFunction, Request, Response } from 'express';
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }>;
  cacheHitRate: number;
  memoryUsage: NodeJS.MemoryUsage;
}

class ResponseCache {
  private cache: LRUCache<string, { data: any; etag: string; timestamp: number }>;
  private hitCount = 0;
  private missCount = 0;

  constructor(options: CacheOptions) {
    this.cache = new LRUCache({
      max: options.maxSize,
      ttl: options.ttl,
    });
  }

  get(key: string): { data: any; etag: string } | null {
    const cached = this.cache.get(key);
    if (cached) {
      this.hitCount++;
      return { data: cached.data, etag: cached.etag };
    }
    this.missCount++;
    return null;
  }

  set(key: string, data: any, etag: string): void {
    this.cache.set(key, {
      data,
      etag,
      timestamp: Date.now(),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total === 0 ? 0 : this.hitCount / total;
  }

  getStats() {
    return {
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.getHitRate(),
    };
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    slowQueries: [],
    cacheHitRate: 0,
    memoryUsage: process.memoryUsage(),
  };
  private responseTimes: number[] = [];
  private maxSlowQueries = 100;

  recordRequest(responseTime: number): void {
    this.metrics.requestCount++;
    this.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
    
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  recordSlowQuery(query: string, duration: number): void {
    this.metrics.slowQueries.push({
      query,
      duration,
      timestamp: new Date(),
    });

    // Keep only recent slow queries
    if (this.metrics.slowQueries.length > this.maxSlowQueries) {
      this.metrics.slowQueries.shift();
    }
  }

  updateCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
  }

  updateMemoryUsage(): void {
    this.metrics.memoryUsage = process.memoryUsage();
  }

  getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  getHealthStatus() {
    const metrics = this.getMetrics();
    const memoryUsageMB = metrics.memoryUsage.heapUsed / 1024 / 1024;
    
    return {
      healthy: metrics.averageResponseTime < 1000 && memoryUsageMB < 512,
      averageResponseTime: metrics.averageResponseTime,
      memoryUsageMB: Math.round(memoryUsageMB),
      requestCount: metrics.requestCount,
      cacheHitRate: metrics.cacheHitRate,
    };
  }
}

// Global instances
const responseCache = new ResponseCache({
  maxSize: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
});

const performanceMonitor = new PerformanceMonitor();

// Response time tracking middleware
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    performanceMonitor.recordRequest(responseTime);
    
    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`Slow request: ${req.method} ${req.url} - ${responseTime}ms`);
    }
    
    // Add response time header
    res.set('X-Response-Time', `${responseTime}ms`);
  });
  
  next();
};

// Response caching middleware
export const cacheMiddleware = (options: { ttl?: number; skipPaths?: string[] } = {}) => {
  const { ttl = 5 * 60 * 1000, skipPaths = [] } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for certain paths
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const cacheKey = `${req.method}:${req.url}`;
    const cached = responseCache.get(cacheKey);
    
    if (cached) {
      // Check if client has the cached version
      if (req.get('If-None-Match') === cached.etag) {
        return res.status(304).end();
      }
      
      res.set('ETag', cached.etag);
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64')}"`;
      res.set('ETag', etag);
      res.set('X-Cache', 'MISS');
      
      // Cache the response
      responseCache.set(cacheKey, data, etag);
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Compression middleware with dynamic level
export const compressionMiddleware = compression({
  level: (req, res) => {
    // Use higher compression for API responses
    if (req.path.startsWith('/api/')) {
      return 6;
    }
    return 1;
  },
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress images or already compressed content
    const contentType = res.get('Content-Type') || '';
    return !contentType.includes('image/') && 
           !contentType.includes('application/octet-stream');
  },
});

// Memory usage monitoring middleware
export const memoryMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
  
  // Warn if memory usage is high
  if (heapUsedMB > 512) {
    console.warn(`High memory usage: ${Math.round(heapUsedMB)}MB`);
  }
  
  // Add memory usage header
  res.set('X-Memory-Usage', `${Math.round(heapUsedMB)}MB`);
  
  next();
};

// Database query optimization middleware
export const queryOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Track database queries (this would integrate with your ORM)
  const originalQuery = req.query;
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow database operations
    if (duration > 500) {
      performanceMonitor.recordSlowQuery(
        `${req.method} ${req.url}`,
        duration
      );
    }
  });
  
  next();
};

// Resource cleanup middleware
export const resourceCleanupMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Clean up resources on request completion
  res.on('finish', () => {
    // Update cache hit rate
    const cacheStats = responseCache.getStats();
    performanceMonitor.updateCacheHitRate(cacheStats.hitRate);
    
    // Trigger garbage collection periodically
    if (performanceMonitor.getMetrics().requestCount % 1000 === 0) {
      if (global.gc) {
        global.gc();
      }
    }
  });
  
  next();
};

// Performance metrics endpoint
export const performanceMetricsHandler = (req: Request, res: Response) => {
  const metrics = performanceMonitor.getMetrics();
  const cacheStats = responseCache.getStats();
  const healthStatus = performanceMonitor.getHealthStatus();
  
  res.json({
    health: healthStatus,
    metrics: {
      ...metrics,
      cache: cacheStats,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
    },
  });
};

// Cache management endpoints
export const cacheManagementHandlers = {
  getStats: (req: Request, res: Response) => {
    res.json(responseCache.getStats());
  },
  
  clearCache: (req: Request, res: Response) => {
    responseCache.clear();
    res.json({ message: 'Cache cleared successfully' });
  },
  
  deleteKey: (req: Request, res: Response) => {
    const { key } = req.params;
    responseCache.delete(key);
    res.json({ message: `Cache key ${key} deleted` });
  },
};

// Export performance optimization middleware bundle
export const performanceOptimization = {
  responseTime: responseTimeMiddleware,
  cache: cacheMiddleware,
  compression: compressionMiddleware,
  memoryMonitoring: memoryMonitoringMiddleware,
  queryOptimization: queryOptimizationMiddleware,
  resourceCleanup: resourceCleanupMiddleware,
  monitor: performanceMonitor,
  cache: responseCache,
};