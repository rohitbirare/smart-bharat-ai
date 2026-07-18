import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, FileText, ListChecks, Clock, Building2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiPost } from '../services/api.js'
import { AIBadge, PromptReveal } from '../components/AITransparency.jsx'
import { CardSkeleton } from '../components/LoadingSkeleton.jsx'

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
]

const INCOME_LEVELS = ['Below ₹2.5L', '₹2.5L - ₹5L', '₹5L - ₹10L', 'Above ₹10L']

export default function CivicTwin() {
  const { refreshToken } = useAuth()
  const [form, setForm] = useState({ age: '', state: 'Maharashtra', profession: '', income: INCOME_LEVELS[0], situation: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function runQuery(e) {
    e?.preventDefault()
    if (!form.age || !form.profession || !form.situation) {
      setError('Please fill in age, profession, and your situation.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const token = await refreshToken()
      const response = await apiPost('/api/civic-twin', form, token)
      setResult(response.data)
    } catch (err) {
      if (err.code === 'NETWORK_ERROR') {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.')
      } else if (err.status === 422 && err.details) {
        setError(err.details.map((d) => d.message).join(', '))
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Your Civic Twin</h1>
        <p className="mt-2 text-white/55">
          Share your real situation. Gemini AI reasons through it and generates a personalized civic journey — not a generic list.
        </p>
      </div>

      <form onSubmit={runQuery} className="glass mb-10 grid gap-4 rounded-2xl p-6 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm text-white/60">Age</label>
          <input
            type="number"
            min="0"
            max="120"
            value={form.age}
            onChange={update('age')}
            placeholder="e.g. 24"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-orange-400/50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-white/60">State</label>
          <select
            value={form.state}
            onChange={update('state')}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-orange-400/50"
          >
            {STATES.map((s) => (
              <option key={s} value={s} className="bg-[#0d1326]">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-white/60">Profession</label>
          <input
            type="text"
            value={form.profession}
            onChange={update('profession')}
            placeholder="e.g. Engineering student, Farmer, Shop owner"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-orange-400/50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-white/60">Income Level</label>
          <select
            value={form.income}
            onChange={update('income')}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-orange-400/50"
          >
            {INCOME_LEVELS.map((i) => (
              <option key={i} value={i} className="bg-[#0d1326]">
                {i}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm text-white/60">Your Situation</label>
          <textarea
            rows={3}
            value={form.situation}
            onChange={update('situation')}
            placeholder="e.g. I am a final-year engineering student looking for internship and scholarship support"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-orange-400/50"
          />
        </div>

        {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="glow-hover flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-black disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Analyzing your profile...' : 'Generate My Civic Journey'}
          </button>
        </div>
      </form>

      {loading && <CardSkeleton count={3} />}

      {!loading && result && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-white/70">{result.summary}</p>
            <AIBadge isLive={true} />
          </div>

          {result.disclaimer && (
            <div className="mb-5 rounded-xl border border-teal-400/20 bg-teal-400/5 px-4 py-3 text-xs text-teal-200/70">
              ℹ️ {result.disclaimer}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-3">
            {result.eligibleSchemes.map((scheme, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass glow-hover flex flex-col rounded-2xl p-5"
              >
                <span className="mb-2 inline-block w-fit rounded-full bg-orange-400/10 px-2.5 py-1 text-xs font-medium text-orange-300">
                  {scheme.category}
                </span>
                <h3 className="font-display text-base font-semibold">{scheme.schemeName}</h3>
                <p className="mt-2 text-sm text-white/55">{scheme.eligibilityReason}</p>

                <div className="mt-4 space-y-2 text-xs text-white/50">
                  <div className="flex items-start gap-2">
                    <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                    <span>{scheme.requiredDocuments.join(', ')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                    <span>{scheme.department}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                    <span>{scheme.timeline}</span>
                  </div>
                  {scheme.officialPortal && (
                    <div className="flex items-start gap-2">
                      <span className="text-teal-400">🔗</span>
                      <span className="break-all">{scheme.officialPortal}</span>
                    </div>
                  )}
                </div>

                <details className="mt-4 border-t border-white/5 pt-3">
                  <summary className="cursor-pointer flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white/70">
                    <FileText className="h-3.5 w-3.5" /> Application Steps
                  </summary>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-white/55">
                    {scheme.applicationSteps.map((step, si) => (
                      <li key={si}>{step}</li>
                    ))}
                  </ol>
                </details>
              </motion.div>
            ))}
          </div>

          {/* Prompt transparency — prompt is sent securely from the server */}
          <PromptReveal prompt="(Prompt is built and sent securely from the backend server — your API key is never exposed in the browser)" />
        </motion.div>
      )}
    </div>
  )
}
