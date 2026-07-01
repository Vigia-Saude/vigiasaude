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

// Middleware para padronizar o formato de erro ({ error } e { erro }) de forma retrocompatível
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && typeof body === 'object') {
      if ('error' in body && !('erro' in body)) {
        body.erro = body.error;
      } else if ('erro' in body && !('error' in body)) {
        body.error = body.erro;
      }
    }
    return originalJson.call(this, body);
  };
  next();
});

// Middlewares de Segurança
app.use(helmet())
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3002',
]
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').forEach(o => allowedOrigins.push(o.trim()))
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (como curl, mobile apps)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    try {
      const url = new URL(origin)
      const hostname = url.hostname
      
      // Permitir apenas o deploy de produção do Vercel, previews do próprio projeto ou o deploy do Railway
      const isProductionVercel = hostname === 'vigia-saude-git-developer-giancarlo-projects.vercel.app'
      const isPreviewVercel = hostname.startsWith('vigia-saude-') && hostname.endsWith('-giancarlo-projects.vercel.app')
      const isRailwayDeploy = hostname === 'vigiasaude-production.up.railway.app'
      const isRailwayNewDeploy = hostname === 'vigiasaude-production-a091.up.railway.app'
      
      if (isProductionVercel || isPreviewVercel || isRailwayDeploy || isRailwayNewDeploy) {
        return callback(null, true)
      }
    } catch {
      // Ignorar erros de parsing
    }
    
    callback(new Error('Não permitido pelo CORS'))
  },
  credentials: true
}))
app.use(express.json({ limit: '1mb' }))

// Rate Limiter Global para as rotas da API
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // Máximo 100 requisições por IP
  message: { error: 'Muitas requisições vindas deste IP, por favor tente novamente em um minuto.' }
})

// Rotas
app.use('/auth', authRoutes)
app.use('/api', apiLimiter, apiRoutes)
app.use('/uploads', authMiddleware, express.static(path.join(__dirname, '..', 'uploads')))

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
