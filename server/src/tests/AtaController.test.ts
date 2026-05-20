import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AtaController } from '../controllers/AtaController';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

// Mock do prisma
vi.mock('../config/prisma', () => {
  const mock = {
    ata: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    medicamentoAta: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    ataConsumo: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  mock.$transaction.mockImplementation((callback) => callback(mock));
  return {
    default: mock,
  };
});

// Mock do Express Request e Response
const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('AtaController - Testes Unitários de Regras de Negócio e Segurança', () => {
  let controller: AtaController;

  beforeEach(() => {
    controller = new AtaController();
    vi.clearAllMocks();
  });

  // 1. Cenário CT-01: Consumo padrão bem-sucedido
  it('deve registrar consumo com sucesso quando saldo e preço estão em conformidade', async () => {
    const req: any = {
      params: { ataId: 'ata-123' },
      body: {
        ataItemId: 'med-456',
        quantidade: 20,
        valorUnitario: 10.0,
        setorSolicitante: 'UPA Centro',
      },
    };
    const res = mockResponse();

    vi.mocked(prisma.ata.findUnique).mockResolvedValue({
      id: 'ata-123',
      numero: '2024/002',
      fornecedorNome: 'Distribuidora X',
      fornecedorCnpj: '12345678000199',
      processoLicitatorio: '123/2024',
      numeroPregao: '45/2024',
      numeroEdital: '01/2024',
      vigenciaInicio: new Date('2026-01-01'),
      vigenciaFim: new Date('2026-12-31'),
      valorTeto: new Prisma.Decimal(10000.0),
      valorConsumido: new Prisma.Decimal(0.0),
      status: 'ATIVA',
      documentoPdfUrl: null,
      observacoes: null,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    } as any);

    vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
      id: 'med-456',
      ataId: 'ata-123',
      catmatCodigo: 'BR123456',
      nome: 'Dipirona 500mg',
      unidadeFornecimento: 'COMPRIMIDO',
      unidadeAta: 'COMPRIMIDO',
      marca: 'EMS',
      modelo: 'Caixa',
      precoUnitario: new Prisma.Decimal(10.0),
      qtdeInicial: 100,
      quantidadeUsada: 40,
      saldoAtual: 60,
      precoBPS: null,
      precoCMED: null,
      observacoes: null
    } as any);

    vi.mocked(prisma.ataConsumo.create).mockResolvedValue({ id: 'consumo-new' } as any);
    vi.mocked(prisma.medicamentoAta.update).mockResolvedValue({} as any);
    vi.mocked(prisma.ata.update).mockResolvedValue({} as any);

    await controller.registrarConsumo(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // 2. Cenário CT-02: Bloqueio de Ata Vencida
  it('deve rejeitar registro de consumo se a ata estiver fora da vigência', async () => {
    const req: any = {
      params: { ataId: 'ata-123' },
      body: {
        ataItemId: 'med-456',
        quantidade: 10,
        valorUnitario: 10.0,
      },
    };
    const res = mockResponse();

    vi.mocked(prisma.ata.findUnique).mockResolvedValue({
      id: 'ata-123',
      status: 'ATIVA',
      vigenciaInicio: new Date('2025-01-01'),
      vigenciaFim: new Date('2025-12-31'), // Ata já vencida
      valorConsumido: new Prisma.Decimal(0.0),
    } as any);

    await controller.registrarConsumo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('vigência')
    }));
  });

  // 3. Cenário CT-03: Bloqueio de Ata Inativa
  it('deve rejeitar registro de consumo se o status da ata for CANCELADA ou inativo', async () => {
    const req: any = {
      params: { ataId: 'ata-123' },
      body: {
        ataItemId: 'med-456',
        quantidade: 10,
        valorUnitario: 10.0,
      },
    };
    const res = mockResponse();

    vi.mocked(prisma.ata.findUnique).mockResolvedValue({
      id: 'ata-123',
      status: 'CANCELADA', // Status proibido
      vigenciaInicio: new Date('2026-01-01'),
      vigenciaFim: new Date('2026-12-31'),
      valorConsumido: new Prisma.Decimal(0.0),
    } as any);

    await controller.registrarConsumo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('ATIVA')
    }));
  });

  // 4. Cenário CT-04: Segurança / Preço Unitário Adulterado
  it('deve rejeitar o consumo se o valor unitário enviado diferir do preço unitário licitado do item', async () => {
    const req: any = {
      params: { ataId: 'ata-123' },
      body: {
        ataItemId: 'med-456',
        quantidade: 10,
        valorUnitario: 15.0, // Tentativa de fraude (Licitado é 10.00)
      },
    };
    const res = mockResponse();

    vi.mocked(prisma.ata.findUnique).mockResolvedValue({
      id: 'ata-123',
      status: 'ATIVA',
      vigenciaInicio: new Date('2026-01-01'),
      vigenciaFim: new Date('2026-12-31'),
      valorConsumido: new Prisma.Decimal(0.0),
    } as any);

    vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
      id: 'med-456',
      ataId: 'ata-123',
      precoUnitario: new Prisma.Decimal(10.0),
    } as any);

    await controller.registrarConsumo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('preço')
    }));
  });

  // 5. Cenário CT-06: Estouro de Saldo sem Justificativa
  it('deve rejeitar o consumo se exceder o saldo inicial e a justificativa (observação) estiver vazia', async () => {
    const req: any = {
      params: { ataId: 'ata-123' },
      body: {
        ataItemId: 'med-456',
        quantidade: 20, // Excede saldo de 10
        valorUnitario: 10.0,
        observacao: '', // Sem justificativa
      },
    };
    const res = mockResponse();

    vi.mocked(prisma.ata.findUnique).mockResolvedValue({
      id: 'ata-123',
      status: 'ATIVA',
      vigenciaInicio: new Date('2026-01-01'),
      vigenciaFim: new Date('2026-12-31'),
      valorConsumido: new Prisma.Decimal(0.0),
    } as any);

    vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
      id: 'med-456',
      ataId: 'ata-123',
      precoUnitario: new Prisma.Decimal(10.0),
      qtdeInicial: 100,
      quantidadeUsada: 90, // Saldo de apenas 10
    } as any);

    await controller.registrarConsumo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('justificativa')
    }));
  });
});
