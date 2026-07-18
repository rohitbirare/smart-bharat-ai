import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ShieldAlert, AlertTriangle as Warn, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiPost } from '../services/api.js'
import { AIBadge, PromptReveal } from '../components/AITransparency.jsx'
import { CardSkeleton } from '../components/LoadingSkeleton.jsx'

const EXAMPLES = [
  'I lost my job last month',
  'I started a small farming business',
  'I just became a parent',
  'I need education support for my child',
]

const URGENCY_STYLE = {
  high: 'bg-red-400/10 text-red-300 border-red-400/30',
  medium: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  low: 'bg-teal-400/10 text-teal-300 border-teal-400/30',
}

export default function LifeEvent() {
  const { refreshToken } = useAuth()
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function analyze(text) {
    const value = text ?? input
    if (!value.trim()) return
    setError('')
    setLoading(true)

    try {
      const token = await refreshToken()
      const response = await apiPost('/api/life-event', { userInput: value }, token)
      setResult(response.data)
    } catch (err) {
      if (err.code === 'NETWORK_ERROR') {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Life Event Intelligence</h1>
        <p className="mt-2 text-white/55">
          Tell BharatSetu AI what's happening in your life — in your own words. It reasons through the
          real implications instead of matching keywords.
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. I lost my job and I'm not sure what support I can get..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-teal-400/50"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setInput(ex)
                analyze(ex)
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-teal-400/40 hover:text-teal-200"
            >
              {ex}
            </button>
          ))}
        </div>

        <button
          onClick={() => analyze()}
          disabled={loading}
          className="glow-hover mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-6 py-3 font-semibold text-black disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? 'Understanding your situation...' : 'Analyze My Situation'}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {loading && (
        <div className="mt-8">
          <CardSkeleton count={2} />
        </div>
      )}

      {!loading && result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-semibold">{result.detectedEvent}</h2>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase ${URGENCY_STYLE[result.urgency] || URGENCY_STYLE.medium}`}
              >
                {result.urgency} urgency
              </span>
            </div>
            <AIBadge isLive={true} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {result.recommendedServices.map((s, i) => (
              <div key={i} className="glass glow-hover rounded-2xl p-5">
                <h3 className="font-display font-semibold">{s.serviceName}</h3>
                <p className="mt-2 text-sm text-white/55">{s.description}</p>
                <p className="mt-3 text-xs text-white/40">
                  Documents: {s.documentsRequired?.join(', ')}
                </p>
                {s.officialPortal && (
                  <p className="mt-2 text-xs text-teal-400">🔗 {s.officialPortal}</p>
                )}
              </div>
            ))}
          </div>

          {result.governmentSchemes && result.governmentSchemes.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <h3 className="md:col-span-2 text-sm font-medium text-white/60">Relevant Government Schemes</h3>
              {result.governmentSchemes.map((scheme, i) => (
                <div key={i} className="glass rounded-xl p-4">
                  <p className="font-medium text-sm">{scheme.schemeName}</p>
                  <p className="text-xs text-white/50 mt-1">{scheme.ministry}</p>
                  <p className="text-xs text-white/55 mt-2">{scheme.briefDescription}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/5 p-5">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldAlert className="h-4 w-4" />
              <span className="font-display font-semibold">Avoid Middlemen</span>
            </div>
            <p className="mt-2 text-sm text-amber-100/80">{result.antiMiddlemanNote}</p>
          </div>

          {result.warnings?.length > 0 && (
            <div className="mt-4 flex items-start gap-2 text-sm text-white/50">
              <Warn className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-white/60">Next Actions</p>
            <div className="flex flex-wrap gap-2">
              {result.nextActions?.map((a, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60"
                >
                  <ArrowRight className="h-3 w-3" /> {a}
                </span>
              ))}
            </div>
          </div>

          {result.disclaimer && (
            <div className="mt-4 rounded-xl border border-teal-400/20 bg-teal-400/5 px-4 py-3 text-xs text-teal-200/70">
              ℹ️ {result.disclaimer}
            </div>
          )}

          <PromptReveal prompt="(Prompt is built and sent securely from the backend server — your API key is never exposed in the browser)" />
        </motion.div>
      )}
    </div>
  )
}
