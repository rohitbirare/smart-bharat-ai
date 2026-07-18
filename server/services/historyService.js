/**
 * services/historyService.js
 * In-memory history store per user.
 *
 * Falls back to this in-memory store if a database is unavailable.
 * Data is keyed by Firebase UID and segmented by type:
 *   - civic_twin
 *   - life_event
 *   - complaint
 */

const { v4: uuidv4 } = require('uuid')

// In-memory store: { [uid]: { civic_twin: [], life_event: [], complaint: [] } }
const store = {}

function ensureUser(uid) {
  if (!store[uid]) {
    store[uid] = { civic_twin: [], life_event: [], complaint: [] }
  }
}

/**
 * Adds a record to a user's history.
 * @param {string} uid - Firebase UID
 * @param {'civic_twin'|'life_event'|'complaint'} type
 * @param {object} input - The original user inputs
 * @param {object} result - The AI-generated result
 * @param {object} [extra] - Optional extra fields (e.g. trackingId for complaints)
 */
function addHistory(uid, type, input, result, extra = {}) {
  ensureUser(uid)
  const record = {
    id: uuidv4(),
    type,
    input,
    result,
    createdAt: new Date().toISOString(),
    ...extra,
  }
  store[uid][type].unshift(record) // newest first

  // Keep at most 50 entries per type per user
  if (store[uid][type].length > 50) {
    store[uid][type] = store[uid][type].slice(0, 50)
  }

  return record
}

/**
 * Returns all civic_twin and life_event records for a user (combined).
 * @param {string} uid
 */
function getHistory(uid) {
  ensureUser(uid)
  const { civic_twin, life_event } = store[uid]
  return [...civic_twin, ...life_event].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
}

/**
 * Returns all complaint records for a user.
 * @param {string} uid
 */
function getComplaintHistory(uid) {
  ensureUser(uid)
  return store[uid].complaint
}

module.exports = { addHistory, getHistory, getComplaintHistory }
