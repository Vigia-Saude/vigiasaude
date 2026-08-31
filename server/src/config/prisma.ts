import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente!')
}

/**
 * Normaliza a connection string para uso com o driver `pg` (node-postgres):
 * - Remove `pgbouncer=true`: esse parâmetro é entendido apenas pelo driver
 *   nativo do Prisma, NÃO pelo `pg`. Mantê-lo não desativa prepared statements
 *   e só gera confusão.
 * - Avisa quando aponta para o TRANSACTION pooler (porta 6543). Em servidor
 *   persistente (Railway) o correto é o SESSION pooler (porta 5432), que mantém
 *   uma conexão dedicada por cliente e evita quedas/reset de conexões ociosas.
 */
function normalizarConnString(raw: string): string {
  if (!raw) return raw
  try {
    const u = new URL(raw)
    u.searchParams.delete('pgbouncer')
    if (u.port === '6543') {
      console.warn(
        '⚠️ [DB] DATABASE_URL aponta para o TRANSACTION pooler (6543). ' +
          'Em servidor persistente (Railway), use o SESSION pooler (5432) ' +
          'para eliminar quedas de conexão. Ex.: troque :6543 por :5432 e remova ?pgbouncer=true.'
      )
    }
    return u.toString()
  } catch {
    return raw
  }
}

const connectionString = normalizarConnString(process.env.DATABASE_URL || '')
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1')

const pool = new Pool({
  connectionString,
  max: Number(process.env.DB_POOL_MAX || 8),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  allowExitOnIdle: false,
})

// Tratar erro em conexões ociosas para que o pool descarte sockets mortos sem quebrar o servidor
pool.on('error', (err) => {
  console.error('⚠️ [Postgres Pool] Erro em conexão ociosa (socket descartado automaticamente):', err.message)
})

const adapter = new PrismaPg(pool)

const base = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// ---------------------------------------------------------------------------
// Resiliência a conexões transitórias
//
// Contra o pooler do Supabase, sockets ociosos são frequentemente reciclados.
// A primeira query que pega um socket morto falha com um erro de conexão — mas
// a retentativa imediata já usa uma conexão nova e funciona. Este extension
// aplica esse retry de forma GLOBAL (todas as queries de todos os controllers),
// substituindo os retries manuais espalhados pelo código.
// ---------------------------------------------------------------------------
const ERROS_TRANSITORIOS = [
  'Connection terminated',
  'server closed the connection',
  'Connection terminated unexpectedly',
  'terminating connection',
  'Client has encountered a connection error',
  'connection is closed',
  'ECONNRESET',
  'socket hang up',
  'timeout exceeded when trying to connect',
  "Can't reach database server",
  'Server has closed the connection',
]

function ehTransitorio(err: any): boolean {
  const msg = String(err?.message ?? '')
  const code = err?.code
  if (code === 'P1001' || code === 'P1017' || code === 'ECONNRESET' || code === '57P01') return true
  return ERROS_TRANSITORIOS.some((t) => msg.includes(t))
}

const MAX_TENTATIVAS = Number(process.env.DB_RETRY_ATTEMPTS || 3)

// O runtime do client estendido é 100% compatível com o PrismaClient base;
// preservamos o TIPO base (`typeof base`) para não alterar as assinaturas usadas
// pelos controllers (ex.: passar o client para helpers/$transaction).
const prisma = base.$extends({
  name: 'retry-conexao-transitoria',
  query: {
    async $allOperations({ args, query }) {
      let ultimoErro: unknown
      for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
        try {
          return await query(args)
        } catch (err) {
          ultimoErro = err
          if (!ehTransitorio(err) || tentativa === MAX_TENTATIVAS) throw err
          const backoff = 150 * tentativa
          console.warn(
            `⚠️ [DB] Erro transitório de conexão (tentativa ${tentativa}/${MAX_TENTATIVAS}), ` +
              `retentando em ${backoff}ms: ${(err as any)?.message}`
          )
          await new Promise((r) => setTimeout(r, backoff))
        }
      }
      throw ultimoErro
    },
  },
}) as unknown as typeof base

/** Ping leve para manter o pool aquecido (usado pelo keepalive do scheduler e por /health). */
export async function pingDatabase(): Promise<boolean> {
  try {
    await base.$queryRaw`SELECT 1`
    return true
  } catch (err: any) {
    console.warn('⚠️ [DB] Ping falhou:', err?.message)
    return false
  }
}

export default prisma
export { prisma, pool }
