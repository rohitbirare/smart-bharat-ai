/**
 * routes/lifeEvent.js
 * POST /api/life-event
 *
 * NOTE: The frontend sends to /api/life-event (singular), not /api/life-events.
 */

const router = require('express').Router()
const authMiddleware = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { lifeEvent } = require('../controllers/lifeEventController')

router.post('/', authMiddleware, validate(['userInput']), lifeEvent)

module.exports = router
