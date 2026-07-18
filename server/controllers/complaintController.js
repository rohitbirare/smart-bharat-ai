/**
 * controllers/complaintController.js
 * Handles POST /api/complaint
 *
 * Drafts a professional complaint letter, generates a tracking ID,
 * and optionally returns a Base64-encoded PDF.
 */

const { v4: uuidv4 } = require('uuid')
const asyncHandler = require('../utils/asyncHandler')
const { generateComplaint } = require('../services/geminiService')
const { generateComplaintPDFBase64 } = require('../services/pdfService')
const { addHistory } = require('../services/historyService')

/**
 * POST /api/complaint
 * Body: { issueType, location, description }
 * req.user is set by authMiddleware
 */
const complaint = asyncHandler(async (req, res) => {
  const { issueType, location, description } = req.body
  const uid = req.user.uid
  const userName = req.user.name || req.user.email || 'Citizen'

  // Generate complaint content via Gemini
  const result = await generateComplaint({ issueType, location, description, userName })

  // Create a unique tracking ID for this complaint
  const trackingId = `BSC-${Date.now().toString(36).toUpperCase()}-${uuidv4().split('-')[0].toUpperCase()}`

  // Attach the tracking ID to the result
  result.trackingId = trackingId

  // Generate PDF in the background (non-blocking) — attach to response if successful
  let pdfBase64 = null
  let pdfFilename = `${trackingId}.pdf`
  try {
    pdfBase64 = await generateComplaintPDFBase64(result.formalComplaint, trackingId)
  } catch (pdfErr) {
    // PDF generation is optional — log but don't fail the request
    console.warn('[complaint] PDF generation failed:', pdfErr.message)
  }

  // Persist to history
  addHistory(
    uid,
    'complaint',
    { issueType, location, description },
    result,
    { trackingId }
  )

  res.status(200).json({
    success: true,
    data: {
      ...result,
      pdfBase64,
      pdfFilename,
    },
  })
})

module.exports = { complaint }
