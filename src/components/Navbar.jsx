import { NavLink, useNavigate } from 'react-router-dom'
import { Network, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

const links = [
  { to: '/', label: 'Home' },
  { to: '/twin', label: 'Civic Twin' },
  { to: '/life-event', label: 'Life Events' },
  { to: '/complaint', label: 'Complaint Agent' },
  { to: '/history', label: 'My History' },
  { to: '/how-it-works', label: 'How It Works' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Sign-out failed:', err)
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#070b18]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <NavLink to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <Network className="h-5 w-5 text-orange-400" />
          <span>
            Bharat<span className="gradient-text">Setu</span> AI
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right side: user info or empty */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-2">
              {/* User avatar */}
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-8 w-8 rounded-full ring-1 ring-white/20"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-xs font-semibold text-orange-300 ring-1 ring-white/20">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="rounded-lg border border-white/15 px-4 py-1.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              Sign in
            </NavLink>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-white/70 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-white/5 px-5 py-3 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/60'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <button
              onClick={() => { setOpen(false); handleSignOut() }}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white/80"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg px-3 py-2 text-sm font-medium text-orange-400"
            >
              Sign in
            </NavLink>
          )}
        </div>
      )}
    </nav>
  )
}

