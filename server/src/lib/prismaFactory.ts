import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const SCHEMA_REGEX = /^tenant_[a-z][a-z0-9_]{1,50}$/;

const clientCache = new Map<string, PrismaClient>();

export function getPrismaForSchema(schema: string): PrismaClient {
  if (!SCHEMA_REGEX.test(schema)) {
    throw new Error(`Schema inválido: "${schema}". Use o padrão tenant_nome_unidade`);
  }

  const cached = clientCache.get(schema);
  if (cached) return cached;

  const baseUrl = process.env.DATABASE_URL_DIRECT;
  if (!baseUrl) throw new Error('DATABASE_URL_DIRECT não configurada');

  const url = new URL(baseUrl);
  url.searchParams.set('options', `--search_path=${schema},public`);

  const pool = new Pool({ connectionString: url.toString() });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

  clientCache.set(schema, client);
  return client;
}

export async function disposePrismaForSchema(schema: string): Promise<void> {
  const client = clientCache.get(schema);
  if (client) {
    await client.$disconnect();
    clientCache.delete(schema);
  }
}

export async function disposeAllPrismaClients(): Promise<void> {
  await Promise.all([...clientCache.values()].map(c => c.$disconnect()));
  clientCache.clear();
}
