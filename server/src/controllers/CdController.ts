import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { Prisma } from '@prisma/client';
import { parseNfeXml } from '../utils/nfeXmlParser';
import { getPrismaForSchema } from '../lib/prismaFactory';

interface ItemNfInput {
  catmatCodigo?: string;
  medicamentoNome: string;
  numeroLote: string;
  dataValidade: string;
  quantidadeEsperada: number;
  precoUnitario: number;
}

interface ItemConferenciaInput {
  itemId: string;
  quantidadeRecebida: number;
  observacaoDivergencia?: string;
}

async function verificarRecall(
  numeroLote: string,
  catmatCodigo: string | null,
  client: Prisma.TransactionClient | typeof prisma = prisma
): Promise<boolean> {
  const result = await client.$queryRaw<[{ is_lote_bloqueado_recall: boolean }]>`
    SELECT public.is_lote_bloqueado_recall(${numeroLote}::text, ${catmatCodigo}::text) AS is_lote_bloqueado_recall
  `;
  return result[0]?.is_lote_bloqueado_recall ?? false;
}

export class CdController {
  // GET /api/cd/dashboard/stats
  getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [
        distinctMedicamentos,
        lotesDisponiveisCount,
        recebimentosHojeRaw,
        alertasCount
      ] = await Promise.all([
        // Itens cadastrados (medicamentos distintos nos lotes ou notas fiscais)
        prisma.cdEstoqueLote.groupBy({
          by: ['medicamentoNome'],
          where: { deletedAt: null },
        }),
        // Lotes no estoque disponíveis
        prisma.cdEstoqueLote.count({
          where: {
            status: 'DISPONIVEL',
            deletedAt: null,
          },
        }),
        // Recebimentos hoje (NFs recebidas hoje)
        prisma.notaFiscal.findMany({
          where: {
            dataRecebimento: {
              gte: todayStart,
              lte: todayEnd,
            },
            deletedAt: null,
          },
          include: {
            itens: true,
          },
        }),
        // Alertas ativos
        prisma.alertaCd.count({
          where: {
            status: 'NOVO',
          },
        }),
      ]);

      const recebimentosLotes = recebimentosHojeRaw.reduce(
        (acc, nf) => acc + nf.itens.length,
        0
      );

      const recebimentosUnidades = recebimentosHojeRaw.reduce((acc, nf) => {
        const itemSum = nf.itens.reduce(
          (sum, item) => sum + (item.quantidadeRecebida || item.quantidadeEsperada || 0),
          0
        );
        return acc + itemSum;
      }, 0);

      return res.json({
        itensCadastradosCount: distinctMedicamentos.length,
        lotesDisponiveisCount,
        recebimentosHojeLotes: recebimentosLotes,
        recebimentosHojeUnidades: recebimentosUnidades,
        alertasAtivosCount: alertasCount,
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas do CD:', err);
      return res.status(500).json({ erro: 'Erro interno ao buscar estatísticas do CD' });
    }
  };

  // POST /api/cd/notas-fiscais
  registrarNf = async (req: AuthRequest, res: Response) => {
    const { numeroNf, serie, chaveAcesso, dataEmissao, fornecedorId, pedidoCompraId, valorTotal, xmlUrl, observacoes, itens } = req.body;

    if (!numeroNf || !serie || !dataEmissao || !fornecedorId || !valorTotal || !Array.isArray(itens) || itens.length === 0) {
      res.status(400).json({ erro: 'Campos obrigatórios: numeroNf, serie, dataEmissao, fornecedorId, valorTotal, itens.' });
      return;
    }

    try {
      if (chaveAcesso) {
        const nfExistente = await prisma.notaFiscal.findFirst({
          where: { chaveAcesso, deletedAt: null }
        });
        if (nfExistente) {
          res.status(400).json({ erro: `Esta Nota Fiscal (Chave: ${chaveAcesso}) já foi cadastrada no sistema.` });
          return;
        }
      }

      const nf = await prisma.notaFiscal.create({
        data: {
          numeroNf,
          serie,
          chaveAcesso: chaveAcesso ?? null,
          dataEmissao: new Date(dataEmissao),
          fornecedorId,
          pedidoCompraId: pedidoCompraId ?? null,
          valorTotal: new Prisma.Decimal(valorTotal),
          xmlUrl: xmlUrl ?? null,
          observacoes: observacoes ?? null,
          itens: {
            create: (itens as ItemNfInput[]).map(item => ({
              catmatCodigo: item.catmatCodigo ?? null,
              medicamentoNome: item.medicamentoNome,
              numeroLote: item.numeroLote,
              dataValidade: new Date(item.dataValidade),
              quantidadeEsperada: item.quantidadeEsperada,
              precoUnitario: new Prisma.Decimal(item.precoUnitario),
            })),
          },
        },
        include: { itens: true },
      });

      res.status(201).json(nf);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao registrar nota fiscal.' });
    }
  };

