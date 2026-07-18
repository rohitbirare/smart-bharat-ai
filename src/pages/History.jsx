import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileClock, UserCircle2, Inbox, RefreshCw, HeartHandshake } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiGet } from '../services/api.js'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function History() {
  const { refreshToken } = useAuth()
  const [tab, setTab] = useState('complaints')
  const [complaints, setComplaints] = useState([])
  const [twins, setTwins] = useState([])
  const [lifeEvents, setLifeEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchHistory() {
    setLoading(true)
    setError('')
    try {
      const token = await refreshToken()
      const [allHistory, complaintHistory] = await Promise.all([
        apiGet('/api/history', token),
        apiGet('/api/history/complaints', token),
      ])

      const historyItems = allHistory.data || []
      setTwins(historyItems.filter((h) => h.type === 'civic_twin'))
      setLifeEvents(historyItems.filter((h) => h.type === 'life_event'))
      setComplaints(complaintHistory.data || [])
    } catch (err) {
      if (err.code === 'NETWORK_ERROR') {
        setError('Cannot reach the server. Make sure the backend is running.')
      } else {
        setError(err.message || 'Failed to load history.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const tabs = [
    { key: 'complaints', label: `Complaints (${complaints.length})` },
    { key: 'twin', label: `Civic Twin (${twins.length})` },
    { key: 'life', label: `Life Events (${lifeEvents.length})` },
  ]

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">My Civic History</h1>
          <p className="mt-2 text-white/55">Everything you've submitted, synced across all your devices.</p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.key ? 'bg-white/10 text-white' : 'text-white/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass h-16 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {tab === 'complaints' && (
            <div className="space-y-3">
              {complaints.length === 0 && <EmptyState label="No complaints submitted yet." />}
              {complaints.map((c, i) => (
                <motion.div
                  key={c.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <FileClock className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="font-medium">{c.result?.category || c.form?.issueType}</p>
                      <p className="text-xs text-white/40">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.result?.priority && (
                      <span className="text-xs text-white/40">{c.result.priority} priority</span>
                    )}
                    <span className="font-mono text-xs text-teal-300">{c.trackingId}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'twin' && (
            <div className="space-y-3">
              {twins.length === 0 && <EmptyState label="No Civic Twin queries yet." />}
              {twins.map((t, i) => (
                <motion.div
                  key={t.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="h-5 w-5 text-orange-400" />
                    <div>
                      <p className="font-medium">
                        {t.input?.profession}, {t.input?.state}
                      </p>
                      <p className="text-xs text-white/40">{formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-white/50">
                    {t.result?.eligibleSchemes?.length || 0} schemes found
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'life' && (
            <div className="space-y-3">
              {lifeEvents.length === 0 && <EmptyState label="No life event analyses yet." />}
              {lifeEvents.map((e, i) => (
                <motion.div
                  key={e.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <HeartHandshake className="h-5 w-5 text-teal-400" />
                    <div>
                      <p className="font-medium">{e.result?.detectedEvent || 'Life Event'}</p>
                      <p className="text-xs text-white/40">{formatDate(e.createdAt)}</p>
                    </div>
                  </div>
                  {e.input?.userInput && (
                    <p className="mt-2 text-sm text-white/50 line-clamp-2">"{e.input.userInput}"</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div className="glass flex flex-col items-center gap-2 rounded-xl p-10 text-center text-white/40">
      <Inbox className="h-8 w-8" />
      <p>{label}</p>
    </div>
  )
}
