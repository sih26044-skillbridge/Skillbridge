/**
 * Centralized error handling middleware.
 * Returns consistent JSON error responses across all endpoints.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message || err);

  // Prisma known error codes
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(400).json({ detail: `A record with this ${field} already exists.` });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ detail: 'Record not found.' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';

  res.status(status).json({ detail: message });
};

module.exports = errorHandler;
