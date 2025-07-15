import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool for optimal performance and compute lifecycle
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 15, // Maximum number of connections in the pool (reduced for better resource management)
  min: 2,  // Minimum number of connections in the pool (reduced for compute efficiency)
  idleTimeoutMillis: 20000, // Close connections after 20 seconds of inactivity (optimized for serverless)
  connectionTimeoutMillis: 5000, // Wait up to 5 seconds for a connection (increased for reliability)
  maxUses: 5000, // Close connections after 5000 uses to prevent memory leaks (reduced for freshness)
  allowExitOnIdle: true, // Allow process to exit when all connections are idle
  keepAlive: true, // Enable TCP keepalive
  keepAliveInitialDelayMillis: 10000, // Initial delay before keepalive probes
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
    console.warn(`Connection pool pressure detected: ${stats.waitingClients} clients waiting`);
  }
  
  if (stats.totalConnections > 12) {
    console.warn(`High connection count: ${stats.totalConnections} connections active`);
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
  process.on('uncaughtException', async (error) => {
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