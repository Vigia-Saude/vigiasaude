import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { getPrismaForSchema } from '../lib/prismaFactory';
import { z } from 'zod';

const dispensarSchema = z.object({
  medicamentoId: z.string().min(1),
  loteId: z.string().min(1),
  quantidade: z.number().int().positive('Quantidade deve ser maior que 0'),
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
  observacao: z.string().optional(),
});

export class FarmaciaController {
  // GET /api/farmacia/estoque?search=...
  buscarEstoque = async (req: AuthRequest, res: Response) => {
    const tenantSchema = req.user?.tenantSchema;
    if (!tenantSchema) {
      res.status(400).json({ erro: 'Tenant não identificado.' });
      return;
    }

    const search = String(req.query.search || '').trim();

    try {
      const tenant = getPrismaForSchema(tenantSchema);

      let query = `
        SELECT
          m.id            AS medicamento_id,
          m.catmat_codigo,
          m.nome,
          m.principio_ativo,
          m.forma_farmaceutica,
          m.concentracao,
          m.unidade_medida,
          m.estoque_minimo,
          l.id            AS lote_id,
          l.numero_lote,
          l.quantidade_atual,
          l.validade,
          l.fornecedor
        FROM medicamentos m
        INNER JOIN lotes l ON l.medicamento_id = m.id AND l.deleted_at IS NULL AND l.quantidade_atual > 0
        WHERE m.deleted_at IS NULL
      `;

      const params: unknown[] = [];

      if (search) {
        params.push(`%${search}%`, `%${search}%`);
        query += ` AND (m.nome ILIKE $1 OR m.catmat_codigo ILIKE $2)`;
      }

      query += ` ORDER BY m.nome, l.validade ASC`;

      const rows: any[] = await tenant.$queryRawUnsafe(query, ...params);

      // Agrupa lotes por medicamento
      const medicamentosMap = new Map<string, any>();

      for (const row of rows) {
        const medId = row.medicamento_id;
        if (!medicamentosMap.has(medId)) {
          medicamentosMap.set(medId, {
            id: medId,
            catmatCodigo: row.catmat_codigo,
            nome: row.nome,
            principioAtivo: row.principio_ativo,
            formaFarmaceutica: row.forma_farmaceutica,
            concentracao: row.concentracao,
            unidadeMedida: row.unidade_medida,
            estoqueMinimo: row.estoque_minimo,
            lotes: [],
          });
        }

        medicamentosMap.get(medId).lotes.push({
          id: row.lote_id,
          numeroLote: row.numero_lote,
          quantidadeAtual: row.quantidade_atual,
          validade: row.validade,
          fornecedor: row.fornecedor,
        });
      }

      res.json(Array.from(medicamentosMap.values()));
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar estoque da farmácia.' });
    }
  };

