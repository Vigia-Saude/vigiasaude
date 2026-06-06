import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Auditoria logs for CD...')

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

  // 2. Clear old CD audit records
  console.log('Clearing old auditoria records...')
  await prisma.auditoria.deleteMany({})

  // 3. Create realistic audit records
  const now = new Date()
  
  const auditLogs = [
    {
      dataHora: new Date(now.getTime() - 60 * 60 * 1000 * 24 * 5), // 5 days ago
      usuarioId: comprador.id,
      acao: 'ENTRADA_ESTOQUE',
      entidadeId: 'nf-001',
      dadosDepois: {
        notaFiscal: {
          id: 'nf-001',
          numeroNf: 'NF-10293',
          serie: '1',
          valorTotal: 15200.50,
          status: 'CONFERIDA'
        },
        itens: [
          { medicamento: 'Paracetamol 500mg', lote: 'LOT2024A123', quantidade: 5000, validade: '2027-12-31' },
          { medicamento: 'Amoxicilina 500mg', lote: 'LOT2024C789', quantidade: 2000, validade: '2026-08-30' }
        ]
      },
      justificativa: 'Recebimento e conferência física das vacinas e insumos sem divergências.'
    },
    {
      dataHora: new Date(now.getTime() - 60 * 60 * 1000 * 24 * 4), // 4 days ago
      usuarioId: comprador.id,
      acao: 'PEDIDO_CRIADO',
      entidadeId: 'PED-2026-0001',
      dadosDepois: {
        pedidoId: 'PED-2026-0001',
        unidade: 'UBS Central',
        urgencia: 'ALTA',
        itens: [
          { medicamento: 'Paracetamol 500mg', quantidade: 300 }
        ]
      },
      justificativa: 'Solicitação automática baseada no estoque mínimo atingido na UBS.'
    },
    {
      dataHora: new Date(now.getTime() - 60 * 60 * 1000 * 24 * 3.5), // 3.5 days ago
      usuarioId: comprador.id,
      acao: 'PEDIDO_APROVADO',
      entidadeId: 'PED-2026-0001',
      dadosAntes: { status: 'PENDENTE' },
      dadosDepois: { status: 'APROVADO', aprovadoPor: comprador.nome },
      justificativa: 'Pedido validado e liberado para separação.'
    },
    {
      dataHora: new Date(now.getTime() - 60 * 60 * 1000 * 24 * 3.2), // 3.2 days ago
      usuarioId: comprador.id,
      acao: 'TRANSFERENCIA_INICIADA',
      entidadeId: 'PED-2026-0001',
      dadosAntes: { status: 'APROVADO' },
      dadosDepois: { status: 'AGUARDANDO_MOTORISTA', motorista: 'Carlos Motorista' },
      justificativa: 'Motorista designado para realizar a entrega na UBS Central.'
    },
    {
      dataHora: new Date(now.getTime() - 60 * 60 * 1000 * 24 * 3), // 3 days ago
      usuarioId: comprador.id,
      acao: 'RECALL_REGISTRADO',
      entidadeId: 'recall-001',
      dadosDepois: {
        id: 'recall-001',
        medicamento: 'Amoxicilina 500mg',
        lote: 'LOT2024C789',
        motivo: 'Desvio de qualidade na embalagem do fabricante, com risco de comprometimento da esterilidade.',
        anvisa: 'RE 1234/2026',
        lotesBloqueados: ['LOT2024C789']
      },
      justificativa: 'Alerta emitido pela ANVISA determinando recolhimento imediato.'
    },
    {
      dataHora: new Date(now.getTime() - 60 * 60 * 1000 * 24 * 2.5), // 2.5 days ago
      usuarioId: comprador.id,
      acao: 'TRANSFERENCIA_CONCLUIDA',
      entidadeId: 'PED-2026-0001',
      dadosAntes: { status: 'AGUARDANDO_MOTORISTA' },
      dadosDepois: { status: 'CONCLUIDO' },
      justificativa: 'Comprovante de entrega assinado digitalmente pelo responsável na UBS Central.'
    },
    {
      dataHora: new Date(now.getTime() - 60 * 60 * 1000 * 24 * 2), // 2 days ago
      usuarioId: comprador.id,
      acao: 'DISPENSACAO',
      entidadeId: 'dispensacao-551',
      dadosDepois: {
        id: 'dispensacao-551',
        paciente: 'Carlos Eduardo Silva',
        medicamento: 'Paracetamol 500mg',
        quantidade: 20,
        lote: 'LOT2024A123',
        prescritor: 'Dr. Marcos Oliveira (CRM 12345)'
      },
      justificativa: 'Dispensação realizada via prescrição eletrônica.'
    },
    {
      dataHora: new Date(now.getTime() - 60 * 60 * 1000 * 24 * 1), // 1 day ago
      usuarioId: comprador.id,
      acao: 'RECALL_ENCERRADO',
      entidadeId: 'recall-001',
      dadosAntes: { ativo: true },
      dadosDepois: { ativo: false },
      justificativa: 'Conclusão da vistoria técnica e devolução dos lotes afetados para a distribuidora.'
    }
  ]

  for (const log of auditLogs) {
    const createdLog = await prisma.auditoria.create({
      data: log
    })
    console.log(`Created audit record for action: ${createdLog.acao} (ID: ${createdLog.id})`)
  }

  console.log('Auditoria CD logs seeded successfully!')
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
