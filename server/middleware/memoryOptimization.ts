import { NextFunction, Request, Response } from 'express';

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

interface MemoryThresholds {
  warning: number; // MB
  critical: number; // MB
  forceGC: number; // MB
}

class MemoryManager {
  private thresholds: MemoryThresholds;
  private gcInterval: NodeJS.Timeout | null = null;
  private memoryHistory: MemoryStats[] = [];
  private maxHistoryLength = 100;
  private leakDetectionEnabled = true;

  constructor(thresholds: MemoryThresholds = {
    warning: 256,
    critical: 512,
    forceGC: 400
  }) {
    this.thresholds = thresholds;
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring(): void {
    // Monitor memory every 30 seconds
    this.gcInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);

    // Clean up memory history every hour
    setInterval(() => {
      this.cleanupMemoryHistory();
    }, 3600000);
  }

  private checkMemoryUsage(): void {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const rssUsedMB = memoryUsage.rss / 1024 / 1024;

    // Store memory stats
    this.memoryHistory.push({
      heapUsed: heapUsedMB,
      heapTotal: memoryUsage.heapTotal / 1024 / 1024,
      external: memoryUsage.external / 1024 / 1024,
      rss: rssUsedMB,
      arrayBuffers: memoryUsage.arrayBuffers / 1024 / 1024,
    });

    // Check thresholds
    if (heapUsedMB > this.thresholds.critical) {
      console.error(`🚨 CRITICAL: Memory usage at ${Math.round(heapUsedMB)}MB`);
      this.emergencyMemoryCleanup();
    } else if (heapUsedMB > this.thresholds.warning) {
      console.warn(`⚠️  WARNING: Memory usage at ${Math.round(heapUsedMB)}MB`);
    }

    // Force garbage collection if needed
    if (heapUsedMB > this.thresholds.forceGC && global.gc) {
      console.log(`🧹 Forcing garbage collection at ${Math.round(heapUsedMB)}MB`);
      global.gc();
    }

    // Detect memory leaks
    if (this.leakDetectionEnabled) {
      this.detectMemoryLeaks();
    }
  }

  private emergencyMemoryCleanup(): void {
    console.log('🚨 Initiating emergency memory cleanup...');
    
    // Force garbage collection multiple times
    if (global.gc) {
      global.gc();
      setTimeout(() => global.gc && global.gc(), 100);
      setTimeout(() => global.gc && global.gc(), 500);
    }

    // Clear any large caches (implement based on your app's caches)
    this.clearApplicationCaches();

    // Log post-cleanup memory usage
    setTimeout(() => {
      const postCleanup = process.memoryUsage();
      console.log(`🧹 Post-cleanup memory: ${Math.round(postCleanup.heapUsed / 1024 / 1024)}MB`);
    }, 1000);
  }

  private clearApplicationCaches(): void {
    // Clear Node.js internal caches
    if (require.cache) {
      Object.keys(require.cache).forEach(key => {
        if (key.includes('node_modules')) return; // Keep node_modules
        delete require.cache[key];
      });
    }

    // Clear any application-specific caches here
    // This would be specific to your application's caching implementation
  }

  private detectMemoryLeaks(): void {
    if (this.memoryHistory.length < 10) return;

    const recent = this.memoryHistory.slice(-10);
    const trend = this.calculateMemoryTrend(recent);

    // If memory is consistently increasing, it might be a leak
    if (trend > 5) { // 5MB increase trend
      console.warn(`🔍 Potential memory leak detected: ${trend.toFixed(2)}MB/minute trend`);
    }
  }

  private calculateMemoryTrend(history: MemoryStats[]): number {
    if (history.length < 2) return 0;

    const first = history[0].heapUsed;
    const last = history[history.length - 1].heapUsed;
    const timeSpan = history.length * 0.5; // 30-second intervals

    return (last - first) / timeSpan;
  }

  private cleanupMemoryHistory(): void {
    if (this.memoryHistory.length > this.maxHistoryLength) {
      this.memoryHistory = this.memoryHistory.slice(-this.maxHistoryLength);
    }
  }

  getMemoryStats(): {
    current: MemoryStats;
    trend: number;
    history: MemoryStats[];
    thresholds: MemoryThresholds;
  } {
    const memoryUsage = process.memoryUsage();
    const current = {
      heapUsed: memoryUsage.heapUsed / 1024 / 1024,
      heapTotal: memoryUsage.heapTotal / 1024 / 1024,
      external: memoryUsage.external / 1024 / 1024,
      rss: memoryUsage.rss / 1024 / 1024,
      arrayBuffers: memoryUsage.arrayBuffers / 1024 / 1024,
    };

    return {
      current,
      trend: this.calculateMemoryTrend(this.memoryHistory.slice(-10)),
      history: this.memoryHistory.slice(-50), // Last 50 measurements
      thresholds: this.thresholds,
    };
  }

  destroy(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
    }
  }
}

// Stream processing optimization
class StreamOptimizer {
  private static readonly CHUNK_SIZE = 64 * 1024; // 64KB chunks
  
  static optimizeStream(req: Request, res: Response): void {
    // Set optimal chunk size for streaming
    if (req.url?.includes('/api/export') || req.url?.includes('/api/download')) {
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
    }
  }

