/**
 * controllers/lifeEventController.js
 * Handles POST /api/life-event
 *
 * Accepts free-text life event description and returns AI-generated
 * government process guidance.
 */

const asyncHandler = require('../utils/asyncHandler')
const { analyzeLifeEvent } = require('../services/geminiService')
const { addHistory } = require('../services/historyService')

/**
 * POST /api/life-event
 * Body: { userInput }
 */
const lifeEvent = asyncHandler(async (req, res) => {
  const { userInput } = req.body
  const uid = req.user.uid

  const result = await analyzeLifeEvent(userInput)

  // Persist to history
  addHistory(uid, 'life_event', { userInput }, result)

  res.status(200).json({
    success: true,
    data: result,
  })
})

module.exports = { lifeEvent }
