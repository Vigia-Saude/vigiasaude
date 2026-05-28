import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { Prisma } from '@prisma/client';

export class PedidoReposicaoController {
  // GET /api/cd/pedidos-reposicao
  listar = async (req: AuthRequest, res: Response) => {
    const { status, urgencia, busca, data, page = '1', limit = '50' } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
    const take = Math.min(100, Number(limit));

    try {
      const where: Prisma.PedidoReposicaoWhereInput = { deletedAt: null };

      if (status) {
        where.status = status as any;
      }
      if (urgencia) {
        where.urgencia = urgencia as any;
      }
      if (data) {
        const start = new Date(String(data));
        const end = new Date(String(data));
        end.setDate(end.getDate() + 1);
        where.criadoEm = {
          gte: start,
          lt: end
        };
      }

      if (busca) {
        // Find units matching name
        const units = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM public.unidades
          WHERE nome ILIKE ${`%${busca}%`} AND deleted_at IS NULL
        `;
        const unitIds = units.map(u => u.id);

        where.OR = [
          { numero: { contains: String(busca), mode: 'insensitive' } },
          { unidadeId: { in: unitIds } }
        ];
      }

      const [total, pedidos] = await Promise.all([
        prisma.pedidoReposicao.count({ where }),
        prisma.pedidoReposicao.findMany({
          where,
          skip,
          take,
          orderBy: { criadoEm: 'desc' },
          include: {
            itens: true,
            solicitadoPor: { select: { nome: true } },
            motorista: { select: { nome: true } }
          }
        })
      ]);

      // Resolve units names using queryRaw since Unidades table is not mapped directly
      const unitIdsToFetch = Array.from(new Set(pedidos.map(p => p.unidadeId)));
      let unitsMap: Record<string, string> = {};
      if (unitIdsToFetch.length > 0) {
        const unitsData = await prisma.$queryRaw<{ id: string, nome: string }[]>`
          SELECT id, nome FROM public.unidades
          WHERE id IN (${Prisma.join(unitIdsToFetch)})
        `;
        unitsMap = unitsData.reduce((acc, u) => {
          acc[u.id] = u.nome;
          return acc;
        }, {} as Record<string, string>);
      }

      const dataResult = pedidos.map(p => ({
        ...p,
        unidadeNome: unitsMap[p.unidadeId] || 'Unidade Desconhecida'
      }));

      // Gather counters for the metric cards
      const [totalCount, pendentesCount, emAnaliseCount, emSeparacaoCount] = await Promise.all([
        prisma.pedidoReposicao.count({ where: { deletedAt: null } }),
        prisma.pedidoReposicao.count({ where: { deletedAt: null, status: 'PENDENTE' } }),
        prisma.pedidoReposicao.count({ where: { deletedAt: null, status: 'EM_ANALISE' } }),
        prisma.pedidoReposicao.count({ where: { deletedAt: null, status: 'EM_SEPARACAO' } })
      ]);

      res.json({
        total,
        pagina: Number(page),
        dados: dataResult,
        stats: {
          total: totalCount,
          pendentes: pendentesCount,
          emAnalise: emAnaliseCount,
          emSeparacao: emSeparacaoCount
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar pedidos de recomposição.' });
    }
  };

  // GET /api/cd/pedidos-reposicao/:id
  detalhes = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);

    try {
      const pedido = await prisma.pedidoReposicao.findFirst({
        where: { id, deletedAt: null },
        include: {
          itens: true,
          solicitadoPor: { select: { nome: true, email: true } },
          motorista: { select: { nome: true, email: true } }
        }
      });

      if (!pedido) {
        res.status(404).json({ erro: 'Pedido não encontrado.' });
        return;
      }

      // Fetch unit name
      const units = await prisma.$queryRaw<{ nome: string }[]>`
        SELECT nome FROM public.unidades WHERE id = ${pedido.unidadeId}
      `;
      const unit = units[0];

      // Check CD Stock availability for each item
      const itensComEstoque = await Promise.all(
        pedido.itens.map(async (item) => {
          // Find available lots in cd_estoque_lotes (ordered by expiration date FEFO)
          const lotesDisponiveis = await prisma.cdEstoqueLote.findMany({
            where: {
              OR: [
                { catmatCodigo: item.catmatCodigo },
                { medicamentoNome: { contains: item.medicamentoNome, mode: 'insensitive' } }
              ],
              status: 'DISPONIVEL',
              quantidadeAtual: { gt: 0 },
              deletedAt: null
            },
            orderBy: { dataValidade: 'asc' }
          });

          // Sum total available quantity
          const totalQtdDisponivel = lotesDisponiveis.reduce((sum, l) => sum + l.quantidadeAtual, 0);

          // Get first available lot details (lote and validade)
          const loteSugerido = lotesDisponiveis[0] || null;

          return {
            ...item,
            disponivel: totalQtdDisponivel > 0,
            loteSugerido: loteSugerido ? loteSugerido.numeroLote : null,
            validadeSugerida: loteSugerido ? loteSugerido.dataValidade : null,
            totalQtdDisponivel
          };
        })
      );

      res.json({
        ...pedido,
        unidadeNome: unit?.nome || 'Unidade Desconhecida',
        itens: itensComEstoque
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar detalhes do pedido.' });
    }
  };

  // POST /api/cd/pedidos-reposicao
  criar = async (req: AuthRequest, res: Response) => {
    const { unidadeId, urgencia, itens } = req.body;

    if (!unidadeId || !urgencia || !Array.isArray(itens) || itens.length === 0) {
      res.status(400).json({ erro: 'Campos obrigatórios: unidadeId, urgencia, itens.' });
      return;
    }

    try {
      // Get next sequence number
      const seqResult = await prisma.$queryRaw<[{ nextval: bigint }]>`
        SELECT nextval('public.pedido_reposicao_numero_seq') as nextval
      `;
      const seqVal = seqResult[0]?.nextval || 1n;
      const year = new Date().getFullYear();
      const numero = `PED-${year}-${String(seqVal).padStart(4, '0')}`;

      const pedido = await prisma.pedidoReposicao.create({
        data: {
          numero,
          urgencia,
          unidadeId,
          solicitadoPorId: req.user!.id,
          status: 'PENDENTE',
          itens: {
            create: itens.map((item: any) => ({
              catmatCodigo: item.catmatCodigo || null,
              medicamentoNome: item.medicamentoNome,
              quantidade: item.quantidade
            }))
          }
        },
        include: { itens: true }
      });

      res.status(201).json(pedido);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao criar pedido de recomposição.' });
    }
  };

  // PATCH /api/cd/pedidos-reposicao/:id/status
  atualizarStatus = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const { status, motoristaId, justificativa, motivoRejeicao } = req.body;

    if (!status) {
      res.status(400).json({ erro: 'Status é obrigatório.' });
      return;
    }

    try {
      const dataUpdate: Prisma.PedidoReposicaoUpdateInput = {
        status: status as any
      };

      if (motoristaId) {
        dataUpdate.motorista = { connect: { id: motoristaId } };
      }
      if (justificativa) {
        dataUpdate.justificativa = justificativa;
      }
      if (motivoRejeicao) {
        dataUpdate.motivoRejeicao = motivoRejeicao;
      }

      const pedido = await prisma.pedidoReposicao.update({
        where: { id },
        data: dataUpdate,
        include: {
          itens: true
        }
      });

      res.json(pedido);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao atualizar status do pedido.' });
    }
  };

  // GET /api/cd/pedidos-reposicao/motoristas
  listarMotoristas = async (_req: AuthRequest, res: Response) => {
    try {
      const motoristas = await prisma.user.findMany({
        where: {
          perfil: 'ENTREGADOR',
          status: 'ATIVO',
          deletedAt: null
        },
        select: {
          id: true,
          nome: true,
          email: true
        },
        orderBy: { nome: 'asc' }
      });

      res.json(motoristas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar motoristas.' });
    }
  };
}
