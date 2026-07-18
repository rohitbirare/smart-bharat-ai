/**
 * API service — authenticated HTTP client for all backend calls.
 *
 * Replaces the old geminiService.js.
 * All Gemini calls now go through the backend, keeping the API key secure.
 *
 * Functions:
 *   apiGet(path, token)        : GET request with auth header
 *   apiPost(path, body, token) : POST request with auth header
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Core fetch wrapper that handles auth headers, JSON parsing, and error throwing.
 * @param {string} path - API path e.g. '/api/civic-twin'
 * @param {object} options - fetch options
 * @param {string|null} token - Firebase ID token
 */
async function request(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })
  } catch (networkErr) {
    const err = new Error('Network error — cannot reach the server. Is the backend running?')
    err.code = 'NETWORK_ERROR'
    throw err
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const err = new Error(data.message || `Server error: ${response.status}`)
    err.code = data.code || `HTTP_${response.status}`
    err.status = response.status
    err.details = data.details || null
    throw err
  }

  return data
}

/**
 * Authenticated GET request.
 * @param {string} path
 * @param {string} token - Firebase ID token
 * @param {object} queryParams - optional query parameters
 */
export async function apiGet(path, token, queryParams = {}) {
  const query = new URLSearchParams(queryParams).toString()
  const fullPath = query ? `${path}?${query}` : path
  return request(fullPath, { method: 'GET' }, token)
}

/**
 * Authenticated POST request.
 * @param {string} path
 * @param {object} body
 * @param {string} token - Firebase ID token
 */
export async function apiPost(path, body, token) {
  return request(
    path,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    token
  )
}
