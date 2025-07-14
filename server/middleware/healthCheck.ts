import { Request, Response } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { sql } from 'drizzle-orm';

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
    };
    disk: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      usage?: number;
    };
  };
}

// Health check endpoint
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: {
        status: 'healthy',
        responseTime: 0
      },
      memory: {
        status: 'healthy',
        usage: 0,
        limit: 0
      },
      disk: {
        status: 'healthy'
      }
    }
  };

  try {
    // Database health check
    const dbStartTime = Date.now();
    try {
      await db.select({ count: sql`count(*)` }).from(users);
      result.checks.database.responseTime = Date.now() - dbStartTime;
      result.checks.database.status = 'healthy';
    } catch (dbError) {
      result.checks.database.status = 'unhealthy';
      result.checks.database.error = dbError instanceof Error ? dbError.message : 'Database connection failed';
      result.checks.database.responseTime = Date.now() - dbStartTime;
      result.status = 'unhealthy';
    }

    // Memory health check
    const memoryUsage = process.memoryUsage();
    const memoryLimit = parseInt(process.env.MEMORY_LIMIT || '512') * 1024 * 1024; // Default 512MB
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryLimit) * 100;
    
    result.checks.memory.usage = memoryUsagePercent;
    result.checks.memory.limit = memoryLimit;
    
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
    result.checks.disk.status = 'healthy';

    // Overall status determination
    const statusCode = result.status === 'healthy' ? 200 : 
                      result.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(result);

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      uptime: process.uptime()
    });
  }
};

// Readiness check (for load balancers)
export const readinessCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Quick database connectivity check
    await db.execute(sql`SELECT 1`);
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Not ready'
    });
  }
};

// Liveness check (for container orchestration)
export const livenessCheck = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};