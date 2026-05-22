import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export class AtaController {
  // GET /api/atas
  listar = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const atas = await prisma.ata.findMany({
        include: {
          fornecedor: true,
          medicamentos: true,
          pedidos: {
            include: {
              itens: true
            }
          }
        },
        orderBy: { criadoEm: 'desc' }
      });
      
      const hoje = new Date();

      const result = atas.map(ata => {
        let valorConsumido = 0;
        let valorComprometido = 0;

        ata.pedidos.forEach(pedido => {
          const val = Number(pedido.valorTotal);
          if (pedido.status === 'PENDENTE') {
            valorComprometido += val;
          } else if (['APROVADO', 'EM_TRANSITO', 'ENTREGUE', 'ACEITO'].includes(pedido.status)) {
            valorConsumido += val;
          }
        });

        const valorTeto = Number(ata.valorTeto);
        const valorDisponivel = Math.max(0, valorTeto - valorConsumido - valorComprometido);
        
        const diffTime = ata.vigenciaFim.getTime() - hoje.getTime();
        const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diasRestantesVal = diasRestantes < 0 ? 0 : diasRestantes;

        const totalVigencia = ata.vigenciaFim.getTime() - ata.vigenciaInicio.getTime();
        let porcentagemVigenciaDecorrente = 100;
        if (totalVigencia > 0) {
          const decorrido = hoje.getTime() - ata.vigenciaInicio.getTime();
          const pct = (decorrido / totalVigencia) * 100;
          porcentagemVigenciaDecorrente = pct < 0 ? 0 : (pct > 100 ? 100 : Math.round(pct));
        }

        const medicamentosFormatados = ata.medicamentos.map(med => {
          let qtdeConsumida = 0;
          let qtdeComprometida = 0;

          ata.pedidos.forEach(pedido => {
            pedido.itens.forEach(item => {
              if (item.ataItemId === med.id) {
                const qty = Number(item.quantidade);
                if (pedido.status === 'PENDENTE') {
                  qtdeComprometida += qty;
                } else if (['APROVADO', 'EM_TRANSITO', 'ENTREGUE', 'ACEITO'].includes(pedido.status)) {
                  qtdeConsumida += qty;
                }
              }
            });
          });

          const qtdeInicial = med.qtdeInicial;
          const saldoRestante = Math.max(0, qtdeInicial - qtdeConsumida - qtdeComprometida);
          const porcentagemConsumida = qtdeInicial > 0 ? Number(((qtdeConsumida / qtdeInicial) * 100).toFixed(1)) : 0;

          return {
            ...med,
            precoUnitario: Number(med.precoUnitario),
            precoBPS: med.precoBPS ? Number(med.precoBPS) : 0,
            precoCMED: med.precoCMED ? Number(med.precoCMED) : 0,
            valorTotalItem: med.valorTotalItem ? Number(med.valorTotalItem) : null,
            quantidadeInicial: qtdeInicial,
            qtdeConsumida,
            qtdeComprometida,
            saldoRestante,
            porcentagemConsumida
          };
        });

        return {
          ...ata,
          dataInicio: ata.vigenciaInicio.toISOString(),
          dataFim: ata.vigenciaFim.toISOString(),
          valorTeto,
          valorConsumido,
          valorComprometido,
          valorDisponivel,
          diasRestantes: diasRestantesVal,
          porcentagemVigenciaDecorrente,
          fornecedorId: ata.fornecedor?.id || '',
          fornecedorNome: ata.fornecedor?.nomeFantasia || ata.fornecedorNome,
          medicamentos: medicamentosFormatados
        };
      });

      return res.json(result);
    } catch (err) {
      console.error('Erro ao listar atas:', err);
      return res.status(500).json({ error: 'Erro interno ao listar atas' });
    }
  };

  // GET /api/atas/:id
  detalhes = async (req: AuthRequest, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    try {
      const ata = await prisma.ata.findUnique({
        where: { id: String(id) },
        include: {
          medicamentos: {
            include: {
              consumos: {
                orderBy: { dataConsumo: 'desc' }
              }
            }
          },
          pedidos: {
            include: {
              itens: true,
              consumos: true
            }
          },
          consumos: {
            orderBy: { dataConsumo: 'desc' }
          },
          fornecedor: true
        }
      });

      if (!ata) {
        return res.status(404).json({ error: 'Ata não encontrada' });
      }

      const hoje = new Date();
      let valorConsumido = 0;
      let valorComprometido = 0;

      ata.pedidos.forEach(pedido => {
        const val = Number(pedido.valorTotal);
        if (pedido.status === 'PENDENTE') {
          valorComprometido += val;
        } else if (['APROVADO', 'EM_TRANSITO', 'ENTREGUE', 'ACEITO'].includes(pedido.status)) {
          valorConsumido += val;
        }
      });

      const valorTeto = Number(ata.valorTeto);
      const valorDisponivel = Math.max(0, valorTeto - valorConsumido - valorComprometido);

      const diffTime = ata.vigenciaFim.getTime() - hoje.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diasRestantesVal = diasRestantes < 0 ? 0 : diasRestantes;

      const totalVigencia = ata.vigenciaFim.getTime() - ata.vigenciaInicio.getTime();
      let porcentagemVigenciaDecorrente = 100;
      if (totalVigencia > 0) {
        const decorrido = hoje.getTime() - ata.vigenciaInicio.getTime();
        const pct = (decorrido / totalVigencia) * 100;
        porcentagemVigenciaDecorrente = pct < 0 ? 0 : (pct > 100 ? 100 : Math.round(pct));
      }

      const formattedMedicamentos = ata.medicamentos.map((med: any) => {
        let qtdeConsumida = 0;
        let qtdeComprometida = 0;

        ata.pedidos.forEach(pedido => {
          pedido.itens.forEach(item => {
            if (item.ataItemId === med.id) {
              const qty = Number(item.quantidade);
              if (pedido.status === 'PENDENTE') {
                qtdeComprometida += qty;
              } else if (['APROVADO', 'EM_TRANSITO', 'ENTREGUE', 'ACEITO'].includes(pedido.status)) {
                qtdeConsumida += qty;
              }
            }
          });
        });

        const qtdeInicial = med.qtdeInicial;
        const saldoRestante = Math.max(0, qtdeInicial - qtdeConsumida - qtdeComprometida);
        const porcentagemConsumida = qtdeInicial > 0 ? Number(((qtdeConsumida / qtdeInicial) * 100).toFixed(1)) : 0;

        return {
          ...med,
          precoUnitario: Number(med.precoUnitario),
          valorTotalItem: med.valorTotalItem ? Number(med.valorTotalItem) : null,
          precoBPS: med.precoBPS ? Number(med.precoBPS) : 0,
          precoCMED: med.precoCMED ? Number(med.precoCMED) : 0,
          quantidadeInicial: qtdeInicial,
          qtdeConsumida,
          qtdeComprometida,
          saldoRestante,
          porcentagemConsumida,
          saldoAtual: saldoRestante,
          consumos: med.consumos ? med.consumos.map((c: any) => ({
            ...c,
            valorUnitario: Number(c.valorUnitario),
            valorTotal: Number(c.valorTotal),
          })) : []
        };
      });

      const formattedConsumos = ata.consumos ? ata.consumos.map((c: any) => ({
        ...c,
        valorUnitario: Number(c.valorUnitario),
        valorTotal: Number(c.valorTotal),
      })) : [];

      const formattedPedidos = ata.pedidos ? ata.pedidos.map((p: any) => ({
        ...p,
        valorTotal: Number(p.valorTotal),
        dataCriacao: p.criadoEm,
        itens: p.itens.map((it: any) => ({
          ...it,
          precoUnitario: Number(it.precoUnitario),
          valorTotal: Number(it.valorTotal)
        }))
      })) : [];

      const result = {
        ...ata,
        dataInicio: ata.vigenciaInicio.toISOString(),
        dataFim: ata.vigenciaFim.toISOString(),
        valorTeto,
        valorConsumido,
        valorComprometido,
        valorDisponivel,
        diasRestantes: diasRestantesVal,
        porcentagemVigenciaDecorrente,
        fornecedorId: ata.fornecedor?.id || '',
        fornecedorNome: ata.fornecedor?.nomeFantasia || ata.fornecedorNome,
        medicamentos: formattedMedicamentos,
        pedidos: formattedPedidos,
        consumos: formattedConsumos,
      };

      return res.json(result);
    } catch (err) {
      console.error('Erro ao buscar detalhes da ata:', err);
      return res.status(500).json({ error: 'Erro interno ao buscar detalhes' });
    }
  };

  // POST /api/atas
  criar = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const {
        numero,
        fornecedorNome,
        fornecedorCnpj,
        processoLicitatorio,
        numeroPregao,
        numeroEdital,
        vigenciaInicio,
        vigenciaFim,
        valorTeto,
        documentoPdfUrl,
        observacoes,
        medicamentos
      } = req.body;

      if (!numero || !fornecedorNome || !vigenciaInicio || !vigenciaFim || !valorTeto) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
      }

      if (!medicamentos || !Array.isArray(medicamentos) || medicamentos.length === 0) {
        return res.status(400).json({ error: 'A ata deve conter pelo menos um medicamento.' });
      }

      let resolvedCnpj = (fornecedorCnpj && fornecedorCnpj.trim() !== '') ? fornecedorCnpj.trim() : null;

      const novaAta = await prisma.$transaction(async (tx) => {
        if (resolvedCnpj) {
          const cleanCnpj = resolvedCnpj.replace(/\D/g, '');
          const fornecedorExistente = await tx.fornecedor.findFirst({
            where: {
              OR: [
                { cnpj: resolvedCnpj },
                { cnpj: cleanCnpj }
              ]
            }
          });

          if (fornecedorExistente) {
            resolvedCnpj = fornecedorExistente.cnpj;
          } else {
            await tx.fornecedor.create({
              data: {
                cnpj: resolvedCnpj,
                razaoSocial: fornecedorNome,
                nomeFantasia: fornecedorNome,
                email: 'contato@fornecedor.com.br',
                whatsapp: '00000000000',
                status: 'ATIVO',
                taxaAceitacao: new Prisma.Decimal(100.00),
                categorias: []
              }
            });
          }
        }

        const ataCriada = await tx.ata.create({
          data: {
            numero,
            fornecedorNome,
            fornecedorCnpj: resolvedCnpj,
            processoLicitatorio,
            numeroPregao,
            numeroEdital,
            vigenciaInicio: new Date(vigenciaInicio),
            vigenciaFim: new Date(vigenciaFim),
            valorTeto: new Prisma.Decimal(valorTeto),
            valorConsumido: new Prisma.Decimal(0),
            documentoPdfUrl,
            observacoes,
            status: 'ATIVA',
          }
        });

        for (const med of medicamentos) {
          const valorTotalItem = new Prisma.Decimal(med.precoUnitario).mul(med.qtdeInicial);
          
          await tx.medicamentoAta.create({
            data: {
              ataId: ataCriada.id,
              catmatCodigo: med.catmatCodigo || null,
              nome: med.nome,
              unidadeFornecimento: med.unidadeFornecimento || null,
              unidadeAta: med.unidadeAta || null,
              marca: med.marca || null,
              modelo: med.modelo || null,
              precoUnitario: new Prisma.Decimal(med.precoUnitario),
              qtdeInicial: Number(med.qtdeInicial),
              quantidadeUsada: 0,
              saldoAtual: Number(med.qtdeInicial),
              valorTotalItem,
              precoBPS: med.precoBPS ? new Prisma.Decimal(med.precoBPS) : null,
              precoCMED: med.precoCMED ? new Prisma.Decimal(med.precoCMED) : null,
              observacoes: med.observacoes || null,
            }
          });
        }

        if (req.user?.id) {
          await tx.auditoria.create({
            data: {
              usuarioId: req.user.id,
              acao: 'CRIACAO_ATA',
              entidadeId: ataCriada.id,
              dadosDepois: JSON.parse(JSON.stringify(ataCriada)),
              justificativa: `Criação da ATA ${numero} no sistema.`
            }
          });
        }

        return ataCriada;
      });

      return res.status(201).json(novaAta);
    } catch (err: any) {
      console.error('Erro ao criar ata:', err);
      if (err.code === 'P2002') {
        return res.status(400).json({ error: 'Uma ATA com este número já existe.' });
      }
      return res.status(500).json({ error: 'Erro interno ao criar ata.' });
    }
  };

  // POST /api/atas/:ataId/consumos
  registrarConsumo = async (req: AuthRequest, res: Response): Promise<Response> => {
    const ataId = req.params.ataId as string;
    const {
      ataItemId,
      quantidade,
      valorUnitario,
      setorSolicitante,
      observacao
    } = req.body;

    if (!ataItemId || !quantidade || !valorUnitario) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes: ataItemId, quantidade, valorUnitario.' });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const ata = await tx.ata.findUnique({
          where: { id: ataId }
        });

        if (!ata) {
          throw new Error('ATA_NOT_FOUND');
        }

        if (ata.status !== 'ATIVA') {
          throw new Error('ATA_INACTIVE');
        }

        const hoje = new Date();
        if (hoje < ata.vigenciaInicio || hoje > ata.vigenciaFim) {
          throw new Error('ATA_OUT_OF_VIGENCIA');
        }

        const item = await tx.medicamentoAta.findUnique({
          where: { id: ataItemId }
        });

        if (!item || item.ataId !== ataId) {
          throw new Error('ITEM_NOT_FOUND');
        }

        if (Number(valorUnitario) !== Number(item.precoUnitario)) {
          throw new Error('PRICE_MISMATCH');
        }

        const qtdConsumo = Number(quantidade);
        const saldoDisponivel = item.qtdeInicial - item.quantidadeUsada;

        if (qtdConsumo > saldoDisponivel) {
          if (!observacao || observacao.trim().length < 15) {
            throw new Error('JUSTIFICATION_REQUIRED');
          }
        }

        const valorUnit = new Prisma.Decimal(valorUnitario);
        const valorTotalConsumo = valorUnit.mul(qtdConsumo);

        const novoConsumo = await tx.ataConsumo.create({
          data: {
            ataId,
            ataItemId,
            quantidade: qtdConsumo,
            valorUnitario: valorUnit,
            valorTotal: valorTotalConsumo,
            setorSolicitante,
            observacao
          }
        });

        const novaQtdUsada = item.quantidadeUsada + qtdConsumo;
        const novoSaldo = item.qtdeInicial - novaQtdUsada;

        await tx.medicamentoAta.update({
          where: { id: ataItemId },
          data: {
            quantidadeUsada: novaQtdUsada,
            saldoAtual: novoSaldo
          }
        });

        const novoValorConsumidoAta = ata.valorConsumido.add(valorTotalConsumo);
        
        await tx.ata.update({
          where: { id: ataId },
          data: {
            valorConsumido: novoValorConsumidoAta
          }
        });

        if (req.user?.id) {
          await tx.auditoria.create({
            data: {
              usuarioId: req.user.id,
              acao: 'REGISTRO_CONSUMO_ATA',
              entidadeId: ataId,
              dadosDepois: JSON.parse(JSON.stringify(novoConsumo)),
              justificativa: observacao || `Registro de consumo de ${quantidade} unidades do item ${item.nome}.`
            }
          });
        }

        return novoConsumo;
      });

      return res.status(201).json(result);
    } catch (err: any) {
      console.error('Erro ao registrar consumo:', err);
      if (err.message === 'ATA_NOT_FOUND') {
        return res.status(404).json({ error: 'Ata não encontrada.' });
      }
      if (err.message === 'ATA_INACTIVE') {
        return res.status(400).json({ error: 'Apenas atas com status ATIVA podem registrar consumos.' });
      }
      if (err.message === 'ATA_OUT_OF_VIGENCIA') {
        return res.status(400).json({ error: 'Esta Ata está fora do período de vigência permitido.' });
      }
      if (err.message === 'ITEM_NOT_FOUND') {
        return res.status(404).json({ error: 'Item não encontrado nesta ata.' });
      }
      if (err.message === 'PRICE_MISMATCH') {
        return res.status(400).json({ error: 'Preço unitário do consumo diverge do preço unitário licitado na Ata.' });
      }
      if (err.message === 'JUSTIFICATION_REQUIRED') {
        return res.status(400).json({ error: 'O consumo excede o saldo disponível na Ata. É obrigatório fornecer uma justificativa detalhada de no mínimo 15 caracteres.' });
      }
      return res.status(500).json({ error: 'Erro interno ao registrar consumo.' });
    }
  };
}
