import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { UserCircle2, HeartHandshake, FileWarning, ShieldCheck, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: UserCircle2,
    title: 'Civic Twin Dashboard',
    desc: 'Tell us your age, state, profession, income and situation — Gemini AI finds schemes you actually qualify for, and explains why.',
    to: '/twin',
    color: 'text-orange-400',
  },
  {
    icon: HeartHandshake,
    title: 'Life Event Intelligence',
    desc: 'Lost a job? Started farming? Became a parent? Describe it in your own words and get a real, situation-specific action plan.',
    to: '/life-event',
    color: 'text-teal-400',
  },
  {
    icon: FileWarning,
    title: 'Smart Complaint Agent',
    desc: 'Describe any civic issue — AI drafts a professional complaint letter, finds the right department, and tracks it.',
    to: '/complaint',
    color: 'text-amber-400',
  },
]

export default function Landing() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-16 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
          An AI Civic Trust Copilot for India
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
          India doesn't lack schemes.
          <br />
          It lacks <span className="gradient-text">trust and guidance.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-white/60 md:text-lg">
          BharatSetu AI understands your life situation, predicts what you'll need next,
          and helps you navigate government services confidently — without middlemen.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/twin"
            className="glow-hover flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-black"
          >
            Start Your Civic Journey <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/how-it-works"
            className="glow-hover rounded-xl border border-white/15 px-6 py-3 font-semibold text-white/80"
          >
            See How the AI Works
          </Link>
        </div>
      </motion.div>

      <div className="mt-20 grid gap-5 md:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link
              to={f.to}
              className="glass glow-hover block h-full rounded-2xl p-6 transition-colors"
            >
              <f.icon className={`h-8 w-8 ${f.color}`} />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
