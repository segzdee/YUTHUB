import { AppError } from '../utils/errors.js';

export function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    error = new AppError(message, statusCode);
  }

  console.error('Error:', {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.userId,
    organizationId: req.organizationId,
  });

  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  }

  res.status(error.statusCode).json(error.toJSON());
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
