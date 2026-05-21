import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export class AtaController {
  // GET /api/atas
  listar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const atas = await prisma.ata.findMany({
        include: {
          fornecedor: true,
          _count: {
            select: { medicamentos: true }
          }
        },
        orderBy: { criadoEm: 'desc' }
      });
      
      const result = atas.map(ata => ({
        ...ata,
        dataInicio: ata.vigenciaInicio.toISOString(),
        dataFim: ata.vigenciaFim.toISOString(),
        valorTeto: Number(ata.valorTeto),
        valorConsumido: Number(ata.valorConsumido),
        fornecedorId: ata.fornecedor?.id || '',
        fornecedorNome: ata.fornecedor?.nomeFantasia || ata.fornecedorNome
      }));

      return res.json(result);
    } catch (err) {
      console.error('Erro ao listar atas:', err);
      return res.status(500).json({ error: 'Erro interno ao listar atas' });
    }
  };

  // GET /api/atas/:id
  detalhes = async (req: Request, res: Response): Promise<Response> => {
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

      const ataData = ata as any;

      const formattedMedicamentos = ataData.medicamentos.map((med: any) => ({
        ...med,
        quantidadeInicial: med.qtdeInicial,
        precoUnitario: Number(med.precoUnitario),
        valorTotalItem: med.valorTotalItem ? Number(med.valorTotalItem) : null,
        precoBPS: med.precoBPS ? Number(med.precoBPS) : 0,
        precoCMED: med.precoCMED ? Number(med.precoCMED) : 0,
        saldoAtual: med.qtdeInicial - med.quantidadeUsada,
        consumos: med.consumos ? med.consumos.map((c: any) => ({
          ...c,
          valorUnitario: Number(c.valorUnitario),
          valorTotal: Number(c.valorTotal),
        })) : []
      }));

      const formattedConsumos = ataData.consumos ? ataData.consumos.map((c: any) => ({
        ...c,
        valorUnitario: Number(c.valorUnitario),
        valorTotal: Number(c.valorTotal),
      })) : [];

      const formattedPedidos = ataData.pedidos ? ataData.pedidos.map((p: any) => ({
        ...p,
        valorTotal: Number(p.valorTotal),
        dataCriacao: p.criadoEm,
        itens: []
      })) : [];

      const result = {
        ...ataData,
        dataInicio: ata.vigenciaInicio.toISOString(),
        dataFim: ata.vigenciaFim.toISOString(),
        valorTeto: Number(ata.valorTeto),
        valorConsumido: Number(ata.valorConsumido),
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
  criar = async (req: Request, res: Response): Promise<Response> => {
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

      const novaAta = await prisma.$transaction(async (tx) => {
        const ataCriada = await tx.ata.create({
          data: {
            numero,
            fornecedorNome,
            fornecedorCnpj,
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
  registrarConsumo = async (req: Request, res: Response): Promise<Response> => {
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
