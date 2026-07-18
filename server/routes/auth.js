/**
 * routes/auth.js
 * POST /api/auth/login
 * POST /api/auth/logout
 */

const router = require('express').Router()
const authMiddleware = require('../middlewares/auth')
const { login, logout } = require('../controllers/authController')

// Login requires a valid Firebase token (verified by authMiddleware)
router.post('/login', authMiddleware, login)

// Logout — optionally protected so we know who is logging out
router.post('/logout', authMiddleware, logout)

module.exports = router
