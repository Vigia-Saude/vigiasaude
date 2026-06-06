import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Insulina NPH data...')

  // 1. Ensure Suppliers Exist
  const fornecedorBioPharm = await prisma.fornecedor.upsert({
    where: { cnpj: '11.111.111/0001-11' },
    update: {},
    create: {
      cnpj: '11.111.111/0001-11',
      razaoSocial: 'BioPharm S.A. Distribuidora',
      nomeFantasia: 'BioPharm S.A.',
      email: 'contato@biopharm.com.br',
      whatsapp: '11988887777',
      status: 'ATIVO',
      categorias: ['Medicamentos'],
    }
  })

  const fornecedorMedFarma = await prisma.fornecedor.upsert({
    where: { cnpj: '22.222.222/0001-22' },
    update: {},
    create: {
      cnpj: '22.222.222/0001-22',
      razaoSocial: 'MedFarma Ltda Distribuidora',
      nomeFantasia: 'MedFarma Ltda',
      email: 'contato@medfarma.com.br',
      whatsapp: '11977776666',
      status: 'ATIVO',
      categorias: ['Medicamentos'],
    }
  })

  const fornecedorPrincipal = await prisma.fornecedor.upsert({
    where: { cnpj: '12.345.678/0001-99' },
    update: {},
    create: {
      cnpj: '12.345.678/0001-99',
      razaoSocial: 'MedSupply Distribuidora de Medicamentos SA',
      nomeFantasia: 'MedSupply SA',
      email: 'contato@medsupply.com.br',
      whatsapp: '11999999999',
      status: 'ATIVO',
      categorias: ['Medicamentos'],
    }
  })

  // 2. Ensure default user exists for orders
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

  // 3. Clear existing Insulina NPH data from stock and related NFs/Orders to avoid duplicates
  console.log('Clearing old Insulina NPH records...')
  const medicamentoNome = 'Insulina NPH 100UI/mL Frasco 10mL'
  
  await prisma.cdEstoqueLote.deleteMany({
    where: { medicamentoNome }
  })
  await prisma.notaFiscalItem.deleteMany({
    where: { medicamentoNome }
  })
  await prisma.pedidoReposicaoItem.deleteMany({
    where: { medicamentoNome }
  })

  // 4. Create Notas Fiscais (Entradas)
  console.log('Creating Notas Fiscais and Stock Lots...')

  // NF for LT2024001 (Entered on 01/05/2026, 60 units initial, 30 current)
  const nf1 = await prisma.notaFiscal.create({
    data: {
      numeroNf: 'NF-1001',
      serie: '1',
      dataEmissao: new Date('2026-05-01T08:00:00Z'),
      fornecedorId: fornecedorPrincipal.id,
      valorTotal: 1200.00,
      status: 'CONFERIDA',
      conferidoPor: comprador.id,
      conferidoEm: new Date('2026-05-01T14:00:00Z'),
      itens: {
        create: {
          catmatCodigo: 'BR0112233',
          medicamentoNome,
          numeroLote: 'LT2024001',
          dataValidade: new Date('2026-04-14T00:00:00Z'),
          quantidadeEsperada: 60,
          quantidadeRecebida: 60,
          precoUnitario: 20.00,
        }
      }
    },
    include: { itens: true }
  })

  await prisma.cdEstoqueLote.create({
    data: {
      notaFiscalItemId: nf1.itens[0].id,
      catmatCodigo: 'BR0112233',
      medicamentoNome,
      numeroLote: 'LT2024001',
      dataValidade: new Date('2026-04-14T00:00:00Z'),
      quantidadeInicial: 60,
      quantidadeAtual: 30, // 30 remaining after exits (60 - 12 - 8 - 10 = 30)
      status: 'DISPONIVEL'
    }
  })

  // NF for LT2024002 (Entered on 05/05/2026, 40 units initial, 25 current)
  const nf2 = await prisma.notaFiscal.create({
    data: {
      numeroNf: 'NF-1002',
      serie: '1',
      dataEmissao: new Date('2026-05-05T09:00:00Z'),
      fornecedorId: fornecedorBioPharm.id,
      valorTotal: 800.00,
      status: 'CONFERIDA',
      conferidoPor: comprador.id,
      conferidoEm: new Date('2026-05-05T10:00:00Z'),
      itens: {
        create: {
          catmatCodigo: 'BR0112233',
          medicamentoNome,
          numeroLote: 'LT2024002',
          dataValidade: new Date('2026-06-28T00:00:00Z'),
          quantidadeEsperada: 40,
          quantidadeRecebida: 40,
          precoUnitario: 20.00,
        }
      }
    },
    include: { itens: true }
  })

  await prisma.cdEstoqueLote.create({
    data: {
      notaFiscalItemId: nf2.itens[0].id,
      catmatCodigo: 'BR0112233',
      medicamentoNome,
      numeroLote: 'LT2024002',
      dataValidade: new Date('2026-06-28T00:00:00Z'),
      quantidadeInicial: 40,
      quantidadeAtual: 25, // 25 remaining
      status: 'DISPONIVEL'
    }
  })

  // NF for LT2024003 (Entered on 10/05/2026, 50 units initial, 25 current)
  const nf3 = await prisma.notaFiscal.create({
    data: {
      numeroNf: 'NF-1003',
      serie: '1',
      dataEmissao: new Date('2026-05-10T08:30:00Z'),
      fornecedorId: fornecedorMedFarma.id,
      valorTotal: 1000.00,
      status: 'CONFERIDA',
      conferidoPor: comprador.id,
      conferidoEm: new Date('2026-05-10T09:15:00Z'),
      itens: {
        create: {
          catmatCodigo: 'BR0112233',
          medicamentoNome,
          numeroLote: 'LT2024003',
          dataValidade: new Date('2026-09-12T00:00:00Z'),
          quantidadeEsperada: 50,
          quantidadeRecebida: 50,
          precoUnitario: 20.00,
        }
      }
    },
    include: { itens: true }
  })

  await prisma.cdEstoqueLote.create({
    data: {
      notaFiscalItemId: nf3.itens[0].id,
      catmatCodigo: 'BR0112233',
      medicamentoNome,
      numeroLote: 'LT2024003',
      dataValidade: new Date('2026-09-12T00:00:00Z'),
      quantidadeInicial: 50,
      quantidadeAtual: 25, // 25 remaining
      status: 'DISPONIVEL'
    }
  })

  // 5. Create Historical Exits (Replenishment Orders - Completed / In Transit)
  console.log('Creating Historical Replenishment Orders (Exits)...')

  // Exit 1: Farmácia Filial 02 - Zona Leste (12 units, 08/05/2026 11:20)
  await prisma.pedidoReposicao.create({
    data: {
      numero: 'PED-2026-1001',
      status: 'CONCLUIDO',
      urgencia: 'MEDIA',
      unidadeId: 'unit-filial2-uuid',
      solicitadoPorId: comprador.id,
      criadoEm: new Date('2026-05-08T11:20:00Z'),
      atualizadoEm: new Date('2026-05-08T11:20:00Z'),
      itens: {
        create: {
          catmatCodigo: 'BR0112233',
          medicamentoNome,
          quantidade: 12,
        }
      }
    }
  })

  // Exit 2: Farmácia Filial 01 - Zona Norte (8 units, 09/05/2026 16:45)
  await prisma.pedidoReposicao.create({
    data: {
      numero: 'PED-2026-1002',
      status: 'CONCLUIDO',
      urgencia: 'BAIXA',
      unidadeId: 'unit-filial1-uuid',
      solicitadoPorId: comprador.id,
      criadoEm: new Date('2026-05-09T16:45:00Z'),
      atualizadoEm: new Date('2026-05-09T16:45:00Z'),
      itens: {
        create: {
          catmatCodigo: 'BR0112233',
          medicamentoNome,
          quantidade: 8,
        }
      }
    }
  })

  // Exit 3: Farmácia Central (10 units, 11/05/2026 14:30)
  await prisma.pedidoReposicao.create({
    data: {
      numero: 'PED-2026-1003',
      status: 'CONCLUIDO',
      urgencia: 'ALTA',
      unidadeId: '3aa7397b-340e-489b-88b6-125214bc14ed',
      solicitadoPorId: comprador.id,
      criadoEm: new Date('2026-05-11T14:30:00Z'),
      atualizadoEm: new Date('2026-05-11T14:30:00Z'),
      itens: {
        create: {
          catmatCodigo: 'BR0112233',
          medicamentoNome,
          quantidade: 10,
        }
      }
    }
  })

  // 6. Create Active Reservations (Replenishment Orders - Pending / separating)
  console.log('Creating Active Pending Orders (Reservations)...')
  
  // Pending order that will reserve 7 units total
  // FEFO rule will allocate 5 from Lote 1 (remaining 30, so it gets 5)
  // and 2 from Lote 2 (remaining 25, so it gets 2)
  await prisma.pedidoReposicao.create({
    data: {
      numero: 'PED-2026-1004',
      status: 'EM_SEPARACAO',
      urgencia: 'ALTA',
      unidadeId: '3aa7397b-340e-489b-88b6-125214bc14ed',
      solicitadoPorId: comprador.id,
      criadoEm: new Date('2026-05-12T09:00:00Z'),
      itens: {
        create: {
          catmatCodigo: 'BR0112233',
          medicamentoNome,
          quantidade: 7,
        }
      }
    }
  })

  console.log('Insulina NPH data seeded successfully!')
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
