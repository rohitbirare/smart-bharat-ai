/**
 * controllers/historyController.js
 * Handles GET /api/history and GET /api/history/complaints
 *
 * Returns the authenticated user's civic history from in-memory store.
 */

const asyncHandler = require('../utils/asyncHandler')
const { getHistory, getComplaintHistory } = require('../services/historyService')

/**
 * GET /api/history
 * Returns civic_twin + life_event records for the current user.
 */
const history = asyncHandler(async (req, res) => {
  const uid = req.user.uid
  const records = getHistory(uid)

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  })
})

/**
 * GET /api/history/complaints
 * Returns complaint records for the current user.
 */
const complaintHistory = asyncHandler(async (req, res) => {
  const uid = req.user.uid
  const records = getComplaintHistory(uid)

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  })
})

module.exports = { history, complaintHistory }
