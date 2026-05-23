import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import helmet from 'helmet'
import path from 'path'
import { rateLimit } from 'express-rate-limit'
import authRoutes from './routes/authRoutes'
import apiRoutes from './routes/apiRoutes'
import { authMiddleware, roleMiddleware } from './middlewares/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Confiar no proxy reverso para o rate limiter funcionar
app.set('trust proxy', 1)

// Middlewares de Segurança
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json())

// Rate Limit para o Login (Prevenir Brute Force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 tentativas por IP
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
})

// Rotas
app.use('/auth', loginLimiter, authRoutes)
app.use('/api', apiRoutes)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Rota de teste pública
app.get('/', (req, res) => {
  res.send('Vigia Saúde API is running')
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor Vigia Saúde está online.' })
})

// Rota de teste protegida
app.get('/me', authMiddleware, (req: any, res) => {
  res.json({ user: req.user })
})

// Exemplo de rota protegida por Role
app.get('/comprador-only', authMiddleware, roleMiddleware(['COMPRADOR']), (req, res) => {
  res.send('Acesso exclusivo para compradores.')
})

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} recebido — encerrando servidor...`)
  server.close(async () => {
    const { disposeAllPrismaClients } = await import('./lib/prismaFactory.js')
    await disposeAllPrismaClients()
    process.exit(0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT',  () => gracefulShutdown('SIGINT'))
