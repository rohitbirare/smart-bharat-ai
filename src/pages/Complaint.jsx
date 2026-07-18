import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Copy, Download, Building2, AlertOctagon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiPost } from '../services/api.js'
import { AIBadge, PromptReveal } from '../components/AITransparency.jsx'
import { CardSkeleton } from '../components/LoadingSkeleton.jsx'
import ConfidenceRing from '../components/ConfidenceRing.jsx'

const PRIORITY_STYLE = {
  High: 'bg-red-400/10 text-red-300 border-red-400/30',
  Medium: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  Low: 'bg-teal-400/10 text-teal-300 border-teal-400/30',
}

export default function Complaint() {
  const { refreshToken, user } = useAuth()
  const [form, setForm] = useState({ issueType: '', location: '', description: '' })
  const [result, setResult] = useState(null)
  const [trackingId, setTrackingId] = useState('')
  const [pdfBase64, setPdfBase64] = useState(null)
  const [pdfFilename, setPdfFilename] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const filledCount = [form.issueType, form.location, form.description].filter((v) => v.trim()).length
  const missingFields = [
    !form.issueType && 'Issue Type',
    !form.location && 'Location',
    !form.description && 'Description',
  ].filter(Boolean)
  const readinessScore = Math.round((filledCount / 3) * 100)

  async function submit(e) {
    e.preventDefault()
    if (filledCount < 3) return
    setError('')
    setLoading(true)

    try {
      const token = await refreshToken()
      const response = await apiPost('/api/complaint', form, token)
      const data = response.data
      setResult(data)
      setTrackingId(data.trackingId)
      if (data.pdfBase64) {
        setPdfBase64(data.pdfBase64)
        setPdfFilename(data.pdfFilename || `${data.trackingId}.pdf`)
      }
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

  function copyLetter() {
    navigator.clipboard.writeText(result.formalComplaint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadPDF() {
    if (pdfBase64) {
      // Download the server-generated PDF
      const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = pdfFilename
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Fallback: download as plain text if PDF generation failed
      const blob = new Blob([result.formalComplaint], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${trackingId || 'complaint'}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Smart Complaint Agent</h1>
        <p className="mt-2 text-white/55">
          Describe your civic issue — AI identifies the right department and drafts a professional
          complaint letter, ready to submit.
        </p>
      </div>

      <form onSubmit={submit} className="glass mb-6 grid gap-4 rounded-2xl p-6">
        <div>
          <label className="mb-1.5 block text-sm text-white/60">Issue Type</label>
          <input
            type="text"
            value={form.issueType}
            onChange={update('issueType')}
            placeholder="e.g. Road damage, Water supply, Garbage collection"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-amber-400/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-white/60">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={update('location')}
            placeholder="e.g. Near Panchavati Signal, Nashik"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-amber-400/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-white/60">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={update('description')}
            placeholder="Describe the issue in detail..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-amber-400/50"
          />
        </div>

        <ConfidenceRing score={readinessScore} missingItems={missingFields} />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || filledCount < 3}
          className="glow-hover flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? 'Drafting complaint...' : 'Generate Complaint Letter'}
        </button>
      </form>

      {loading && <CardSkeleton count={1} />}

      {!loading && result && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{result.category}</span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLE[result.priority] || PRIORITY_STYLE.Medium}`}
              >
                {result.priority} priority
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                <Building2 className="h-3 w-3" /> {result.department}
              </span>
            </div>
            <AIBadge isLive={true} />
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <p className="text-xs text-white/40">Tracking ID</p>
                <p className="font-mono text-lg font-semibold text-teal-300">{trackingId}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Expected Resolution</p>
                <p className="text-sm font-medium">{result.estimatedDays}</p>
              </div>
              {result.escalationPath && (
                <div>
                  <p className="text-xs text-white/40">Escalation Authority</p>
                  <p className="text-xs text-white/60 max-w-[200px]">{result.escalationPath}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={copyLetter}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" /> {pdfBase64 ? 'Download PDF' : 'Download'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white p-6 text-black">
              <pre className="font-letter whitespace-pre-wrap text-sm leading-relaxed">
                {result.formalComplaint}
              </pre>
            </div>

            {result.priorityReason && (
              <div className="mt-4 flex items-start gap-2 text-xs text-white/45">
                <AlertOctagon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{result.priorityReason}</span>
              </div>
            )}
          </div>

          <PromptReveal prompt="(Prompt is built and sent securely from the backend server — your API key is never exposed in the browser)" />
        </motion.div>
      )}
    </div>
  )
}
