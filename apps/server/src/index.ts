import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──────────────────────────────────────────
app.use(express.json())

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}))

// ── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ResearchOS server is running 🚀',
        timestamp: new Date().toISOString(),
    })
})

// ── Start Server ────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📋 Health check: http://localhost:${PORT}/health`)
})

export default app
