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

  // GET /api/farmacia/entregas
  listarEntregas = async (req: AuthRequest, res: Response) => {
    const tenantSchema = req.user?.tenantSchema;
    if (!tenantSchema) {
      res.status(400).json({ erro: 'Tenant não identificado.' });
      return;
    }

    const status = req.query.status ? String(req.query.status).trim() : null;

    try {
      const tenant = getPrismaForSchema(tenantSchema);

      let query = `
        SELECT
          e.id,
          e.numero,
          e.status,
          e.prioridade,
          e.paciente_id AS "pacienteId",
          e.paciente_nome AS "pacienteNome",
          e.paciente_cpf AS "pacienteCpf",
          e.endereco,
          e.entregador_nome AS "entregadorNome",
          e.codigo_rastreio AS "codigoRastreio",
          e.observacoes,
          e.criado_por AS "criadoPor",
          e.criado_em AS "criadoEm",
          e.atualizado_em AS "atualizadoEm",
          i.id AS "item_id",
          i.medicamento_id AS "item_medicamentoId",
          i.medicamento_nome AS "item_medicamentoNome",
          i.lote_id AS "item_loteId",
          i.numero_lote AS "item_numeroLote",
          i.quantidade AS "item_quantidade"
        FROM entregas_domiciliares e
        LEFT JOIN entrega_itens i ON i.entrega_id = e.id
        WHERE e.deleted_at IS NULL
      `;

      const params: unknown[] = [];
      if (status && status !== 'TODOS') {
        params.push(status);
        query += ` AND e.status = $1`;
      }

      query += ` ORDER BY e.criado_em DESC`;

      const rows: any[] = await tenant.$queryRawUnsafe(query, ...params);

      const entregasMap = new Map<string, any>();
      for (const row of rows) {
        if (!entregasMap.has(row.id)) {
          entregasMap.set(row.id, {
            id: row.id,
            numero: row.numero,
            status: row.status,
            prioridade: row.prioridade,
            pacienteId: row.pacienteId,
            pacienteNome: row.pacienteNome,
            pacienteCpf: row.pacienteCpf,
            endereco: row.endereco,
            entregadorNome: row.entregadorNome,
            codigoRastreio: row.codigoRastreio,
            observacoes: row.observacoes,
            criadoPor: row.criadoPor,
            criadoEm: row.criadoEm,
            atualizadoEm: row.atualizadoEm,
            itens: [],
          });
        }

        if (row.item_id) {
          entregasMap.get(row.id).itens.push({
            id: row.item_id,
            medicamentoId: row.item_medicamentoId,
            medicamentoNome: row.item_medicamentoNome,
            loteId: row.item_loteId,
            numeroLote: row.item_numeroLote,
            quantidade: row.item_quantidade,
          });
        }
      }

      res.json(Array.from(entregasMap.values()));
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar entregas.' });
    }
  };

  // GET /api/farmacia/entregas/stats
  statsEntregas = async (req: AuthRequest, res: Response) => {
    const tenantSchema = req.user?.tenantSchema;
    if (!tenantSchema) {
      res.status(400).json({ erro: 'Tenant não identificado.' });
      return;
    }

    try {
      const tenant = getPrismaForSchema(tenantSchema);

      const rows: any[] = await tenant.$queryRawUnsafe(`
        SELECT
          COUNT(CASE WHEN status = 'PENDENTE' THEN 1 END) AS pendentes,
          COUNT(CASE WHEN status = 'EM_ROTA' THEN 1 END) AS em_rota,
          COUNT(CASE WHEN status = 'ENTREGUE' AND atualizado_em >= DATE_TRUNC('day', NOW()) THEN 1 END) AS entregues_hoje,
          COUNT(CASE WHEN status = 'DEVOLVIDO' THEN 1 END) AS devolvidos
        FROM entregas_domiciliares
        WHERE deleted_at IS NULL
      `);

      const stats = rows[0] || { pendentes: 0, em_rota: 0, entregues_hoje: 0, devolvidos: 0 };
      
      res.json({
        pendentes: Number(stats.pendentes || 0),
        emRota: Number(stats.em_rota || 0),
        entreguesHoje: Number(stats.entregues_hoje || 0),
        devolvidos: Number(stats.devolvidos || 0),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao obter estatísticas de entregas.' });
    }
  };

  // POST /api/farmacia/entregas
  criarEntrega = async (req: AuthRequest, res: Response) => {
    const tenantSchema = req.user?.tenantSchema;
    if (!tenantSchema) {
      res.status(400).json({ erro: 'Tenant não identificado.' });
      return;
    }

    const itemEntregaSchema = z.object({
      medicamentoId: z.string().min(1),
      loteId: z.string().min(1),
      quantidade: z.number().int().positive(),
    });

    const criarEntregaSchema = z.object({
      pacienteId: z.string().nullable().optional(),
      pacienteNome: z.string().min(1),
      pacienteCpf: z.string().nullable().optional(),
      endereco: z.string().min(1),
      prioridade: z.enum(['NORMAL', 'URGENTE']),
      observacoes: z.string().nullable().optional(),
      itens: z.array(itemEntregaSchema).min(1),
    });

    const parsed = criarEntregaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten().fieldErrors });
      return;
    }

    const { pacienteId, pacienteNome, pacienteCpf, endereco, prioridade, observacoes, itens } = parsed.data;
    const usuarioId = req.user!.id;

    try {
      const tenant = getPrismaForSchema(tenantSchema);

      // 1. Gerar número de entrega
      const year = new Date().getFullYear();
      const countResult: any[] = await tenant.$queryRawUnsafe(
        `SELECT COUNT(*) AS total FROM entregas_domiciliares WHERE criado_em >= DATE_TRUNC('year', NOW())`
      );
      const total = Number(countResult[0]?.total || 0);
      const numero = `ENTREGA-${year}-${String(total + 1).padStart(5, '0')}`;

      // 2. Buscar nomes de medicamentos
      const itemMedicamentoIds = itens.map(i => i.medicamentoId);
      const medicamentos: any[] = await tenant.$queryRawUnsafe(
        `SELECT id, nome FROM medicamentos WHERE id = ANY($1)`,
        itemMedicamentoIds
      );
      const medMap = new Map(medicamentos.map(m => [m.id, m.nome]));

      // 3. Buscar números de lotes
      const itemLoteIds = itens.map(i => i.loteId);
      const lotes: any[] = await tenant.$queryRawUnsafe(
        `SELECT id, numero_lote, quantidade_atual, validade, medicamento_id FROM lotes WHERE id = ANY($1) AND deleted_at IS NULL`,
        itemLoteIds
      );
      const lotesMap = new Map(lotes.map(l => [l.id, l]));

      // 4. Validar estoque e validade
      for (const item of itens) {
        const lote = lotesMap.get(item.loteId);
        if (!lote) {
          res.status(404).json({ erro: `Lote ${item.loteId} não encontrado.` });
          return;
        }
        if (lote.medicamento_id && lote.medicamento_id !== item.medicamentoId) {
          res.status(400).json({ erro: `Lote ${lote.numero_lote} não pertence ao medicamento informado.` });
          return;
        }
        if (new Date(lote.validade) < new Date()) {
          res.status(400).json({ erro: `Lote ${lote.numero_lote} está vencido.` });
          return;
        }
        if (item.quantidade > Number(lote.quantidade_atual)) {
          res.status(400).json({ erro: `Quantidade insuficiente no lote ${lote.numero_lote}. Disponível: ${lote.quantidade_atual}` });
          return;
        }
      }

      // 5. Iniciar transação no BD
      // 5. Iniciar transação no BD
      const result = await tenant.$transaction(async (tx) => {
        const entregaInsertRes: any[] = await tx.$queryRawUnsafe(
          `
          INSERT INTO entregas_domiciliares (
            numero, status, prioridade, paciente_id, paciente_nome, paciente_cpf, endereco, observacoes, criado_por
          ) VALUES ($1, 'PENDENTE', $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
          `,
          numero,
          prioridade,
          pacienteId || null,
          pacienteNome,
          pacienteCpf || null,
          endereco,
          observacoes || null,
          usuarioId
        );
        const entregaId = entregaInsertRes[0].id;

        for (const item of itens) {
          const medNome = medMap.get(item.medicamentoId) || 'Medicamento';
          const lote = lotesMap.get(item.loteId);
          const loteNum = lote ? lote.numero_lote : null;

          // Inserir item
          await tx.$executeRawUnsafe(
            `
            INSERT INTO entrega_itens (
              entrega_id, medicamento_id, medicamento_nome, lote_id, numero_lote, quantidade
            ) VALUES ($1, $2, $3, $4, $5, $6)
            `,
            entregaId,
            item.medicamentoId,
            medNome,
            item.loteId,
            loteNum,
            item.quantidade
          );

          // Decrementar lote
          await tx.$executeRawUnsafe(
            `
            UPDATE lotes SET quantidade_atual = quantidade_atual - $1
            WHERE id = $2
            `,
            item.quantidade,
            item.loteId
          );
        }

        return { id: entregaId, numero };
      });

      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao registrar entrega.' });
    }
  };

  // PATCH /api/farmacia/entregas/:id/coletar
  confirmarColeta = async (req: AuthRequest, res: Response) => {
    const tenantSchema = req.user?.tenantSchema;
    if (!tenantSchema) {
      res.status(400).json({ erro: 'Tenant não identificado.' });
      return;
    }

    const coletarSchema = z.object({
      entregadorNome: z.string().min(1, 'Nome do entregador é obrigatório'),
      codigoRastreio: z.string().optional(),
    });

    const parsed = coletarSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ erro: 'Dados inválidos.', detalhes: parsed.error.flatten().fieldErrors });
      return;
    }

    const { entregadorNome, codigoRastreio } = parsed.data;
    const { id } = req.params;

    try {
      const tenant = getPrismaForSchema(tenantSchema);

      const result: any[] = await tenant.$queryRawUnsafe(
        `
        UPDATE entregas_domiciliares
        SET status = 'EM_ROTA',
            entregador_nome = $1,
            codigo_rastreio = $2,
            atualizado_em = NOW()
        WHERE id = $3 AND status = 'PENDENTE' AND deleted_at IS NULL
        RETURNING id
        `,
        entregadorNome,
        codigoRastreio || null,
        id
      );

      if (result.length === 0) {
        res.status(404).json({ erro: 'Entrega não encontrada ou não está mais pendente.' });
        return;
      }

      res.json({ id, status: 'EM_ROTA' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao confirmar coleta.' });
    }
  };

  // PATCH /api/farmacia/entregas/:id/status
  atualizarStatusEntrega = async (req: AuthRequest, res: Response) => {
    const tenantSchema = req.user?.tenantSchema;
    if (!tenantSchema) {
      res.status(400).json({ erro: 'Tenant não identificado.' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'ENTREGUE' && status !== 'DEVOLVIDO') {
      res.status(400).json({ erro: 'Status inválido. Deve ser ENTREGUE ou DEVOLVIDO.' });
      return;
    }

    try {
      const tenant = getPrismaForSchema(tenantSchema);

      // Verificar status atual
      const entregaRes: any[] = await tenant.$queryRawUnsafe(
        `SELECT status FROM entregas_domiciliares WHERE id = $1 AND deleted_at IS NULL`,
        id
      );

      if (entregaRes.length === 0) {
        res.status(404).json({ erro: 'Entrega não encontrada.' });
        return;
      }

      const currentStatus = entregaRes[0].status;

      // Buscar itens para o caso de devolução
      const items: any[] = await tenant.$queryRawUnsafe(
        `SELECT lote_id, quantidade FROM entrega_itens WHERE entrega_id = $1`,
        id
      );

      await tenant.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(
          `UPDATE entregas_domiciliares SET status = $1, atualizado_em = NOW() WHERE id = $2`,
          status,
          id
        );

        // Se status foi para DEVOLVIDO e não estava devolvido antes, devolve os itens ao estoque
        if (currentStatus !== 'DEVOLVIDO' && status === 'DEVOLVIDO') {
          for (const item of items) {
            if (item.lote_id) {
              await tx.$executeRawUnsafe(
                `UPDATE lotes SET quantidade_atual = quantidade_atual + $1 WHERE id = $2`,
                item.quantidade,
                item.lote_id
              );
            }
          }
        }
      });

      res.json({ id, status });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao atualizar status da entrega.' });
    }
  };
}
