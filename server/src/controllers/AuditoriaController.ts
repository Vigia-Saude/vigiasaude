import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

export class AuditoriaController {
  // GET /api/auditoria
  async listar(req: AuthRequest, res: Response) {
    const { page, limit } = req.query;

    try {
      if (!page && !limit) {
        // Comportamento original sem paginação para compatibilidade retroativa com o frontend
        const logs = await prisma.auditoria.findMany({
          orderBy: {
            dataHora: 'desc',
          },
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
                role: true,
              },
            },
          },
        });
        return res.json(logs);
      }

      // Comportamento com paginação
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
      const skip = (pageNum - 1) * limitNum;

      const [total, logs] = await Promise.all([
        prisma.auditoria.count(),
        prisma.auditoria.findMany({
          orderBy: {
            dataHora: 'desc',
          },
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
                role: true,
              },
            },
          },
          skip,
          take: limitNum,
        })
      ]);

      return res.json({
        total,
        pagina: pageNum,
        limite: limitNum,
        paginas: Math.ceil(total / limitNum),
        dados: logs
      });
    } catch (err) {
      console.error('Erro ao buscar auditoria:', err);
      return res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
    }
  }
}
