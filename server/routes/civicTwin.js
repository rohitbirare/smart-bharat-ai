/**
 * routes/civicTwin.js
 * POST /api/civic-twin
 */

const router = require('express').Router()
const authMiddleware = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { civicTwin } = require('../controllers/civicTwinController')

router.post(
  '/',
  authMiddleware,
  validate(['age', 'state', 'profession', 'situation']),
  civicTwin
)

module.exports = router
