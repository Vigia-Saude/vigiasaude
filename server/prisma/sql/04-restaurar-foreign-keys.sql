-- =============================================================================
-- Vigia-Saude — Restaurar integridade referencial
--
-- CONTEXTO: o banco foi construído com `prisma db push` / SQL manual, e várias
-- foreign keys declaradas no schema.prisma nunca chegaram ao Postgres. Sem
-- elas, o banco aceita linha filha apontando para pai inexistente.
--
-- Isso JÁ ACONTECEU: em 2026-08-05 havia 1 registro em nota_fiscal_itens
-- referenciando uma nota fiscal que não existe mais.
--
-- ORDEM: limpar órfãos (bloco 1) antes de criar as constraints (bloco 2),
-- senão o ALTER TABLE falha.
-- =============================================================================


-- ─── BLOCO 1: Diagnóstico ────────────────────────────────────────────────────
-- Rode primeiro e confira o que será removido.

SELECT i.id, i.nota_fiscal_id, i.medicamento_nome, i.numero_lote
FROM public.nota_fiscal_itens i
LEFT JOIN public.notas_fiscais n ON n.id = i.nota_fiscal_id
WHERE n.id IS NULL;


-- ─── BLOCO 2: Limpeza dos órfãos ─────────────────────────────────────────────
-- DESTRUTIVO. Só execute após conferir o resultado do bloco 1.

-- DELETE FROM public.nota_fiscal_itens i
-- WHERE NOT EXISTS (SELECT 1 FROM public.notas_fiscais n WHERE n.id = i.nota_fiscal_id);


-- ─── BLOCO 3: Criação das foreign keys ausentes ──────────────────────────────

ALTER TABLE public.nota_fiscal_itens
  ADD CONSTRAINT nota_fiscal_itens_nota_fiscal_id_fkey
  FOREIGN KEY (nota_fiscal_id) REFERENCES public.notas_fiscais(id) ON DELETE CASCADE;

ALTER TABLE public.notas_fiscais
  ADD CONSTRAINT notas_fiscais_fornecedor_id_fkey
  FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id);

ALTER TABLE public.notas_fiscais
  ADD CONSTRAINT notas_fiscais_pedido_compra_id_fkey
  FOREIGN KEY (pedido_compra_id) REFERENCES public.pedidos_compra(id);

ALTER TABLE public.cd_estoque_lotes
  ADD CONSTRAINT cd_estoque_lotes_nota_fiscal_item_id_fkey
  FOREIGN KEY (nota_fiscal_item_id) REFERENCES public.nota_fiscal_itens(id);

ALTER TABLE public.pedido_reposicao_itens
  ADD CONSTRAINT pedido_reposicao_itens_pedido_id_fkey
  FOREIGN KEY (pedido_id) REFERENCES public.pedidos_reposicao(id) ON DELETE CASCADE;

ALTER TABLE public.pedidos_reposicao
  ADD CONSTRAINT pedidos_reposicao_unidade_id_fkey
  FOREIGN KEY (unidade_id) REFERENCES public.unidades(id);

ALTER TABLE public.pedidos_reposicao
  ADD CONSTRAINT pedidos_reposicao_solicitado_por_id_fkey
  FOREIGN KEY (solicitado_por_id) REFERENCES public.usuarios(id);

ALTER TABLE public.pedidos_reposicao
  ADD CONSTRAINT pedidos_reposicao_motorista_id_fkey
  FOREIGN KEY (motorista_id) REFERENCES public.usuarios(id);

-- Índice que o Prisma espera e o banco não tem.
CREATE INDEX IF NOT EXISTS pacientes_unidade_origem_id_idx
  ON public.pacientes (unidade_origem_id);
