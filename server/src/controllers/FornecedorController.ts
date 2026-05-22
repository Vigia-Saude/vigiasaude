import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { Prisma } from '@prisma/client';

export class FornecedorController {
  // GET /api/fornecedores
  async listar(req: AuthRequest, res: Response) {
    const { query, status, categoria } = req.query;

    try {
      const whereClause: Prisma.FornecedorWhereInput = { deletedAt: null };

      if (status) {
        whereClause.status = String(status);
      }

      if (categoria) {
        whereClause.categorias = {
          has: String(categoria)
        };
      }

      if (query) {
        const queryStr = String(query);
        whereClause.OR = [
          { cnpj: { contains: queryStr, mode: 'insensitive' } },
          { razaoSocial: { contains: queryStr, mode: 'insensitive' } },
          { nomeFantasia: { contains: queryStr, mode: 'insensitive' } }
        ];
      }

      const fornecedores = await prisma.fornecedor.findMany({
        where: whereClause,
        orderBy: { criadoEm: 'desc' }
      });

      return res.json(fornecedores);
    } catch (err) {
      console.error('Erro ao listar fornecedores:', err);
      return res.status(500).json({ error: 'Erro interno ao listar fornecedores' });
    }
  }

  // GET /api/fornecedores/:id
  async detalhes(req: AuthRequest, res: Response) {
    const id = req.params.id as string;

    // Fornecedor só pode ver a si mesmo
    if (req.user?.role === 'FORNECEDOR' && req.user.fornecedorId && req.user.fornecedorId !== id) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    try {
      const fornecedor = await prisma.fornecedor.findUnique({
        where: { id },
        include: {
          atas: {
            orderBy: { vigenciaFim: 'desc' }
          }
        }
      });

      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }

      return res.json(fornecedor);
    } catch (err) {
      console.error('Erro ao buscar detalhes do fornecedor:', err);
      return res.status(500).json({ error: 'Erro interno ao buscar detalhes' });
    }
  }

  // POST /api/fornecedores
  async criar(req: AuthRequest, res: Response) {
    const { cnpj, razaoSocial, nomeFantasia, email, whatsapp, categorias } = req.body;
    const usuarioId = req.user?.id;

    if (!cnpj || !razaoSocial || !nomeFantasia || !email || !whatsapp || !categorias) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    try {
      // Verificar se CNPJ já existe
      const fornecedorExistente = await prisma.fornecedor.findUnique({
        where: { cnpj }
      });

      if (fornecedorExistente) {
        return res.status(400).json({ error: 'Já existe um fornecedor cadastrado com este CNPJ' });
      }

      const novoFornecedor = await prisma.$transaction(async (tx) => {
        const fornecedor = await tx.fornecedor.create({
          data: {
            cnpj,
            razaoSocial,
            nomeFantasia,
            email,
            whatsapp,
            categorias,
            status: 'ATIVO',
            taxaAceitacao: 100.00
          }
        });

        if (usuarioId) {
          await tx.auditoria.create({
            data: {
              usuarioId,
              acao: 'CRIACAO_FORNECEDOR',
              entidadeId: fornecedor.id,
              dadosDepois: fornecedor,
              justificativa: 'Cadastro inicial de fornecedor no sistema.'
            }
          });
        }

        return fornecedor;
      });

      return res.status(201).json(novoFornecedor);
    } catch (err) {
      console.error('Erro ao criar fornecedor:', err);
      return res.status(500).json({ error: 'Erro interno ao cadastrar fornecedor' });
    }
  }

  // PUT /api/fornecedores/:id
  async atualizar(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const { razaoSocial, nomeFantasia, email, whatsapp, categorias } = req.body;
    const usuarioId = req.user?.id;

    try {
      const fornecedorExistente = await prisma.fornecedor.findUnique({
        where: { id }
      });

      if (!fornecedorExistente) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }

      const fornecedorAtualizado = await prisma.$transaction(async (tx) => {
        const fornecedor = await tx.fornecedor.update({
          where: { id },
          data: {
            razaoSocial,
            nomeFantasia,
            email,
            whatsapp,
            categorias
          }
        });

        if (usuarioId) {
          await tx.auditoria.create({
            data: {
              usuarioId,
              acao: 'ATUALIZACAO_FORNECEDOR',
              entidadeId: id,
              dadosAntes: fornecedorExistente,
              dadosDepois: fornecedor,
              justificativa: 'Alteração dos dados cadastrais do fornecedor.'
            }
          });
        }

        return fornecedor;
      });

      return res.json(fornecedorAtualizado);
    } catch (err) {
      console.error('Erro ao atualizar fornecedor:', err);
      return res.status(500).json({ error: 'Erro interno ao atualizar fornecedor' });
    }
  }

  // PATCH /api/fornecedores/:id/status
  async toggleStatus(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const usuarioId = req.user?.id;

    try {
      const fornecedorExistente = await prisma.fornecedor.findUnique({
        where: { id }
      });

      if (!fornecedorExistente) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }

      const novoStatus = fornecedorExistente.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';

      const fornecedorAtualizado = await prisma.$transaction(async (tx) => {
        const fornecedor = await tx.fornecedor.update({
          where: { id },
          data: { status: novoStatus }
        });

        if (usuarioId) {
          await tx.auditoria.create({
            data: {
              usuarioId,
              acao: novoStatus === 'INATIVO' ? 'DESATIVACAO_FORNECEDOR' : 'ATIVACAO_FORNECEDOR',
              entidadeId: id,
              dadosAntes: { status: fornecedorExistente.status },
              dadosDepois: { status: novoStatus },
              justificativa: `Alteração de status do fornecedor para ${novoStatus}.`
            }
          });
        }

        return fornecedor;
      });

      return res.json(fornecedorAtualizado);
    } catch (err) {
      console.error('Erro ao alternar status do fornecedor:', err);
      return res.status(500).json({ error: 'Erro interno ao alternar status' });
    }
  }
}
