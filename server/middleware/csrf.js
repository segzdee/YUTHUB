import crypto from 'crypto';

/**
 * Modern CSRF Protection using Double Submit Cookie Pattern
 * This approach doesn't require server-side session storage
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
function generateToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Middleware to generate and set CSRF token
 */
export function csrfTokenGenerator(req, res, next) {
  // Generate token if not exists
  let token = req.cookies?.[CSRF_COOKIE_NAME];

  if (!token) {
    token = generateToken();

    // Set cookie with secure options
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be readable by client JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  // Make token available to templates/API responses
  res.locals.csrfToken = token;
  req.csrfToken = () => token;

  next();
}

/**
 * Middleware to validate CSRF token for state-changing requests
 */
export function csrfProtection(req, res, next) {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for webhook endpoints (they use other verification)
  if (req.path.startsWith('/api/webhooks/')) {
    return next();
  }

  // Get token from cookie
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  // Get token from header or body
  const requestToken = req.headers[CSRF_HEADER_NAME] || req.body?._csrf;

  // Validate tokens exist
  if (!cookieToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'CSRF cookie not found. Please refresh the page.',
    });
  }

  if (!requestToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'CSRF token not provided in request.',
    });
  }

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(requestToken)
  )) {
    return res.status(403).json({
      error: 'CSRF token invalid',
      message: 'Invalid CSRF token. This request has been blocked.',
    });
  }

  next();
}

/**
 * Endpoint to get CSRF token (for client-side requests)
 */
export function getCsrfToken(req, res) {
  res.json({
    csrfToken: req.csrfToken(),
  });
}
