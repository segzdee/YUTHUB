/**
 * Error handling configuration for different environments
 */

interface ErrorConfig {
  includeStackTrace: boolean;
  includeRequestDetails: boolean;
  includeUserInfo: boolean;
  sanitizeMessages: boolean;
  maxErrorDetailsLength: number;
  rateLimitErrors: boolean;
  alertOnCriticalErrors: boolean;
}

const getErrorConfig = (): ErrorConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  const baseConfig: ErrorConfig = {
    includeStackTrace: false,
    includeRequestDetails: false,
    includeUserInfo: false,
    sanitizeMessages: true,
    maxErrorDetailsLength: 500,
    rateLimitErrors: true,
    alertOnCriticalErrors: true,
  };
  
  switch (env) {
    case 'production':
      return {
        ...baseConfig,
        includeStackTrace: false,
        includeRequestDetails: false,
        includeUserInfo: false,
        sanitizeMessages: true,
        maxErrorDetailsLength: 200,
        rateLimitErrors: true,
        alertOnCriticalErrors: true,
      };
      
    case 'staging':
      return {
        ...baseConfig,
        includeStackTrace: false,
        includeRequestDetails: true,
        includeUserInfo: true,
        sanitizeMessages: true,
        maxErrorDetailsLength: 500,
        rateLimitErrors: true,
        alertOnCriticalErrors: true,
      };
      
    case 'development':
      return {
        ...baseConfig,
        includeStackTrace: true,
        includeRequestDetails: true,
        includeUserInfo: true,
        sanitizeMessages: false,
        maxErrorDetailsLength: 1000,
        rateLimitErrors: false,
        alertOnCriticalErrors: false,
      };
      
    case 'test':
      return {
        ...baseConfig,
        includeStackTrace: true,
        includeRequestDetails: true,
        includeUserInfo: true,
        sanitizeMessages: false,
        maxErrorDetailsLength: 1000,
        rateLimitErrors: false,
        alertOnCriticalErrors: false,
      };
      
    default:
      // Default to most restrictive settings for unknown environments
      return baseConfig;
  }
};

/**
 * Sanitize error messages to prevent information leakage
 */
export const sanitizeErrorMessage = (message: string): string => {
  const config = getErrorConfig();
  
  if (!config.sanitizeMessages) {
    return message;
  }
  
  // Remove sensitive patterns
  const patterns = [
    // File paths
    /\/[a-zA-Z0-9_\-\/]+\.(js|ts|jsx|tsx|json|env)/gi,
    // Database queries
    /SELECT .* FROM/gi,
    /INSERT INTO .*/gi,
    /UPDATE .* SET/gi,
    /DELETE FROM .*/gi,
    // Connection strings
    /postgresql:\/\/[^@]+@[^\s]+/gi,
    /mongodb:\/\/[^@]+@[^\s]+/gi,
    // API keys and tokens
    /[a-zA-Z0-9]{32,}/g,
    // Email addresses
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // IP addresses
    /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    // Ports
    /:[0-9]{2,5}/g,
  ];
  
  let sanitized = message;
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  
  // Truncate if too long
  if (sanitized.length > config.maxErrorDetailsLength) {
    sanitized = sanitized.substring(0, config.maxErrorDetailsLength) + '...';
  }
  
  return sanitized;
};

/**
 * Format error response based on environment
 */
export const formatErrorResponse = (error: any, req?: any): any => {
  const config = getErrorConfig();
  
  const response: any = {
    error: sanitizeErrorMessage(error.message || 'An error occurred'),
    timestamp: new Date().toISOString(),
  };
  
  // Add error code if available
  if (error.code) {
    response.code = error.code;
  }
  
  // Add request ID if available
  if (req?.headers?.['x-request-id']) {
    response.requestId = req.headers['x-request-id'];
  }
  
  // Conditionally add details based on config
  if (config.includeStackTrace && error.stack) {
    response.stack = error.stack;
  }
  
  if (config.includeRequestDetails && req) {
    response.request = {
      method: req.method,
      path: req.path,
      query: req.query,
      // Never include body or headers as they may contain sensitive data
    };
  }
  
  if (config.includeUserInfo && req?.user) {
    response.user = {
      id: req.user.id,
      // Don't include email or other PII
    };
  }
  
  return response;
};

/**
 * Determine if an error should trigger an alert
 */
export const shouldAlertOnError = (error: any, statusCode: number): boolean => {
  const config = getErrorConfig();
  
  if (!config.alertOnCriticalErrors) {
    return false;
  }
  
  // Alert on 5xx errors
  if (statusCode >= 500) {
    return true;
  }
  
  // Alert on specific error types
  const criticalErrorTypes = [
    'DatabaseError',
    'AuthenticationError',
    'SecurityError',
    'DataIntegrityError',
  ];
  
  if (criticalErrorTypes.includes(error.constructor.name)) {
    return true;
  }
  
  // Alert on specific error codes
  const criticalErrorCodes = [
    'DB_CONNECTION_FAILED',
    'AUTH_SERVICE_DOWN',
    'PAYMENT_PROCESSING_FAILED',
    'DATA_CORRUPTION_DETECTED',
  ];
  
  if (criticalErrorCodes.includes(error.code)) {
    return true;
  }
  
  return false;
};

/**
 * Log error with appropriate detail level
 */
export const logError = (error: any, context: any = {}): void => {
  const config = getErrorConfig();
  
  const logData: any = {
    timestamp: new Date().toISOString(),
    message: sanitizeErrorMessage(error.message),
    level: error.statusCode >= 500 ? 'error' : 'warn',
  };
  
  if (config.includeStackTrace) {
    logData.stack = error.stack;
  }
  
  // Add context but sanitize sensitive fields
  const sanitizedContext = { ...context };
  delete sanitizedContext.password;
  delete sanitizedContext.token;
  delete sanitizedContext.apiKey;
  delete sanitizedContext.secret;
  delete sanitizedContext.creditCard;
  
  logData.context = sanitizedContext;
  
  // Use appropriate log level
  if (logData.level === 'error') {
    console.error('ERROR:', logData);
  } else {
    console.warn('WARNING:', logData);
  }
};

export const errorConfig = getErrorConfig();
export default errorConfig;