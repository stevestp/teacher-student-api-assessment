const morgan = require('morgan');

/**
 * Global error handling middleware
 * Handles all errors and returns consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error stack:', err.stack);

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'Duplicate entry: Resource already exists'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      message: 'Invalid reference: Referenced resource does not exist'
    });
  }

  // Validation errors (should be caught by validation middleware)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: `Validation error: ${err.message}`
    });
  }

  // Default to 500 server error
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
};

/**
 * 404 handler middleware
 * Handles requests to non-existent endpoints
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
};

/**
 * Request logging middleware
 * Logs all incoming requests
 */
const requestLogger = morgan('combined', {
  skip: (req, res) => {
    // Skip logging in test environment
    return process.env.NODE_ENV === 'test';
  }
});

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger,
  asyncHandler
};
