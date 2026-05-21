import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando seed...')

  // Limpar dados existentes (opcional, cuidado em produção)
  // await prisma.auditoria.deleteMany({})
  // await prisma.pedidoCompra.deleteMany({})
  // await prisma.medicamentoAta.deleteMany({})
  // await prisma.ata.deleteMany({})
  // await prisma.user.deleteMany({})

  // Criar Usuário Comprador
  const comprador = await prisma.user.upsert({
    where: { email: 'comprador@vigiasaude.com.br' },
    update: {},
    create: {
      nome: 'João Comprador',
      email: 'comprador@vigiasaude.com.br',
      senhaHash: '$2b$10$BOy0TlhfA4uYyvDEN0bCHeK8eRwAjqumO60t72AEyxJ3TGEgR/fgS', // Senha: 123456
      role: 'COMPRADOR',
    },
  })

  // Criar Usuário Fornecedor
  const fornecedor = await prisma.user.upsert({
    where: { email: 'fornecedor@medsupply.com.br' },
    update: {},
    create: {
      nome: 'Maria Fornecedora',
      email: 'fornecedor@medsupply.com.br',
      senhaHash: '$2b$10$BOy0TlhfA4uYyvDEN0bCHeK8eRwAjqumO60t72AEyxJ3TGEgR/fgS', // Senha: 123456
      role: 'FORNECEDOR',
      fornecedorId: 'f1',
    },
  })

  console.log({ comprador, fornecedor })

  // Carga de dados CATMAT a partir do arquivo CSV
  const csvPath = path.resolve(__dirname, '..', '..', 'catmat_medicamentos.csv')
  console.log(`Lendo arquivo CSV em: ${csvPath}`)

  if (!fs.existsSync(csvPath)) {
    throw new Error(`Arquivo CSV de medicamentos não encontrado em: ${csvPath}`)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as any[]

  console.log(`Linhas lidas do CSV: ${records.length}`)

  // Deduplicar registros por codigoBr no arquivo CSV
  const map = new Map<string, { codigoBr: string; descricao: string; unidadeFornecimento: string }>()

  for (const record of records) {
    const codigoBr = record.codigo_br?.trim()
    const descricao = record.descricao?.trim()
    const unidadeFornecimento = record.unidade_fornecimento?.trim()

    if (!codigoBr || !descricao) {
      continue
    }

    // Mantém o primeiro registro encontrado no CSV
    if (!map.has(codigoBr)) {
      map.set(codigoBr, {
        codigoBr,
        descricao,
        unidadeFornecimento: unidadeFornecimento || '',
      })
    }
  }

  const uniqueRecords = Array.from(map.values())
  console.log(`Registros únicos do CATMAT para inserção: ${uniqueRecords.length}`)

  // Inserir em lotes de 1000 registros
  const CHUNK_SIZE = 1000
  let totalInseridos = 0

  for (let i = 0; i < uniqueRecords.length; i += CHUNK_SIZE) {
    const chunk = uniqueRecords.slice(i, i + CHUNK_SIZE)
    const res = await prisma.catmatMedicamento.createMany({
      data: chunk,
      skipDuplicates: true,
    })
    totalInseridos += res.count
    console.log(`Lote de ${chunk.length} processado. Novos registros inseridos no banco: ${res.count}`)
  }

  console.log(`Importação concluída. Total de novos registros adicionados: ${totalInseridos}`)

  // Criar uma Ata de Exemplo
  const ataExemplo = await prisma.ata.upsert({
    where: { numero: '2024/001' },
    update: {},
    create: {
      numero: '2024/001',
      vigenciaInicio: new Date('2024-01-01'),
      vigenciaFim: new Date('2025-01-01'),
      valorTeto: 100000.00,
      fornecedorNome: 'MedSupply SA',
      fornecedorCnpj: '12.345.678/0001-99',
      status: 'ATIVA',
      medicamentos: {
        create: [
          {
            nome: 'Amoxicilina 500mg',
            precoUnitario: 1.50,
            qtdeInicial: 10000,
          },
          {
            nome: 'Dipirona 500mg',
            precoUnitario: 0.50,
            qtdeInicial: 50000,
          }
        ]
      }
    }
  })

  console.log('Ata de exemplo criada:', ataExemplo.numero)
  console.log('Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    // @ts-expect-error - process is global in node
    if (typeof process !== 'undefined') process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
