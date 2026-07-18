/**
 * controllers/authController.js
 * Handles /api/auth routes.
 *
 * POST /api/auth/login  — verify Firebase token, create/sync user record
 * POST /api/auth/logout — client-side logout acknowledgement
 */

const asyncHandler = require('../utils/asyncHandler')

/**
 * POST /api/auth/login
 * The Frontend sends the Firebase ID Token.
 * This endpoint verifies it (via auth middleware) and returns user info.
 * req.user is populated by authMiddleware before this controller is called.
 */
const login = asyncHandler(async (req, res) => {
  const { uid, email, name, picture } = req.user

  // Here you could upsert a user document to Firestore/DB.
  // For now we simply echo the decoded identity back.

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      uid,
      email: email || null,
      name: name || null,
      picture: picture || null,
    },
  })
})

/**
 * POST /api/auth/logout
 * Firebase tokens are stateless; logout is handled client-side.
 * This endpoint exists for API completeness and potential server-side cleanup.
 */
const logout = asyncHandler(async (req, res) => {
  // If you store sessions, invalidate them here.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  })
})

module.exports = { login, logout }
