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
  console.log('Iniciando seed de alta fidelidade...')

  // Limpar tabelas dependentes
  console.log('Limpando tabelas antigas...')
  await prisma.auditoria.deleteMany({})
  await prisma.pedidoCompraItem.deleteMany({})
  await prisma.ataConsumo.deleteMany({})
  await prisma.pedidoCompra.deleteMany({})
  await prisma.medicamentoAta.deleteMany({})
  await prisma.ata.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.fornecedor.deleteMany({})

  // Criar Usuário Comprador
  const comprador = await prisma.user.upsert({
    where: { email: 'comprador@vigiasaude.com.br' },
    update: {},
    create: {
      nome: 'João Comprador',
      email: 'comprador@vigiasaude.com.br',
      cpf: '12345678900',
      senhaHash: '$2b$10$FzEersQUUfgc98FaICNMS.TEZNG5/HOHppexIFjO54Yg7epVNSMZy', // Senha: 123456
      role: 'COMPRADOR',
      perfil: 'SECRETARIO_SAUDE',
      status: 'ATIVO',
    },
  })

  // Criar Fornecedor
  const fornecedor = await prisma.fornecedor.create({
    data: {
      id: 'f1',
      cnpj: '12.345.678/0001-99',
      razaoSocial: 'MedSupply Distribuidora de Medicamentos SA',
      nomeFantasia: 'MedSupply SA',
      email: 'contato@medsupply.com.br',
      whatsapp: '11999999999',
      status: 'ATIVO',
      categorias: ['Medicamentos'],
    }
  })

  // Criar Usuário Fornecedor
  const usuarioFornecedor = await prisma.user.upsert({
    where: { email: 'fornecedor@medsupply.com.br' },
    update: {},
    create: {
      nome: 'Maria Fornecedora',
      email: 'fornecedor@medsupply.com.br',
      cpf: '98765432100',
      senhaHash: '$2b$10$FzEersQUUfgc98FaICNMS.TEZNG5/HOHppexIFjO54Yg7epVNSMZy', // Senha: 123456
      role: 'FORNECEDOR',
      status: 'ATIVO',
      fornecedorId: fornecedor.id,
    },
  })

  console.log({ comprador, fornecedor, usuarioFornecedor })

  // Carga de dados CATMAT a partir do arquivo CSV (se existirem novos ou para garantir)
  const csvPath = path.resolve(__dirname, '..', '..', 'catmat_medicamentos.csv')
  if (fs.existsSync(csvPath)) {
    console.log(`Lendo arquivo CSV em: ${csvPath}`)
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as any[]

    console.log(`Linhas lidas do CSV: ${records.length}`)
    const map = new Map<string, { codigoBr: string; descricao: string; unidadeFornecimento: string }>()

    for (const record of records) {
      const codigoBr = record.codigo_br?.trim()
      const descricao = record.descricao?.trim()
      const unidadeFornecimento = record.unidade_fornecimento?.trim()

      if (!codigoBr || !descricao) continue

      if (!map.has(codigoBr)) {
        map.set(codigoBr, {
          codigoBr,
          descricao,
          unidadeFornecimento: unidadeFornecimento || '',
        })
      }
    }

    const uniqueRecords = Array.from(map.values())
    const CHUNK_SIZE = 1000
    let totalInseridos = 0

    for (let i = 0; i < uniqueRecords.length; i += CHUNK_SIZE) {
      const chunk = uniqueRecords.slice(i, i + CHUNK_SIZE)
      const res = await prisma.catmatMedicamento.createMany({
        data: chunk,
        skipDuplicates: true,
      })
      totalInseridos += res.count
    }
    console.log(`CATMAT total importado: ${totalInseridos}`)
  }

  // Criar 8 ATAs Ativas (3 delas vencendo em menos de 45 dias)
  // Valor total das 8 ATAs = R$ 1.000.000,00
  const today = new Date()
  
  const getFutureDate = (days: number) => {
    const d = new Date()
    d.setDate(today.getDate() + days)
    return d
  }

  const getPastDate = (days: number) => {
    const d = new Date()
    d.setDate(today.getDate() - days)
    return d
  }

  console.log('Criando 8 ATAs vigentes...')

  const atasConfig = [
    // 3 ATAs vencendo em menos de 45 dias
    { numero: 'ATA-2026-0001', vigenciaInicio: getPastDate(300), vigenciaFim: getFutureDate(10), valorTeto: 100000.00 }, // Expira em 10 dias
    { numero: 'ATA-2026-0002', vigenciaInicio: getPastDate(320), vigenciaFim: getFutureDate(20), valorTeto: 120000.00 }, // Expira em 20 dias
    { numero: 'ATA-2026-0003', vigenciaInicio: getPastDate(310), vigenciaFim: getFutureDate(30), valorTeto: 80000.00 },  // Expira em 30 dias
    
    // 5 ATAs vigentes a longo prazo
    { numero: 'ATA-2026-0004', vigenciaInicio: getPastDate(50), vigenciaFim: getFutureDate(300), valorTeto: 150000.00 },
    { numero: 'ATA-2026-0005', vigenciaInicio: getPastDate(60), vigenciaFim: getFutureDate(200), valorTeto: 150000.00 },
    { numero: 'ATA-2026-0006', vigenciaInicio: getPastDate(40), vigenciaFim: getFutureDate(250), valorTeto: 200000.00 },
    { numero: 'ATA-2026-0007', vigenciaInicio: getPastDate(80), vigenciaFim: getFutureDate(180), valorTeto: 100000.00 },
    { numero: 'ATA-2026-0008', vigenciaInicio: getPastDate(90), vigenciaFim: getFutureDate(270), valorTeto: 100000.00 },
  ]

  const seededAtas = []

  for (const config of atasConfig) {
    const ata = await prisma.ata.create({
      data: {
        numero: config.numero,
        vigenciaInicio: config.vigenciaInicio,
        vigenciaFim: config.vigenciaFim,
        valorTeto: config.valorTeto,
        valorConsumido: 0.00,
        fornecedorNome: fornecedor.nomeFantasia,
        fornecedorCnpj: fornecedor.cnpj,
        status: 'ATIVA',
        medicamentos: {
          create: [
            {
              nome: 'Amoxicilina 500mg',
              precoUnitario: 1.50,
              qtdeInicial: 50000,
              saldoAtual: 50000,
            },
            {
              nome: 'Dipirona 500mg',
              precoUnitario: 0.50,
              qtdeInicial: 100000,
              saldoAtual: 100000,
            }
          ]
        }
      },
      include: {
        medicamentos: true
      }
    })
    seededAtas.push(ata)
  }

  console.log(`Seeded ${seededAtas.length} ATAs.`);

  // Criar Pedidos de Compra para bater os Saldos:
  // - Consumido: R$ 270.000,00 (ENTREGUE)
  // - Comprometido: R$ 280.000,00 (PENDENTE/APROVADO)
  //   - PENDENTE: 8 PdCs no total (sendo 2 deles nos recentes, e 6 antigos).
  //   - APROVADO: 2 PdCs (recentes).
  //   - Valores das PENDENTE: R$ 10.000,00 cada -> total R$ 80.000,00
  //   - Valores das APROVADO: R$ 100.000,00 cada -> total R$ 200.000,00
  //   - Soma Comprometido = R$ 280.000,00
  //   - Valor da ENTREGUE: R$ 270.000,00 -> total R$ 270.000,00

  const itemsAta = seededAtas[0].medicamentos

  // 1. Pedido ENTREGUE (Valor Total = R$ 270.000,00)
  const pdcEntregue = await prisma.pedidoCompra.create({
    data: {
      numero: 'PDC-2026-0021',
      status: 'ENTREGUE',
      ataId: seededAtas[0].id,
      fornecedorId: fornecedor.id,
      valorTotal: 270000.00,
      justificativa: 'Anti-Inflamatórios',
      dataSolicitacao: getPastDate(28),
      criadoEm: getPastDate(28),
      itens: {
        create: [
          {
            medicamentoNome: 'Anti-Inflamatórios',
            quantidade: 180000,
            precoUnitario: 1.50,
            valorTotal: 270000.00,
            ataItemId: itemsAta[0].id
          }
        ]
      }
    }
  })

  // Atualizar consumo da ATA
  await prisma.ata.update({
    where: { id: seededAtas[0].id },
    data: { valorConsumido: 270000.00 }
  })
  await prisma.medicamentoAta.update({
    where: { id: itemsAta[0].id },
    data: { 
      quantidadeUsada: 180000,
      saldoAtual: itemsAta[0].qtdeInicial - 180000
    }
  })

  // 2. Pedidos APROVADOS (2 Pedidos de R$ 100.000,00 cada = R$ 200.000,00)
  const pdcAprovado1 = await prisma.pedidoCompra.create({
    data: {
      numero: 'PDC-2026-0022',
      status: 'APROVADO',
      ataId: seededAtas[0].id,
      fornecedorId: fornecedor.id,
      valorTotal: 100000.00,
      justificativa: 'Analgésicos - Lote 12',
      dataSolicitacao: getPastDate(27),
      criadoEm: getPastDate(27),
      itens: {
        create: [
          {
            medicamentoNome: 'Analgésicos - Lote 12',
            quantidade: 200000,
            precoUnitario: 0.50,
            valorTotal: 100000.00,
            ataItemId: itemsAta[1].id
          }
        ]
      }
    }
  })

  const pdcAprovado2 = await prisma.pedidoCompra.create({
    data: {
      numero: 'PDC-2026-0019',
      status: 'APROVADO',
      ataId: seededAtas[1].id,
      fornecedorId: fornecedor.id,
      valorTotal: 100000.00,
      justificativa: 'Material Hospitalar',
      dataSolicitacao: getPastDate(30),
      criadoEm: getPastDate(30),
      itens: {
        create: [
          {
            medicamentoNome: 'Material Hospitalar',
            quantidade: 200000,
            precoUnitario: 0.50,
            valorTotal: 100000.00,
            ataItemId: seededAtas[1].medicamentos[1].id
          }
        ]
      }
    }
  })

  // 3. Pedidos PENDENTES (8 Pedidos de R$ 10.000,00 cada = R$ 80.000,00)
  // Dois deles são recentes (PDC-2026-0023 e PDC-2026-0020)
  const pdcPendente1 = await prisma.pedidoCompra.create({
    data: {
      numero: 'PDC-2026-0023',
      status: 'PENDENTE',
      ataId: seededAtas[0].id,
      fornecedorId: fornecedor.id,
      valorTotal: 10000.00,
      justificativa: 'Antibióticos - Lote 05',
      dataSolicitacao: getPastDate(26),
      criadoEm: getPastDate(26),
      itens: {
        create: [
          {
            medicamentoNome: 'Antibióticos - Lote 05',
            quantidade: 20000,
            precoUnitario: 0.50,
            valorTotal: 10000.00,
            ataItemId: itemsAta[1].id
          }
        ]
      }
    }
  })

  const pdcPendente2 = await prisma.pedidoCompra.create({
    data: {
      numero: 'PDC-2026-0020',
      status: 'PENDENTE',
      ataId: seededAtas[0].id,
      fornecedorId: fornecedor.id,
      valorTotal: 10000.00,
      justificativa: 'Medicamentos Controlados',
      dataSolicitacao: getPastDate(29),
      criadoEm: getPastDate(29),
      itens: {
        create: [
          {
            medicamentoNome: 'Medicamentos Controlados',
            quantidade: 20000,
            precoUnitario: 0.50,
            valorTotal: 10000.00,
            ataItemId: itemsAta[1].id
          }
        ]
      }
    }
  })

  // Criar os outros 6 pedidos pendentes mais antigos para inteirar 8 pendentes
  for (let i = 1; i <= 6; i++) {
    await prisma.pedidoCompra.create({
      data: {
        numero: `PDC-2026-000${i}`,
        status: 'PENDENTE',
        ataId: seededAtas[2].id,
        fornecedorId: fornecedor.id,
        valorTotal: 10000.00,
        justificativa: `Paracetamol 500mg - Lote 0${i}`,
        dataSolicitacao: getPastDate(35 + i),
        criadoEm: getPastDate(35 + i),
        itens: {
          create: [
            {
              medicamentoNome: 'Paracetamol 500mg',
              quantidade: 20000,
              precoUnitario: 0.50,
              valorTotal: 10000.00,
              ataItemId: seededAtas[2].medicamentos[1].id
            }
          ]
        }
      }
    })
  }

  console.log('Mock de alta fidelidade populado com sucesso!')
  console.log('Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    //@ts-ignore
    if (typeof process !== 'undefined') process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
