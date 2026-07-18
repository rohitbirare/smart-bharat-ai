/**
 * config/firebase.js
 * Initializes Firebase Admin SDK using environment variables.
 * Never reads credentials from anywhere other than process.env.
 */

const admin = require('firebase-admin')

let initialized = false

function initFirebase() {
  if (initialized) return

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, ' +
        'FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in server/.env'
    )
  }

  // The private key stored in .env has literal \n — convert them to real newlines
  const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })

  initialized = true
  console.log('✅ Firebase Admin initialized (project:', FIREBASE_PROJECT_ID, ')')
}

module.exports = { admin, initFirebase }
