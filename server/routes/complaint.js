/**
 * routes/complaint.js
 * POST /api/complaint
 *
 * NOTE: The frontend sends to /api/complaint (singular), not /api/complaints.
 */

const router = require('express').Router()
const authMiddleware = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { complaint } = require('../controllers/complaintController')

router.post(
  '/',
  authMiddleware,
  validate(['issueType', 'location', 'description']),
  complaint
)

module.exports = router
