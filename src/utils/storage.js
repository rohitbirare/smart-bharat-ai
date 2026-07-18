const KEYS = {
  CIVIC_TWIN: 'bharatsetu_civic_twin_history',
  COMPLAINTS: 'bharatsetu_complaints_history',
}

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — fail silently, app still works in-memory
  }
}

export function saveCivicTwinEntry(entry) {
  const list = safeGet(KEYS.CIVIC_TWIN)
  list.unshift({ ...entry, id: Date.now(), createdAt: new Date().toISOString() })
  safeSet(KEYS.CIVIC_TWIN, list.slice(0, 20))
}

export function getCivicTwinHistory() {
  return safeGet(KEYS.CIVIC_TWIN)
}

export function saveComplaintEntry(entry) {
  const list = safeGet(KEYS.COMPLAINTS)
  list.unshift({ ...entry, createdAt: new Date().toISOString() })
  safeSet(KEYS.COMPLAINTS, list.slice(0, 20))
}

export function getComplaintHistory() {
  return safeGet(KEYS.COMPLAINTS)
}
