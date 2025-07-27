import { NextFunction, Request, Response } from 'express';
import { Redis } from 'ioredis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitStore {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  get(key: string): Promise<number | null>;
}

class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async incr(key: string): Promise<number> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetTime < now) {
      this.store.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      entry.resetTime = Date.now() + seconds * 1000;
    }
  }

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry || entry.resetTime < Date.now()) {
      return null;
    }
    return entry.count;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

class RedisStore implements RateLimitStore {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async incr(key: string): Promise<number> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 60); // 1 minute expiry
    }
    return count;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async get(key: string): Promise<number | null> {
    const value = await this.redis.get(key);
    return value ? parseInt(value, 10) : null;
  }
}

export class RateLimiter {
  private config: RateLimitConfig;
  private store: RateLimitStore;

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = {
      message: 'Too many requests, please try again later',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: req => req.ip || 'unknown',
      ...config,
    };
    this.store = store || new MemoryStore();

    // Cleanup memory store every 5 minutes
    if (this.store instanceof MemoryStore) {
      setInterval(
        () => {
          (this.store as MemoryStore).cleanup();
        },
        5 * 60 * 1000
      );
    }
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = `rate_limit:${this.config.keyGenerator!(req)}`;
        const current = await this.store.incr(key);

        // Set expiry for the window
        if (current === 1) {
          await this.store.expire(key, Math.ceil(this.config.windowMs / 1000));
        }

        // Check if limit exceeded
        if (current > this.config.maxRequests) {
          const resetTime = new Date(Date.now() + this.config.windowMs);

          res.set({
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toISOString(),
          });

          return res.status(429).json({
            error: 'Too Many Requests',
            message: this.config.message,
            retryAfter: Math.ceil(this.config.windowMs / 1000),
          });
        }

        // Add rate limit headers
        res.set({
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(
            0,
            this.config.maxRequests - current
          ).toString(),
          'X-RateLimit-Reset': new Date(
            Date.now() + this.config.windowMs
          ).toISOString(),
        });

        next();
      } catch (error) {
        console.error('Rate limiter error:', error);
        next(); // Fail open
      }
    };
  }
}

// Predefined rate limiters for different endpoints
export const rateLimiters = {
  // API endpoints - 100 requests per hour
  api: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    message: 'API rate limit exceeded. Please try again later.',
  }),

  // Authentication endpoints - 5 attempts per 15 minutes
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again later.',
  }),

  // File upload - 10 uploads per hour
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Upload rate limit exceeded. Please try again later.',
  }),

  // Password reset - 3 attempts per hour
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts. Please try again later.',
  }),

  // General web requests - 1000 per hour
  web: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    message: 'Too many requests. Please slow down.',
  }),
};

// Advanced rate limiter with sliding window
export class SlidingWindowRateLimiter {
  private windowSize: number;
  private maxRequests: number;
  private store: Map<string, number[]> = new Map();

  constructor(windowSizeMs: number, maxRequests: number) {
    this.windowSize = windowSizeMs;
    this.maxRequests = maxRequests;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();

      if (!this.store.has(key)) {
        this.store.set(key, []);
      }

      const requests = this.store.get(key)!;

      // Remove old requests outside the window
      const cutoff = now - this.windowSize;
      const validRequests = requests.filter(time => time > cutoff);

      if (validRequests.length >= this.maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(this.windowSize / 1000),
        });
      }

      // Add current request
      validRequests.push(now);
      this.store.set(key, validRequests);

      res.set({
        'X-RateLimit-Remaining': Math.max(
          0,
          this.maxRequests - validRequests.length
        ).toString(),
      });

      next();
    };
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.windowSize;

    for (const [key, requests] of this.store.entries()) {
      const validRequests = requests.filter(time => time > cutoff);
      if (validRequests.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, validRequests);
      }
    }
  }
}
