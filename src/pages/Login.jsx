/**
 * Login Page — Google Sign-In
 *
 * Matches the existing dark glass UI aesthetic.
 * No email/password form — Google OAuth only per spec.
 * Redirects to the app after successful sign-in.
 */
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Network, ShieldCheck, Chrome } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // After login, redirect to where the user was trying to go
  const from = location.state?.from?.pathname || '/twin'

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.')
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow pop-ups for this site.')
      } else {
        setError('Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md rounded-2xl p-8 text-center"
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400">
            <Network className="h-7 w-7 text-black" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold">
          Welcome to Bharat<span className="gradient-text">Setu</span> AI
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Your AI-powered civic guide for navigating Indian government services.
        </p>

        {/* Trust signals */}
        <div className="my-6 space-y-2 rounded-xl border border-white/8 bg-white/3 p-4 text-left">
          {[
            'Your data is saved securely in the cloud',
            'AI responses never leave our secure server',
            'Your Gemini API key is never stored in your browser',
          ].map((point) => (
            <div key={point} className="flex items-start gap-2 text-xs text-white/55">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Google Sign-In button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          id="google-signin-btn"
          className="glow-hover flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition-all hover:bg-white/10 disabled:opacity-60"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <GoogleIcon />
          )}
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        <p className="mt-6 text-xs text-white/30">
          By signing in, you agree that BharatSetu AI recommendations are AI-generated guidance
          and not official government information.
        </p>
      </motion.div>
    </div>
  )
}

// Google's official "G" logo as SVG
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
