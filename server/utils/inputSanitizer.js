import { JSDOM } from 'jsdom';
import DOMPurify from 'isomorphic-dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export function sanitizeHtml(dirty) {
  if (typeof dirty !== 'string') {
    return dirty;
  }

  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/\0/g, '');
}

export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return email;
  }

  return email.toLowerCase().trim();
}

export function sanitizeName(name) {
  if (typeof name !== 'string') {
    return name;
  }

  return name
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 100);
}

export function sanitizeUrl(url) {
  if (typeof url !== 'string') {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return '';
    }
    return url;
  } catch {
    return '';
  }
}

export function sanitizeObject(obj, schema = {}) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    const sanitizer = schema[key];

    if (sanitizer === 'html') {
      sanitized[key] = sanitizeHtml(value);
    } else if (sanitizer === 'email') {
      sanitized[key] = sanitizeEmail(value);
    } else if (sanitizer === 'name') {
      sanitized[key] = sanitizeName(value);
    } else if (sanitizer === 'url') {
      sanitized[key] = sanitizeUrl(value);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function sanitizeRequestBody(schema = {}) {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, schema);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    next();
  };
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function preventSqlInjection(input) {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/(['";\\])/g, '')
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi, '');
}

export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') {
    return 'file';
  }

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}
