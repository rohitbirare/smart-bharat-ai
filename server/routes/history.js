/**
 * routes/history.js
 * GET /api/history            — all civic_twin + life_event records
 * GET /api/history/complaints — all complaint records
 */

const router = require('express').Router()
const authMiddleware = require('../middlewares/auth')
const { history, complaintHistory } = require('../controllers/historyController')

// All history routes require authentication
router.use(authMiddleware)

router.get('/', history)
router.get('/complaints', complaintHistory)

module.exports = router
