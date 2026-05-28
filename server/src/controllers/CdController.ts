import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { Prisma } from '@prisma/client';
import { parseNfeXml } from '../utils/nfeXmlParser';

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

async function verificarRecall(numeroLote: string, catmatCodigo: string | null): Promise<boolean> {
  const result = await prisma.$queryRaw<[{ is_lote_bloqueado_recall: boolean }]>`
    SELECT public.is_lote_bloqueado_recall(${numeroLote}::text, ${catmatCodigo}::text) AS is_lote_bloqueado_recall
  `;
  return result[0]?.is_lote_bloqueado_recall ?? false;
}

export class CdController {
  // POST /api/cd/notas-fiscais
  registrarNf = async (req: AuthRequest, res: Response) => {
    const { numeroNf, serie, chaveAcesso, dataEmissao, fornecedorId, pedidoCompraId, valorTotal, xmlUrl, observacoes, itens } = req.body;

    if (!numeroNf || !serie || !dataEmissao || !fornecedorId || !valorTotal || !Array.isArray(itens) || itens.length === 0) {
      res.status(400).json({ erro: 'Campos obrigatórios: numeroNf, serie, dataEmissao, fornecedorId, valorTotal, itens.' });
      return;
    }

    try {
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

      // Se não há divergência, cria os lotes no estoque do CD e sela a NF como CONFERIDA
      if (nfAtualizada.status !== 'CONFERIDO_DIVERGENCIA') {
        await prisma.$transaction(async (tx) => {
          for (const item of nfAtualizada.itens) {
            const bloqueado = await verificarRecall(item.numeroLote, item.catmatCodigo);
            const statusLote = bloqueado ? 'BLOQUEADO_RECALL' : 'DISPONIVEL';

            await tx.cdEstoqueLote.create({
              data: {
                notaFiscalItemId: item.id,
                catmatCodigo: item.catmatCodigo,
                medicamentoNome: item.medicamentoNome,
                numeroLote: item.numeroLote,
                dataValidade: item.dataValidade,
                quantidadeInicial: item.quantidadeRecebida ?? item.quantidadeEsperada,
                quantidadeAtual: item.quantidadeRecebida ?? item.quantidadeEsperada,
                status: statusLote,
              },
            });
          }

          await tx.notaFiscal.update({
            where: { id },
            data: {
              status: 'CONFERIDA',
              conferidoPor: req.user?.id ?? null,
              conferidoEm: new Date(),
            },
          });
        });
      }

      const resultado = await prisma.notaFiscal.findUniqueOrThrow({
        where: { id },
        include: { itens: { include: { estoqueLote: true } } },
      });

      res.json(resultado);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao conferir nota fiscal.' });
    }
  };

  // GET /api/cd/estoque
  listarEstoque = async (req: Request, res: Response) => {
    const { status, busca, page = '1', limit = '50' } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
    const take = Math.min(100, Number(limit));

    try {
      const where: Prisma.CdEstoqueLoteWhereInput = { deletedAt: null };
      if (status) where.status = status as Prisma.EnumCdEstoqueLoteStatusFilter;
      if (busca) {
        where.OR = [
          { medicamentoNome: { contains: String(busca), mode: 'insensitive' } },
          { numeroLote: { contains: String(busca), mode: 'insensitive' } },
          { catmatCodigo: { contains: String(busca), mode: 'insensitive' } },
        ];
      }

      const [total, lotes] = await Promise.all([
        prisma.cdEstoqueLote.count({ where }),
        prisma.cdEstoqueLote.findMany({ where, skip, take, orderBy: { dataValidade: 'asc' } }),
      ]);

      res.json({ total, pagina: Number(page), dados: lotes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar estoque do CD.' });
    }
  };

  // POST /api/cd/recalls
  registrarRecall = async (req: AuthRequest, res: Response) => {
    const { catmatCodigo, numeroLote, motivo, autoridadeEmissora, numeroAnvisa, dataExpiracao } = req.body;

    if (!motivo || (!catmatCodigo && !numeroLote)) {
      res.status(400).json({ erro: 'Informe motivo e ao menos catmatCodigo ou numeroLote.' });
      return;
    }

    try {
      const recall = await prisma.recall.create({
        data: {
          catmatCodigo: catmatCodigo ?? null,
          numeroLote: numeroLote ?? null,
          motivo,
          autoridadeEmissora: autoridadeEmissora ?? null,
          numeroAnvisa: numeroAnvisa ?? null,
          dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
          ativo: true,
          criadoPor: req.user!.id,
        },
      });

      // Trigger trg_recall_insert executa no banco:
      // bloqueia lotes em cd_estoque_lotes e cria alerta para SECRETARIO_SAUDE

      res.status(201).json(recall);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao registrar recall.' });
    }
  };

  // GET /api/cd/recalls
  listarRecalls = async (_req: Request, res: Response) => {
    try {
      const recalls = await prisma.recall.findMany({
        where: { ativo: true },
        orderBy: { criadoEm: 'desc' },
      });
      res.json(recalls);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar recalls.' });
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
}
