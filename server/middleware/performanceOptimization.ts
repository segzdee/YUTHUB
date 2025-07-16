import { Request, Response, NextFunction } from 'express';
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private responseCache: LRUCache<string, any>;
  private slowQueryThreshold = 100; // milliseconds
  private requestMetrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();
  
  constructor() {
    this.responseCache = new LRUCache<string, any>({
      max: 1000,
      ttl: 5 * 60 * 1000, // 5 minutes
      allowStale: false,
      updateAgeOnGet: true
    });
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private generateCacheKey(req: Request): string {
    return `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
  }

  cacheResponse(req: Request, data: any, ttl?: number): void {
    const key = this.generateCacheKey(req);
    this.responseCache.set(key, data, { ttl });
  }

  getCachedResponse(req: Request): any | undefined {
    const key = this.generateCacheKey(req);
    return this.responseCache.get(key);
  }

  trackRequestMetrics(path: string, duration: number): void {
    const existing = this.requestMetrics.get(path) || { count: 0, totalTime: 0, avgTime: 0 };
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    
    this.requestMetrics.set(path, existing);
    
    // Log slow requests
    if (duration > this.slowQueryThreshold) {
      console.warn(`🐌 Slow request: ${path} took ${duration}ms`);
    }
  }

  getPerformanceMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    this.requestMetrics.forEach((stats, path) => {
      metrics[path] = {
        requestCount: stats.count,
        averageResponseTime: Math.round(stats.avgTime),
        totalTime: stats.totalTime
      };
    });
    
    return {
      endpoints: metrics,
      cacheStats: {
        size: this.responseCache.size,
        hits: this.responseCache.hits,
        misses: this.responseCache.misses
      }
    };
  }

  clearCache(): void {
    this.responseCache.clear();
    console.log('🗑️  Response cache cleared');
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Middleware for response caching
export const cacheMiddleware = (options: CacheOptions = { maxSize: 1000, ttl: 5 * 60 * 1000 }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cachedResponse = performanceOptimizer.getCachedResponse(req);
    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    res.set('X-Cache', 'MISS');
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(body: any) {
      performanceOptimizer.cacheResponse(req, body, options.ttl);
      return originalJson.call(this, body);
    };

    next();
  };
};

// Middleware for performance tracking
export const performanceTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    performanceOptimizer.trackRequestMetrics(req.path, duration);
  });
  
  next();
};

// Middleware for request compression
export const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add compression headers for large responses
  const originalSend = res.send;
  res.send = function(body: any) {
    if (body && typeof body === 'string' && body.length > 1024) {
      this.set('Content-Encoding', 'gzip');
    }
    return originalSend.call(this, body);
  };
  
  next();
};

// Database query optimization middleware
export const queryOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add query optimization hints
  req.queryHints = {
    useIndex: true,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    select: req.query.select as string || '*'
  };
  
  next();
};

// Declare the custom property
declare global {
  namespace Express {
    interface Request {
      queryHints?: {
        useIndex: boolean;
        limit: number;
        offset: number;
        select: string;
      };
    }
  }
}

export { PerformanceOptimizer };