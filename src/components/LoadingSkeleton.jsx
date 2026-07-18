import { AlertTriangle, RefreshCcw } from 'lucide-react'

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5">
          <div className="shimmer mb-3 h-4 w-2/3 rounded" />
          <div className="shimmer mb-2 h-3 w-full rounded" />
          <div className="shimmer mb-2 h-3 w-5/6 rounded" />
          <div className="shimmer h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  )
}

export function FallbackBanner({ onRetry }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-amber-200">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Live AI unavailable — showing sample data
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-lg bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-100 transition-colors hover:bg-amber-400/30"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Retry with AI
        </button>
      )}
    </div>
  )
}
