import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General API rate limiter
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(15 * 60), // seconds
      timestamp: new Date().toISOString()
    });
  }
});

// Strict rate limiter for sensitive endpoints
export const strictApiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many requests for sensitive operation, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests for sensitive operation.',
      retryAfter: Math.ceil(15 * 60),
      timestamp: new Date().toISOString()
    });
  }
});

// Create operation rate limiter
export const createRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 create operations per minute
  message: {
    error: 'Too many create operations, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Create rate limit exceeded',
      message: 'Too many create operations. Please wait before creating more records.',
      retryAfter: 60,
      timestamp: new Date().toISOString()
    });
  }
});

// Report generation rate limiter
export const reportRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 report generations per 5 minutes
  message: {
    error: 'Too many report generation requests.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Report generation rate limit exceeded',
      message: 'Too many report generation requests. Please wait before generating more reports.',
      retryAfter: 5 * 60,
      timestamp: new Date().toISOString()
    });
  }
});