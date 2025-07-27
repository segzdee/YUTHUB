import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
  stack?: string;
}

interface ErrorMetrics {
  count: number;
  lastOccurrence: Date;
  paths: Set<string>;
  userAgents: Set<string>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorCounts = new Map<string, ErrorMetrics>();
  private recentErrors: Array<{
    error: string;
    timestamp: Date;
    path: string;
    userAgent?: string;
  }> = [];
  private maxRecentErrors = 100;
  private alertThresholds = {
    errorRate: 0.1, // 10% error rate
    errorCount: 50, // 50 errors in window
    timeWindow: 5 * 60 * 1000, // 5 minutes
  };

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  trackError(error: Error, path: string, userAgent?: string): void {
    const errorKey = error.name || 'UnknownError';
    const existing = this.errorCounts.get(errorKey) || {
      count: 0,
      lastOccurrence: new Date(),
      paths: new Set<string>(),
      userAgents: new Set<string>(),
    };

    existing.count++;
    existing.lastOccurrence = new Date();
    existing.paths.add(path);
    if (userAgent) existing.userAgents.add(userAgent);

    this.errorCounts.set(errorKey, existing);

    // Keep recent errors for analysis
    this.recentErrors.push({
      error: error.message,
      timestamp: new Date(),
      path,
      userAgent,
    });

    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors.shift();
    }

    // Check for error rate alerts
    this.checkErrorAlerts(errorKey, existing);
  }

  private checkErrorAlerts(errorKey: string, metrics: ErrorMetrics): void {
    // Alert on frequent errors
    if (metrics.count > 10 && metrics.count % 10 === 0) {
      console.warn(
        `🚨 Frequent error detected: ${errorKey} (${metrics.count} occurrences)`
      );

      // In production, this would trigger alerts to monitoring systems
      this.triggerAlert('frequent_error', {
        errorType: errorKey,
        count: metrics.count,
        paths: Array.from(metrics.paths),
        lastOccurrence: metrics.lastOccurrence,
      });
    }

    // Alert on error rate spikes
    const recentErrors = this.recentErrors.filter(
      e => Date.now() - e.timestamp.getTime() < this.alertThresholds.timeWindow
    );

    if (recentErrors.length > this.alertThresholds.errorCount) {
      console.error(
        `🚨 High error rate: ${recentErrors.length} errors in ${this.alertThresholds.timeWindow / 1000} seconds`
      );

      this.triggerAlert('high_error_rate', {
        errorCount: recentErrors.length,
        timeWindow: this.alertThresholds.timeWindow,
        topErrors: this.getTopErrors(recentErrors),
      });
    }
  }

  private getTopErrors(errors: any[]): Record<string, number> {
    const errorCounts: Record<string, number> = {};
    errors.forEach(error => {
      errorCounts[error.error] = (errorCounts[error.error] || 0) + 1;
    });

    return Object.fromEntries(
      Object.entries(errorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    );
  }

  private triggerAlert(type: string, data: any): void {
    // In production, integrate with monitoring services like:
    // - Sentry
    // - DataDog
    // - New Relic
    // - Custom alerting systems

    console.log(`Alert triggered: ${type}`, data);

    // Example: Send to monitoring service
    // await monitoringService.sendAlert(type, data);
  }

  getErrorMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};

    this.errorCounts.forEach((stats, errorType) => {
      metrics[errorType] = {
        count: stats.count,
        lastOccurrence: stats.lastOccurrence,
        affectedPaths: Array.from(stats.paths),
        uniqueUserAgents: stats.userAgents.size,
      };
    });

    return {
      errorTypes: metrics,
      recentErrors: this.recentErrors.slice(-20), // Last 20 errors
      totalErrors: Array.from(this.errorCounts.values()).reduce(
        (sum, stats) => sum + stats.count,
        0
      ),
      uniqueErrorTypes: this.errorCounts.size,
      errorRate: this.calculateErrorRate(),
    };
  }

  private calculateErrorRate(): number {
    const recentErrors = this.recentErrors.filter(
      e => Date.now() - e.timestamp.getTime() < this.alertThresholds.timeWindow
    );

    // This would need total request count for accurate rate
    // For now, return count as approximation
    return recentErrors.length;
  }

  clearMetrics(): void {
    this.errorCounts.clear();
    this.recentErrors = [];
    console.log('🗑️  Error metrics cleared');
  }

  getHealthStatus(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];
    const now = Date.now();

    // Check for recent error spikes
    const recentErrors = this.recentErrors.filter(
      e => now - e.timestamp.getTime() < this.alertThresholds.timeWindow
    );

    if (recentErrors.length > this.alertThresholds.errorCount) {
      issues.push(
        `High error rate: ${recentErrors.length} errors in last 5 minutes`
      );
    }

    // Check for frequent error types
    this.errorCounts.forEach((stats, errorType) => {
      if (stats.count > 50) {
        issues.push(`Frequent ${errorType}: ${stats.count} occurrences`);
      }
    });

    return {
      healthy: issues.length === 0,
      issues,
    };
  }
}