  static createBackpressureHandler() {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalWrite = res.write;
      const originalEnd = res.end;
      let writeBuffer: Buffer[] = [];
      let isWriting = false;

      res.write = function(chunk: any, encoding?: any): boolean {
        if (!isWriting && writeBuffer.length === 0) {
          return originalWrite.call(this, chunk, encoding);
        }

        writeBuffer.push(Buffer.from(chunk, encoding));
        if (!isWriting) {
          isWriting = true;
          process.nextTick(() => {
            this.flushBuffer();
          });
        }
        return true;
      };

      (res as any).flushBuffer = function() {
        while (writeBuffer.length > 0 && this.writable) {
          const chunk = writeBuffer.shift();
          if (!originalWrite.call(this, chunk)) {
            // Backpressure detected, wait for drain
            this.once('drain', () => {
              if (writeBuffer.length > 0) {
                this.flushBuffer();
              } else {
                isWriting = false;
              }
            });
            return;
          }
        }
        isWriting = false;
      };

      res.end = function(chunk?: any, encoding?: any): Response {
        if (chunk) {
          this.write(chunk, encoding);
        }
        return originalEnd.call(this);
      };

      next();
    };
  }
}

// Object pooling for frequently created objects
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }

  size(): number {
    return this.pool.length;
  }
}

// Buffer pool for handling large data
class BufferPool {
  private pools: Map<number, Buffer[]> = new Map();
  private readonly MAX_POOL_SIZE = 10;

  getBuffer(size: number): Buffer {
    const pool = this.pools.get(size);
    if (pool && pool.length > 0) {
      return pool.pop()!;
    }
    return Buffer.allocUnsafe(size);
  }

  releaseBuffer(buffer: Buffer): void {
    const size = buffer.length;
    if (!this.pools.has(size)) {
      this.pools.set(size, []);
    }
    
    const pool = this.pools.get(size)!;
    if (pool.length < this.MAX_POOL_SIZE) {
      buffer.fill(0); // Clear the buffer
      pool.push(buffer);
    }
  }

  clear(): void {
    this.pools.clear();
  }
}

// Global instances
const memoryManager = new MemoryManager();
const bufferPool = new BufferPool();

// Request object pool
const requestDataPool = new ObjectPool(
  () => ({ body: null, params: {}, query: {}, headers: {} }),
  (obj) => {
    obj.body = null;
    obj.params = {};
    obj.query = {};
    obj.headers = {};
  }
);

// Memory optimization middleware
export const memoryOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Optimize streams
  StreamOptimizer.optimizeStream(req, res);

  // Add memory stats to response headers (in development)
  if (process.env.NODE_ENV === 'development') {
    const stats = memoryManager.getMemoryStats();
    res.setHeader('X-Memory-Heap', `${Math.round(stats.current.heapUsed)}MB`);
    res.setHeader('X-Memory-RSS', `${Math.round(stats.current.rss)}MB`);
  }

  // Clean up after request
  res.on('finish', () => {
    // Release any pooled objects
    if ((req as any).pooledData) {
      requestDataPool.release((req as any).pooledData);
    }
  });

  next();
};

// Large file handling middleware
export const largeFileMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Handle large file uploads
  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length'], 10);
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Payload too large',
        maxSize: maxSize,
        receivedSize: contentLength,
      });
    }
  }

  next();
};

// Memory leak detection middleware
export const memoryLeakDetectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startMemory = process.memoryUsage().heapUsed;

  res.on('finish', () => {
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDiff = (endMemory - startMemory) / 1024 / 1024;

    // Log if request caused significant memory increase
    if (memoryDiff > 10) { // 10MB
      console.warn(`🔍 Large memory allocation: ${req.method} ${req.url} (+${memoryDiff.toFixed(2)}MB)`);
    }
  });

  next();
};

// Memory stats endpoint
export const memoryStatsHandler = (req: Request, res: Response) => {
  const stats = memoryManager.getMemoryStats();
  const processStats = {
    pid: process.pid,
    uptime: process.uptime(),
    cpuUsage: process.cpuUsage(),
    resourceUsage: process.resourceUsage ? process.resourceUsage() : null,
  };

  res.json({
    memory: stats,
    process: processStats,
    bufferPool: {
      pools: bufferPool.clear(), // This would need a getter method
    },
    objectPools: {
      requestData: requestDataPool.size(),
    },
  });
};

// Force garbage collection endpoint (for development)
export const forceGCHandler = (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'production' && global.gc) {
    const beforeGC = process.memoryUsage();
    global.gc();
    const afterGC = process.memoryUsage();
    
    res.json({
      message: 'Garbage collection forced',
      before: {
        heapUsed: Math.round(beforeGC.heapUsed / 1024 / 1024),
        heapTotal: Math.round(beforeGC.heapTotal / 1024 / 1024),
      },
      after: {
        heapUsed: Math.round(afterGC.heapUsed / 1024 / 1024),
        heapTotal: Math.round(afterGC.heapTotal / 1024 / 1024),
      },
      freed: Math.round((beforeGC.heapUsed - afterGC.heapUsed) / 1024 / 1024),
    });
  } else {
    res.status(400).json({
      error: 'Garbage collection not available or not in development mode',
    });
  }
};

// Export memory optimization utilities
export const memoryOptimization = {
  middleware: memoryOptimizationMiddleware,
  largeFile: largeFileMiddleware,
  leakDetection: memoryLeakDetectionMiddleware,
  backpressure: StreamOptimizer.createBackpressureHandler(),
  manager: memoryManager,
  bufferPool,
  requestDataPool,
  stats: memoryStatsHandler,
  forceGC: forceGCHandler,
};