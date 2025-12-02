import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { log } from './logger.js';

/**
 * Application Monitoring with Sentry
 * Configure error tracking and performance monitoring
 */

let isInitialized = false;

export function initializeMonitoring() {
  // Only initialize if SENTRY_DSN is provided
  const sentryDSN = process.env.SENTRY_DSN;

  if (!sentryDSN) {
    log.warn('Sentry DSN not configured. Error tracking disabled.');
    log.info('To enable Sentry, set SENTRY_DSN environment variable');
    return;
  }

  try {
    Sentry.init({
      dsn: sentryDSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_VERSION || '1.0.0',

      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Profiling
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new ProfilingIntegration(),
      ],

      // Filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-csrf-token'];
        }

        // Remove passwords from data
        if (event.request?.data) {
          const data = typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data;

          if (data.password) data.password = '[REDACTED]';
          if (data.token) data.token = '[REDACTED]';
          if (data.apiKey) data.apiKey = '[REDACTED]';

          event.request.data = JSON.stringify(data);
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        'NetworkError',
        'AbortError',
        'Navigation cancelled',
        'Non-Error promise rejection',
      ],
    });

    isInitialized = true;
    log.info('Sentry monitoring initialized', {
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION,
    });
  } catch (error) {
    log.error('Failed to initialize Sentry', { error: error.message });
  }
}

/**
 * Capture exception with additional context
 */
export function captureException(error, context = {}) {
  if (isInitialized) {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  // Always log to Winston
  log.error(error.message, {
    error: error.stack,
    ...context,
  });
}

/**
 * Capture message with severity level
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (isInitialized) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }

  log[level](message, context);
}

/**
 * Set user context for error tracking
 */
export function setUser(user) {
  if (isInitialized && user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

/**
 * Clear user context
 */
export function clearUser() {
  if (isInitialized) {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(category, message, data = {}) {
  if (isInitialized) {
    Sentry.addBreadcrumb({
      category,
      message,
      level: 'info',
      data,
    });
  }

  log.debug('Breadcrumb', { category, message, ...data });
}

/**
 * Express error handler middleware
 */
export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture 4xx and 5xx errors
      return error.status >= 400;
    },
  });
}

/**
 * Express request handler middleware
 */
export function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler({
    ip: true,
    request: ['method', 'url', 'query_string'],
    user: ['id', 'email'],
  });
}

/**
 * Express tracing middleware
 */
export function sentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

/**
 * Start a performance transaction
 */
export function startTransaction(name, op) {
  if (isInitialized) {
    return Sentry.startTransaction({
      name,
      op,
    });
  }
  return null;
}

/**
 * Flush events before shutting down
 */
export async function shutdown(timeout = 2000) {
  if (isInitialized) {
    log.info('Flushing monitoring events...');
    await Sentry.close(timeout);
    log.info('Monitoring shutdown complete');
  }
}

export default {
  initializeMonitoring,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  sentryErrorHandler,
  sentryRequestHandler,
  sentryTracingHandler,
  startTransaction,
  shutdown,
};
