import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class CatmatController {
  buscar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.json([]);
      }

      const medicamentos = await prisma.catmatMedicamento.findMany({
        where: {
          OR: [
            { descricao: { contains: q, mode: 'insensitive' } },
            { codigoBr: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });

      return res.json(medicamentos);
    } catch (error) {
      console.error('Erro ao buscar medicamentos CATMAT:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar medicamentos CATMAT' });
    }
  };
}
