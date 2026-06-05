import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import dns from 'dns'

dotenv.config()

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente!')
}

let cachedPoolerIp: string | null = null

// Pre-resolve pooler IPv4 address at startup to keep it dynamic and robust
dns.lookup('aws-0-sa-east-1.pooler.supabase.com', { family: 4 }, (err, address) => {
  if (!err && address) {
    cachedPoolerIp = address
    console.log(`[Database DNS] Pre-resolved pooler to IPv4: ${address}`)
  } else {
    cachedPoolerIp = '52.67.1.88'
    console.error('[Database DNS] Failed to resolve pooler dynamically, using fallback:', err)
  }
})

const customLookup = (hostname: string, options: any, callback: any) => {
  if (hostname === 'db.oxanubfolkoulklrhrpr.supabase.co') {
    const ip = cachedPoolerIp || '52.67.1.88'
    return callback(null, ip, 4)
  }
  return dns.lookup(hostname, options, callback)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // @ts-ignore
  lookup: customLookup
})
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

export default prisma