  // POST /api/cd/notas-fiscais/xml
  lerNfXml = async (req: Request, res: Response) => {
    const { xml } = req.body;

    if (!xml) {
      res.status(400).json({ erro: 'O conteúdo XML é obrigatório.' });
      return;
    }

    try {
      const parsed = parseNfeXml(xml);
      
      // Procurar fornecedor no banco pelo CNPJ extraído
      const cleanCnpj = parsed.fornecedorCnpj.replace(/\D/g, '');
      let fornecedor = await prisma.fornecedor.findFirst({
        where: {
          cnpj: {
            contains: cleanCnpj
          },
          deletedAt: null
        }
      });

      // Se não encontrar, tentar achar formatado "XX.XXX.XXX/XXXX-XX"
      if (!fornecedor) {
        const formattedCnpj = parsed.fornecedorCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
        fornecedor = await prisma.fornecedor.findFirst({
          where: {
            cnpj: formattedCnpj,
            deletedAt: null
          }
        });
      }

      // Se não existir, realizar auto-cadastro do fornecedor com base nas tags <emit>
      if (!fornecedor) {
        const formattedCnpj = parsed.fornecedorCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
        fornecedor = await prisma.fornecedor.create({
          data: {
            cnpj: formattedCnpj,
            razaoSocial: parsed.fornecedorNome,
            nomeFantasia: parsed.fornecedorFantasia,
            email: 'contato@' + (parsed.fornecedorFantasia.toLowerCase().replace(/[^a-z0-9]/g, '')) + '.com.br',
            whatsapp: '(00) 00000-0000',
            categorias: ['Medicamentos'],
            status: 'ATIVO',
            taxaAceitacao: 100.00
          }
        });
        console.log(`[CD] Fornecedor auto-cadastrado via XML: ${parsed.fornecedorNome} (${formattedCnpj})`);
      }

      res.json({
        ...parsed,
        fornecedorId: fornecedor.id,
        fornecedorNome: fornecedor.nomeFantasia
      });
    } catch (err: any) {
      res.status(400).json({ erro: err.message || 'Erro ao processar XML da nota fiscal.', issues: err.issues });
    }
  };

  // GET /api/cd/notas-fiscais
  listarNfs = async (req: Request, res: Response) => {
    const { status, fornecedorId, page = '1', limit = '50' } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
    const take = Math.min(100, Number(limit));

    try {
      const where: Prisma.NotaFiscalWhereInput = { deletedAt: null };
      if (status) where.status = status as Prisma.EnumNotaFiscalStatusFilter;
      if (fornecedorId) where.fornecedorId = String(fornecedorId);

      const [total, nfs] = await Promise.all([
        prisma.notaFiscal.count({ where }),
        prisma.notaFiscal.findMany({
          where,
          skip,
          take,
          orderBy: { criadoEm: 'desc' },
          include: { fornecedor: { select: { razaoSocial: true, cnpj: true } }, _count: { select: { itens: true } } },
        }),
      ]);

      res.json({ total, pagina: Number(page), dados: nfs });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar notas fiscais.' });
    }
  };

  // GET /api/cd/notas-fiscais/:id
  obterNf = async (req: Request, res: Response) => {
    const id = String(req.params.id);

    try {
      const nf = await prisma.notaFiscal.findFirst({
        where: { id, deletedAt: null },
        include: {
          fornecedor: { select: { razaoSocial: true, cnpj: true } },
          pedidoCompra: { select: { numero: true } },
          itens: { include: { estoqueLote: true } },
        },
      });

      if (!nf) { res.status(404).json({ erro: 'Nota fiscal não encontrada.' }); return; }
      res.json(nf);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar nota fiscal.' });
    }
  };

