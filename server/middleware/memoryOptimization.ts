import { Request, Response, NextFunction } from 'express';

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

interface MemoryThresholds {
  warning: number;
  critical: number;
}

class MemoryMonitor {
  private static instance: MemoryMonitor;
  private thresholds: MemoryThresholds = {
    warning: 100 * 1024 * 1024, // 100MB
    critical: 150 * 1024 * 1024  // 150MB
  };
  
  private memoryHistory: MemoryStats[] = [];
  private maxHistorySize = 100;
  
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  getMemoryStats(): MemoryStats {
    const memory = process.memoryUsage();
    return {
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
      rss: memory.rss,
      arrayBuffers: memory.arrayBuffers
    };
  }

  recordMemoryUsage(): void {
    const stats = this.getMemoryStats();
    this.memoryHistory.push(stats);
    
    // Keep only recent history
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }
    
    // Check for memory warnings
    if (stats.heapUsed > this.thresholds.critical) {
      console.error(`🚨 Critical memory usage: ${this.formatBytes(stats.heapUsed)}`);
      this.triggerGarbageCollection();
    } else if (stats.heapUsed > this.thresholds.warning) {
      console.warn(`⚠️  High memory usage: ${this.formatBytes(stats.heapUsed)}`);
    }
  }

  private formatBytes(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)}MB`;
  }

  private triggerGarbageCollection(): void {
    if (global.gc) {
      global.gc();
      console.log('🗑️  Manual garbage collection triggered');
    }
  }

  getMemoryTrends(): { average: number; peak: number; current: number } {
    if (this.memoryHistory.length === 0) {
      return { average: 0, peak: 0, current: 0 };
    }

    const heapUsages = this.memoryHistory.map(stat => stat.heapUsed);
    const average = heapUsages.reduce((sum, usage) => sum + usage, 0) / heapUsages.length;
    const peak = Math.max(...heapUsages);
    const current = heapUsages[heapUsages.length - 1];

    return { average, peak, current };
  }
}

export const memoryMonitor = MemoryMonitor.getInstance();

// Middleware to track memory usage per request
export const memoryTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startMemory = memoryMonitor.getMemoryStats();
  
  res.on('finish', () => {
    const endMemory = memoryMonitor.getMemoryStats();
    const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;
    
    // Log memory-intensive requests
    if (memoryDiff > 5 * 1024 * 1024) { // 5MB threshold
      console.warn(`🏋️  Memory-intensive request: ${req.method} ${req.path} (+${memoryMonitor['formatBytes'](memoryDiff)})`);
    }
  });
  
  next();
};

// Periodic memory monitoring
export const startMemoryMonitoring = () => {
  setInterval(() => {
    memoryMonitor.recordMemoryUsage();
  }, 30000); // Check every 30 seconds
  
  console.log('📊 Memory monitoring started');
};

// Memory cleanup utilities
export const cleanupMemory = () => {
  if (global.gc) {
    global.gc();
  }
  
  // Clear any large caches if they exist
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Memory cleanup completed');
  }
};

// Request-specific memory limits
export const memoryLimitMiddleware = (limit: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const currentMemory = memoryMonitor.getMemoryStats();
    
    if (currentMemory.heapUsed > limit) {
      return res.status(503).json({
        error: 'Server temporarily unavailable due to high memory usage',
        code: 'MEMORY_LIMIT_EXCEEDED'
      });
    }
    
    next();
  };
};

export { MemoryMonitor };