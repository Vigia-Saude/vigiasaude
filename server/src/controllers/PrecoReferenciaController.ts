import { Request, Response } from 'express';
import { obterPrecosReferencia } from '../services/precoReferencia.service';

/**
 * PrecoReferenciaController
 * Preços oficiais de referência (BPS e CMED) para um item do catálogo CATMAT.
 *
 * Endpoint:
 *   GET /api/precos/referencia?codigoBr=BR0271089-2&limiteCmed=10
 */
export class PrecoReferenciaController {
  obter = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { codigoBr, limiteCmed } = req.query;

      if (!codigoBr || typeof codigoBr !== 'string' || !codigoBr.trim()) {
        return res.status(400).json({ error: 'Parâmetro codigoBr é obrigatório' });
      }

      const limite = Math.min(parseInt(String(limiteCmed ?? '10'), 10) || 10, 50);
      const precos = await obterPrecosReferencia(codigoBr.toUpperCase().trim(), limite);

      return res.json(precos);
    } catch (error) {
      console.error('Erro ao buscar preços de referência:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar preços de referência' });
    }
  };
}
