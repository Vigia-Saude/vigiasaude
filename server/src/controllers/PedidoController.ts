import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { Prisma } from '@prisma/client';

export class PedidoController {
  // GET /api/pedidos
  listar = async (req: AuthRequest, res: Response) => {
    const { busca, fornecedorId, status, dataInicio, dataFim } = req.query;

    try {
      // Construir o objeto where do Prisma
      const where: Prisma.PedidoCompraWhereInput = {};

      if (fornecedorId) {
        where.fornecedorId = String(fornecedorId);
      }

      if (status) {
        where.status = status as any;
      }

      // Filtro por período
      if (dataInicio || dataFim) {
        where.dataSolicitacao = {};
        if (dataInicio) {
          where.dataSolicitacao.gte = new Date(String(dataInicio));
        }
        if (dataFim) {
          // Ajusta para o final do dia
          const fim = new Date(String(dataFim));
          fim.setHours(23, 59, 59, 999);
          where.dataSolicitacao.lte = fim;
        }
      }

      // Filtro por busca textual (Número do pedido, Fornecedor ou Medicamento)
      if (busca) {
        const buscaStr = String(busca).trim();
        where.OR = [
          { numero: { contains: buscaStr, mode: 'insensitive' } },
          {
            fornecedor: {
              nomeFantasia: { contains: buscaStr, mode: 'insensitive' }
            }
          },
          {
            fornecedor: {
              razaoSocial: { contains: buscaStr, mode: 'insensitive' }
            }
          },
          {
            itens: {
              some: {
                medicamentoNome: { contains: buscaStr, mode: 'insensitive' }
              }
            }
          }
        ];
      }

      const pedidos = await prisma.pedidoCompra.findMany({
        where,
        include: {
          ata: {
            select: { id: true, numero: true }
          },
          fornecedor: {
            select: { id: true, nomeFantasia: true, razaoSocial: true }
          },
          itens: true
        },
        orderBy: { criadoEm: 'desc' }
      });

      // Formatar retorno decimal para Number para facilidade do front
      const result = pedidos.map(p => ({
        ...p,
        valorTotal: Number(p.valorTotal),
        dataCriacao: p.criadoEm.toISOString(),
        dataSolicitacao: p.dataSolicitacao.toISOString(),
        ataNumero: p.ata?.numero || '',
        itens: p.itens.map(item => ({
          ...item,
          precoUnitario: Number(item.precoUnitario),
          valorTotal: Number(item.valorTotal)
        }))
      }));

      return res.json(result);
    } catch (err) {
      console.error('Erro ao listar pedidos:', err);
      return res.status(500).json({ error: 'Erro interno ao listar pedidos' });
    }
  };

