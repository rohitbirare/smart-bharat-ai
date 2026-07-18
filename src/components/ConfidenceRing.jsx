import { motion } from 'framer-motion'

export default function ConfidenceRing({ score = 0, missingItems = [] }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = score >= 80 ? '#22d3c4' : score >= 50 ? '#ffb84d' : '#ff6b6b'
  const status = score >= 80 ? 'Ready for Submission' : score >= 50 ? 'Almost Ready' : 'Needs More Info'

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-32 w-32 shrink-0">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold">{score}%</span>
        </div>
      </div>

      <div>
        <p className="font-display text-lg font-semibold" style={{ color }}>
          {status}
        </p>
        {missingItems.length > 0 ? (
          <ul className="mt-1 space-y-0.5 text-sm text-white/50">
            {missingItems.map((item) => (
              <li key={item}>• Missing: {item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-white/50">All required information provided.</p>
        )}
      </div>
    </div>
  )
}
