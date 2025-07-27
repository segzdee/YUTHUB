import { NextFunction, Request, Response } from 'express';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// HTML/XSS sanitization
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return input;

  // Use DOMPurify for comprehensive XSS protection
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

// SQL injection prevention (basic - Drizzle ORM provides better protection)
export const sanitizeSql = (input: string): string => {
  if (typeof input !== 'string') return input;

  // Remove common SQL injection patterns
  return input
    .replace(
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      ''
    )
    .replace(/[';\\x00\\x1a]/g, '')
    .replace(/(-{2}|\/\*|\*\/)/g, '');
};

// Path traversal prevention
export const sanitizePath = (input: string): string => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/\.\./g, '')
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\0/g, '');
};

// Email sanitization
export const sanitizeEmail = (input: string): string => {
  if (typeof input !== 'string') return input;

  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, '');
};

// Phone number sanitization
export const sanitizePhone = (input: string): string => {
  if (typeof input !== 'string') return input;

  return input.replace(/[^\d+\-\s()]/g, '').trim();
};

// URL sanitization
export const sanitizeUrl = (input: string): string => {
  if (typeof input !== 'string') return input;

  try {
    const url = new URL(input);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
};

// General input sanitization middleware
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const sanitizeObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return sanitizeHtml(obj).trim();
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize route parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Validation middleware factory
export const validateInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and parse the request body
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid input data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received,
          })),
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid input data',
          timestamp: new Date().toISOString(),
        });
      }
    }
  };
};

// File upload sanitization
export const sanitizeFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.files || req.file) {
    const sanitizeFile = (file: any) => {
      if (file.originalname) {
        // Remove dangerous characters from filename
        file.originalname = file.originalname
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/\.+/g, '.')
          .substring(0, 100); // Limit filename length
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error(`File type ${file.mimetype} not allowed`);
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit');
      }

      return file;
    };

    try {
      if (req.files) {
        if (Array.isArray(req.files)) {
          req.files = req.files.map(sanitizeFile);
        } else {
          for (const fieldName in req.files) {
            const files = req.files[fieldName];
            if (Array.isArray(files)) {
              req.files[fieldName] = files.map(sanitizeFile);
            } else {
              req.files[fieldName] = sanitizeFile(files);
            }
          }
        }
      }

      if (req.file) {
        req.file = sanitizeFile(req.file);
      }

      next();
    } catch (error) {
      res.status(400).json({
        error: 'File validation failed',
        message: error instanceof Error ? error.message : 'Invalid file upload',
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    next();
  }
};

// CSRF protection middleware
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'CSRF token validation failed',
      message: 'Invalid or missing CSRF token',
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Content type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.get('Content-Type');

    if (
      !contentType ||
      !allowedTypes.some(type => contentType.includes(type))
    ) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

// Request size limiter
export const limitRequestSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('Content-Length');

    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: `Request size exceeds ${maxSize} bytes`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

// Header sanitization
export const sanitizeHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove potentially dangerous headers
  const dangerousHeaders = [
    'x-forwarded-host',
    'x-real-ip',
    'x-forwarded-proto',
  ];

  dangerousHeaders.forEach(header => {
    if (req.headers[header]) {
      delete req.headers[header];
    }
  });

  // Sanitize user-agent
  if (req.headers['user-agent']) {
    req.headers['user-agent'] = sanitizeHtml(
      req.headers['user-agent']
    );
  }

  next();
};

// Export all sanitization middleware
export const inputSanitization = {
  sanitizeInput,
  validateInput,
  sanitizeFileUpload,
  csrfProtection,
  validateContentType,
  limitRequestSize,
  sanitizeHeaders,
  sanitizeHtml,
  sanitizeSql,
  sanitizePath,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
};
