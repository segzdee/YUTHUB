import { NextFunction, Request, Response } from 'express';

// Mock dependencies for now - these should be implemented properly
const closeDatabaseConnections = async () => {
  console.log('Closing database connections...');
};

const backgroundJobScheduler = {
  stop: async () => {
    console.log('Stopping background jobs...');
  }
};

export class ComputeLifecycleManager {
  private static instance: ComputeLifecycleManager;
  private shutdownInProgress = false;
  private activeRequests = new Set<string>();
  private gracefulShutdownTimeout = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): ComputeLifecycleManager {
    if (!ComputeLifecycleManager.instance) {
      ComputeLifecycleManager.instance = new ComputeLifecycleManager();
    }
    return ComputeLifecycleManager.instance;
  }

  // Track active requests
  trackRequest(requestId: string): void {
    this.activeRequests.add(requestId);
  }

  // Untrack completed requests
  untrackRequest(requestId: string): void {
    this.activeRequests.delete(requestId);
  }

  // Get active request count
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  // Initiate graceful shutdown
  async gracefulShutdown(signal: string): Promise<void> {
    if (this.shutdownInProgress) {
      console.log('Shutdown already in progress...');
      return;
    }

    this.shutdownInProgress = true;
    console.log(`Received ${signal}, initiating graceful shutdown...`);

    try {
      // Set a timeout for forceful shutdown
      const forceShutdownTimer = setTimeout(() => {
        console.error('Graceful shutdown timeout exceeded, forcing exit...');
        process.exit(1);
      }, this.gracefulShutdownTimeout);

      // 1. Stop accepting new requests (handled by server.close())
      console.log('1. Stopping new request acceptance...');

      // 2. Wait for active requests to complete
      console.log(`2. Waiting for ${this.activeRequests.size} active requests to complete...`);
      while (this.activeRequests.size > 0) {
        console.log(`   ${this.activeRequests.size} requests still active...`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 3. Stop background jobs
      console.log('3. Stopping background jobs...');
      await backgroundJobScheduler.stop();

      // 4. Close database connections
      console.log('4. Closing database connections...');
      await closeDatabaseConnections();

      // 5. Clear the force shutdown timer
      clearTimeout(forceShutdownTimer);

      console.log('Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  // Setup process signal handlers
  setupSignalHandlers(): void {
    // Handle SIGTERM (typical container shutdown)
    process.on('SIGTERM', () => {
      this.gracefulShutdown('SIGTERM');
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      this.gracefulShutdown('SIGINT');
    });

    // Handle SIGUSR2 (nodemon restart)
    process.on('SIGUSR2', () => {
      this.gracefulShutdown('SIGUSR2');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught exception:', error);
      await this.gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      await this.gracefulShutdown('unhandledRejection');
    });
  }

  // Health check for compute lifecycle
  getHealthStatus() {
    return {
      shutdownInProgress: this.shutdownInProgress,
      activeRequests: this.activeRequests.size,
      processId: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }
}

// Request tracking middleware
export const requestTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const lifecycle = ComputeLifecycleManager.getInstance();
  
  // Track the request
  lifecycle.trackRequest(requestId);
  
  // Store request ID for reference
  (req as any).requestId = requestId;
  
  // Untrack when request completes
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    lifecycle.untrackRequest(requestId);
    return originalEnd.apply(res, args);
  };
  
  next();
};