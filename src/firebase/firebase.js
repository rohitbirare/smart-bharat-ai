/**
 * Firebase client SDK initialization.
 *
 * These public config values are safe to include in the frontend —
 * they are NOT secret. They identify your Firebase project but do not
 * grant any privileged access. Security is enforced by Firestore Rules.
 *
 * ⚠️  The Gemini API key is NEVER in this file. It lives only in server/.env
 */
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate required config
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missingKeys.length > 0) {
  console.warn(
    `⚠️ Missing Firebase config keys: ${missingKeys.join(', ')}\n` +
      'Copy .env.example → .env and fill in your Firebase project values.'
  )
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Request additional scopes for richer user profile data
googleProvider.addScope('profile')
googleProvider.addScope('email')
