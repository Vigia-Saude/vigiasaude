import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class DashboardController {
  getStats = async (req: Request, res: Response): Promise<Response> => {
    try {
      const today = new Date();
      const date45DaysFromNow = new Date();
      date45DaysFromNow.setDate(today.getDate() + 45);

      // Executa as queries em paralelo
      const [
        expiringAtasCount,
        activeAtasCount,
        pendingPdcsCount,
        recentPdcsRaw,
        totalSum,
        consumedSum,
        committedSum
      ] = await Promise.all([
        prisma.ata.count({
          where: {
            status: 'ATIVA',
            vigenciaFim: {
              gte: today,
              lte: date45DaysFromNow,
            },
          },
        }),
        prisma.ata.count({
          where: {
            status: 'ATIVA',
          },
        }),
        prisma.pedidoCompra.count({
          where: {
            status: 'PENDENTE',
          },
        }),
        prisma.pedidoCompra.findMany({
          take: 5,
          orderBy: {
            criadoEm: 'desc',
          },
          include: {
            itens: true,
          },
        }),
        prisma.ata.aggregate({
          _sum: {
            valorTeto: true,
          },
          where: {
            status: 'ATIVA',
          },
        }),
        prisma.pedidoCompra.aggregate({
          _sum: {
            valorTotal: true,
          },
          where: {
            status: 'ENTREGUE',
          },
        }),
        prisma.pedidoCompra.aggregate({
          _sum: {
            valorTotal: true,
          },
          where: {
            status: {
              in: ['PENDENTE', 'APROVADO'],
            },
          },
        }),
      ]);

      const recentPdcs = recentPdcsRaw.map((pedido) => {
        let descricao = 'Sem itens';
        if (pedido.justificativa && pedido.justificativa.trim().length > 0) {
          descricao = pedido.justificativa;
        } else if (pedido.itens && pedido.itens.length > 0) {
          const firstItem = pedido.itens[0].medicamentoNome;
          if (pedido.itens.length > 1) {
            descricao = `${firstItem} e mais ${pedido.itens.length - 1} item(ns)`;
          } else {
            descricao = firstItem;
          }
        }

        return {
          id: pedido.id,
          numero: pedido.numero,
          descricao,
          data: pedido.dataSolicitacao.toISOString(),
          status: pedido.status,
          valorTotal: Number(pedido.valorTotal),
        };
      });

      const total = Number(totalSum._sum.valorTeto || 0);
      const consumido = Number(consumedSum._sum.valorTotal || 0);
      const comprometido = Number(committedSum._sum.valorTotal || 0);

      // Disponível: Sobra do orçamento
      const disponivel = Math.max(0, total - consumido - comprometido);

      return res.json({
        expiringAtasCount,
        activeAtasCount,
        pendingPdcsCount,
        recentPdcs,
        budget: {
          total,
          consumido,
          comprometido,
          disponivel,
        },
      });
    } catch (err) {
      console.error('Erro ao calcular estatísticas do dashboard:', err);
      return res.status(500).json({ error: 'Erro interno ao calcular estatísticas do dashboard' });
    }
  };
}
