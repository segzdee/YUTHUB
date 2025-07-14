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

// Configure connection pool for optimal performance
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections in the pool
  min: 5,  // Minimum number of connections in the pool
  idleTimeoutMillis: 30000, // Close connections after 30 seconds of inactivity
  connectionTimeoutMillis: 2000, // Wait up to 2 seconds for a connection
  maxUses: 7500, // Close connections after 7500 uses to prevent memory leaks
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
      console.warn(`Slow database health check: ${duration}ms`);
    }
    
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Connection pool monitoring
export const getPoolStats = () => {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
  };
};

// Graceful shutdown
export const closeDatabaseConnections = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('Database connections closed gracefully');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
};