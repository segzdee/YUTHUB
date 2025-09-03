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

// Validate database URL format and security
const validateDatabaseUrl = (url: string): void => {
  try {
    const dbUrl = new URL(url);
    
    // Ensure SSL is enabled for production
    if (process.env.NODE_ENV === 'production') {
      // Parse URL parameters properly
      const params = new URLSearchParams(dbUrl.search);
      const sslMode = params.get('sslmode');
      const ssl = params.get('ssl');
      
      // Check for proper SSL configuration
      if (sslMode !== 'require' && ssl !== 'true') {
        throw new Error('Database connection must use SSL in production (sslmode=require or ssl=true)');
      }
    }
    
    // Validate protocol
    if (!['postgresql:', 'postgres:'].includes(dbUrl.protocol)) {
      throw new Error('Invalid database protocol. Must be PostgreSQL');
    }
    
    // Check for exposed credentials in logs
    if (process.env.NODE_ENV === 'production') {
      console.log('Database connected to:', dbUrl.hostname);
      // Never log the full connection string in production
    }
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error}`);
  }
};

// Validate the database URL
validateDatabaseUrl(process.env.DATABASE_URL);

// Configure connection pool with security-focused settings
const getPoolConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    connectionString: process.env.DATABASE_URL,
    // Reduced pool limits for production to prevent resource exhaustion
    max: isProduction ? 10 : 20, // Lower max connections in production
    min: isProduction ? 2 : 5, // Lower minimum in production
    idleTimeoutMillis: isProduction ? 10000 : 30000, // Shorter idle timeout in production
    connectionTimeoutMillis: 5000, // Reduced connection timeout
    maxUses: 7500, // Connection recycling
    allowExitOnIdle: true,
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
    // Additional security settings
    statement_timeout: isProduction ? 30000 : 60000, // 30s in prod, 60s in dev
    query_timeout: isProduction ? 30000 : 60000,
    idle_in_transaction_session_timeout: isProduction ? 60000 : 120000,
    // SSL configuration
    ssl: isProduction ? { rejectUnauthorized: true } : false,
  };
};

export const pool = new Pool(getPoolConfig());

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  // In production, send alert to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // alertingService.sendAlert(...)
  }
});

pool.on('connect', (client) => {
  // Set session parameters for security
  client.query('SET statement_timeout = 30000'); // 30 second timeout
  client.query('SET lock_timeout = 10000'); // 10 second lock timeout
  client.query('SET idle_in_transaction_session_timeout = 60000'); // 1 minute
});

export const db = drizzle({ client: pool, schema });

// Enhanced database health monitoring with query timeout
export const checkDatabaseHealth = async (): Promise<boolean> => {
  const timeoutMs = 5000; // 5 second timeout for health checks
  
  try {
    const healthCheckPromise = db.execute(sql`SELECT 1`);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), timeoutMs)
    );
    
    const start = Date.now();
    await Promise.race([healthCheckPromise, timeoutPromise]);
    const duration = Date.now() - start;

    // Log slow queries (over 1 second)
    if (duration > 1000) {
      console.warn(`Slow database health check: ${duration}ms`);
    }

    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Connection pool monitoring with alerting thresholds
export const getPoolStats = () => {
  const stats = {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
    processId: process.pid,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  };
  
  // Add health status based on thresholds
  const healthStatus = {
    isHealthy: true,
    warnings: [] as string[],
    errors: [] as string[],
  };
  
  // Check for issues
  if (stats.waitingClients > 5) {
    healthStatus.warnings.push(`${stats.waitingClients} clients waiting for connections`);
  }
  
  if (stats.waitingClients > 10) {
    healthStatus.isHealthy = false;
    healthStatus.errors.push('Critical: Too many clients waiting');
  }
  
  if (stats.totalConnections >= pool.options.max * 0.9) {
    healthStatus.warnings.push('Connection pool near capacity');
  }
  
  if (stats.totalConnections >= pool.options.max) {
    healthStatus.isHealthy = false;
    healthStatus.errors.push('Connection pool at maximum capacity');
  }
  
  const memoryUsageMB = stats.memoryUsage.heapUsed / 1024 / 1024;
  if (memoryUsageMB > 200) {
    healthStatus.warnings.push(`High memory usage: ${memoryUsageMB.toFixed(2)}MB`);
  }
  
  if (memoryUsageMB > 400) {
    healthStatus.isHealthy = false;
    healthStatus.errors.push(`Critical memory usage: ${memoryUsageMB.toFixed(2)}MB`);
  }
  
  return { ...stats, healthStatus };
};

// Monitor connection pool health with auto-recovery
export const monitorPoolHealth = async () => {
  const stats = getPoolStats();
  
  // Log warnings
  if (stats.healthStatus.warnings.length > 0) {
    console.warn('Database pool warnings:', stats.healthStatus.warnings);
  }
  
  // Log errors and attempt recovery
  if (!stats.healthStatus.isHealthy) {
    console.error('Database pool errors:', stats.healthStatus.errors);
    
    // Attempt to recover if pool is exhausted
    if (stats.totalConnections >= pool.options.max) {
      console.log('Attempting to clear idle connections...');
      try {
        // Force cleanup of idle connections
        await pool.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle\' AND state_change < NOW() - INTERVAL \'5 minutes\'');
      } catch (error) {
        console.error('Failed to clear idle connections:', error);
      }
    }
  }
  
  return stats;
};

// Graceful shutdown with timeout
export const closeDatabaseConnections = async (): Promise<void> => {
  const shutdownTimeout = 5000; // 5 seconds max for shutdown
  
  try {
    console.log('Initiating graceful database shutdown...');
    
    const shutdownPromise = pool.end();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database shutdown timeout')), shutdownTimeout)
    );
    
    await Promise.race([shutdownPromise, timeoutPromise]);
    console.log('Database connections closed gracefully');
  } catch (error) {
    console.error('Error closing database connections:', error);
    // Force exit if graceful shutdown fails
    process.exit(1);
  }
};

// Enhanced compute lifecycle management
export const handleComputeLifecycle = () => {
  let isShuttingDown = false;
  
  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      console.log('Shutdown already in progress...');
      return;
    }
    
    isShuttingDown = true;
    console.log(`Received ${signal}, shutting down gracefully...`);
    
    try {
      await closeDatabaseConnections();
      process.exit(0);
    } catch (error) {
      console.error('Shutdown error:', error);
      process.exit(1);
    }
  };
  
  // Handle process termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception:', error);
    await shutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    await shutdown('unhandledRejection');
  });
  
  // Periodic health monitoring with adaptive intervals
  let healthCheckInterval = 60000; // Start with 1 minute
  
  const performHealthCheck = async () => {
    const stats = await monitorPoolHealth();
    
    // Adjust monitoring frequency based on health
    if (!stats.healthStatus.isHealthy) {
      healthCheckInterval = 10000; // Check every 10 seconds if unhealthy
    } else if (stats.healthStatus.warnings.length > 0) {
      healthCheckInterval = 30000; // Check every 30 seconds if warnings
    } else {
      healthCheckInterval = 60000; // Check every minute if healthy
    }
    
    // Schedule next check
    setTimeout(performHealthCheck, healthCheckInterval);
  };
  
  // Start health monitoring
  setTimeout(performHealthCheck, 5000); // Initial check after 5 seconds
  
  console.log('Database lifecycle management initialized');
};

// Export query timeout wrapper for critical queries
export const withQueryTimeout = async <T>(
  query: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
  );
  
  return Promise.race([query, timeoutPromise]);
};