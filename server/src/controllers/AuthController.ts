import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const loginSchema = z.object({
  cpf: z.string().min(11),
  password: z.string().min(1),
});

const perfilEnum = z.enum([
  'SECRETARIO_SAUDE',
  'GESTOR_ESTOQUE',
  'FARMACIA',
  'MEDICO',
  'ENTREGADOR',
]);

const solicitarAcessoSchema = z.object({
  nome: z.string().min(2),
  cpf: z.string().length(11),
  email: z.string().email().optional(),
  perfil: perfilEnum,
  justificativa: z.string().min(10),
  password: z.string().min(8),
});

const aprovarSchema = z.object({
  perfil: perfilEnum,
  unidadeId: z.string().optional(),
  tenantSchema: z.string().optional(),
  permissoesExtras: z.record(z.string(), z.boolean()).optional(),
});

const recusarSchema = z.object({
  motivoRecusa: z.string().min(5),
});

function firstIssue(err: z.ZodError): string {
  return err.issues[0]?.message ?? 'Dados inválidos';
}

export class AuthController {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: firstIssue(parsed.error) });
    }

    const { cpf, password } = parsed.data;

    try {
      const user = await prisma.user.findUnique({ where: { cpf } });

      if (!user || !(await bcrypt.compare(password, user.senhaHash))) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      if (user.status === 'PENDENTE') {
        return res.status(403).json({ error: 'Seu cadastro ainda aguarda aprovação do secretário.' });
      }
      if (user.status === 'RECUSADO') {
        return res.status(403).json({ error: 'Seu cadastro foi recusado. Entre em contato com a secretaria.' });
      }
      if (user.status === 'DESATIVADO') {
        return res.status(403).json({ error: 'Conta desativada. Entre em contato com a secretaria.' });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          perfil: user.perfil,
          tenantSchema: user.tenantSchema,
          unidadeId: user.unidadeId,
          fornecedorId: user.fornecedorId ?? null,
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        user: {
          id: user.id,
          nome: user.nome,
          cpf: user.cpf,
          email: user.email,
          role: user.role,
          perfil: user.perfil,
          tenantSchema: user.tenantSchema,
          unidadeId: user.unidadeId,
        },
        token,
      });
    } catch (err) {
      console.error('Erro no login:', err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  async solicitarAcesso(req: Request, res: Response) {
    const parsed = solicitarAcessoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: firstIssue(parsed.error) });
    }

    const { nome, cpf, email, perfil, justificativa, password } = parsed.data;

    try {
      const existing = await prisma.user.findUnique({ where: { cpf } });
      if (existing) {
        return res.status(409).json({
          error: 'Não foi possível concluir o cadastro. Verifique os dados ou entre em contato com a secretaria.',
        });
      }

      const senhaHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: { nome, cpf, email, senhaHash, perfil, justificativa, status: 'PENDENTE' },
      });

      return res.status(201).json({
        message: 'Solicitação enviada. Aguarde a aprovação do secretário.',
        id: user.id,
      });
    } catch (err) {
      console.error('Erro ao solicitar acesso:', err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  async listarPendentes(req: AuthRequest, res: Response) {
    try {
      const usuarios = await prisma.user.findMany({
        where: { status: 'PENDENTE', deletedAt: null },
        select: {
          id: true,
          nome: true,
          cpf: true,
          email: true,
          perfil: true,
          justificativa: true,
          criadoEm: true,
        },
        orderBy: { criadoEm: 'asc' },
      });
      return res.json(usuarios);
    } catch (err) {
      console.error('Erro ao listar pendentes:', err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  async aprovarUsuario(req: AuthRequest, res: Response) {
    const id = String(req.params['id']);
    const parsed = aprovarSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: firstIssue(parsed.error) });
    }

    const { perfil, unidadeId, tenantSchema, permissoesExtras } = parsed.data;

    try {
      const usuario = await prisma.user.findUnique({ where: { id } });
      if (!usuario || usuario.status !== 'PENDENTE') {
        return res.status(404).json({ error: 'Solicitação não encontrada ou já processada.' });
      }

      const atualizado = await prisma.user.update({
        where: { id },
        data: {
          status: 'ATIVO',
          perfil,
          unidadeId: unidadeId ?? null,
          tenantSchema: tenantSchema ?? null,
          permissoesExtras: permissoesExtras as Prisma.InputJsonValue ?? Prisma.JsonNull,
          aprovadoPor: req.user?.id,
          aprovadoEm: new Date(),
        },
        select: { id: true, nome: true, cpf: true, perfil: true, status: true },
      });

      return res.json({ message: 'Usuário aprovado.', usuario: atualizado });
    } catch (err) {
      console.error('Erro ao aprovar usuário:', err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  async recusarUsuario(req: AuthRequest, res: Response) {
    const id = String(req.params['id']);
    const parsed = recusarSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: firstIssue(parsed.error) });
    }

    try {
      const usuario = await prisma.user.findUnique({ where: { id } });
      if (!usuario || usuario.status !== 'PENDENTE') {
        return res.status(404).json({ error: 'Solicitação não encontrada ou já processada.' });
      }

      const atualizado = await prisma.user.update({
        where: { id },
        data: {
          status: 'RECUSADO',
          motivoRecusa: parsed.data.motivoRecusa,
          aprovadoPor: req.user?.id,
          aprovadoEm: new Date(),
        },
        select: { id: true, nome: true, status: true },
      });

      return res.json({ message: 'Solicitação recusada.', usuario: atualizado });
    } catch (err) {
      console.error('Erro ao recusar usuário:', err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
}
