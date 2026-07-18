/**
 * middlewares/validate.js
 * Lightweight field-presence validator.
 * Pass an array of required field names; returns 422 with details if any are missing.
 *
 * Usage:
 *   router.post('/', validate(['age','state','profession']), controller)
 */

function validate(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => {
      const val = req.body[field]
      return val === undefined || val === null || String(val).trim() === ''
    })

    if (missing.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed — missing required fields.',
        code: 'VALIDATION_ERROR',
        details: missing.map((f) => ({ field: f, message: `${f} is required.` })),
      })
    }

    next()
  }
}

module.exports = validate