  // POST /api/farmacia/dispensar
  dispensar = async (req: AuthRequest, res: Response) => {
    const tenantSchema = req.user?.tenantSchema;
    if (!tenantSchema) {
      res.status(400).json({ erro: 'Tenant não identificado.' });
      return;
    }

    const parsed = dispensarSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten().fieldErrors });
      return;
    }

    const { medicamentoId, loteId, quantidade, pacienteId, observacao } = parsed.data;
    const usuarioId = req.user!.id;

    try {
      const tenant = getPrismaForSchema(tenantSchema);

      // Verificar se o lote existe e tem estoque suficiente
      const lotes: any[] = await tenant.$queryRawUnsafe(
        `SELECT id, medicamento_id, quantidade_atual, validade FROM lotes WHERE id = $1 AND deleted_at IS NULL`,
        loteId,
      );

      if (lotes.length === 0) {
        res.status(404).json({ erro: 'Lote não encontrado.' });
        return;
      }

      const lote = lotes[0];

      if (lote.medicamento_id !== medicamentoId) {
        res.status(400).json({ erro: 'Lote não pertence ao medicamento informado.' });
        return;
      }

      if (new Date(lote.validade) < new Date()) {
        res.status(400).json({ erro: 'Lote vencido. Não é possível dispensar.' });
        return;
      }

      if (quantidade > Number(lote.quantidade_atual)) {
        res.status(400).json({ erro: `Quantidade insuficiente no lote. Disponível: ${lote.quantidade_atual}` });
        return;
      }

      // Transação: criar dispensação + item + decrementar lote
      const result: any[] = await tenant.$queryRawUnsafe(
        `
        WITH nova_dispensacao AS (
          INSERT INTO dispensacoes (paciente_id, prescricao_id, usuario_id, data_dispensacao, observacoes)
          VALUES ($1, NULL, $2, NOW(), $3)
          RETURNING id, paciente_id, usuario_id, data_dispensacao, observacoes, criado_em
        ),
        novo_item AS (
          INSERT INTO dispensacao_itens (dispensacao_id, medicamento_id, lote_id, quantidade)
          VALUES ((SELECT id FROM nova_dispensacao), $4, $5, $6)
          RETURNING id, dispensacao_id, medicamento_id, lote_id, quantidade
        ),
        atualiza_lote AS (
          UPDATE lotes SET quantidade_atual = quantidade_atual - $6
          WHERE id = $5
          RETURNING id, quantidade_atual
        )
        SELECT
          d.id              AS dispensacao_id,
          d.paciente_id,
          d.usuario_id,
          d.data_dispensacao,
          d.observacoes,
          d.criado_em,
          i.id              AS item_id,
          i.medicamento_id,
          i.lote_id,
          i.quantidade,
          al.quantidade_atual AS lote_quantidade_restante
        FROM nova_dispensacao d
        CROSS JOIN novo_item i
        CROSS JOIN atualiza_lote al
        `,
        pacienteId || null,
        usuarioId,
        observacao || null,
        medicamentoId,
        loteId,
        quantidade,
      );

      const row = result[0];

      res.status(201).json({
        id: row.dispensacao_id,
        pacienteId: row.paciente_id,
        usuarioId: row.usuario_id,
        dataDispensacao: row.data_dispensacao,
        observacoes: row.observacoes,
        criadoEm: row.criado_em,
        item: {
          id: row.item_id,
          medicamentoId: row.medicamento_id,
          loteId: row.lote_id,
          quantidade: row.quantidade,
        },
        loteQuantidadeRestante: row.lote_quantidade_restante,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao registrar dispensação.' });
    }
  };

  // GET /api/farmacia/dispensacoes/recentes
  dispensacoesRecentes = async (req: AuthRequest, res: Response) => {
    const tenantSchema = req.user?.tenantSchema;
    if (!tenantSchema) {
      res.status(400).json({ erro: 'Tenant não identificado.' });
      return;
    }

    try {
      const tenant = getPrismaForSchema(tenantSchema);

      const rows: any[] = await tenant.$queryRawUnsafe(`
        SELECT
          d.id              AS dispensacao_id,
          d.data_dispensacao,
          d.observacoes,
          d.criado_em,
          p.nome            AS paciente_nome,
          di.quantidade,
          m.nome            AS medicamento_nome,
          m.concentracao,
          l.numero_lote
        FROM dispensacoes d
        LEFT JOIN pacientes p ON p.id = d.paciente_id
        INNER JOIN dispensacao_itens di ON di.dispensacao_id = d.id
        INNER JOIN medicamentos m ON m.id = di.medicamento_id
        INNER JOIN lotes l ON l.id = di.lote_id
        ORDER BY d.data_dispensacao DESC
        LIMIT 15
      `);

      const dispensacoes = rows.map(row => ({
        id: row.dispensacao_id,
        dataDispensacao: row.data_dispensacao,
        observacoes: row.observacoes,
        criadoEm: row.criado_em,
        pacienteNome: row.paciente_nome,
        medicamentoNome: row.medicamento_nome,
        concentracao: row.concentracao,
        quantidade: row.quantidade,
        numeroLote: row.numero_lote,
      }));

      res.json(dispensacoes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar dispensações recentes.' });
    }
  };

  // GET /api/farmacia/pacientes?search=...
  buscarPacientes = async (req: AuthRequest, res: Response) => {
    const tenantSchema = req.user?.tenantSchema;
    if (!tenantSchema) {
      res.status(400).json({ erro: 'Tenant não identificado.' });
      return;
    }

    const search = String(req.query.search || '').trim();

    try {
      const tenant = getPrismaForSchema(tenantSchema);

      let query = `
        SELECT id, nome, cpf, cartao_sus AS "cartaoSus"
        FROM pacientes
        WHERE deleted_at IS NULL
      `;
      const params: unknown[] = [];

      if (search) {
        params.push(`%${search}%`, `%${search}%`);
        query += ` AND (nome ILIKE $1 OR cpf ILIKE $2)`;
      }

      query += ` ORDER BY nome LIMIT 50`;

      const rows = await tenant.$queryRawUnsafe(query, ...params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar pacientes.' });
    }
  };
}
