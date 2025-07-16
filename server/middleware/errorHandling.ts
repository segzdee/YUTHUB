import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
}

interface ErrorMetrics {
  count: number;
  lastOccurrence: Date;
  paths: Set<string>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorCounts = new Map<string, ErrorMetrics>();
  private recentErrors: Array<{ error: string; timestamp: Date; path: string }> = [];
  private maxRecentErrors = 100;

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  trackError(error: Error, path: string): void {
    const errorKey = error.name || 'UnknownError';
    const existing = this.errorCounts.get(errorKey) || {
      count: 0,
      lastOccurrence: new Date(),
      paths: new Set<string>()
    };

    existing.count++;
    existing.lastOccurrence = new Date();
    existing.paths.add(path);
    
    this.errorCounts.set(errorKey, existing);

    // Keep recent errors for analysis
    this.recentErrors.push({
      error: error.message,
      timestamp: new Date(),
      path
    });

    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors.shift();
    }

    // Log frequent errors
    if (existing.count > 10) {
      console.warn(`🚨 Frequent error detected: ${errorKey} (${existing.count} occurrences)`);
    }
  }

  getErrorMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    this.errorCounts.forEach((stats, errorType) => {
      metrics[errorType] = {
        count: stats.count,
        lastOccurrence: stats.lastOccurrence,
        affectedPaths: Array.from(stats.paths)
      };
    });

    return {
      errorTypes: metrics,
      recentErrors: this.recentErrors.slice(-20), // Last 20 errors
      totalErrors: Array.from(this.errorCounts.values()).reduce((sum, stats) => sum + stats.count, 0)
    };
  }

  clearMetrics(): void {
    this.errorCounts.clear();
    this.recentErrors = [];
    console.log('🗑️  Error metrics cleared');
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

// Error formatting utilities
const formatZodError = (error: ZodError): any => {
  return {
    message: 'Validation failed',
    issues: error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code
    }))
  };
};

const formatDatabaseError = (error: any): any => {
  // Hide sensitive database information in production
  if (process.env.NODE_ENV === 'production') {
    return {
      message: 'Database operation failed',
      code: 'DATABASE_ERROR'
    };
  }
  
  return {
    message: error.message,
    code: error.code || 'DATABASE_ERROR',
    detail: error.detail
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
  errorTracker.trackError(error, req.path);

  let statusCode = 500;
  let errorResponse: ErrorResponse;

  // Handle different error types
  if (error instanceof ApplicationError) {
    statusCode = error.statusCode;
    errorResponse = {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  } else if (error instanceof ZodError) {
    statusCode = 400;
    errorResponse = {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: formatZodError(error),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  } else if (error.name === 'DatabaseError' || error.code?.startsWith('23')) {
    statusCode = 500;
    errorResponse = {
      error: 'Database operation failed',
      code: 'DATABASE_ERROR',
      details: formatDatabaseError(error),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  } else {
    // Generic error handling
    statusCode = error.statusCode || 500;
    errorResponse = {
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };
  }

  // Log error details
  console.error(`❌ Error ${statusCode} on ${req.method} ${req.path}:`, {
    message: error.message,
    stack: error.stack,
    user: req.user?.id || 'anonymous'
  });

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
    method: req.method
  };

  res.status(404).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { ErrorTracker };