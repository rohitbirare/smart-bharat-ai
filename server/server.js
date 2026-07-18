/**
 * server.js
 * BharatSetu AI — Express backend entry point
 *
 * Starts an HTTP server on PORT (default 5000) with:
 *   - Firebase Admin SDK
 *   - Helmet (security headers)
 *   - CORS (allows the Vite frontend + any *.vercel.app deployment)
 *   - Compression (gzip)
 *   - Morgan (request logging)
 *   - JSON body parsing
 *   - Rate limiting
 *   - All API routes
 *   - Centralized error handler
 */

// ── Load environment variables first ─────────────────────────────────────────
require('dotenv').config()

// ── Initialize Firebase Admin before anything else ───────────────────────────
const { initFirebase } = require('./config/firebase')
initFirebase()

// ── Dependencies ─────────────────────────────────────────────────────────────
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth')
const civicTwinRoutes = require('./routes/civicTwin')
const lifeEventRoutes = require('./routes/lifeEvent')
const complaintRoutes = require('./routes/complaint')
const historyRoutes = require('./routes/history')

// ── Middleware ────────────────────────────────────────────────────────────────
const errorHandler = require('./middlewares/errorHandler')

// ── App ───────────────────────────────────────────────────────────────────────
const app = express()
const PORT = process.env.PORT || 5000

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow the Vite dev server and any production origin(s).
// CLIENT_ORIGIN can be a single URL or a comma-separated list
// (useful for allowing both your stable Vercel domain and preview URLs).
const allowedOrigins = [
  'http://localhost:5173',   // Vite default
  'http://localhost:3000',   // CRA / other
  'http://localhost:4173',   // Vite preview
  ...(process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
    : []),
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      // Also allow any *.vercel.app preview URL automatically
      if (origin && /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) {
        return callback(null, true)
      }
      callback(new Error(`CORS: origin ${origin} is not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression())

// ── Request Logging ───────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ── Global Rate Limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
})
app.use(globalLimiter)

// ── AI-specific Rate Limiter (stricter) ───────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // 20 AI requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request limit reached. Please wait a moment and try again.',
    code: 'AI_RATE_LIMIT_EXCEEDED',
  },
})

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'BharatSetu AI Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/civic-twin', aiLimiter, civicTwinRoutes)
app.use('/api/life-event', aiLimiter, lifeEventRoutes)
app.use('/api/complaint', aiLimiter, complaintRoutes)
app.use('/api/history', historyRoutes)

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
    code: 'NOT_FOUND',
  })
})

// ── Centralized Error Handler (MUST be last) ──────────────────────────────────
app.use(errorHandler)

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('')
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║          BharatSetu AI — Backend Server          ║')
  console.log('╠══════════════════════════════════════════════════╣')
  console.log(`║  🚀 Server running on   http://localhost:${PORT}    ║`)
  console.log(`║  🌍 Environment         ${(process.env.NODE_ENV || 'development').padEnd(25)}║`)
  console.log('║  🔒 Firebase Admin      ✅ Initialized           ║')
  console.log('║  🤖 AI Service          ✅ Ready                 ║')
  console.log('║  📋 Routes              /api/auth               ║')
  console.log('║                         /api/civic-twin         ║')
  console.log('║                         /api/life-event         ║')
  console.log('║                         /api/complaint          ║')
  console.log('║                         /api/history            ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log('')
})

module.exports = app
