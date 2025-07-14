import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// HTML/XSS sanitization
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// SQL injection prevention (basic - Drizzle ORM provides better protection)
export const sanitizeSql = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  // Remove common SQL injection patterns
  return input
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '')
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

// General input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
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
            received: err.received
          })),
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid input data',
          timestamp: new Date().toISOString()
        });
      }
    }
  };
};

// File upload sanitization
export const sanitizeFileUpload = (req: Request, res: Response, next: NextFunction): void => {
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
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
        timestamp: new Date().toISOString()
      });
    }
  } else {
    next();
  }
};