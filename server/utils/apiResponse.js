/**
 * Standardized API response utilities
 * Format: { success: boolean, data?: T, error?: { code: string, message: string }, meta?: { page, limit, total } }
 */

/**
 * Send success response
 */
export function success(res, data, meta = null, statusCode = 200) {
  const response = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function error(res, code, message, statusCode = 500, details = null) {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send paginated response
 */
export function paginated(res, data, pagination) {
  return success(res, data, {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: Math.ceil(pagination.total / pagination.limit),
  });
}

/**
 * Common error codes and messages
 */
export const ErrorCodes = {
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
  CONFLICT: { code: 'CONFLICT', status: 409 },
  UNPROCESSABLE: { code: 'UNPROCESSABLE_ENTITY', status: 422 },
  RATE_LIMIT: { code: 'RATE_LIMIT_EXCEEDED', status: 429 },
  INTERNAL_ERROR: { code: 'INTERNAL_SERVER_ERROR', status: 500 },
  SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', status: 503 },
};

/**
 * Error response shortcuts
 */
export function unauthorized(res, message = 'Unauthorized') {
  return error(res, ErrorCodes.UNAUTHORIZED.code, message, ErrorCodes.UNAUTHORIZED.status);
}

export function forbidden(res, message = 'Forbidden') {
  return error(res, ErrorCodes.FORBIDDEN.code, message, ErrorCodes.FORBIDDEN.status);
}

export function notFound(res, message = 'Resource not found') {
  return error(res, ErrorCodes.NOT_FOUND.code, message, ErrorCodes.NOT_FOUND.status);
}

export function validationError(res, message = 'Validation failed', details = null) {
  return error(res, ErrorCodes.VALIDATION_ERROR.code, message, ErrorCodes.VALIDATION_ERROR.status, details);
}

export function conflict(res, message = 'Resource conflict') {
  return error(res, ErrorCodes.CONFLICT.code, message, ErrorCodes.CONFLICT.status);
}

export function internalError(res, message = 'Internal server error') {
  return error(res, ErrorCodes.INTERNAL_ERROR.code, message, ErrorCodes.INTERNAL_ERROR.status);
}

export function serviceUnavailable(res, message = 'Service temporarily unavailable') {
  return error(res, ErrorCodes.SERVICE_UNAVAILABLE.code, message, ErrorCodes.SERVICE_UNAVAILABLE.status);
}
