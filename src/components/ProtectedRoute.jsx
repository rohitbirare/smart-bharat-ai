/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * If the user is not signed in, redirects to /login
 * and remembers the original destination for post-login redirect.
 *
 * Shows a loading spinner while Firebase resolves the initial auth state.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-orange-400" />
          <p className="text-sm text-white/40">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
