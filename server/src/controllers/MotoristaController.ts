import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { Prisma } from '@prisma/client';
import { getPrismaForSchema } from '../lib/prismaFactory';

export class MotoristaController {
  // GET /api/motorista/dashboard
  dashboard = async (req: AuthRequest, res: Response) => {
    const motoristaId = req.user!.id;

    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      const [coletasPendentes, emTransito, concluidasHoje, totalMes] = await Promise.all([
        prisma.pedidoReposicao.count({
          where: { motoristaId, status: 'AGUARDANDO_MOTORISTA', deletedAt: null }
        }),
        prisma.pedidoReposicao.count({
          where: { motoristaId, status: 'EM_TRANSITO', deletedAt: null }
        }),
        prisma.pedidoReposicao.count({
          where: {
            motoristaId,
            status: 'CONCLUIDO',
            atualizadoEm: { gte: hoje },
            deletedAt: null
          }
        }),
        prisma.pedidoReposicao.count({
          where: {
            motoristaId,
            status: 'CONCLUIDO',
            atualizadoEm: { gte: primeiroDiaMes },
            deletedAt: null
          }
        })
      ]);

      res.json({
        coletasPendentes,
        emTransito,
        concluidasHoje,
        totalMes
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar dashboard do motorista.' });
    }
  };

  // GET /api/motorista/coletas
  coletasPendentes = async (req: AuthRequest, res: Response) => {
    const motoristaId = req.user!.id;
    const { page = '1', limit = '50' } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
    const take = Math.min(100, Number(limit));

    try {
      const where: Prisma.PedidoReposicaoWhereInput = {
        motoristaId,
        status: 'AGUARDANDO_MOTORISTA',
        deletedAt: null
      };

      const [total, pedidos] = await Promise.all([
        prisma.pedidoReposicao.count({ where }),
        prisma.pedidoReposicao.findMany({
          where,
          skip,
          take,
          orderBy: [
            { urgencia: 'desc' },
            { criadoEm: 'asc' }
          ],
          include: {
            itens: true,
            solicitadoPor: { select: { nome: true } }
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

      const dados = pedidos.map(p => ({
        ...p,
        unidadeNome: unitsMap[p.unidadeId] || 'Unidade Desconhecida'
      }));

      res.json({ total, pagina: Number(page), dados });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar coletas pendentes.' });
    }
  };

  // GET /api/motorista/entregas
  entregasAtivas = async (req: AuthRequest, res: Response) => {
    const motoristaId = req.user!.id;

    try {
      const where: Prisma.PedidoReposicaoWhereInput = {
        motoristaId,
        status: 'EM_TRANSITO',
        deletedAt: null
      };

      const pedidos = await prisma.pedidoReposicao.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        include: {
          itens: true,
          solicitadoPor: { select: { nome: true } }
        }
      });

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

      const dados = pedidos.map(p => ({
        ...p,
        unidadeNome: unitsMap[p.unidadeId] || 'Unidade Desconhecida'
      }));

      res.json(dados);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar entregas ativas.' });
    }
  };

  // GET /api/motorista/historico
  historico = async (req: AuthRequest, res: Response) => {
    const motoristaId = req.user!.id;
    const { page = '1', limit = '50', dataInicio, dataFim, status } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
    const take = Math.min(100, Number(limit));

    try {
      const where: Prisma.PedidoReposicaoWhereInput = {
        motoristaId,
        status: { in: ['CONCLUIDO', 'REJEITADO'] },
        deletedAt: null
      };

      if (status && (status === 'CONCLUIDO' || status === 'REJEITADO')) {
        where.status = status as any;
      }

      if (dataInicio || dataFim) {
        const dateFilter: Prisma.DateTimeFilter = {};
        if (dataInicio) {
          dateFilter.gte = new Date(String(dataInicio));
        }
        if (dataFim) {
          const end = new Date(String(dataFim));
          end.setDate(end.getDate() + 1);
          dateFilter.lt = end;
        }
        where.atualizadoEm = dateFilter;
      }

      const [total, pedidos] = await Promise.all([
        prisma.pedidoReposicao.count({ where }),
        prisma.pedidoReposicao.findMany({
          where,
          skip,
          take,
          orderBy: { atualizadoEm: 'desc' },
          include: {
            itens: true,
            solicitadoPor: { select: { nome: true } }
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

      const dados = pedidos.map(p => ({
        ...p,
        unidadeNome: unitsMap[p.unidadeId] || 'Unidade Desconhecida'
      }));

      res.json({ total, pagina: Number(page), dados });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar histórico.' });
    }
  };

  // PATCH /api/motorista/coletas/:id/aceitar
  aceitarColeta = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const motoristaId = req.user!.id;

    try {
      const pedidoAnterior = await prisma.pedidoReposicao.findFirst({
        where: { id, motoristaId, status: 'AGUARDANDO_MOTORISTA', deletedAt: null }
      });

      if (!pedidoAnterior) {
        res.status(404).json({ erro: 'Coleta não encontrada ou não disponível para aceitar.' });
        return;
      }

      const pedido = await prisma.pedidoReposicao.update({
        where: { id },
        data: { status: 'EM_TRANSITO' },
        include: {
          itens: true,
          motorista: { select: { nome: true } }
        }
      });

      // Audit Log
      if (req.user?.id) {
        await prisma.auditoria.create({
          data: {
            usuarioId: req.user.id,
            acao: 'TRANSFERENCIA_INICIADA',
            entidadeId: pedido.id,
            dadosAntes: { status: pedidoAnterior.status },
            dadosDepois: {
              id: pedido.id,
              numero: pedido.numero,
              status: pedido.status,
              motorista: pedido.motorista?.nome || null
            },
            justificativa: `Motorista aceitou coleta do pedido ${pedido.numero}.`
          }
        }).catch(err => console.error('Erro ao salvar auditoria de aceite de coleta:', err));
      }

      res.json(pedido);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao aceitar coleta.' });
    }
  };

  // PATCH /api/motorista/entregas/:id/confirmar
  confirmarEntrega = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const motoristaId = req.user!.id;
    const { assinatura } = req.body;

    try {
      const pedidoAnterior = await prisma.pedidoReposicao.findFirst({
        where: { id, motoristaId, status: 'EM_TRANSITO', deletedAt: null }
      });

      if (!pedidoAnterior) {
        res.status(404).json({ erro: 'Entrega não encontrada ou não disponível para confirmar.' });
        return;
      }

      const dataUpdate: Prisma.PedidoReposicaoUpdateInput = {
        status: 'CONCLUIDO'
      };

      const pedido = await prisma.pedidoReposicao.update({
        where: { id },
        data: dataUpdate,
        include: {
          itens: true,
          motorista: { select: { nome: true } }
        }
      });

      // Adicionar ao estoque da farmácia (tenant)
      await this.adicionarEstoqueFarmacia(pedido.unidadeId, pedido.itens, pedido.numero);

      // Audit Log
      if (req.user?.id) {
        await prisma.auditoria.create({
          data: {
            usuarioId: req.user.id,
            acao: 'TRANSFERENCIA_CONCLUIDA',
            entidadeId: pedido.id,
            dadosAntes: { status: pedidoAnterior.status },
            dadosDepois: {
              id: pedido.id,
              numero: pedido.numero,
              status: pedido.status,
              motorista: pedido.motorista?.nome || null,
              assinatura: assinatura || null
            },
            justificativa: `Motorista confirmou entrega do pedido ${pedido.numero}.`
          }
        }).catch(err => console.error('Erro ao salvar auditoria de confirmação de entrega:', err));
      }

      res.json(pedido);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao confirmar entrega.' });
    }
  };

  // PATCH /api/motorista/entregas/:id/devolver
  devolverEntrega = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const motoristaId = req.user!.id;
    const { motivoRejeicao } = req.body;

    if (!motivoRejeicao) {
      res.status(400).json({ erro: 'Motivo da devolução é obrigatório.' });
      return;
    }

    try {
      const pedidoAnterior = await prisma.pedidoReposicao.findFirst({
        where: { id, motoristaId, status: 'EM_TRANSITO', deletedAt: null }
      });

      if (!pedidoAnterior) {
        res.status(404).json({ erro: 'Entrega não encontrada ou não disponível para devolver.' });
        return;
      }

      const pedido = await prisma.pedidoReposicao.update({
        where: { id },
        data: {
          status: 'REJEITADO',
          motivoRejeicao
        },
        include: {
          itens: true,
          motorista: { select: { nome: true } }
        }
      });

      // Audit Log
      if (req.user?.id) {
        await prisma.auditoria.create({
          data: {
            usuarioId: req.user.id,
            acao: 'PEDIDO_REJEITADO',
            entidadeId: pedido.id,
            dadosAntes: { status: pedidoAnterior.status },
            dadosDepois: {
              id: pedido.id,
              numero: pedido.numero,
              status: pedido.status,
              motorista: pedido.motorista?.nome || null,
              motivoRejeicao: pedido.motivoRejeicao || null
            },
            justificativa: motivoRejeicao
          }
        }).catch(err => console.error('Erro ao salvar auditoria de devolução:', err));
      }

      res.json(pedido);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao devolver entrega.' });
    }
  };

  /**
   * Adiciona itens ao estoque da farmácia (tenant) quando o pedido é concluído.
   * Cria medicamentos se não existirem e insere lotes novos.
   */
  private adicionarEstoqueFarmacia = async (
    unidadeId: string,
    itens: { catmatCodigo: string | null; medicamentoNome: string; quantidade: number }[],
    numeroPedido: string
  ) => {
    // Buscar o tenant schema da unidade
    const unidades = await prisma.$queryRaw<{ tenant_schema: string }[]>`
      SELECT tenant_schema FROM public.unidades WHERE id = ${unidadeId} AND deleted_at IS NULL
    `;

    if (unidades.length === 0 || !unidades[0].tenant_schema) {
      console.warn(`[Stock Transfer] Unidade ${unidadeId} não tem tenant schema configurado.`);
      return;
    }

    const tenantSchema = unidades[0].tenant_schema;

    // Validação do schema para segurança
    if (!/^tenant_[a-z][a-z0-9_]{1,50}$/.test(tenantSchema)) {
      console.warn(`[Stock Transfer] Schema inválido: ${tenantSchema}`);
      return;
    }

    const tenant = getPrismaForSchema(tenantSchema);

    for (const item of itens) {
      try {
        // 1. Buscar ou criar medicamento no tenant
        const medicamentos: { id: string }[] = await tenant.$queryRawUnsafe(
          `SELECT id FROM medicamentos WHERE nome ILIKE $1 AND deleted_at IS NULL LIMIT 1`,
          item.medicamentoNome
        );

        let medicamentoId: string;

        if (medicamentos.length > 0) {
          medicamentoId = medicamentos[0].id;
        } else {
          // Criar medicamento
          const novos: { id: string }[] = await tenant.$queryRawUnsafe(
            `INSERT INTO medicamentos (id, catmat_codigo, nome, estoque_minimo)
             VALUES (gen_random_uuid()::text, $1, $2, 0)
             RETURNING id`,
            item.catmatCodigo,
            item.medicamentoNome
          );
          medicamentoId = novos[0].id;
        }

        // 2. Buscar lote sugerido do CD para info de validade e numero lote
        const lotesCD = await prisma.cdEstoqueLote.findMany({
          where: {
            OR: [
              ...(item.catmatCodigo ? [{ catmatCodigo: item.catmatCodigo }] : []),
              { medicamentoNome: { contains: item.medicamentoNome, mode: 'insensitive' as const } }
            ],
            deletedAt: null
          },
          orderBy: { dataValidade: 'asc' },
          take: 1
        });

        const loteRef = lotesCD[0];
        const numeroLote = loteRef?.numeroLote || `REPO-${numeroPedido}`;
        const validade = loteRef?.dataValidade || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        // 3. Criar lote no tenant
        await tenant.$queryRawUnsafe(
          `INSERT INTO lotes (id, medicamento_id, numero_lote, quantidade, quantidade_atual, validade, nota_fiscal)
           VALUES (gen_random_uuid()::text, $1, $2, $3, $3, $4, $5)`,
          medicamentoId,
          numeroLote,
          item.quantidade,
          validade,
          `Reposição ${numeroPedido}`
        );

        console.log(`[Stock Transfer] ${item.medicamentoNome} x${item.quantidade} → ${tenantSchema}`);
      } catch (err) {
        console.error(`[Stock Transfer] Erro ao transferir ${item.medicamentoNome}:`, err);
        // Continua com os próximos itens, não falha todo o pedido
      }
    }
  };
}
