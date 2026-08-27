import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import helmet from 'helmet'
import path from 'path'
import { rateLimit } from 'express-rate-limit'
import compression from 'compression'

import authRoutes from './routes/authRoutes'
import apiRoutes from './routes/apiRoutes'
import { authMiddleware, roleMiddleware } from './middlewares/auth'

dotenv.config()

const app = express()
app.use(compression())
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
      
      // Permitir o deploy de produção e previews da Vercel (tanto giancarlo quanto tiscinovacoes ou Giancarlomellolino) e Railway
      const isVercel = hostname.endsWith('.vercel.app')
      const isRailwayDeploy = hostname.endsWith('.up.railway.app')
      
      if (isVercel || isRailwayDeploy) {
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

import { FilaWhatsappController } from './controllers/FilaWhatsappController'
import { ConfirmacaoController } from './controllers/ConfirmacaoController'

const filaWhatsappController = new FilaWhatsappController()
const confirmacaoController = new ConfirmacaoController()

// Webhook da Meta/WhatsApp (público)
app.get('/webhooks/whatsapp', filaWhatsappController.verifyWebhook)
app.post('/webhooks/whatsapp', filaWhatsappController.receiveWebhook)

// Callback do ChatBot (público) — respostas dos pacientes ao ciclo de confirmação
app.post('/api/regulacao/confirmacao/callback', confirmacaoController.callback)

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

// Middleware de erro global — garante resposta JSON (não HTML) para falhas de
// upload (Multer/Busboy: boundary ausente, arquivo grande demais, tipo inválido, etc.)
// e qualquer erro não tratado que chegue via next(err).
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }
  console.error('Erro não tratado:', err)
  const status = err?.status || err?.statusCode || 500
  const mensagem = err?.message || 'Erro interno do servidor.'
  res.status(status).json({ erro: mensagem })
})

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})

// Cron jobs do módulo de Confirmação Automatizada (seção 7)
import { startSchedulers, stopSchedulers } from './jobs/scheduler'
startSchedulers()

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} recebido — encerrando servidor...`)
  stopSchedulers()
  server.close(async () => {
    const { disposeAllPrismaClients } = await import('./lib/prismaFactory.js')
    await disposeAllPrismaClients()
    process.exit(0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT',  () => gracefulShutdown('SIGINT'))
