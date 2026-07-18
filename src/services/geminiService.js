const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = 'gemini-2.0-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

/**
 * Calls Gemini with a prompt that must return JSON.
 * Throws typed errors so callers can decide how to fall back.
 */
export async function callGemini(prompt) {
  if (!API_KEY) {
    const err = new Error('No Gemini API key configured')
    err.code = 'NO_API_KEY'
    throw err
  }

  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: 'application/json',
        },
      }),
    })
  } catch (networkErr) {
    const err = new Error('Network error while calling Gemini')
    err.code = 'NETWORK_ERROR'
    throw err
  }

  if (!response.ok) {
    const err = new Error(`Gemini API returned status ${response.status}`)
    err.code = 'GEMINI_API_ERROR'
    throw err
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    const err = new Error('Gemini returned an empty response')
    err.code = 'EMPTY_RESPONSE'
    throw err
  }

  const cleaned = rawText.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (parseErr) {
    const err = new Error('Could not parse Gemini response as JSON')
    err.code = 'PARSE_ERROR'
    throw err
  }
}

export function hasApiKey() {
  return Boolean(API_KEY)
}