  // GET /api/pedidos/:id
  detalhes = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
      const pedido = await prisma.pedidoCompra.findUnique({
        where: { id },
        include: {
          ata: true,
          fornecedor: true,
          itens: true
        }
      });

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido de compra não encontrado.' });
      }

      return res.json({
        ...pedido,
        valorTotal: Number(pedido.valorTotal),
        dataCriacao: pedido.criadoEm.toISOString(),
        dataSolicitacao: pedido.dataSolicitacao.toISOString(),
        ataNumero: pedido.ata?.numero || '',
        itens: pedido.itens.map(item => ({
          ...item,
          precoUnitario: Number(item.precoUnitario),
          valorTotal: Number(item.valorTotal)
        }))
      });
    } catch (err) {
      console.error('Erro ao obter detalhes do pedido:', err);
      return res.status(500).json({ error: 'Erro interno ao obter detalhes do pedido.' });
    }
  };

  // POST /api/pedidos
  criarPedido = async (req: AuthRequest, res: Response) => {
    const { ataId, fornecedorId, status, dataSolicitacao, itens, justificativa } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não identificado.' });
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'O pedido deve conter pelo menos um medicamento.' });
    }

    try {
      // 1. Validar e Calcular Itens preliminarmente
      let totalCalculado = new Prisma.Decimal(0);
      const itensCompletos: any[] = [];

      for (const item of itens) {
        const qtd = Number(item.quantidade);
        const preco = new Prisma.Decimal(item.precoUnitario);
        if (isNaN(qtd) || qtd <= 0) {
          return res.status(400).json({ error: `Quantidade inválida para o item: ${item.medicamentoNome}` });
        }
        if (preco.lessThanOrEqualTo(0)) {
          return res.status(400).json({ error: `Preço unitário inválido para o item: ${item.medicamentoNome}` });
        }

        const totalItem = preco.mul(qtd);
        totalCalculado = totalCalculado.add(totalItem);

        itensCompletos.push({
          medicamentoId: item.medicamentoId || null,
          medicamentoNome: item.medicamentoNome,
          quantidade: qtd,
          precoUnitario: preco,
          valorTotal: totalItem,
          ataItemId: item.ataItemId || null
        });
      }

      // 2. Gerar Número Automático do PdC (PdC-YYYY-XXXX)
      const anoAtual = new Date().getFullYear();
      const inicioAno = new Date(anoAtual, 0, 1);
      const fimAno = new Date(anoAtual, 11, 31, 23, 59, 59, 999);

      const totalNoAno = await prisma.pedidoCompra.count({
        where: {
          criadoEm: {
            gte: inicioAno,
            lte: fimAno
          }
        }
      });

      const sequencial = String(totalNoAno + 1).padStart(4, '0');
      const numeroGerado = `PdC-${anoAtual}-${sequencial}`;

      // 3. Determinar Fornecedor e validar se houver vínculo com ATA
      let resolvedFornecedorId = fornecedorId;
      if (ataId && !resolvedFornecedorId) {
        const tempAta = await prisma.ata.findUnique({
          where: { id: ataId },
          include: { fornecedor: true }
        });
        resolvedFornecedorId = tempAta?.fornecedor?.id;
      }

      if (!resolvedFornecedorId) {
        return res.status(400).json({ error: 'O fornecedor do pedido é obrigatório.' });
      }

      const statusInicial = status || 'PENDENTE';

      // 4. Executar Criação em Transação (com validações internas)
      const novoPedido = await prisma.$transaction(async (tx) => {
        // Validação contra a ATA (se houver vínculo com ATA)
        if (ataId) {
          const ataEntity = await tx.ata.findUnique({
            where: { id: ataId }
          });

          if (!ataEntity) {
            throw new Error('ATA_NOT_FOUND');
          }

          if (ataEntity.status !== 'ATIVA') {
            throw new Error('ATA_NOT_ACTIVE');
          }

          // Validar valor teto
          const totalPedidosAtivos = await tx.pedidoCompra.aggregate({
            where: {
              ataId,
              status: { notIn: ['CANCELADO', 'REJEITADO'] }
            },
            _sum: {
              valorTotal: true
            }
          });

          const valorSomaAtivos = totalPedidosAtivos._sum.valorTotal || new Prisma.Decimal(0);
          const saldoAtaDisponivel = Number(ataEntity.valorTeto) - Number(valorSomaAtivos);

          if (Number(totalCalculado) > saldoAtaDisponivel) {
            throw new Error('EXCEDES_ATA_TETO');
          }

          // Validar cada item contra a ATA
          for (const item of itensCompletos) {
            if (item.ataItemId) {
              const medicamentoAta = await tx.medicamentoAta.findUnique({
                where: { id: item.ataItemId }
              });

              if (!medicamentoAta || medicamentoAta.ataId !== ataId) {
                throw new Error(`MEDICAMENTO_NOT_IN_ATA:${item.medicamentoNome}`);
              }

              // Validar Preço
              if (Math.abs(Number(medicamentoAta.precoUnitario) - Number(item.precoUnitario)) > 0.01) {
                throw new Error(`PRICE_DIVERGENCE:${item.medicamentoNome}:${Number(medicamentoAta.precoUnitario)}:${Number(item.precoUnitario)}`);
              }

              // Validar Saldo
              const saldoDisponivel = medicamentoAta.qtdeInicial - medicamentoAta.quantidadeUsada;
              if (item.quantidade > saldoDisponivel) {
                if (!justificativa || justificativa.trim().length < 15) {
                  throw new Error(`SALDO_INSUFICIENTE_SEM_JUSTIFICATIVA:${item.medicamentoNome}:${item.quantidade}:${saldoDisponivel}`);
                }
              }
            }
          }
        }

        // Criar o Pedido
        const pedido = await tx.pedidoCompra.create({
          data: {
            numero: numeroGerado,
            status: statusInicial,
            ataId: ataId || null,
            fornecedorId: resolvedFornecedorId,
            valorTotal: totalCalculado,
            dataSolicitacao: dataSolicitacao ? new Date(dataSolicitacao) : new Date(),
            justificativa: justificativa || null,
            itens: {
              create: itensCompletos.map(item => ({
                medicamentoId: item.medicamentoId,
                medicamentoNome: item.medicamentoNome,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
                valorTotal: item.valorTotal,
                ataItemId: item.ataItemId
              }))
            }
          },
          include: {
            itens: true
          }
        });

        // 5. Se status inicial for ativo (não Rascunho/Cancelado), gera consumos e reduz saldos
        const isNewActive = statusInicial !== 'RASCUNHO' && statusInicial !== 'CANCELADO' && statusInicial !== 'REJEITADO';

        if (isNewActive && ataId) {
          for (const item of pedido.itens) {
            if (item.ataItemId) {
              // Criar Lançamento de Consumo
              await tx.ataConsumo.create({
                data: {
                  ataId,
                  ataItemId: item.ataItemId,
                  pedidoId: pedido.id,
                  quantidade: item.quantidade,
                  valorUnitario: item.precoUnitario,
                  valorTotal: item.valorTotal,
                  setorSolicitante: 'Compras / Almoxarifado',
                  observacao: justificativa || 'Consumo automático gerado pelo Pedido de Compra.'
                }
              });

              // Atualizar saldos no MedicamentoAta
              await tx.medicamentoAta.update({
                where: { id: item.ataItemId },
                data: {
                  quantidadeUsada: { increment: item.quantidade },
                  saldoAtual: { decrement: item.quantidade }
                }
              });
            }
          }

          // Atualizar valor total consumido da ATA
          await tx.ata.update({
            where: { id: ataId },
            data: {
              valorConsumido: { increment: totalCalculado }
            }
          });
        }

        // Criar Auditoria
        await tx.auditoria.create({
          data: {
            usuarioId,
            acao: 'CRIACAO_PEDIDO',
            entidadeId: pedido.id,
            dadosDepois: {
              numero: numeroGerado,
              status: statusInicial,
              ataId,
              fornecedorId: resolvedFornecedorId,
              valorTotal: Number(totalCalculado)
            },
            justificativa: justificativa || 'Novo pedido de compra criado no sistema.'
          }
        });

        return pedido;
      });

      return res.status(201).json({
        ...novoPedido,
        valorTotal: Number(novoPedido.valorTotal),
        itens: novoPedido.itens.map(it => ({
          ...it,
          precoUnitario: Number(it.precoUnitario),
          valorTotal: Number(it.valorTotal)
        }))
      });
    } catch (err: any) {
      console.error('Erro ao criar pedido:', err);

      const message = err.message || '';
      if (message === 'ATA_NOT_FOUND') {
        return res.status(404).json({ error: 'ATA vinculada não encontrada.' });
      }
      if (message === 'ATA_NOT_ACTIVE') {
        return res.status(400).json({ error: 'A ATA selecionada não está ativa.' });
      }
      if (message === 'EXCEDES_ATA_TETO') {
        return res.status(400).json({ error: 'O valor total do pedido excede o saldo financeiro disponível na ATA.' });
      }
      if (message.startsWith('MEDICAMENTO_NOT_IN_ATA:')) {
        const [, nome] = message.split(':');
        return res.status(400).json({ error: `Medicamento ${nome} não faz parte da ATA selecionada.` });
      }
      if (message.startsWith('PRICE_DIVERGENCE:')) {
        const [, nome, precoEsperado, precoDivergente] = message.split(':');
        return res.status(400).json({
          error: `Preço unitário do medicamento ${nome} (R$ ${Number(precoDivergente).toFixed(2)}) diverge do preço licitado na ATA (R$ ${Number(precoEsperado).toFixed(2)}).`
        });
      }
      if (message.startsWith('SALDO_INSUFICIENTE_SEM_JUSTIFICATIVA:')) {
        const [, nome, qtd, saldo] = message.split(':');
        return res.status(400).json({
          error: `A quantidade solicitada para ${nome} (${qtd}) excede o saldo da ATA (${saldo}). É obrigatório fornecer uma justificativa detalhada (mínimo de 15 caracteres).`
        });
      }

      return res.status(500).json({ error: 'Erro interno ao criar pedido de compra.' });
    }
  };

  // PATCH /api/pedidos/:id/status
  atualizarStatus = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { status, justificativa } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não identificado.' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório.' });
    }

    try {
      const pedido = await prisma.pedidoCompra.findUnique({
        where: { id },
        include: { itens: true }
      });

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido de compra não encontrado.' });
      }

      const statusAntigo = pedido.status;
      const statusNovo = status;

      if (statusAntigo === statusNovo) {
        return res.json(pedido);
      }

      // Pedidos com status final não podem ter seu status alterado
      if (['CANCELADO', 'REJEITADO', 'ENTREGUE'].includes(statusAntigo)) {
        return res.status(400).json({ error: `Não é possível alterar o status de um pedido com status final ${statusAntigo}.` });
      }

      const result = await prisma.$transaction(async (tx) => {
        const wasActive = statusAntigo !== 'RASCUNHO' && statusAntigo !== 'CANCELADO' && statusAntigo !== 'REJEITADO';
        const isNewActive = statusNovo !== 'RASCUNHO' && statusNovo !== 'CANCELADO' && statusNovo !== 'REJEITADO';

        // Fluxo 1: Transição de Inativo para Ativo (ex: RASCUNHO -> PENDENTE)
        if (!wasActive && isNewActive && pedido.ataId) {
          // Validar ATA
          const ata = await tx.ata.findUnique({
            where: { id: pedido.ataId }
          });
          if (!ata) {
            throw new Error('ATA_NOT_FOUND');
          }
          if (ata.status !== 'ATIVA') {
            throw new Error('ATA_NOT_ACTIVE');
          }

          // Validar valor teto
          const saldoAtaDisponivel = Number(ata.valorTeto) - Number(ata.valorConsumido);
          if (Number(pedido.valorTotal) > saldoAtaDisponivel) {
            throw new Error('EXCEDES_ATA_TETO');
          }

          // Validar e registrar os consumos na ATA
          for (const item of pedido.itens) {
            if (item.ataItemId) {
              const medAta = await tx.medicamentoAta.findUnique({
                where: { id: item.ataItemId }
              });

              if (!medAta) {
                throw new Error(`MEDICAMENTO_NOT_IN_ATA:${item.medicamentoNome}`);
              }

              // Validar Saldo
              const saldoDisponivel = medAta.qtdeInicial - medAta.quantidadeUsada;
              if (item.quantidade > saldoDisponivel) {
                const combinedJustificativa = justificativa || '';
                if (combinedJustificativa.trim().length < 15) {
                  throw new Error(`SALDO_INSUFICIENTE_SEM_JUSTIFICATIVA:${item.medicamentoNome}:${item.quantidade}:${saldoDisponivel}`);
                }
              }

              // Registrar Consumo
              await tx.ataConsumo.create({
                data: {
                  ataId: pedido.ataId,
                  ataItemId: item.ataItemId,
                  pedidoId: pedido.id,
                  quantidade: item.quantidade,
                  valorUnitario: item.precoUnitario,
                  valorTotal: item.valorTotal,
                  setorSolicitante: 'Compras / Almoxarifado',
                  observacao: justificativa || 'Consumo gerado pela ativação do Pedido de Compra.'
                }
              });

              // Atualizar saldos
              await tx.medicamentoAta.update({
                where: { id: item.ataItemId },
                data: {
                  quantidadeUsada: { increment: item.quantidade },
                  saldoAtual: { decrement: item.quantidade }
                }
              });
            }
          }

          // Atualizar valor consumido da ATA
          await tx.ata.update({
            where: { id: pedido.ataId },
            data: {
              valorConsumido: { increment: pedido.valorTotal }
            }
          });
        }

        // Fluxo 2: Transição de Ativo para Inativo (ex: PENDENTE -> CANCELADO / REJEITADO)
        if (wasActive && !isNewActive && pedido.ataId) {
          // Deletar os consumos gerados por este pedido
          await tx.ataConsumo.deleteMany({
            where: { pedidoId: pedido.id }
          });

          // Reverter saldos de cada item
          for (const item of pedido.itens) {
            if (item.ataItemId) {
              await tx.medicamentoAta.update({
                where: { id: item.ataItemId },
                data: {
                  quantidadeUsada: { decrement: item.quantidade },
                  saldoAtual: { increment: item.quantidade }
                }
              });
            }
          }

          // Atualizar valor consumido da ATA
          await tx.ata.update({
            where: { id: pedido.ataId },
            data: {
              valorConsumido: { decrement: pedido.valorTotal }
            }
          });
        }

        // Atualiza o status do pedido
        const pedidoAtualizado = await tx.pedidoCompra.update({
          where: { id },
          data: { status: statusNovo },
          include: { itens: true }
        });

        // Registrar auditoria
        await tx.auditoria.create({
          data: {
            usuarioId,
            acao: 'ATUALIZACAO_STATUS_PEDIDO',
            entidadeId: id,
            dadosAntes: { status: statusAntigo },
            dadosDepois: { status: statusNovo },
            justificativa: justificativa || `Status do pedido atualizado de ${statusAntigo} para ${statusNovo}.`
          }
        });

        return pedidoAtualizado;
      });

      return res.json({
        ...result,
        valorTotal: Number(result.valorTotal),
        itens: result.itens.map(it => ({
          ...it,
          precoUnitario: Number(it.precoUnitario),
          valorTotal: Number(it.valorTotal)
        }))
      });
    } catch (err: any) {
      console.error('Erro ao atualizar status do pedido:', err);

      const message = err.message || '';
      if (message === 'ATA_NOT_FOUND') {
        return res.status(404).json({ error: 'ATA vinculada não encontrada.' });
      }
      if (message === 'ATA_NOT_ACTIVE') {
        return res.status(400).json({ error: 'A ATA selecionada não está ativa.' });
      }
      if (message === 'EXCEDES_ATA_TETO') {
        return res.status(400).json({ error: 'O valor total do pedido excede o saldo financeiro disponível na ATA.' });
      }
      if (message.startsWith('MEDICAMENTO_NOT_IN_ATA:')) {
        const [, nome] = message.split(':');
        return res.status(400).json({ error: `Medicamento ${nome} não faz parte da ATA selecionada.` });
      }
      if (message.startsWith('SALDO_INSUFICIENTE_SEM_JUSTIFICATIVA:')) {
        const [, nome, qtd, saldo] = message.split(':');
        return res.status(400).json({
          error: `A quantidade solicitada para ${nome} (${qtd}) excede o saldo da ATA (${saldo}). É obrigatório fornecer uma justificativa detalhada (mínimo de 15 caracteres).`
        });
      }

      return res.status(500).json({ error: 'Erro interno ao atualizar status do pedido.' });
    }
  };

  // PUT /api/pedidos/:id
  atualizarPedido = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { ataId, fornecedorId, status, dataSolicitacao, itens, justificativa } = req.body;
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não identificado.' });
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'O pedido deve conter pelo menos um medicamento.' });
    }

    try {
      // 1. Buscar o pedido existente
      const pedidoExistente = await prisma.pedidoCompra.findUnique({
        where: { id },
        include: { itens: true }
      });

      if (!pedidoExistente) {
        return res.status(404).json({ error: 'Pedido de compra não encontrado.' });
      }

      // Apenas pedidos não finalizados podem ser editados
      if (['ENTREGUE', 'CANCELADO', 'REJEITADO'].includes(pedidoExistente.status)) {
        return res.status(400).json({ error: 'Pedidos entregues, cancelados ou rejeitados não podem ser editados.' });
      }

      // 2. Validar formato dos itens preliminarmente
      let totalCalculado = new Prisma.Decimal(0);
      const itensCompletos: any[] = [];

      for (const item of itens) {
        const qtd = Number(item.quantidade);
        const preco = new Prisma.Decimal(item.precoUnitario);
        if (isNaN(qtd) || qtd <= 0) {
          return res.status(400).json({ error: `Quantidade inválida para o item: ${item.medicamentoNome}` });
        }
        if (preco.lessThanOrEqualTo(0)) {
          return res.status(400).json({ error: `Preço unitário inválido para o item: ${item.medicamentoNome}` });
        }

        const totalItem = preco.mul(qtd);
        totalCalculado = totalCalculado.add(totalItem);

        itensCompletos.push({
          medicamentoId: item.medicamentoId || null,
          medicamentoNome: item.medicamentoNome,
          quantidade: qtd,
          precoUnitario: preco,
          valorTotal: totalItem,
          ataItemId: item.ataItemId || null
        });
      }

      // 3. Determinar Fornecedor
      let resolvedFornecedorId = fornecedorId;
      if (ataId && !resolvedFornecedorId) {
        const tempAta = await prisma.ata.findUnique({
          where: { id: ataId },
          include: { fornecedor: true }
        });
        resolvedFornecedorId = tempAta?.fornecedor?.id;
      }

      if (!resolvedFornecedorId) {
        return res.status(400).json({ error: 'O fornecedor do pedido é obrigatório.' });
      }

      const statusInicial = status || 'RASCUNHO';

      // 4. Executar Atualização em Transação
      const pedidoAtualizado = await prisma.$transaction(async (tx) => {
        const wasActive = pedidoExistente.status !== 'RASCUNHO' && pedidoExistente.status !== 'CANCELADO' && pedidoExistente.status !== 'REJEITADO';
        const isNewActive = statusInicial !== 'RASCUNHO' && statusInicial !== 'CANCELADO' && statusInicial !== 'REJEITADO';

        // Passo A: Se era ativo, reverter consumos e saldos antigos temporariamente
        if (wasActive && pedidoExistente.ataId) {
          // Deletar consumos antigos
          await tx.ataConsumo.deleteMany({
            where: { pedidoId: id }
          });

          // Devolver quantidades ao MedicamentoAta
          for (const item of pedidoExistente.itens) {
            if (item.ataItemId) {
              await tx.medicamentoAta.update({
                where: { id: item.ataItemId },
                data: {
                  quantidadeUsada: { decrement: item.quantidade },
                  saldoAtual: { increment: item.quantidade }
                }
              });
            }
          }

          // Deduzir valor consumido da ATA antiga
          await tx.ata.update({
            where: { id: pedidoExistente.ataId },
            data: {
              valorConsumido: { decrement: pedidoExistente.valorTotal }
            }
          });
        }

        // Passo B: Validar os novos itens e limites contra os saldos atualizados (revertidos)
        if (ataId) {
          const ataEntity = await tx.ata.findUnique({
            where: { id: ataId }
          });

          if (!ataEntity) {
            throw new Error('ATA_NOT_FOUND');
          }

          if (ataEntity.status !== 'ATIVA') {
            throw new Error('ATA_NOT_ACTIVE');
          }

          // Validar valor teto
          const saldoAtaDisponivel = Number(ataEntity.valorTeto) - Number(ataEntity.valorConsumido);
          if (Number(totalCalculado) > saldoAtaDisponivel) {
            throw new Error('EXCEDES_ATA_TETO');
          }

          // Validar itens
          for (const item of itensCompletos) {
            if (item.ataItemId) {
              const medicamentoAta = await tx.medicamentoAta.findUnique({
                where: { id: item.ataItemId }
              });

              if (!medicamentoAta || medicamentoAta.ataId !== ataId) {
                throw new Error(`MEDICAMENTO_NOT_IN_ATA:${item.medicamentoNome}`);
              }

              // Validar Preço
              if (Math.abs(Number(medicamentoAta.precoUnitario) - Number(item.precoUnitario)) > 0.01) {
                throw new Error(`PRICE_DIVERGENCE:${item.medicamentoNome}:${Number(medicamentoAta.precoUnitario)}:${Number(item.precoUnitario)}`);
              }

              // Validar Saldo
              const saldoDisponivel = medicamentoAta.qtdeInicial - medicamentoAta.quantidadeUsada;
              if (item.quantidade > saldoDisponivel) {
                if (!justificativa || justificativa.trim().length < 15) {
                  throw new Error(`SALDO_INSUFICIENTE_SEM_JUSTIFICATIVA:${item.medicamentoNome}:${item.quantidade}:${saldoDisponivel}`);
                }
              }
            }
          }
        }

        // Passo C: Deletar itens antigos do pedido e atualizar o PedidoCompra
        await tx.pedidoCompraItem.deleteMany({
          where: { pedidoId: id }
        });

        const pedido = await tx.pedidoCompra.update({
          where: { id },
          data: {
            status: statusInicial,
            ataId: ataId || null,
            fornecedorId: resolvedFornecedorId,
            valorTotal: totalCalculado,
            dataSolicitacao: dataSolicitacao ? new Date(dataSolicitacao) : new Date(),
            justificativa: justificativa || null,
            itens: {
              create: itensCompletos.map(item => ({
                medicamentoId: item.medicamentoId,
                medicamentoNome: item.medicamentoNome,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
                valorTotal: item.valorTotal,
                ataItemId: item.ataItemId
              }))
            }
          },
          include: {
            itens: true
          }
        });

        // Passo D: Se novo status for ativo, registrar os novos consumos e decrementar saldos
        if (isNewActive && ataId) {
          for (const item of pedido.itens) {
            if (item.ataItemId) {
              await tx.ataConsumo.create({
                data: {
                  ataId,
                  ataItemId: item.ataItemId,
                  pedidoId: pedido.id,
                  quantidade: item.quantidade,
                  valorUnitario: item.precoUnitario,
                  valorTotal: item.valorTotal,
                  setorSolicitante: 'Compras / Almoxarifado',
                  observacao: justificativa || 'Consumo automático gerado pelo Pedido de Compra (Atualização).'
                }
              });

              await tx.medicamentoAta.update({
                where: { id: item.ataItemId },
                data: {
                  quantidadeUsada: { increment: item.quantidade },
                  saldoAtual: { decrement: item.quantidade }
                }
              });
            }
          }

          // Atualizar valor total consumido da ATA nova
          await tx.ata.update({
            where: { id: ataId },
            data: {
              valorConsumido: { increment: totalCalculado }
            }
          });
        }

        // Criar Auditoria
        await tx.auditoria.create({
          data: {
            usuarioId,
            acao: 'ATUALIZACAO_PEDIDO',
            entidadeId: pedido.id,
            dadosDepois: {
              numero: pedido.numero,
              status: statusInicial,
              ataId,
              fornecedorId: resolvedFornecedorId,
              valorTotal: Number(totalCalculado)
            },
            justificativa: justificativa || 'Pedido de compra atualizado/enviado.'
          }
        });

        return pedido;
      });

      return res.json({
        ...pedidoAtualizado,
        valorTotal: Number(pedidoAtualizado.valorTotal),
        itens: pedidoAtualizado.itens.map(it => ({
          ...it,
          precoUnitario: Number(it.precoUnitario),
          valorTotal: Number(it.valorTotal)
        }))
      });
    } catch (err: any) {
      console.error('Erro ao atualizar pedido:', err);

      const message = err.message || '';
      if (message === 'ATA_NOT_FOUND') {
        return res.status(404).json({ error: 'ATA vinculada não encontrada.' });
      }
      if (message === 'ATA_NOT_ACTIVE') {
        return res.status(400).json({ error: 'A ATA selecionada não está ativa.' });
      }
      if (message === 'EXCEDES_ATA_TETO') {
        return res.status(400).json({ error: 'O valor total do pedido excede o saldo financeiro disponível na ATA.' });
      }
      if (message.startsWith('MEDICAMENTO_NOT_IN_ATA:')) {
        const [, nome] = message.split(':');
        return res.status(400).json({ error: `Medicamento ${nome} não faz parte da ATA selecionada.` });
      }
      if (message.startsWith('PRICE_DIVERGENCE:')) {
        const [, nome, precoEsperado, precoDivergente] = message.split(':');
        return res.status(400).json({
          error: `Preço unitário do medicamento ${nome} (R$ ${Number(precoDivergente).toFixed(2)}) diverge do preço licitado na ATA (R$ ${Number(precoEsperado).toFixed(2)}).`
        });
      }
      if (message.startsWith('SALDO_INSUFICIENTE_SEM_JUSTIFICATIVA:')) {
        const [, nome, qtd, saldo] = message.split(':');
        return res.status(400).json({
          error: `A quantidade solicitada para ${nome} (${qtd}) excede o saldo da ATA (${saldo}). É obrigatório fornecer uma justificativa detalhada (mínimo de 15 caracteres).`
        });
      }

      return res.status(500).json({ error: 'Erro interno ao atualizar pedido de compra.' });
    }
  };

  // PATCH /api/pedidos/:id/entrega
  confirmarEntrega = async (req: AuthRequest, res: Response) => {
    req.body.status = 'ENTREGUE';
    req.body.justificativa = 'Entrega confirmada pelo usuário.';
    return this.atualizarStatus(req, res);
  };
}
