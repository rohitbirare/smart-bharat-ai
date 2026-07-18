/**
 * utils/asyncHandler.js
 * Wraps async route handlers so that thrown errors are forwarded to Express's
 * next(err) — eliminating repetitive try/catch blocks in controllers.
 *
 * Usage:
 *   router.post('/path', authMiddleware, asyncHandler(async (req, res) => { ... }))
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = asyncHandler
