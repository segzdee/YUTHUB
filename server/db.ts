import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Load environment variables if not already loaded
if (!process.env.DATABASE_URL) {
  // Try loading from dotenv for local development
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    // Dotenv might not be available in production
  }
}

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set. Did you forget to provision a database?'
  );
}

// Configure connection pool for optimal performance and compute lifecycle
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Increased for better concurrency
  min: 5, // Higher minimum for faster response
  idleTimeoutMillis: 30000, // Longer idle timeout
  connectionTimeoutMillis: 10000, // Longer connection timeout
  maxUses: 7500, // Higher max uses
  allowExitOnIdle: true,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0, // Immediate keepalive
});

export const db = drizzle({ client: pool, schema });

// Database health monitoring
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const duration = Date.now() - start;

    // Log slow queries (over 1 second)
    if (duration > 1000) {
      // Log slow queries to monitoring system
      // console.warn(`Slow database health check: ${duration}ms`);
    }

    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Connection pool monitoring and lifecycle management
export const getPoolStats = () => {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
    processId: process.pid,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  };
};

// Monitor connection pool health
export const monitorPoolHealth = () => {
  const stats = getPoolStats();

  // Log warnings for potential issues
  if (stats.waitingClients > 0) {
    console.warn(
      `Connection pool pressure detected: ${stats.waitingClients} clients waiting`
    );
  }

  if (stats.totalConnections > 12) {
    console.warn(
      `High connection count: ${stats.totalConnections} connections active`
    );
  }

  // Memory usage monitoring
  const memoryUsageMB = stats.memoryUsage.heapUsed / 1024 / 1024;
  if (memoryUsageMB > 100) {
    console.warn(`High memory usage: ${memoryUsageMB.toFixed(2)}MB heap used`);
  }

  return stats;
};

// Graceful shutdown and compute lifecycle management
export const closeDatabaseConnections = async (): Promise<void> => {
  try {
    console.log('Initiating graceful database shutdown...');

    // Give existing queries time to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Close all connections
    await pool.end();
    console.log('Database connections closed gracefully');
  } catch (error) {
    console.error('Error closing database connections:', error);
    throw error;
  }
};

// Compute lifecycle management
export const handleComputeLifecycle = () => {
  // Handle process termination signals
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await closeDatabaseConnections();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await closeDatabaseConnections();
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async error => {
    console.error('Uncaught exception:', error);
    await closeDatabaseConnections();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    await closeDatabaseConnections();
    process.exit(1);
  });

  // Periodic health monitoring
  setInterval(() => {
    monitorPoolHealth();
  }, 60000); // Check every minute
};