export const errorTracker = ErrorTracker.getInstance();

// Custom error classes
export class ApplicationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApplicationError';
    Error.captureStackTrace(this, ApplicationError);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

// Error formatting utilities
const formatZodError = (error: ZodError): any => {
  return {
    message: 'Validation failed',
    issues: error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
      received: issue.received,
    })),
  };
};

const formatDatabaseError = (error: any): any => {
  // Hide sensitive database information in production
  if (process.env.NODE_ENV === 'production') {
    return {
      message: 'Database operation failed',
      code: 'DATABASE_ERROR',
    };
  }

  return {
    message: error.message,
    code: error.code || 'DATABASE_ERROR',
    detail: error.detail,
    constraint: error.constraint,
  };
};

const formatNetworkError = (error: any): any => {
  return {
    message: 'Network operation failed',
    code: 'NETWORK_ERROR',
    errno: error.errno,
    syscall: error.syscall,
    address: error.address,
    port: error.port,
  };
};

// Main error handling middleware
export const errorHandlingMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Track the error
  errorTracker.trackError(error, req.path, req.get('User-Agent'));

  let statusCode = 500;
  let errorResponse: ErrorResponse;
  const requestId = req.headers['x-request-id'] as string;

  // Handle different error types
  if (error instanceof ApplicationError) {
    statusCode = error.statusCode;
    errorResponse = {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId,
    };
  } else if (error instanceof ZodError) {
    statusCode = 400;
    errorResponse = {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: formatZodError(error),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId,
    };
  } else if (error.name === 'DatabaseError' || error.code?.startsWith('23')) {
    statusCode = 500;
    errorResponse = {
      error: 'Database operation failed',
      code: 'DATABASE_ERROR',
      details: formatDatabaseError(error),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId,
    };
  } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    statusCode = 503;
    errorResponse = {
      error: 'Service unavailable',
      code: 'SERVICE_UNAVAILABLE',
      details: formatNetworkError(error),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId,
    };
  } else {
    // Generic error handling
    statusCode = error.statusCode || 500;
    errorResponse = {
      error:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message || 'Unknown error occurred',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }
  }

  // Log error details
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  console[logLevel](
    `${logLevel.toUpperCase()} ${statusCode} on ${req.method} ${req.path}:`,
    {
      message: error.message,
      stack: error.stack,
      user: (req as any).user?.id || 'anonymous',
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId,
    }
  );

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  const errorResponse: ErrorResponse = {
    error: 'Route not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'] as string,
  };

  // Track 404s as they might indicate broken links or attacks
  errorTracker.trackError(new NotFoundError(), req.path, req.get('User-Agent'));

  res.status(404).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error recovery middleware
export const errorRecoveryMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Add error recovery helpers to response
  res.locals.recover = {
    withFallback: (primary: () => any, fallback: () => any) => {
      try {
        return primary();
      } catch (error) {
        console.warn(
          'Primary operation failed, using fallback:',
          error.message
        );
        return fallback();
      }
    },

    withRetry: async (operation: () => Promise<any>, maxRetries = 3) => {
      let lastError;

      for (let i = 0; i < maxRetries; i++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error;

          // Wait before retry (exponential backoff)
          if (i < maxRetries - 1) {
            await new Promise(resolve =>
              setTimeout(resolve, Math.pow(2, i) * 1000)
            );
          }
        }
      }

      throw lastError;
    },
  };

  next();
};

// Error metrics endpoint
export const errorMetricsHandler = (req: Request, res: Response) => {
  const metrics = errorTracker.getErrorMetrics();
  const health = errorTracker.getHealthStatus();

  res.json({
    ...metrics,
    health,
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    },
  });
};

// Clear error metrics endpoint (for development)
export const clearErrorMetricsHandler = (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'production') {
    errorTracker.clearMetrics();
    res.json({ message: 'Error metrics cleared' });
  } else {
    res.status(403).json({ error: 'Not available in production' });
  }
};

// Export error handling utilities
export const errorHandling = {
  errorTracker,
  errorHandlingMiddleware,
  notFoundHandler,
  asyncHandler,
  errorRecoveryMiddleware,
  errorMetricsHandler,
  clearErrorMetricsHandler,
  ApplicationError,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
};
