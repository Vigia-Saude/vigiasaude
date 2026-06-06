import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Recall data...')

  // 1. Get default comprador user
  let comprador = await prisma.user.findFirst({
    where: { email: 'comprador@vigiasaude.com.br' }
  })
  if (!comprador) {
    comprador = await prisma.user.create({
      data: {
        nome: 'João Comprador',
        email: 'comprador@vigiasaude.com.br',
        cpf: '12345678900',
        senhaHash: '$2b$10$FzEersQUUfgc98FaICNMS.TEZNG5/HOHppexIFjO54Yg7epVNSMZy',
        role: 'COMPRADOR',
        perfil: 'SECRETARIO_SAUDE',
        status: 'ATIVO',
      }
    })
  }

  // 2. Clear existing recalls to avoid duplicates
  console.log('Clearing old Recall records...')
  await prisma.recall.deleteMany({})

  // 3. Reset statuses of any blocked lots to DISPONIVEL first, so the triggers can re-block them properly
  console.log('Resetting lot statuses in CD Stock...')
  await prisma.cdEstoqueLote.updateMany({
    data: { status: 'DISPONIVEL' }
  })

  // 4. Create recalls (this will fire the insert triggers)
  console.log('Inserting Recalls...')

  // Active ANVISA Recall - Amoxicilina 500mg
  const recallAmox = await prisma.recall.create({
    data: {
      catmatCodigo: 'BR0270027',
      numeroLote: 'LOT2024C789',
      medicamentoNome: 'Amoxicilina 500mg',
      fonte: 'ANVISA',
      risco: 'ALTO',
      motivo: 'Desvio de qualidade na embalagem do fabricante, com risco de comprometimento da esterilidade.',
      autoridadeEmissora: 'ANVISA',
      numeroAnvisa: 'RE 1234/2026',
      dataEmissao: new Date('2026-06-01T08:00:00Z'),
      ativo: true,
      criadoPor: comprador.id
    }
  })
  console.log(`Created Active Recall for Amoxicilina: ${recallAmox.id}`)

  // Active Fabricante Recall - Cetoconazol
  const recallCeto = await prisma.recall.create({
    data: {
      catmatCodigo: '6971',
      numeroLote: '372/25',
      medicamentoNome: 'CETOCONAZOL 20MG/G 30G 100 BISN HIPOLABOR',
      fonte: 'Fabricante',
      risco: 'MEDIO',
      motivo: 'Aviso voluntário do fabricante Hipolabor devido a teor de princípio ativo ligeiramente abaixo do limite especificado.',
      autoridadeEmissora: 'Hipolabor Farmacêutica Ltda',
      dataEmissao: new Date('2026-06-03T10:00:00Z'),
      ativo: true,
      criadoPor: comprador.id
    }
  })
  console.log(`Created Active Recall for Cetoconazol: ${recallCeto.id}`)

  // Inactive (Resolved) Recall - Paracetamol
  const recallParac = await prisma.recall.create({
    data: {
      catmatCodigo: 'BR0280028',
      numeroLote: 'LOT2024A123',
      medicamentoNome: 'Paracetamol 500mg',
      fonte: 'Vigilância Sanitária',
      risco: 'CRITICO',
      motivo: 'Suspeita de contaminação física. Análise laboratorial confirmou conformidade posteriormente.',
      autoridadeEmissora: 'Visa Municipal SP',
      dataEmissao: new Date('2026-05-15T09:00:00Z'),
      dataExpiracao: new Date('2026-05-25T18:00:00Z'),
      ativo: false,
      criadoPor: comprador.id
    }
  })
  console.log(`Created Resolved Recall for Paracetamol: ${recallParac.id}`)

  console.log('Recalls data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
