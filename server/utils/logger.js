import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Structured Logger using Winston
 * Provides consistent logging across the application
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  })
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let logMessage = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0 && meta.stack) {
      logMessage += `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }

    return logMessage;
  })
);

// Define transports
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  const logDir = path.join(__dirname, '../../logs');

  transports.push(
    // Error logs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: format,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: format,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Helper methods for structured logging
export const log = {
  error: (message, meta = {}) => {
    logger.error(message, meta);
  },

  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  http: (message, meta = {}) => {
    logger.http(message, meta);
  },

  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  // Database operation logging
  db: (operation, table, meta = {}) => {
    logger.info('DB Operation', {
      operation,
      table,
      ...meta,
    });
  },

  // API request logging
  api: (method, endpoint, status, duration, meta = {}) => {
    logger.http('API Request', {
      method,
      endpoint,
      status,
      duration: `${duration}ms`,
      ...meta,
    });
  },

  // Security event logging
  security: (event, meta = {}) => {
    logger.warn('Security Event', {
      event,
      ...meta,
    });
  },

  // User action logging
  audit: (action, userId, meta = {}) => {
    logger.info('Audit Log', {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...meta,
    });
  },
};

export default logger;
