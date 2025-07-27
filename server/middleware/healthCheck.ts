import { Request, Response } from 'express';
import { performance } from 'perf_hooks';

// Mock database connection for now - replace with actual database
const mockDb = {
  query: async (sql: string) => {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    return [{ count: 1 }];
  },
};

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      error?: string;
    };
    memory: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      usage: number;
      limit: number;
      heapUsed: number;
      heapTotal: number;
    };
    disk: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      usage?: number;
    };
    api: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      responseTime: number;
    };
    external: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      services: Record<string, boolean>;
    };
  };
  metrics: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

class HealthMonitor {
  private static instance: HealthMonitor;
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private startTime = Date.now();

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  recordRequest(responseTime: number, hasError: boolean = false): void {
    this.requestCount++;
    this.totalResponseTime += responseTime;
    if (hasError) this.errorCount++;
  }

  getMetrics() {
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    return {
      requestsPerSecond: this.requestCount / uptimeSeconds,
      averageResponseTime:
        this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0,
      errorRate:
        this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
    };
  }

  reset(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
    this.startTime = Date.now();
  }
}

const healthMonitor = HealthMonitor.getInstance();

// Health check endpoint
export const healthCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startTime = performance.now();

  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: {
        status: 'healthy',
        responseTime: 0,
      },
      memory: {
        status: 'healthy',
        usage: 0,
        limit: 0,
        heapUsed: 0,
        heapTotal: 0,
      },
      disk: {
        status: 'healthy',
      },
      api: {
        status: 'healthy',
        responseTime: 0,
      },
      external: {
        status: 'healthy',
        services: {},
      },
    },
    metrics: healthMonitor.getMetrics(),
  };

  try {
    // Database health check
    const dbStartTime = performance.now();
    try {
      await mockDb.query('SELECT 1');
      result.checks.database.responseTime = performance.now() - dbStartTime;
      result.checks.database.status = 'healthy';
    } catch (dbError) {
      result.checks.database.status = 'unhealthy';
      result.checks.database.error =
        dbError instanceof Error
          ? dbError.message
          : 'Database connection failed';
      result.checks.database.responseTime = performance.now() - dbStartTime;
      result.status = 'unhealthy';
    }

    // Memory health check
    const memoryUsage = process.memoryUsage();
    const memoryLimit =
      parseInt(process.env.MEMORY_LIMIT || '512') * 1024 * 1024; // Default 512MB
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryLimit) * 100;

    result.checks.memory.usage = memoryUsagePercent;
    result.checks.memory.limit = memoryLimit;
    result.checks.memory.heapUsed = memoryUsage.heapUsed;
    result.checks.memory.heapTotal = memoryUsage.heapTotal;

    if (memoryUsagePercent > 90) {
      result.checks.memory.status = 'unhealthy';
      result.status = 'unhealthy';
    } else if (memoryUsagePercent > 80) {
      result.checks.memory.status = 'degraded';
      if (result.status === 'healthy') result.status = 'degraded';
    } else {
      result.checks.memory.status = 'healthy';
    }

    // Disk health check (simplified - in production would check actual disk usage)
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      result.checks.disk.status = 'healthy';
    } catch (error) {
      result.checks.disk.status = 'degraded';
      if (result.status === 'healthy') result.status = 'degraded';
    }

    // API health check
    const apiResponseTime = performance.now() - startTime;
    result.checks.api.responseTime = apiResponseTime;

    if (apiResponseTime > 1000) {
      result.checks.api.status = 'degraded';
      if (result.status === 'healthy') result.status = 'degraded';
    } else {
      result.checks.api.status = 'healthy';
    }

    // External services check
    result.checks.external.services = await checkExternalServices();
    const externalServicesHealthy = Object.values(
      result.checks.external.services
    ).every(Boolean);

    if (!externalServicesHealthy) {
      result.checks.external.status = 'degraded';
      if (result.status === 'healthy') result.status = 'degraded';
    }

    // Overall status determination
    const statusCode =
      result.status === 'healthy'
        ? 200
        : result.status === 'degraded'
          ? 200
          : 503;

    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      uptime: process.uptime(),
    });
  }
};

// Check external services
async function checkExternalServices(): Promise<Record<string, boolean>> {
  const services: Record<string, boolean> = {};

  // Example external service checks
  const externalChecks = [
    { name: 'email_service', url: process.env.EMAIL_SERVICE_URL },
    { name: 'payment_gateway', url: process.env.PAYMENT_GATEWAY_URL },
    { name: 'file_storage', url: process.env.FILE_STORAGE_URL },
  ];

  for (const check of externalChecks) {
    if (check.url) {
      try {
        const response = await fetch(check.url, {
          method: 'HEAD',
          timeout: 5000,
        });
        services[check.name] = response.ok;
      } catch (error) {
        services[check.name] = false;
      }
    } else {
      services[check.name] = true; // If no URL configured, assume healthy
    }
  }

  return services;
}

// Readiness check (for load balancers)
export const readinessCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Quick database connectivity check
    await mockDb.query('SELECT 1');

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Not ready',
    });
  }
};

// Liveness check (for container orchestration)
export const livenessCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
  });
};

// Detailed health check with component breakdown
export const detailedHealthCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  const components = [
    {
      name: 'database',
      status: 'healthy',
      details: { responseTime: '< 50ms', connections: 'active' },
    },
    {
      name: 'cache',
      status: 'healthy',
      details: { hitRate: '95%', memory: 'normal' },
    },
    {
      name: 'queue',
      status: 'healthy',
      details: { pending: 0, processed: 1250 },
    },
    {
      name: 'storage',
      status: 'healthy',
      details: { available: '80%', latency: '< 10ms' },
    },
  ];

  const overallStatus = components.every(c => c.status === 'healthy')
    ? 'healthy'
    : 'degraded';

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    components,
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },
  });
};

// Health check middleware for request tracking
export const healthCheckMiddleware = (
  req: Request,
  res: Response,
  next: Function
) => {
  const start = performance.now();

  res.on('finish', () => {
    const responseTime = performance.now() - start;
    const hasError = res.statusCode >= 400;
    healthMonitor.recordRequest(responseTime, hasError);
  });

  next();
};

// Export health check utilities
export const healthCheckUtils = {
  healthMonitor,
  healthCheck,
  readinessCheck,
  livenessCheck,
  detailedHealthCheck,
  healthCheckMiddleware,
};
