/**
 * middlewares/errorHandler.js
 * Centralized error handler — always returns JSON.
 * Catches both operational and programming errors.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Log full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.path}`, err)
  } else {
    console.error(`[ERROR] ${status} — ${message}`)
  }

  res.status(status).json({
    success: false,
    message,
    code: err.code || 'SERVER_ERROR',
    ...(err.details ? { details: err.details } : {}),
  })
}

module.exports = errorHandler
