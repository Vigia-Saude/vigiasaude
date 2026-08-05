import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { TipoUnidade } from '@prisma/client';

function gerarTenantSchema(nome: string): string {
  const slug = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `tenant_${slug}`;
}

export class UnidadeController {
  // GET /api/unidades
  listar = async (req: Request, res: Response) => {
    try {
      const { busca, tipo } = req.query;

      const where: any = {
        deletedAt: null
      };

      if (busca) {
        where.OR = [
          { nome: { contains: String(busca), mode: 'insensitive' } },
          { cnes: { contains: String(busca), mode: 'insensitive' } },
          { cidade: { contains: String(busca), mode: 'insensitive' } }
        ];
      }

      if (tipo && Object.values(TipoUnidade).includes(tipo as TipoUnidade)) {
        where.tipo = tipo;
      }

      const unidades = await prisma.unidade.findMany({
        where,
        orderBy: { nome: 'asc' }
      });

      return res.json(unidades);
    } catch (err) {
      console.error('Erro ao listar unidades:', err);
      return res.status(500).json({ error: 'Erro ao listar unidades de saúde.' });
    }
  };

  // GET /api/unidades/:id
  obterPorId = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const unidade = await prisma.unidade.findUnique({
        where: { id }
      });

      if (!unidade || unidade.deletedAt) {
        return res.status(404).json({ error: 'Unidade de saúde não encontrada.' });
      }

      return res.json(unidade);
    } catch (err) {
      console.error('Erro ao obter unidade:', err);
      return res.status(500).json({ error: 'Erro ao buscar detalhes da unidade.' });
    }
  };

  // POST /api/unidades
  criar = async (req: Request, res: Response) => {
    try {
      const {
        nome,
        cnes,
        tipo,
        telefone,
        email,
        responsavel,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        uf
      } = req.body;

      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'O nome da unidade é obrigatório.' });
      }

      if (nome.trim().length < 3) {
        return res.status(400).json({ error: 'O nome da unidade deve ter no mínimo 3 caracteres.' });
      }

      if (cnes && cnes.trim()) {
        const cleanCnes = cnes.replace(/\D/g, '');
        if (cleanCnes.length !== 7) {
          return res.status(400).json({ error: 'O código CNES deve ter exatamente 7 dígitos numéricos.' });
        }
        const cnesExistente = await prisma.unidade.findFirst({
          where: { cnes: cleanCnes, deletedAt: null }
        });
        if (cnesExistente) {
          return res.status(400).json({ error: 'Já existe uma unidade cadastrada com este CNES.' });
        }
      }

      if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      }

      let tenantSchema = gerarTenantSchema(nome);
      // Garantir unicidade do tenantSchema
      let counter = 1;
      while (await prisma.unidade.findUnique({ where: { tenantSchema } })) {
        tenantSchema = `${gerarTenantSchema(nome)}_${counter}`;
        counter++;
      }

      const enderecoFormatado = [logradouro, numero, bairro, cidade, uf]
        .filter(Boolean)
        .join(', ');

      const novaUnidade = await prisma.unidade.create({
        data: {
          nome: nome.trim(),
          cnes: cnes ? cnes.trim() : null,
          tipo: tipo && Object.values(TipoUnidade).includes(tipo) ? tipo : TipoUnidade.UBS,
          telefone: telefone ? telefone.trim() : null,
          email: email ? email.trim() : null,
          responsavel: responsavel ? responsavel.trim() : null,
          cep: cep ? cep.trim() : null,
          logradouro: logradouro ? logradouro.trim() : null,
          numero: numero ? numero.trim() : null,
          bairro: bairro ? bairro.trim() : null,
          cidade: cidade ? cidade.trim() : null,
          uf: uf ? uf.trim().toUpperCase() : null,
          endereco: enderecoFormatado || null,
          tenantSchema,
          ativa: true
        }
      });

      return res.status(201).json(novaUnidade);
    } catch (err: any) {
      console.error('Erro ao criar unidade:', err);
      return res.status(500).json({ error: err?.message || 'Erro ao cadastrar nova unidade de saúde.' });
    }
  };

  // PUT /api/unidades/:id
  atualizar = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const {
        nome,
        cnes,
        tipo,
        telefone,
        email,
        responsavel,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        ativa
      } = req.body;

      const unidadeExistente = await prisma.unidade.findUnique({ where: { id } });
      if (!unidadeExistente || unidadeExistente.deletedAt) {
        return res.status(404).json({ error: 'Unidade não encontrada.' });
      }

      if (cnes && cnes.trim() !== unidadeExistente.cnes) {
        const cnesEmUso = await prisma.unidade.findFirst({
          where: { cnes: cnes.trim(), id: { not: id }, deletedAt: null }
        });
        if (cnesEmUso) {
          return res.status(400).json({ error: 'Já existe outra unidade cadastrada com este CNES.' });
        }
      }

      const enderecoFormatado = [logradouro, numero, bairro, cidade, uf]
        .filter(Boolean)
        .join(', ');

      const unidadeAtualizada = await prisma.unidade.update({
        where: { id },
        data: {
          nome: nome ? nome.trim() : unidadeExistente.nome,
          cnes: cnes !== undefined ? (cnes ? cnes.trim() : null) : unidadeExistente.cnes,
          tipo: tipo && Object.values(TipoUnidade).includes(tipo) ? tipo : unidadeExistente.tipo,
          telefone: telefone !== undefined ? (telefone ? telefone.trim() : null) : unidadeExistente.telefone,
          email: email !== undefined ? (email ? email.trim() : null) : unidadeExistente.email,
          responsavel: responsavel !== undefined ? (responsavel ? responsavel.trim() : null) : unidadeExistente.responsavel,
          cep: cep !== undefined ? (cep ? cep.trim() : null) : unidadeExistente.cep,
          logradouro: logradouro !== undefined ? (logradouro ? logradouro.trim() : null) : unidadeExistente.logradouro,
          numero: numero !== undefined ? (numero ? numero.trim() : null) : unidadeExistente.numero,
          bairro: bairro !== undefined ? (bairro ? bairro.trim() : null) : unidadeExistente.bairro,
          cidade: cidade !== undefined ? (cidade ? cidade.trim() : null) : unidadeExistente.cidade,
          uf: uf !== undefined ? (uf ? uf.trim().toUpperCase() : null) : unidadeExistente.uf,
          endereco: enderecoFormatado || unidadeExistente.endereco,
          ativa: ativa !== undefined ? Boolean(ativa) : unidadeExistente.ativa
        }
      });

      return res.json(unidadeAtualizada);
    } catch (err: any) {
      console.error('Erro ao atualizar unidade:', err);
      return res.status(500).json({ error: err?.message || 'Erro ao atualizar dados da unidade.' });
    }
  };

  // PATCH /api/unidades/:id/toggle-status
  toggleStatus = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const unidade = await prisma.unidade.findUnique({ where: { id } });

      if (!unidade || unidade.deletedAt) {
        return res.status(404).json({ error: 'Unidade não encontrada.' });
      }

      const unidadeAtualizada = await prisma.unidade.update({
        where: { id },
        data: { ativa: !unidade.ativa }
      });

      return res.json(unidadeAtualizada);
    } catch (err) {
      console.error('Erro ao alternar status da unidade:', err);
      return res.status(500).json({ error: 'Erro ao alterar status da unidade.' });
    }
  };
}
