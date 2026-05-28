import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PedidoController } from '../controllers/PedidoController';
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
    pedidoCompra: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    pedidoCompraItem: {
      deleteMany: vi.fn(),
    },
    ataConsumo: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    auditoria: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  };
  mock.$transaction.mockImplementation((callback) => callback(mock));
  mock.$queryRaw.mockResolvedValue([{ nextval: 1n }]);
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

describe('PedidoController - Testes Unitários de Regras de Negócio e Segurança', () => {
  let controller: PedidoController;

  beforeEach(() => {
    controller = new PedidoController();
    vi.clearAllMocks();
  });

  describe('criarPedido', () => {
    it('deve criar um pedido com sucesso quando saldo e preço estão em conformidade', async () => {
      const req: any = {
        user: { id: 'user-123' },
        body: {
          ataId: 'ata-123',
          fornecedorId: 'forn-123',
          status: 'PENDENTE',
          itens: [
            {
              medicamentoId: 'med-catmat-1',
              medicamentoNome: 'Amoxicilina 500mg',
              quantidade: 100,
              precoUnitario: 1.50,
              ataItemId: 'med-ata-456'
            }
          ]
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.pedidoCompra.count).mockResolvedValue(0);
      vi.mocked(prisma.ata.findUnique).mockResolvedValue({
        id: 'ata-123',
        numero: '2026/001',
        status: 'ATIVA',
        valorTeto: new Prisma.Decimal(10000.0),
        fornecedor: { id: 'forn-123' }
      } as any);

      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-ata-456',
        ataId: 'ata-123',
        nome: 'Amoxicilina 500mg',
        precoUnitario: new Prisma.Decimal(1.50),
        qtdeInicial: 1000,
        quantidadeUsada: 100,
      } as any);

      vi.mocked(prisma.pedidoCompra.aggregate).mockResolvedValue({
        _sum: { valorTotal: new Prisma.Decimal(0) }
      } as any);

      vi.mocked(prisma.pedidoCompra.create).mockResolvedValue({
        id: 'ped-999',
        numero: 'PdC-2026-0001',
        status: 'PENDENTE',
        itens: [
          {
            id: 'item-999',
            medicamentoId: 'med-catmat-1',
            medicamentoNome: 'Amoxicilina 500mg',
            quantidade: 100,
            precoUnitario: new Prisma.Decimal(1.50),
            valorTotal: new Prisma.Decimal(150.0),
            ataItemId: 'med-ata-456'
          }
        ],
        valorTotal: new Prisma.Decimal(150.0)
      } as any);

      await controller.criarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.pedidoCompra.create).toHaveBeenCalled();
      expect(prisma.ataConsumo.create).toHaveBeenCalled();
    });

    it('deve rejeitar pedido se a quantidade exceder o saldo da ATA e faltar justificativa', async () => {
      const req: any = {
        user: { id: 'user-123' },
        body: {
          ataId: 'ata-123',
          fornecedorId: 'forn-123',
          status: 'PENDENTE',
          itens: [
            {
              medicamentoId: 'med-catmat-1',
              medicamentoNome: 'Amoxicilina 500mg',
              quantidade: 1000, // Excede saldo de 900
              precoUnitario: 1.50,
              ataItemId: 'med-ata-456'
            }
          ],
          justificativa: '' // Vazia
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.pedidoCompra.count).mockResolvedValue(0);
      vi.mocked(prisma.ata.findUnique).mockResolvedValue({
        id: 'ata-123',
        status: 'ATIVA',
        valorTeto: new Prisma.Decimal(10000.0)
      } as any);

      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-ata-456',
        ataId: 'ata-123',
        nome: 'Amoxicilina 500mg',
        precoUnitario: new Prisma.Decimal(1.50),
        qtdeInicial: 1000,
        quantidadeUsada: 100, // Saldo = 900
      } as any);

      await controller.criarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('excede o saldo')
      }));
    });

    it('deve criar o pedido com sucesso se a quantidade exceder o saldo da ATA mas uma justificativa válida for fornecida (>= 15 caracteres)', async () => {
      const req: any = {
        user: { id: 'user-123' },
        body: {
          ataId: 'ata-123',
          fornecedorId: 'forn-123',
          status: 'PENDENTE',
          itens: [
            {
              medicamentoId: 'med-catmat-1',
              medicamentoNome: 'Amoxicilina 500mg',
              quantidade: 1000, // Excede saldo de 900
              precoUnitario: 1.50,
              ataItemId: 'med-ata-456'
            }
          ],
          justificativa: 'Demanda emergencial devido à epidemia local.' // Válida
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.pedidoCompra.count).mockResolvedValue(0);
      vi.mocked(prisma.ata.findUnique).mockResolvedValue({
        id: 'ata-123',
        numero: '2026/001',
        status: 'ATIVA',
        valorTeto: new Prisma.Decimal(10000.0),
        fornecedor: { id: 'forn-123' }
      } as any);

      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-ata-456',
        ataId: 'ata-123',
        nome: 'Amoxicilina 500mg',
        precoUnitario: new Prisma.Decimal(1.50),
        qtdeInicial: 1000,
        quantidadeUsada: 100, // Saldo = 900
      } as any);

      vi.mocked(prisma.pedidoCompra.aggregate).mockResolvedValue({
        _sum: { valorTotal: new Prisma.Decimal(0) }
      } as any);

      vi.mocked(prisma.pedidoCompra.create).mockResolvedValue({
        id: 'ped-999',
        numero: 'PdC-2026-0001',
        status: 'PENDENTE',
        itens: [
          {
            id: 'item-999',
            quantidade: 1000,
            precoUnitario: new Prisma.Decimal(1.50),
            valorTotal: new Prisma.Decimal(1500.0),
            ataItemId: 'med-ata-456'
          }
        ],
        valorTotal: new Prisma.Decimal(1500.0)
      } as any);

      await controller.criarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.pedidoCompra.create).toHaveBeenCalled();
    });

    it('deve rejeitar pedido se o preço unitário divergir da ATA', async () => {
      const req: any = {
        user: { id: 'user-123' },
        body: {
          ataId: 'ata-123',
          fornecedorId: 'forn-123',
          status: 'PENDENTE',
          itens: [
            {
              medicamentoId: 'med-catmat-1',
              medicamentoNome: 'Amoxicilina 500mg',
              quantidade: 100,
              precoUnitario: 2.00, // Diverge de 1.50
              ataItemId: 'med-ata-456'
            }
          ]
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.ata.findUnique).mockResolvedValue({
        id: 'ata-123',
        status: 'ATIVA',
        valorTeto: new Prisma.Decimal(10000.0)
      } as any);

      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-ata-456',
        ataId: 'ata-123',
        nome: 'Amoxicilina 500mg',
        precoUnitario: new Prisma.Decimal(1.50),
      } as any);

      await controller.criarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('diverge do preço licitado')
      }));
    });

    it('deve rejeitar pedido se o valor total do pedido exceder o saldo disponível na ATA (valor teto)', async () => {
      const req: any = {
        user: { id: 'user-123' },
        body: {
          ataId: 'ata-123',
          fornecedorId: 'forn-123',
          status: 'PENDENTE',
          itens: [
            {
              medicamentoId: 'med-catmat-1',
              medicamentoNome: 'Amoxicilina 500mg',
              quantidade: 8000, // 8000 * 1.50 = 12000.0 (excede valor teto de 10000.0)
              precoUnitario: 1.50,
              ataItemId: 'med-ata-456'
            }
          ]
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.pedidoCompra.count).mockResolvedValue(0);
      vi.mocked(prisma.ata.findUnique).mockResolvedValue({
        id: 'ata-123',
        status: 'ATIVA',
        valorTeto: new Prisma.Decimal(10000.0)
      } as any);

      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-ata-456',
        ataId: 'ata-123',
        nome: 'Amoxicilina 500mg',
        precoUnitario: new Prisma.Decimal(1.50),
        qtdeInicial: 10000,
        quantidadeUsada: 0,
      } as any);

      vi.mocked(prisma.pedidoCompra.aggregate).mockResolvedValue({
        _sum: { valorTotal: new Prisma.Decimal(0) }
      } as any);

      await controller.criarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'O valor total do pedido excede o saldo financeiro disponível na ATA.'
      });
    });

    it('deve resolver fornecedorId a partir da ATA se não for fornecido explicitamente no body', async () => {
      const req: any = {
        user: { id: 'user-123' },
        body: {
          ataId: 'ata-123',
          // fornecedorId não fornecido
          status: 'PENDENTE',
          itens: [
            {
              medicamentoId: 'med-catmat-1',
              medicamentoNome: 'Amoxicilina 500mg',
              quantidade: 100,
              precoUnitario: 1.50,
              ataItemId: 'med-ata-456'
            }
          ]
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.pedidoCompra.count).mockResolvedValue(0);
      vi.mocked(prisma.ata.findUnique).mockResolvedValue({
        id: 'ata-123',
        numero: '2026/001',
        status: 'ATIVA',
        valorTeto: new Prisma.Decimal(10000.0),
        fornecedor: { id: 'forn-resolvido-123' }
      } as any);

      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-ata-456',
        ataId: 'ata-123',
        nome: 'Amoxicilina 500mg',
        precoUnitario: new Prisma.Decimal(1.50),
        qtdeInicial: 1000,
        quantidadeUsada: 100,
      } as any);

      vi.mocked(prisma.pedidoCompra.aggregate).mockResolvedValue({
        _sum: { valorTotal: new Prisma.Decimal(0) }
      } as any);

      vi.mocked(prisma.pedidoCompra.create).mockResolvedValue({
        id: 'ped-999',
        numero: 'PdC-2026-0001',
        status: 'PENDENTE',
        itens: [],
        valorTotal: new Prisma.Decimal(150.0)
      } as any);

      await controller.criarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.pedidoCompra.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          fornecedorId: 'forn-resolvido-123'
        })
      }));
    });
  });

  describe('atualizarStatus', () => {
    it('deve retornar erro 401 se o usuário não estiver autenticado', async () => {
      const req: any = {
        params: { id: 'ped-123' },
        body: { status: 'PENDENTE' }
      };
      const res = mockResponse();

      await controller.atualizarStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve registrar consumo e reduzir saldos ao mudar status de RASCUNHO para PENDENTE', async () => {
      const req: any = {
        user: { id: 'user-123' },
        params: { id: 'ped-123' },
        body: {
          status: 'PENDENTE',
          justificativa: 'Enviando pedido de compra.'
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.pedidoCompra.findUnique).mockResolvedValue({
        id: 'ped-123',
        status: 'RASCUNHO',
        ataId: 'ata-123',
        valorTotal: new Prisma.Decimal(150.0),
        itens: [
          {
            id: 'item-1',
            medicamentoNome: 'Amoxicilina 500mg',
            quantidade: 100,
            precoUnitario: new Prisma.Decimal(1.50),
            valorTotal: new Prisma.Decimal(150.0),
            ataItemId: 'med-ata-456'
          }
        ]
      } as any);

      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-ata-456',
        nome: 'Amoxicilina 500mg'
      } as any);

      vi.mocked(prisma.pedidoCompra.update).mockResolvedValue({
        id: 'ped-123',
        status: 'PENDENTE',
        valorTotal: new Prisma.Decimal(150.0),
        itens: []
      } as any);

      await controller.atualizarStatus(req, res);

      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(res.status).not.toHaveBeenCalledWith(500);
      expect(prisma.ataConsumo.create).toHaveBeenCalled();
      expect(prisma.medicamentoAta.update).toHaveBeenCalled();
      expect(prisma.ata.update).toHaveBeenCalled();
    });

    it('deve remover consumo e reverter saldos ao mudar status de PENDENTE para CANCELADO', async () => {
      const req: any = {
        user: { id: 'user-123' },
        params: { id: 'ped-123' },
        body: {
          status: 'CANCELADO',
          justificativa: 'Cancelamento por falta de interesse.'
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.pedidoCompra.findUnique).mockResolvedValue({
        id: 'ped-123',
        status: 'PENDENTE',
        ataId: 'ata-123',
        valorTotal: new Prisma.Decimal(150.0),
        itens: [
          {
            id: 'item-1',
            medicamentoNome: 'Amoxicilina 500mg',
            quantidade: 100,
            precoUnitario: new Prisma.Decimal(1.50),
            valorTotal: new Prisma.Decimal(150.0),
            ataItemId: 'med-ata-456'
          }
        ]
      } as any);

      vi.mocked(prisma.pedidoCompra.update).mockResolvedValue({
        id: 'ped-123',
        status: 'CANCELADO',
        valorTotal: new Prisma.Decimal(150.0),
        itens: []
      } as any);

      await controller.atualizarStatus(req, res);

      expect(prisma.ataConsumo.deleteMany).toHaveBeenCalledWith({ where: { pedidoId: 'ped-123' } });
      expect(prisma.medicamentoAta.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          quantidadeUsada: { decrement: 100 },
          saldoAtual: { increment: 100 }
        })
      }));
      expect(prisma.ata.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          valorConsumido: { decrement: new Prisma.Decimal(150.0) }
        })
      }));
    });
  });

  describe('atualizarPedido', () => {
    it('deve permitir atualizar um pedido que esteja em status RASCUNHO', async () => {
      const req: any = {
        user: { id: 'user-123' },
        params: { id: 'ped-123' },
        body: {
          ataId: 'ata-123',
          fornecedorId: 'forn-123',
          status: 'RASCUNHO',
          itens: [
            {
              medicamentoId: 'med-catmat-1',
              medicamentoNome: 'Amoxicilina 500mg',
              quantidade: 50,
              precoUnitario: 1.50,
              ataItemId: 'med-ata-456'
            }
          ]
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.pedidoCompra.findUnique).mockResolvedValue({
        id: 'ped-123',
        status: 'RASCUNHO',
        itens: []
      } as any);

      vi.mocked(prisma.ata.findUnique).mockResolvedValue({
        id: 'ata-123',
        status: 'ATIVA',
        valorTeto: new Prisma.Decimal(10000.0)
      } as any);

      vi.mocked(prisma.medicamentoAta.findUnique).mockResolvedValue({
        id: 'med-ata-456',
        ataId: 'ata-123',
        nome: 'Amoxicilina 500mg',
        precoUnitario: new Prisma.Decimal(1.50),
        qtdeInicial: 1000,
        quantidadeUsada: 0,
      } as any);

      vi.mocked(prisma.pedidoCompra.aggregate).mockResolvedValue({
        _sum: { valorTotal: new Prisma.Decimal(0) }
      } as any);

      vi.mocked(prisma.pedidoCompra.update).mockResolvedValue({
        id: 'ped-123',
        status: 'RASCUNHO',
        itens: [],
        valorTotal: new Prisma.Decimal(75.0)
      } as any);

      await controller.atualizarPedido(req, res);

      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(prisma.pedidoCompraItem.deleteMany).toHaveBeenCalledWith({ where: { pedidoId: 'ped-123' } });
      expect(prisma.pedidoCompra.update).toHaveBeenCalled();
    });

    it('deve rejeitar atualização se o pedido já estiver cancelado, entregue ou rejeitado', async () => {
      const req: any = {
        user: { id: 'user-123' },
        params: { id: 'ped-123' },
        body: {
          itens: [
            {
              medicamentoNome: 'Amoxicilina 500mg',
              quantidade: 50,
              precoUnitario: 1.50
            }
          ]
        }
      };
      const res = mockResponse();

      vi.mocked(prisma.pedidoCompra.findUnique).mockResolvedValue({
        id: 'ped-123',
        status: 'CANCELADO', // Finalizado / Cancelado
        itens: []
      } as any);

      await controller.atualizarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Pedidos entregues, cancelados ou rejeitados não podem ser editados.' });
    });
  });
});
