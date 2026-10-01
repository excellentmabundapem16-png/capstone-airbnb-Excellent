/**
 * middleware/errorMiddleware.js
 * -----------------------------
 * Central 404 handler + JSON error handler so every failure returns a
 * consistent { message } payload with a proper HTTP status code.
 */

/** Catch requests to unknown API routes. */
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    status = 404;
    message = `Resource not found (invalid id)`;
  }
  // Mongoose validation errors -> join all messages
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    status = 400;
    message = `Duplicate value for: ${Object.keys(err.keyValue).join(', ')}`;
  }

  res.status(status).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
