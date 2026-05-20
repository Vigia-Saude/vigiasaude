import { Request, Response } from 'express';
import prisma from '../config/prisma';

/**
 * CatmatController
 * Gerencia a busca/autocomplete de medicamentos da base CATMAT.
 *
 * Endpoints:
 *   GET /api/catmat/buscar?q=<termo>&limit=<n>
 *     - Busca por código BR ou parte da descrição
 *     - Mínimo de 2 caracteres para iniciar a busca
 *     - Retorna até 10 resultados por padrão (configurável via ?limit=)
 *
 *   GET /api/catmat/:codigoBr
 *     - Retorna um medicamento específico pelo código BR exato
 */
export class CatmatController {
  /**
   * Busca medicamentos por código BR ou descrição (autocomplete)
   * @query q     - Termo de busca (mínimo 2 caracteres)
   * @query limit - Número máximo de resultados (padrão: 10, máximo: 50)
   */
  buscar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { q, limit: limitStr } = req.query;

      // Validação: q é obrigatório e deve ter pelo menos 2 caracteres
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }

      const termoBusca = q.trim();

      if (termoBusca.length < 2) {
        return res.json([]); // Não busca com menos de 2 caracteres
      }

      // Limit configurável, máximo de 50
      const limit = Math.min(parseInt(String(limitStr ?? '10'), 10) || 10, 50);

      const medicamentos = await prisma.catmatMedicamento.findMany({
        where: {
          OR: [
            // Busca por código BR (começa com o termo ou contém)
            { codigoBr: { contains: termoBusca.toUpperCase(), mode: 'insensitive' } },
            // Busca por descrição (contém o termo, case-insensitive)
            { descricao: { contains: termoBusca, mode: 'insensitive' } },
          ],
        },
        orderBy: [
          // Priorizar resultados cujo código começa com o termo digitado
          { codigoBr: 'asc' },
        ],
        select: {
          id: true,
          codigoBr: true,
          descricao: true,
          unidadeFornecimento: true,
        },
        take: limit,
      });

      return res.json(medicamentos);
    } catch (error) {
      console.error('Erro ao buscar medicamentos CATMAT:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar medicamentos CATMAT' });
    }
  };

  /**
   * Retorna um medicamento específico pelo código BR exato
   * @param codigoBr - Código BR do medicamento (ex: BR0268317)
   */
  buscarPorCodigo = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { codigoBr } = req.params;

      if (!codigoBr) {
        return res.status(400).json({ error: 'Código BR é obrigatório' });
      }

      const codigo = String(codigoBr).toUpperCase().trim();
      const medicamento = await prisma.catmatMedicamento.findUnique({
        where: { codigoBr: codigo },
        select: {
          id: true,
          codigoBr: true,
          descricao: true,
          unidadeFornecimento: true,
        },
      });

      if (!medicamento) {
        return res.status(404).json({ error: `Medicamento com código ${codigoBr} não encontrado` });
      }

      return res.json(medicamento);
    } catch (error) {
      console.error('Erro ao buscar medicamento por código:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar medicamento' });
    }
  };
}
