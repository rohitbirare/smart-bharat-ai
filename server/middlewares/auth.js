/**
 * middlewares/auth.js
 * Verifies the Firebase ID Token sent by the frontend as:
 *   Authorization: Bearer <firebase-id-token>
 *
 * On success, attaches `req.user` (decoded token) to the request.
 * On failure, returns 401.
 */

const { admin } = require('../config/firebase')

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — missing or malformed Authorization header.',
      code: 'MISSING_TOKEN',
    })
  }

  const idToken = authHeader.split('Bearer ')[1].trim()

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedToken // { uid, email, name, ... }
    next()
  } catch (err) {
    console.error('[auth] Token verification failed:', err.message)
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — invalid or expired token.',
      code: 'INVALID_TOKEN',
    })
  }
}

module.exports = authMiddleware
