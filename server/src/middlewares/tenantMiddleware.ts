import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getPrismaForSchema } from '../lib/prismaFactory';

interface JwtPayload {
  sub: string;
  tenantSchema: string;
  perfil: string;
  unidadeId?: string;
}

declare global {
  namespace Express {
    interface Request {
      tenantPrisma: PrismaClient;
      jwtPayload: JwtPayload;
    }
  }
}

export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!payload.tenantSchema) {
      res.status(403).json({ error: 'Token sem tenant associado' });
      return;
    }

    req.jwtPayload   = payload;
    req.tenantPrisma = getPrismaForSchema(payload.tenantSchema);

    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
