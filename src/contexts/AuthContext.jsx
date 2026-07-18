/**
 * AuthContext — Firebase Authentication context for the entire React app.
 *
 * Provides:
 *   user         : Firebase User object | null
 *   loading      : boolean — true while checking auth state on mount
 *   idToken      : string | null — current Firebase ID token for API calls
 *   signInWithGoogle() : triggers Google popup sign-in
 *   signOut()          : signs out and clears state
 *   refreshToken()     : forces a token refresh (called before API requests)
 *
 * Usage:
 *   const { user, signInWithGoogle, signOut } = useAuth()
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase/firebase.js'
import { apiPost } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [idToken, setIdToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          setIdToken(token)
          setUser(firebaseUser)

          // Register/update user in our backend
          await apiPost('/api/auth/login', {}, token)
        } catch (err) {
          console.error('[Auth] Failed to sync user with backend:', err.message)
          setUser(firebaseUser) // Still set user even if backend sync fails
        }
      } else {
        setUser(null)
        setIdToken(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err) {
      console.error('[Auth] Google sign-in failed:', err.message)
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await apiPost('/api/auth/logout', {}, idToken).catch(() => {}) // non-fatal
      await firebaseSignOut(auth)
      setUser(null)
      setIdToken(null)
    } catch (err) {
      console.error('[Auth] Sign-out failed:', err.message)
      throw err
    }
  }, [idToken])

  /**
   * Returns a fresh ID token, refreshing if expired.
   * Call this before any authenticated API request.
   */
  const refreshToken = useCallback(async () => {
    if (!auth.currentUser) return null
    const token = await auth.currentUser.getIdToken(/* forceRefresh */ false)
    setIdToken(token)
    return token
  }, [])

  return (
    <AuthContext.Provider value={{ user, idToken, loading, signInWithGoogle, signOut, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
