/**
 * controllers/civicTwinController.js
 * Handles POST /api/civic-twin
 *
 * Accepts a citizen profile and returns a personalized civic journey
 * powered by Gemini AI.
 */

const asyncHandler = require('../utils/asyncHandler')
const { generateCivicTwin } = require('../services/geminiService')
const { addHistory } = require('../services/historyService')

/**
 * POST /api/civic-twin
 * Body: { age, state, profession, income, situation }
 */
const civicTwin = asyncHandler(async (req, res) => {
  const { age, state, profession, income, situation } = req.body
  const uid = req.user.uid

  const result = await generateCivicTwin({ age, state, profession, income, situation })

  // Persist to history
  addHistory(uid, 'civic_twin', { age, state, profession, income, situation }, result)

  res.status(200).json({
    success: true,
    data: result,
  })
})

module.exports = { civicTwin }
