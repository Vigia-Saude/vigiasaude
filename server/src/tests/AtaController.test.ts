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
      create: vi.fn(),
      findMany: vi.fn(),
    },
    medicamentoAta: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
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

  describe('criar', () => {
    it('deve criar uma ATA com sucesso e seus medicamentos correspondentes', async () => {
      const req: any = {
        body: {
          numero: '2026/001',
          fornecedorNome: 'Distribuidora X',
          fornecedorCnpj: '12345678000199',
          processoLicitatorio: '123/2026',
          numeroPregao: '45/2026',
          numeroEdital: '01/2026',
          vigenciaInicio: '2026-01-01',
          vigenciaFim: '2026-12-31',
          valorTeto: 10000.0,
          documentoPdfUrl: 'http://link.pdf',
          observacoes: 'Ata teste',
          medicamentos: [
            {
              nome: 'Dipirona 500mg',
              precoUnitario: 10.0,
              qtdeInicial: 100,
              catmatCodigo: 'BR123456',
              unidadeFornecimento: 'COMPRIMIDO'
            }
          ]
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.ata.create).mockResolvedValue({
        id: 'ata-123',
        numero: '2026/001'
      } as any);

      vi.mocked(prisma.medicamentoAta.create).mockResolvedValue({} as any);

      await controller.criar(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.ata.create).toHaveBeenCalled();
      expect(prisma.medicamentoAta.create).toHaveBeenCalled();
    });

    it('deve retornar erro 400 se campos obrigatórios estiverem ausentes', async () => {
      const req: any = {
        body: {
          numero: '', // Obrigatório ausente
          fornecedorNome: 'Distribuidora X',
          vigenciaInicio: '2026-01-01',
          vigenciaFim: '2026-12-31',
          valorTeto: 10000.0,
        }
      };
      const res = mockResponse();

      await controller.criar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Campos obrigatórios ausentes.' });
    });

    it('deve retornar erro 400 se a lista de medicamentos estiver vazia', async () => {
      const req: any = {
        body: {
          numero: '2026/001',
          fornecedorNome: 'Distribuidora X',
          vigenciaInicio: '2026-01-01',
          vigenciaFim: '2026-12-31',
          valorTeto: 10000.0,
          medicamentos: [] // Vazia
        }
      };
      const res = mockResponse();

      await controller.criar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A ata deve conter pelo menos um medicamento.' });
    });

    it('deve retornar erro 400 se o número da ATA já existir (P2002)', async () => {
      const req: any = {
        body: {
          numero: '2026/001',
          fornecedorNome: 'Distribuidora X',
          vigenciaInicio: '2026-01-01',
          vigenciaFim: '2026-12-31',
          valorTeto: 10000.0,
          medicamentos: [
            {
              nome: 'Dipirona 500mg',
              precoUnitario: 10.0,
              qtdeInicial: 100
            }
          ]
        }
      };
      const res = mockResponse();

      const dbError = new Error('Unique constraint failed') as any;
      dbError.code = 'P2002';
      vi.mocked(prisma.ata.create).mockRejectedValue(dbError);

      await controller.criar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Uma ATA com este número já existe.' });
    });
  });

  describe('registrarConsumo', () => {
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
        vigenciaInicio: new Date('2026-01-01'),
        vigenciaFim: new Date('2026-12-31'),
        valorTeto: new Prisma.Decimal(10000.0),
        valorConsumido: new Prisma.Decimal(0.0),
        status: 'ATIVA',
      } as any);

      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-456',
        ataId: 'ata-123',
        precoUnitario: new Prisma.Decimal(10.0),
        qtdeInicial: 100,
        quantidadeUsada: 40,
      } as any);

      vi.mocked(prisma.ataConsumo.create).mockResolvedValue({ id: 'consumo-new' } as any);
      vi.mocked(prisma.medicamentoAta.update).mockResolvedValue({} as any);
      vi.mocked(prisma.ata.update).mockResolvedValue({} as any);

      await controller.registrarConsumo(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.ataConsumo.create).toHaveBeenCalled();
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

    it('deve rejeitar o consumo se exceder o saldo inicial e a justificativa (observação) for menor que 15 caracteres', async () => {
      const req: any = {
        params: { ataId: 'ata-123' },
        body: {
          ataItemId: 'med-456',
          quantidade: 20, // Excede saldo de 10
          valorUnitario: 10.0,
          observacao: 'Curta demais', // 12 caracteres
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

    it('deve registrar consumo com sucesso mesmo excedendo o saldo se uma justificativa válida for fornecida (>= 15 caracteres)', async () => {
      const req: any = {
        params: { ataId: 'ata-123' },
        body: {
          ataItemId: 'med-456',
          quantidade: 20, // Excede saldo de 10
          valorUnitario: 10.0,
          observacao: 'Justificativa detalhada com mais de 15 caracteres', // Válida
          setorSolicitante: 'UPA Centro'
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

      vi.mocked(prisma.ataConsumo.create).mockResolvedValue({ id: 'consumo-new' } as any);
      vi.mocked(prisma.medicamentoAta.update).mockResolvedValue({} as any);
      vi.mocked(prisma.ata.update).mockResolvedValue({} as any);

      await controller.registrarConsumo(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.ataConsumo.create).toHaveBeenCalled();
    });

    it('deve retornar erro 404 se a ATA não for encontrada', async () => {
      const req: any = {
        params: { ataId: 'ata-not-found' },
        body: {
          ataItemId: 'med-456',
          quantidade: 10,
          valorUnitario: 10.0,
        },
      };
      const res = mockResponse();

      vi.mocked(prisma.ata.findUnique).mockResolvedValue(null);

      await controller.registrarConsumo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ata não encontrada.' });
    });

    it('deve retornar erro 404 se o item não fizer parte da ATA', async () => {
      const req: any = {
        params: { ataId: 'ata-123' },
        body: {
          ataItemId: 'med-not-in-ata',
          quantidade: 10,
          valorUnitario: 10.0,
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

      // medicamentoAta retorna null ou pertence a outra ata
      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-not-in-ata',
        ataId: 'outro-ata-id',
        precoUnitario: new Prisma.Decimal(10.0),
      } as any);

      await controller.registrarConsumo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Item não encontrado nesta ata.' });
    });
  });
});