  // POST /api/cd/notas-fiscais/:id/conferir
  conferirNf = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const { itens }: { itens: ItemConferenciaInput[] } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      res.status(400).json({ erro: 'Informe os itens da conferência.' });
      return;
    }

    try {
      const nf = await prisma.notaFiscal.findFirst({
        where: { id, deletedAt: null },
        include: { itens: true },
      });

      if (!nf) { res.status(404).json({ erro: 'Nota fiscal não encontrada.' }); return; }
      if (nf.status === 'CANCELADA') { res.status(400).json({ erro: 'NF cancelada não pode ser conferida.' }); return; }

      // Atualiza cada item com a quantidade recebida — triggers SQL detectam divergência e criam alerta
      for (const conf of itens) {
        await prisma.notaFiscalItem.update({
          where: { id: conf.itemId },
          data: {
            quantidadeRecebida: conf.quantidadeRecebida,
            observacaoDivergencia: conf.observacaoDivergencia ?? null,
          },
        });
      }

      // Lê o estado atualizado após os triggers
      const nfAtualizada = await prisma.notaFiscal.findUniqueOrThrow({
        where: { id },
        include: { itens: true },
      }) as Prisma.NotaFiscalGetPayload<{ include: { itens: true } }>;

      // Cria os lotes no estoque do CD para todos os itens recebidos (> 0) e atualiza metadados da NF
      await prisma.$transaction(async (tx) => {
        for (const item of nfAtualizada.itens) {
          const qtdRecebida = item.quantidadeRecebida ?? 0;
          if (qtdRecebida > 0) {
            const bloqueado = await verificarRecall(item.numeroLote, item.catmatCodigo, tx);
            const statusLote = bloqueado ? 'BLOQUEADO_RECALL' : 'DISPONIVEL';

            // Evitar duplicidades se já houver um registro de estoque correspondente
            const loteExistente = await tx.cdEstoqueLote.findUnique({
              where: { notaFiscalItemId: item.id }
            });

            if (!loteExistente) {
              await tx.cdEstoqueLote.create({
                data: {
                  notaFiscalItemId: item.id,
                  catmatCodigo: item.catmatCodigo,
                  medicamentoNome: item.medicamentoNome,
                  numeroLote: item.numeroLote,
                  dataValidade: item.dataValidade,
                  quantidadeInicial: qtdRecebida,
                  quantidadeAtual: qtdRecebida,
                  status: statusLote,
                },
              });
            }
          }
        }

        // Se houver divergência, mantém o status CONFERIDO_DIVERGENCIA. Caso contrário, CONFERIDA.
        const statusFinal = nfAtualizada.status === 'CONFERIDO_DIVERGENCIA' ? 'CONFERIDO_DIVERGENCIA' : 'CONFERIDA';

        await tx.notaFiscal.update({
          where: { id },
          data: {
            status: statusFinal,
            conferidoPor: req.user?.id ?? null,
            conferidoEm: new Date(),
          },
        });
      });

      const resultado = await prisma.notaFiscal.findUniqueOrThrow({
        where: { id },
        include: { itens: { include: { estoqueLote: true } } },
      });

      // Audit Log for ENTRADA_ESTOQUE
      if (req.user?.id) {
        await prisma.auditoria.create({
          data: {
            usuarioId: req.user.id,
            acao: 'ENTRADA_ESTOQUE',
            entidadeId: resultado.id,
            dadosAntes: { status: nf.status },
            dadosDepois: {
              id: resultado.id,
              numeroNf: resultado.numeroNf,
              status: resultado.status,
              itens: resultado.itens.map(it => ({
                medicamentoNome: it.medicamentoNome,
                numeroLote: it.numeroLote,
                quantidadeEsperada: it.quantidadeEsperada,
                quantidadeRecebida: it.quantidadeRecebida
              }))
            },
            justificativa: `Conferência da Nota Fiscal ${resultado.numeroNf} finalizada com status ${resultado.status}.`
          }
        }).catch(err => console.error('Erro ao salvar auditoria de entrada:', err));
      }

      res.json(resultado);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao conferir nota fiscal.' });
    }
  };

  // GET /api/cd/estoque
  listarEstoque = async (req: AuthRequest, res: Response) => {
    const { status, busca, page = '1', limit = '50' } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
    const take = Math.min(100, Number(limit));

    try {
      const isUnidade = req.user?.perfil === 'FARMACIA' || req.user?.perfil === 'POSTO_SAUDE';
      if (isUnidade && req.user?.unidadeId && req.user?.tenantSchema) {
        const tenantSchema = req.user.tenantSchema;
        try {
          const tenant = getPrismaForSchema(tenantSchema);
          let query = `
            SELECT
              m.nome            AS "medicamentoNome",
              m.catmat_codigo   AS "catmatCodigo",
              m.estoque_minimo  AS "estoqueMinimo",
              l.id,
              l.numero_lote     AS "numeroLote",
              l.validade        AS "dataValidade",
              l.quantidade_atual AS "quantidadeAtual",
              'DISPONIVEL'      AS "status"
            FROM medicamentos m
            INNER JOIN lotes l ON l.medicamento_id = m.id AND l.deleted_at IS NULL AND l.quantidade_atual > 0
            WHERE m.deleted_at IS NULL
          `;

          const params: unknown[] = [];
          if (busca) {
            params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
            query += ` AND (m.nome ILIKE $1 OR m.catmat_codigo ILIKE $2 OR l.numero_lote ILIKE $3)`;
          }
          
          query += ` ORDER BY m.nome, l.validade ASC`;

          const lotes: any[] = await tenant.$queryRawUnsafe(query, ...params);

          res.json({ total: lotes.length, pagina: 1, dados: lotes });
          return;
        } catch (tenantErr) {
          console.warn(`[CdController] Falha ao consultar tenant schema (${tenantSchema}), caindo para estoque central:`, tenantErr);
        }
      }

      const where: Prisma.CdEstoqueLoteWhereInput = { deletedAt: null };
      if (status) where.status = status as Prisma.EnumCdEstoqueLoteStatusFilter;
      if (busca) {
        where.OR = [
          { medicamentoNome: { contains: String(busca), mode: 'insensitive' } },
          { numeroLote: { contains: String(busca), mode: 'insensitive' } },
          { catmatCodigo: { contains: String(busca), mode: 'insensitive' } },
        ];
      }

      const [total, lotes, minimos] = await Promise.all([
        prisma.cdEstoqueLote.count({ where }),
        prisma.cdEstoqueLote.findMany({ where, skip, take, orderBy: { dataValidade: 'asc' } }),
        prisma.cdEstoqueMinimo.findMany().catch(() => []),
      ]);

      const minimosMap: Record<string, number> = {};
      minimos.forEach(m => {
        minimosMap[m.medicamentoNome] = m.quantidadeMinima;
      });

      const lotesComMinimo = lotes.map(lote => ({
        ...lote,
        estoqueMinimo: minimosMap[lote.medicamentoNome] ?? 0
      }));

      res.json({ total, pagina: Number(page), dados: lotesComMinimo });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar estoque.' });
    }
  };

  // PUT /api/cd/estoque/minimo
  atualizarEstoqueMinimo = async (req: AuthRequest, res: Response) => {
    const { medicamentoNome, catmatCodigo, quantidadeMinima } = req.body;

    if (!medicamentoNome || typeof quantidadeMinima !== 'number' || quantidadeMinima < 0) {
      res.status(400).json({ erro: 'Campos obrigatórios: medicamentoNome e quantidadeMinima (número >= 0).' });
      return;
    }

    try {
      // Upsert do estoque mínimo usando o modelo formal do Prisma
      const registro = await prisma.cdEstoqueMinimo.upsert({
        where: { medicamentoNome },
        update: {
          quantidadeMinima,
          catmatCodigo: catmatCodigo || null,
        },
        create: {
          medicamentoNome,
          catmatCodigo: catmatCodigo || null,
          quantidadeMinima,
        },
      });

      // 4. Se a quantidade mínima atualizada for maior que o estoque atual disponível, criar alerta no CD (bloco isolado)
      try {
        const estoqueLotes = await prisma.cdEstoqueLote.findMany({
          where: { medicamentoNome, status: 'DISPONIVEL', deletedAt: null }
        });
        const qtdTotal = estoqueLotes.reduce((acc, l) => acc + l.quantidadeAtual, 0);

        if (qtdTotal < quantidadeMinima) {
          await prisma.alertaCd.create({
            data: {
              tipo: 'ESTOQUE_MINIMO',
              referenciaId: registro.id,
              referenciaTipo: 'CdEstoqueMinimo',
              titulo: `Estoque Crítico: ${medicamentoNome}`,
              descricao: `O estoque atual (${qtdTotal} un) está abaixo do estoque mínimo configurado (${quantidadeMinima} un).`,
              perfisDestinatarios: ['GESTOR_ESTOQUE', 'COMPRADOR'],
            }
          });
        }
      } catch (alertaErr) {
        console.warn('Aviso: Não foi possível registrar o alerta de estoque mínimo, mas o valor foi salvo:', alertaErr);
      }

      res.json(registro);
    } catch (err: any) {
      console.error('Erro ao atualizar estoque mínimo:', err);
      res.status(500).json({ erro: err?.message || 'Erro interno ao atualizar estoque mínimo.' });
    }
  };


  // POST /api/cd/recalls
  registrarRecall = async (req: AuthRequest, res: Response) => {
    const { catmatCodigo, numeroLote, medicamentoNome, fonte, risco, motivo, autoridadeEmissora, numeroAnvisa, dataExpiracao } = req.body;

    if (!motivo || (!catmatCodigo && !numeroLote)) {
      res.status(400).json({ erro: 'Informe motivo e ao menos catmatCodigo ou numeroLote.' });
      return;
    }

    try {
      const recall = await prisma.recall.create({
        data: {
          catmatCodigo: catmatCodigo ?? null,
          numeroLote: numeroLote ?? null,
          medicamentoNome: medicamentoNome ?? null,
          fonte: fonte ?? 'ANVISA',
          risco: risco ?? 'MEDIO',
          motivo,
          autoridadeEmissora: autoridadeEmissora ?? null,
          numeroAnvisa: numeroAnvisa ?? null,
          dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
          ativo: true,
          criadoPor: req.user!.id,
        },
      });

      // Audit Log for RECALL_REGISTRADO
      if (req.user?.id) {
        await prisma.auditoria.create({
          data: {
            usuarioId: req.user.id,
            acao: 'RECALL_REGISTRADO',
            entidadeId: recall.id,
            dadosAntes: Prisma.DbNull,
            dadosDepois: {
              id: recall.id,
              medicamentoNome: recall.medicamentoNome,
              numeroLote: recall.numeroLote,
              catmatCodigo: recall.catmatCodigo,
              motivo: recall.motivo,
              risco: recall.risco,
              fonte: recall.fonte
            },
            justificativa: `Recall registrado para lote ${recall.numeroLote || 'N/A'}. Motivo: ${recall.motivo}`
          }
        }).catch(err => console.error('Erro ao salvar auditoria de recall:', err));
      }

      res.status(201).json(recall);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao registrar recall.' });
    }
  };

  // GET /api/cd/recalls
  listarRecalls = async (_req: Request, res: Response) => {
    try {
      const [recalls, lotesEstoque] = await Promise.all([
        prisma.recall.findMany({
          orderBy: { criadoEm: 'desc' },
        }),
        prisma.cdEstoqueLote.findMany({
          where: { deletedAt: null },
          select: { catmatCodigo: true, numeroLote: true }
        }),
      ]);

      const recallsComLotes = recalls.map((recall) => {
        let lotesAfetados = 0;

        if (recall.numeroLote && recall.catmatCodigo) {
          lotesAfetados = lotesEstoque.filter(
            l => l.numeroLote === recall.numeroLote && l.catmatCodigo === recall.catmatCodigo
          ).length;
        } else if (recall.catmatCodigo) {
          lotesAfetados = lotesEstoque.filter(
            l => l.catmatCodigo === recall.catmatCodigo
          ).length;
        } else if (recall.numeroLote) {
          lotesAfetados = lotesEstoque.filter(
            l => l.numeroLote === recall.numeroLote
          ).length;
        }

        return {
          ...recall,
          lotesAfetados,
        };
      });

      res.json(recallsComLotes);
    } catch (err) {
      console.error('Erro ao listar recalls:', err);
      res.status(500).json({ erro: 'Erro ao listar recalls.' });
    }
  };

  // PATCH /api/cd/recalls/:id/encerrar
  encerrarRecall = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);

    try {
      const recall = await prisma.recall.findUnique({
        where: { id: id as string },
      });

      if (!recall) {
        res.status(404).json({ erro: 'Recall não encontrado.' });
        return;
      }

      const updatedRecall = await prisma.recall.update({
        where: { id: id as string },
        data: { ativo: false },
      });

      const conditions: any[] = [];
      if (recall.numeroLote && recall.catmatCodigo) {
        conditions.push({ numeroLote: recall.numeroLote, catmatCodigo: recall.catmatCodigo });
      } else if (recall.catmatCodigo) {
        conditions.push({ catmatCodigo: recall.catmatCodigo });
      } else if (recall.numeroLote) {
        conditions.push({ numeroLote: recall.numeroLote });
      }

      const matchingLots = await prisma.cdEstoqueLote.findMany({
        where: {
          status: 'BLOQUEADO_RECALL',
          AND: conditions,
        },
      });

      for (const lot of matchingLots) {
        const isStillBlocked = await verificarRecall(lot.numeroLote, lot.catmatCodigo);
        if (!isStillBlocked) {
          await prisma.cdEstoqueLote.update({
            where: { id: lot.id },
            data: { status: 'DISPONIVEL' },
          });
        }
      }

      // Audit Log for RECALL_ENCERRADO
      if (req.user?.id) {
        await prisma.auditoria.create({
          data: {
            usuarioId: req.user.id,
            acao: 'RECALL_ENCERRADO',
            entidadeId: updatedRecall.id,
            dadosAntes: { ativo: true },
            dadosDepois: { ativo: false },
            justificativa: `Recall encerrado e lotes liberados se aplicável.`
          }
        }).catch(err => console.error('Erro ao salvar auditoria de encerramento de recall:', err));
      }

      res.json(updatedRecall);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao encerrar recall.' });
    }
  };

  // GET /api/cd/auditoria
  listarAuditoria = async (req: AuthRequest, res: Response) => {
    const { busca, dataInicio, dataFim, categoria } = req.query;

    try {
      const where: Prisma.AuditoriaWhereInput = {};

      // Filter by CD operations actions
      // Entradas: ENTRADA_ESTOQUE
      // Dispensações: DISPENSACAO
      // Recalls: RECALL_REGISTRADO, RECALL_ENCERRADO
      // Transferências: TRANSFERENCIA_INICIADA, TRANSFERENCIA_CONCLUIDA
      // Pedidos: PEDIDO_CRIADO, PEDIDO_APROVADO, PEDIDO_REJEITADO
      
      const cdActions = [
        'ENTRADA_ESTOQUE',
        'DISPENSACAO',
        'RECALL_REGISTRADO',
        'RECALL_ENCERRADO',
        'TRANSFERENCIA_INICIADA',
        'TRANSFERENCIA_CONCLUIDA',
        'PEDIDO_CRIADO',
        'PEDIDO_APROVADO',
        'PEDIDO_REJEITADO'
      ];

      if (categoria && String(categoria) !== 'TODOS') {
        const cat = String(categoria).toUpperCase();
        if (cat === 'ENTRADAS') {
          where.acao = 'ENTRADA_ESTOQUE';
        } else if (cat === 'DISPENSACOES') {
          where.acao = 'DISPENSACAO';
        } else if (cat === 'RECALLS') {
          where.acao = { in: ['RECALL_REGISTRADO', 'RECALL_ENCERRADO'] };
        } else if (cat === 'TRANSFERENCIAS') {
          where.acao = { in: ['TRANSFERENCIA_INICIADA', 'TRANSFERENCIA_CONCLUIDA'] };
        } else if (cat === 'PEDIDOS') {
          where.acao = { in: ['PEDIDO_CRIADO', 'PEDIDO_APROVADO', 'PEDIDO_REJEITADO'] };
        } else {
          where.acao = { in: cdActions };
        }
      } else {
        where.acao = { in: cdActions };
      }

      // Date filtering
      if (dataInicio || dataFim) {
        where.dataHora = {};
        if (dataInicio) {
          where.dataHora.gte = new Date(String(dataInicio));
        }
        if (dataFim) {
          const end = new Date(String(dataFim));
          end.setHours(23, 59, 59, 999);
          where.dataHora.lte = end;
        }
      }

      // Search (by User Name, User Email, Description/Justificativa, Action or Entity ID)
      if (busca) {
        const queryBusca = String(busca);
        where.OR = [
          { acao: { contains: queryBusca, mode: 'insensitive' } },
          { entidadeId: { contains: queryBusca, mode: 'insensitive' } },
          { justificativa: { contains: queryBusca, mode: 'insensitive' } },
          {
            usuario: {
              OR: [
                { nome: { contains: queryBusca, mode: 'insensitive' } },
                { email: { contains: queryBusca, mode: 'insensitive' } },
              ]
            }
          }
        ];
      }

      const logs = await prisma.auditoria.findMany({
        where,
        orderBy: { dataHora: 'desc' },
        include: {
          usuario: {
            select: {
              nome: true,
              email: true,
              perfil: true,
              role: true
            }
          }
        }
      });

      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar logs de auditoria do CD.' });
    }
  };

  // GET /api/cd/alertas
  listarAlertas = async (req: AuthRequest, res: Response) => {
    const { status, tipo } = req.query;

    try {
      const where: Prisma.AlertaCdWhereInput = {};
      if (status) where.status = status as Prisma.EnumAlertaCdStatusFilter;
      if (tipo) where.tipo = tipo as Prisma.EnumAlertaCdTipoFilter;

      const perfil = req.user?.perfil;
      if (perfil) {
        where.perfisDestinatarios = { has: perfil };
      }

      const alertas = await prisma.alertaCd.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        take: 100,
      });

      res.json(alertas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar alertas.' });
    }
  };

  // PATCH /api/cd/alertas/:id/lido
  marcarAlertaLido = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);

    try {
      const alerta = await prisma.alertaCd.update({
        where: { id },
        data: {
          status: 'LIDO',
          lidoEm: new Date(),
          lidoPor: req.user?.id ?? null,
        },
      });
      res.json(alerta);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao marcar alerta como lido.' });
    }
  };

  // GET /api/cd/estoque/detalhes
  obterDetalhesMedicamento = async (req: AuthRequest, res: Response) => {
    const medicamentoNome = req.query.nome ? String(req.query.nome) : null;

    if (!medicamentoNome) {
      res.status(400).json({ erro: 'O nome do medicamento é obrigatório.' });
      return;
    }

    try {
      const isUnidade = req.user?.perfil === 'FARMACIA' || req.user?.perfil === 'POSTO_SAUDE';
      if (isUnidade && req.user?.unidadeId) {
        const tenantSchema = req.user.tenantSchema;
        if (!tenantSchema) {
          res.status(400).json({ erro: 'Tenant não identificado para esta unidade.' });
          return;
        }

        const tenant = getPrismaForSchema(tenantSchema);

        // Buscar todos os lotes ativos do medicamento no estoque do tenant
        const lotes = await tenant.$queryRawUnsafe<{ id: string, numero_lote: string, validade: any, quantidade: number, quantidade_atual: number, criado_em: any, nota_fiscal: string }[]>(
          `SELECT l.id, l.numero_lote, l.validade, l.quantidade, l.quantidade_atual, l.criado_em, l.nota_fiscal
           FROM lotes l
           INNER JOIN medicamentos m ON l.medicamento_id = m.id
           WHERE m.nome ILIKE $1 AND l.deleted_at IS NULL AND m.deleted_at IS NULL
           ORDER BY l.validade ASC`,
          `%${medicamentoNome}%`
        );

        const lotesReservas = lotes.map((l, idx) => ({
          id: l.id,
          lote: l.numero_lote,
          validade: l.validade ? new Date(l.validade).toISOString().split('T')[0] : '',
          estoque: l.quantidade_atual,
          reservado: 0,
          disponivel: l.quantidade_atual,
          prioridade: `${idx + 1}º a usar`
        }));

        const movimentacoes: any[] = [];
        lotes.forEach(l => {
          movimentacoes.push({
            id: `entrada-${l.id}`,
            origemDestino: l.nota_fiscal || 'Recebimento de Reposição',
            dataHora: l.criado_em,
            lote: l.numero_lote,
            tipo: 'Entrada',
            quantidade: l.quantidade
          });
        });

        // Buscar dispensações (saídas) do medicamento
        const dispensados = await tenant.$queryRawUnsafe<{ id: string, data_dispensacao: any, numero_lote: string, quantidade: number }[]>(
          `SELECT di.id, d.data_dispensacao, l.numero_lote, di.quantidade
           FROM dispensacao_itens di
           INNER JOIN dispensacoes d ON di.dispensacao_id = d.id
           INNER JOIN lotes l ON di.lote_id = l.id
           INNER JOIN medicamentos m ON di.medicamento_id = m.id
           WHERE m.nome ILIKE $1 AND m.deleted_at IS NULL AND l.deleted_at IS NULL
           ORDER BY d.data_dispensacao ASC`,
          `%${medicamentoNome}%`
        );

        dispensados.forEach(d => {
          movimentacoes.push({
            id: `saida-${d.id}`,
            origemDestino: 'Dispensação ao Paciente',
            dataHora: d.data_dispensacao,
            lote: d.numero_lote,
            tipo: 'Saída',
            quantidade: -d.quantidade
          });
        });

        // Ordenar movimentações de forma cronológica para calcular saldo acumulado
        movimentacoes.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
        
        let saldoAcumulado = 0;
        movimentacoes.forEach(m => {
          saldoAcumulado += m.quantidade;
          m.saldo = saldoAcumulado;
        });

        movimentacoes.reverse();

        // Calcular consumo médio diário baseado nas dispensações dos últimos 30 dias
        const saidas30d = dispensados.filter(d => {
          const diffMs = Date.now() - new Date(d.data_dispensacao).getTime();
          return diffMs <= 30 * 24 * 60 * 60 * 1000;
        });
        const totalDispensado30d = saidas30d.reduce((sum, d) => sum + d.quantidade, 0);
        const consumoMedio = Number((totalDispensado30d / 30).toFixed(1));

        // Calcular gráfico de consumo dos últimos 7 meses
        const meses = ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'];
        const hoje = new Date();
        const graficoConsumo: { month: string; volume: number }[] = [];

        for (let i = 6; i >= 0; i--) {
          const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
          const mesNome = meses[d.getMonth() % 12];
          
          const volume = movimentacoes
            .filter(m => {
              const mDate = new Date(m.dataHora);
              return m.tipo === 'Saída' && mDate.getMonth() === d.getMonth() && mDate.getFullYear() === d.getFullYear();
            })
            .reduce((sum, m) => sum + Math.abs(m.quantidade), 0);

          graficoConsumo.push({
            month: mesNome,
            volume
          });
        }

        const estoqueTotal = lotes.reduce((sum, l) => sum + l.quantidade_atual, 0);

        res.json({
          medicamentoNome,
          cards: {
            estoqueTotal,
            reservado: 0,
            disponivel: estoqueTotal,
            consumoMedio,
            leadTimeMedio: 0,
          },
          lotesReservas,
          graficoConsumo,
          historicoMovimentacoes: movimentacoes,
        });
        return;
      }
      // 1. Buscar todos os lotes ativos do medicamento no estoque do CD
      const lotes = await prisma.cdEstoqueLote.findMany({
        where: {
          medicamentoNome: { contains: medicamentoNome, mode: 'insensitive' },
          deletedAt: null
        },
        orderBy: { dataValidade: 'asc' },
        include: {
          notaFiscalItem: {
            include: {
              notaFiscal: {
                include: { fornecedor: { select: { nomeFantasia: true } } }
              }
            }
          }
        }
      });

      // 2. Buscar todos os pedidos de recomposição contendo este medicamento
      const pedidos = await prisma.pedidoReposicao.findMany({
        where: {
          deletedAt: null,
          itens: {
            some: {
              medicamentoNome: { contains: medicamentoNome, mode: 'insensitive' }
            }
          }
        },
        include: {
          itens: true,
          unidade: { select: { nome: true } }
        },
        orderBy: { criadoEm: 'asc' }
      });

      // 3. Simular saídas históricas por lote para compor histórico e saldo
      const simulatedLots = lotes.map(l => ({
        id: l.id,
        numeroLote: l.numeroLote,
        dataValidade: l.dataValidade,
        quantidadeInicial: l.quantidadeInicial,
        quantidadeAtual: l.quantidadeAtual,
        quantidadeDisponivelSimulada: l.quantidadeInicial,
      }));

      const movimentacoes: any[] = [];

      // Registrar entradas vindas das NFs
      lotes.forEach(l => {
        const dataEntrada = l.notaFiscalItem?.notaFiscal?.conferidoEm || l.criadoEm;
        movimentacoes.push({
          id: `entrada-${l.id}`,
          origemDestino: l.notaFiscalItem?.notaFiscal?.fornecedor?.nomeFantasia || 'Fornecedor',
          dataHora: dataEntrada,
          lote: l.numeroLote,
          tipo: 'Entrada',
          quantidade: l.quantidadeInicial,
        });
      });

      // Simular saídas cronologicamente
      pedidos.forEach(p => {
        const item = p.itens.find(i => i.medicamentoNome.toLowerCase().includes(medicamentoNome.toLowerCase()));
        if (!item) return;

        const isSaidaEfetiva = ['AGUARDANDO_MOTORISTA', 'EM_TRANSITO', 'CONCLUIDO'].includes(p.status);
        if (isSaidaEfetiva) {
          let restante = item.quantidade;
          
          // FEFO
          const lotesElegiveis = simulatedLots.sort((a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime());
          
          for (const lot of lotesElegiveis) {
            if (restante <= 0) break;
            if (lot.quantidadeDisponivelSimulada > 0) {
              const alocado = Math.min(lot.quantidadeDisponivelSimulada, restante);
              lot.quantidadeDisponivelSimulada -= alocado;
              restante -= alocado;

              movimentacoes.push({
                id: `saida-${p.id}-${lot.id}`,
                origemDestino: p.unidade?.nome || 'Unidade Destino',
                dataHora: p.criadoEm,
                lote: lot.numeroLote,
                tipo: 'Saída',
                quantidade: -alocado,
              });
            }
          }
        }
      });

      // Ordenar movimentações de forma cronológica para calcular saldo acumulado
      movimentacoes.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
      
      let saldoAcumulado = 0;
      movimentacoes.forEach(m => {
        saldoAcumulado += m.quantidade;
        m.saldo = saldoAcumulado;
      });

      // Inverter para mostrar mais recente primeiro no histórico do frontend
      movimentacoes.reverse();

      // 4. Calcular reservas ativas sobre o estoque atual (lotes ordenados por FEFO)
      // Somar quantidade solicitada em pedidos pendentes
      let totalReservado = 0;
      pedidos.forEach(p => {
        const isReserva = ['PENDENTE', 'EM_ANALISE', 'EM_SEPARACAO'].includes(p.status);
        if (isReserva) {
          const item = p.itens.find(i => i.medicamentoNome.toLowerCase().includes(medicamentoNome.toLowerCase()));
          if (item) {
            totalReservado += item.quantidade;
          }
        }
      });

      const lotesReservas = lotes.map((l, idx) => {
        return {
          id: l.id,
          lote: l.numeroLote,
          validade: (l.dataValidade instanceof Date ? l.dataValidade : new Date(l.dataValidade)).toISOString().split('T')[0],
          estoque: l.quantidadeAtual,
          reservado: 0,
          disponivel: l.quantidadeAtual,
          prioridade: `${idx + 1}º a usar`
        };
      });

      // FEFO Reserva
      let restanteReserva = totalReservado;
      lotesReservas.forEach(res => {
        if (restanteReserva > 0) {
          const alocado = Math.min(res.estoque, restanteReserva);
          res.reservado = alocado;
          res.disponivel = res.estoque - alocado;
          restanteReserva -= alocado;
        }
      });

      // 5. Configurar cards de resumo
      const estoqueTotal = lotes.reduce((sum, l) => sum + l.quantidadeAtual, 0);
      const somaReservas = lotesReservas.reduce((sum, r) => sum + r.reservado, 0);
      const disponivelReserva = estoqueTotal - somaReservas;

      // Calcular consumo médio diário baseado nas saídas dos últimos 30 dias no CD
      const saidasCD30d = movimentacoes.filter(m => {
        const diffMs = Date.now() - new Date(m.dataHora).getTime();
        return m.tipo === 'Saída' && diffMs <= 30 * 24 * 60 * 60 * 1000;
      });
      const totalSaidasCD30d = saidasCD30d.reduce((sum, m) => sum + Math.abs(m.quantidade), 0);
      const consumoDiario = Number((totalSaidasCD30d / 30).toFixed(1));
      const leadTimeMedio = 0; // Calculável futuramente a partir de logs reais de transição de status

      // 6. Configurar gráfico de consumo dos últimos 7 meses
      const meses = ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'];
      const hoje = new Date();
      const graficoConsumo: { month: string; volume: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesNome = meses[d.getMonth() % 12];
        
        const volume = movimentacoes
          .filter(m => {
            const mDate = new Date(m.dataHora);
            return m.tipo === 'Saída' && mDate.getMonth() === d.getMonth() && mDate.getFullYear() === d.getFullYear();
          })
          .reduce((sum, m) => sum + Math.abs(m.quantidade), 0);

        graficoConsumo.push({
          month: mesNome,
          volume
        });
      }

      res.json({
        medicamentoNome,
        cards: {
          estoqueTotal,
          reservado: somaReservas,
          disponivel: disponivelReserva,
          consumoMedio: consumoDiario,
          leadTimeMedio,
        },
        lotesReservas,
        graficoConsumo,
        historicoMovimentacoes: movimentacoes,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao processar detalhes do medicamento.' });
    }
  };
}
