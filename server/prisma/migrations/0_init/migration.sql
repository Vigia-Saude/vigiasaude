-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COMPRADOR', 'FORNECEDOR');

-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('SECRETARIO_SAUDE', 'GESTOR_ESTOQUE', 'FARMACIA', 'MEDICO', 'ENTREGADOR', 'POSTO_SAUDE', 'REGULADOR');

-- CreateEnum
CREATE TYPE "UsuarioStatus" AS ENUM ('PENDENTE', 'ATIVO', 'RECUSADO', 'DESATIVADO');

-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('RASCUNHO', 'PENDENTE', 'APROVADO', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO', 'ACEITO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "AtaStatus" AS ENUM ('ATIVA', 'VENCIDA', 'CANCELADA', 'EM_REVISAO', 'ESGOTADA');

-- CreateEnum
CREATE TYPE "NotaFiscalStatus" AS ENUM ('PENDENTE', 'CONFERIDA', 'CONFERIDO_DIVERGENCIA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "CdEstoqueLoteStatus" AS ENUM ('DISPONIVEL', 'BLOQUEADO_RECALL', 'ESGOTADO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "AlertaCdTipo" AS ENUM ('DIVERGENCIA_NF', 'RECALL', 'ESTOQUE_MINIMO');

-- CreateEnum
CREATE TYPE "AlertaCdStatus" AS ENUM ('NOVO', 'LIDO', 'RESOLVIDO');

-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('AGUARDANDO_REGULACAO', 'PRE_AGENDADO', 'AGUARDANDO_RESPOSTA_PACIENTE', 'CONFIRMADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoAtendimento" AS ENUM ('SUS', 'PARCERIA');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO', 'PREFIRO_NAO_INFORMAR');

-- CreateEnum
CREATE TYPE "PedidoReposicaoStatus" AS ENUM ('PENDENTE', 'EM_ANALISE', 'EM_SEPARACAO', 'AGUARDANDO_MOTORISTA', 'EM_TRANSITO', 'CONCLUIDO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "PedidoReposicaoUrgencia" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "TipoUnidade" AS ENUM ('UBS', 'USF', 'UPA', 'FARMACIA_MUNICIPAL', 'POSTO_SAUDE');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "QueueEntryStatus" AS ENUM ('PENDING', 'AWAITING_RESPONSE', 'CONFIRMED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'RECEIVED');

-- CreateTable
CREATE TABLE "etl_bps" (
    "id" BIGSERIAL NOT NULL,
    "registro_hash" TEXT NOT NULL,
    "ano_compra" INTEGER NOT NULL,
    "nome_instituicao" TEXT NOT NULL,
    "esfera" TEXT NOT NULL,
    "cnpj_instituicao" TEXT NOT NULL,
    "municipio_instituicao" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "compra" DATE NOT NULL,
    "insercao" DATE NOT NULL,
    "codigo_br" TEXT NOT NULL,
    "descricao_catmat" TEXT NOT NULL,
    "unidade_fornecimento" TEXT NOT NULL,
    "generico" BOOLEAN,
    "anvisa" TEXT,
    "modalidade_compra" TEXT NOT NULL,
    "tipo_compra" TEXT NOT NULL,
    "capacidade" DECIMAL(65,30),
    "unidade_medida" TEXT,
    "unidade_fornecimento_capacidade" TEXT NOT NULL,
    "cnpj_fornecedor" TEXT NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "cnpj_fabricante" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "qtd_itens_comprados" BIGINT NOT NULL,
    "preco_unitario" DECIMAL(65,30) NOT NULL,
    "preco_total" DECIMAL(65,30) NOT NULL,
    "extraido_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arquivo_origem" TEXT NOT NULL,

    CONSTRAINT "etl_bps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etl_cmed" (
    "codigo_ggrem" TEXT NOT NULL,
    "registro" TEXT NOT NULL,
    "ean_1" TEXT,
    "ean_2" TEXT,
    "ean_3" TEXT,
    "substancia" TEXT,
    "produto" TEXT,
    "apresentacao" TEXT,
    "cnpj" TEXT NOT NULL,
    "laboratorio" TEXT,
    "classe_terapeutica" TEXT,
    "tipo_produto" TEXT,
    "regime_de_preco" TEXT,
    "restricao_hospitalar" BOOLEAN,
    "cap" BOOLEAN,
    "confaz_87" BOOLEAN,
    "icms_0_percentual" BOOLEAN,
    "analise_recursal" TEXT,
    "credito_tributario" TEXT,
    "comercializado" BOOLEAN,
    "ano_comercializacao" INTEGER,
    "tarja" TEXT,
    "publicado_em" TIMESTAMP(6) NOT NULL,
    "extraido_em" TIMESTAMP(6) NOT NULL,
    "arquivo_origem" TEXT NOT NULL,

    CONSTRAINT "etl_cmed_pkey" PRIMARY KEY ("codigo_ggrem")
);

-- CreateTable
CREATE TABLE "etl_cmed_precos" (
    "id" BIGSERIAL NOT NULL,
    "codigo_ggrem" TEXT NOT NULL,
    "publicado_em" TIMESTAMP(6) NOT NULL,
    "tipo_preco" TEXT NOT NULL,
    "aliquota_icms" DECIMAL(65,30),
    "alc" BOOLEAN NOT NULL,
    "sem_impostos" BOOLEAN NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "possui_asterisco" BOOLEAN NOT NULL,
    "extraido_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "etl_cmed_precos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etl_catmat" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo_br" TEXT NOT NULL,
    "descricao" TEXT,
    "principio_ativo" TEXT NOT NULL,
    "concentracao" TEXT,
    "forma_farmaceutica" TEXT,
    "unidade_fornecimento" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etl_catmat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "taxa_aceitacao" DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    "categorias" TEXT[],
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "email" TEXT,
    "senha_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COMPRADOR',
    "perfil" "Perfil",
    "status" "UsuarioStatus" NOT NULL DEFAULT 'PENDENTE',
    "unidade_id" TEXT,
    "tenant_schema" TEXT,
    "permissoes_extras" JSONB,
    "justificativa" TEXT,
    "motivo_recusa" TEXT,
    "aprovado_por" TEXT,
    "aprovado_em" TIMESTAMP(3),
    "fornecedor_id" TEXT,
    "telefone" TEXT,
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fornecedor_nome" TEXT NOT NULL,
    "fornecedor_cnpj" TEXT,
    "processo_licitatorio" TEXT,
    "numero_pregao" TEXT,
    "numero_edital" TEXT,
    "vigencia_inicio" TIMESTAMP(3) NOT NULL,
    "vigencia_fim" TIMESTAMP(3) NOT NULL,
    "valor_teto" DECIMAL(12,2) NOT NULL,
    "valor_consumido" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "status" "AtaStatus" NOT NULL DEFAULT 'ATIVA',
    "documento_pdf_url" TEXT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "atas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos_ata" (
    "id" TEXT NOT NULL,
    "ata_id" TEXT NOT NULL,
    "catmat_codigo" TEXT,
    "nome" TEXT NOT NULL,
    "unidade_fornecimento" TEXT,
    "unidade_ata" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "qtde_inicial" INTEGER NOT NULL,
    "quantidade_usada" INTEGER NOT NULL DEFAULT 0,
    "saldo_atual" INTEGER,
    "valor_total_item" DECIMAL(12,2),
    "preco_bps" DECIMAL(10,2),
    "preco_cmed" DECIMAL(10,2),
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicamentos_ata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ata_consumos" (
    "id" TEXT NOT NULL,
    "ata_id" TEXT NOT NULL,
    "ata_item_id" TEXT NOT NULL,
    "pedido_id" TEXT,
    "data_consumo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantidade" INTEGER NOT NULL,
    "valor_unitario" DECIMAL(10,2) NOT NULL,
    "valor_total" DECIMAL(12,2) NOT NULL,
    "setor_solicitante" TEXT,
    "observacao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ata_consumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_compra" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "PedidoStatus" NOT NULL DEFAULT 'PENDENTE',
    "ata_id" TEXT,
    "fornecedor_id" TEXT,
    "valor_total" DECIMAL(12,2) NOT NULL,
    "data_solicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "justificativa" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pedidos_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "medicamento_id" TEXT,
    "medicamento_nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "valor_total" DECIMAL(12,2) NOT NULL,
    "ata_item_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "dados_antes" JSONB,
    "dados_depois" JSONB,
    "justificativa" TEXT,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_fiscais" (
    "id" TEXT NOT NULL,
    "numero_nf" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "chave_acesso" TEXT,
    "data_emissao" TIMESTAMP(3) NOT NULL,
    "data_recebimento" TIMESTAMP(3),
    "fornecedor_id" TEXT NOT NULL,
    "pedido_compra_id" TEXT,
    "status" "NotaFiscalStatus" NOT NULL DEFAULT 'PENDENTE',
    "valor_total" DECIMAL(12,2) NOT NULL,
    "xml_url" TEXT,
    "observacoes" TEXT,
    "conferido_por" TEXT,
    "conferido_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nota_fiscal_itens" (
    "id" TEXT NOT NULL,
    "nota_fiscal_id" TEXT NOT NULL,
    "catmat_codigo" TEXT,
    "medicamento_nome" TEXT NOT NULL,
    "numero_lote" TEXT NOT NULL,
    "data_validade" DATE NOT NULL,
    "quantidade_esperada" INTEGER NOT NULL,
    "quantidade_recebida" INTEGER,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "divergencia" BOOLEAN NOT NULL DEFAULT false,
    "observacao_divergencia" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nota_fiscal_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cd_estoque_lotes" (
    "id" TEXT NOT NULL,
    "nota_fiscal_item_id" TEXT NOT NULL,
    "catmat_codigo" TEXT,
    "medicamento_nome" TEXT NOT NULL,
    "numero_lote" TEXT NOT NULL,
    "data_validade" DATE NOT NULL,
    "quantidade_inicial" INTEGER NOT NULL,
    "quantidade_atual" INTEGER NOT NULL,
    "status" "CdEstoqueLoteStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cd_estoque_lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recalls" (
    "id" TEXT NOT NULL,
    "catmat_codigo" TEXT,
    "numero_lote" TEXT,
    "medicamento_nome" TEXT,
    "fonte" TEXT DEFAULT 'ANVISA',
    "risco" TEXT,
    "motivo" TEXT NOT NULL,
    "autoridade_emissora" TEXT,
    "numero_anvisa" TEXT,
    "data_emissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_expiracao" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recalls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_cd" (
    "id" TEXT NOT NULL,
    "tipo" "AlertaCdTipo" NOT NULL,
    "referencia_id" TEXT NOT NULL,
    "referencia_tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "AlertaCdStatus" NOT NULL DEFAULT 'NOVO',
    "perfis_destinatarios" TEXT[],
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lido_em" TIMESTAMP(3),
    "lido_por" TEXT,

    CONSTRAINT "alertas_cd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cd_estoque_minimo" (
    "id" TEXT NOT NULL,
    "medicamento_nome" TEXT NOT NULL,
    "catmat_codigo" TEXT,
    "quantidade_minima" INTEGER NOT NULL DEFAULT 0,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cd_estoque_minimo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnes" TEXT,
    "tipo" "TipoUnidade" NOT NULL DEFAULT 'UBS',
    "endereco" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "responsavel" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "tenant_schema" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_reposicao" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "PedidoReposicaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "urgencia" "PedidoReposicaoUrgencia" NOT NULL DEFAULT 'BAIXA',
    "unidade_id" TEXT NOT NULL,
    "solicitado_por_id" TEXT NOT NULL,
    "motorista_id" TEXT,
    "justificativa" TEXT,
    "motivo_rejeicao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pedidos_reposicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_reposicao_itens" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "catmat_codigo" TEXT,
    "medicamento_nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_reposicao_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "prontuario" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cartao_sus" TEXT,
    "nome_completo" TEXT NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "orientacao_sexual" TEXT,
    "identidade_genero" TEXT,
    "nome_social" TEXT,
    "municipio_nascimento" TEXT,
    "nacionalidade" TEXT NOT NULL DEFAULT 'BRASILEIRA',
    "pais_nascimento" TEXT NOT NULL DEFAULT 'BRASIL',
    "cor_raca" TEXT NOT NULL DEFAULT 'Não informada',
    "etnia" TEXT,
    "tipo_sanguineo" TEXT,
    "prontuarios_antigos" TEXT,
    "alergias" TEXT,
    "familia" TEXT,
    "area" TEXT,
    "subarea" TEXT,
    "escolaridade" TEXT,
    "celular" TEXT NOT NULL DEFAULT '',
    "telefone" TEXT,
    "email" TEXT,
    "nome_mae" TEXT,
    "mae_desconhecida" BOOLEAN NOT NULL DEFAULT false,
    "nome_pai" TEXT,
    "pai_desconhecido" BOOLEAN NOT NULL DEFAULT false,
    "rg" TEXT,
    "orgao_emissor" TEXT,
    "uf_rg" TEXT,
    "data_expedicao_rg" DATE,
    "nis" TEXT,
    "certidao_nascimento" TEXT,
    "data_obito" DATE,
    "titulo_eleitor" TEXT,
    "estado_civil" TEXT,
    "funcionario_externo" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "profissao_cbo" TEXT,
    "local_trabalho" TEXT,
    "situacao_rua" BOOLEAN NOT NULL DEFAULT false,
    "cep" TEXT NOT NULL,
    "tipo_logradouro" TEXT NOT NULL DEFAULT 'RUA',
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "complemento" TEXT,
    "municipio" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL DEFAULT 'URBANA',
    "unidade_origem_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fila_regulacao" (
    "id" TEXT NOT NULL,
    "unidade_esf_id" TEXT NOT NULL,
    "responsavel_encaminhamento" TEXT NOT NULL,
    "acs_responsavel" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "tipo_atendimento" "TipoAtendimento" NOT NULL DEFAULT 'SUS',
    "procedimento_solicitado" TEXT NOT NULL,
    "observacao_clinica" TEXT,
    "anexo_url" TEXT,
    "data_agendada" DATE,
    "hora_agendada" TEXT,
    "local_agendamento" TEXT,
    "status_agendamento" "StatusAgendamento" NOT NULL DEFAULT 'AGUARDANDO_REGULACAO',
    "criado_por_usuario_id" TEXT NOT NULL,
    "agendado_por_usuario_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fila_regulacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_imports" (
    "id" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "original_filename" TEXT,
    "file_data" BYTEA,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "rows_found" INTEGER,
    "rows_imported" INTEGER,
    "error_log" TEXT,
    "processed_at" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_import_rows" (
    "id" TEXT NOT NULL,
    "import_id" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL,
    "paciente_id" TEXT,
    "queue_entry_id" TEXT,
    "error" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_entries" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "procedimento_id" TEXT,
    "import_id" TEXT,
    "posicao" INTEGER NOT NULL,
    "status" "QueueEntryStatus" NOT NULL DEFAULT 'PENDING',
    "data_agendada" DATE,
    "notificado_em" TIMESTAMP(3),
    "respondido_em" TIMESTAMP(3),
    "expira_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages_log" (
    "id" TEXT NOT NULL,
    "queue_entry_id" TEXT,
    "paciente_id" TEXT,
    "direction" "MessageDirection" NOT NULL,
    "wamid" TEXT,
    "template_name" TEXT,
    "body" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'QUEUED',
    "raw_payload" JSONB,
    "error" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etl_bps_registro_hash_key" ON "etl_bps"("registro_hash");

-- CreateIndex
CREATE INDEX "etl_bps_codigo_br_idx" ON "etl_bps"("codigo_br");

-- CreateIndex
CREATE INDEX "etl_bps_ano_compra_idx" ON "etl_bps"("ano_compra");

-- CreateIndex
CREATE INDEX "etl_bps_anvisa_idx" ON "etl_bps"("anvisa");

-- CreateIndex
CREATE INDEX "etl_bps_cnpj_fornecedor_idx" ON "etl_bps"("cnpj_fornecedor");

-- CreateIndex
CREATE INDEX "etl_bps_cnpj_instituicao_idx" ON "etl_bps"("cnpj_instituicao");

-- CreateIndex
CREATE INDEX "etl_bps_compra_idx" ON "etl_bps"("compra");

-- CreateIndex
CREATE INDEX "etl_bps_uf_idx" ON "etl_bps"("uf");

-- CreateIndex
CREATE INDEX "etl_cmed_produto_idx" ON "etl_cmed"("produto");

-- CreateIndex
CREATE INDEX "etl_cmed_ean_1_idx" ON "etl_cmed"("ean_1");

-- CreateIndex
CREATE INDEX "etl_cmed_registro_idx" ON "etl_cmed"("registro");

-- CreateIndex
CREATE INDEX "etl_cmed_precos_codigo_ggrem_idx" ON "etl_cmed_precos"("codigo_ggrem");

-- CreateIndex
CREATE INDEX "etl_cmed_precos_publicado_em_idx" ON "etl_cmed_precos"("publicado_em");

-- CreateIndex
CREATE INDEX "etl_cmed_precos_tipo_preco_idx" ON "etl_cmed_precos"("tipo_preco");

-- CreateIndex
CREATE UNIQUE INDEX "etl_cmed_precos_codigo_ggrem_publicado_em_tipo_preco_aliquo_key" ON "etl_cmed_precos"("codigo_ggrem", "publicado_em", "tipo_preco", "aliquota_icms", "alc", "sem_impostos");

-- CreateIndex
CREATE INDEX "etl_catmat_codigo_br_idx" ON "etl_catmat"("codigo_br");

-- CreateIndex
CREATE INDEX "etl_catmat_principio_ativo_idx" ON "etl_catmat"("principio_ativo");

-- CreateIndex
CREATE INDEX "etl_catmat_descricao_idx" ON "etl_catmat"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "etl_catmat_codigo_br_principio_ativo_concentracao_forma_far_key" ON "etl_catmat"("codigo_br", "principio_ativo", "concentracao", "forma_farmaceutica", "unidade_fornecimento");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_cnpj_key" ON "fornecedores"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_fornecedor_id_idx" ON "usuarios"("fornecedor_id");

-- CreateIndex
CREATE INDEX "usuarios_status_idx" ON "usuarios"("status");

-- CreateIndex
CREATE UNIQUE INDEX "atas_numero_key" ON "atas"("numero");

-- CreateIndex
CREATE INDEX "atas_fornecedor_cnpj_idx" ON "atas"("fornecedor_cnpj");

-- CreateIndex
CREATE INDEX "medicamentos_ata_ata_id_idx" ON "medicamentos_ata"("ata_id");

-- CreateIndex
CREATE INDEX "ata_consumos_ata_id_idx" ON "ata_consumos"("ata_id");

-- CreateIndex
CREATE INDEX "ata_consumos_ata_item_id_idx" ON "ata_consumos"("ata_item_id");

-- CreateIndex
CREATE INDEX "ata_consumos_pedido_id_idx" ON "ata_consumos"("pedido_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_compra_numero_key" ON "pedidos_compra"("numero");

-- CreateIndex
CREATE INDEX "pedidos_compra_ata_id_idx" ON "pedidos_compra"("ata_id");

-- CreateIndex
CREATE INDEX "pedidos_compra_status_idx" ON "pedidos_compra"("status");

-- CreateIndex
CREATE INDEX "pedidos_compra_fornecedor_id_idx" ON "pedidos_compra"("fornecedor_id");

-- CreateIndex
CREATE INDEX "pedido_itens_pedido_id_idx" ON "pedido_itens"("pedido_id");

-- CreateIndex
CREATE INDEX "pedido_itens_ata_item_id_idx" ON "pedido_itens"("ata_item_id");

-- CreateIndex
CREATE INDEX "auditorias_usuario_id_idx" ON "auditorias"("usuario_id");

-- CreateIndex
CREATE INDEX "auditorias_data_hora_idx" ON "auditorias"("data_hora");

-- CreateIndex
CREATE UNIQUE INDEX "notas_fiscais_chave_acesso_key" ON "notas_fiscais"("chave_acesso");

-- CreateIndex
CREATE INDEX "notas_fiscais_fornecedor_id_idx" ON "notas_fiscais"("fornecedor_id");

-- CreateIndex
CREATE INDEX "notas_fiscais_pedido_compra_id_idx" ON "notas_fiscais"("pedido_compra_id");

-- CreateIndex
CREATE INDEX "notas_fiscais_status_idx" ON "notas_fiscais"("status");

-- CreateIndex
CREATE INDEX "nota_fiscal_itens_nota_fiscal_id_idx" ON "nota_fiscal_itens"("nota_fiscal_id");

-- CreateIndex
CREATE INDEX "nota_fiscal_itens_catmat_codigo_idx" ON "nota_fiscal_itens"("catmat_codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cd_estoque_lotes_nota_fiscal_item_id_key" ON "cd_estoque_lotes"("nota_fiscal_item_id");

-- CreateIndex
CREATE INDEX "cd_estoque_lotes_catmat_codigo_numero_lote_idx" ON "cd_estoque_lotes"("catmat_codigo", "numero_lote");

-- CreateIndex
CREATE INDEX "cd_estoque_lotes_status_idx" ON "cd_estoque_lotes"("status");

-- CreateIndex
CREATE INDEX "recalls_catmat_codigo_numero_lote_idx" ON "recalls"("catmat_codigo", "numero_lote");

-- CreateIndex
CREATE INDEX "recalls_ativo_idx" ON "recalls"("ativo");

-- CreateIndex
CREATE INDEX "alertas_cd_status_idx" ON "alertas_cd"("status");

-- CreateIndex
CREATE INDEX "alertas_cd_tipo_idx" ON "alertas_cd"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "cd_estoque_minimo_medicamento_nome_key" ON "cd_estoque_minimo"("medicamento_nome");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_cnes_key" ON "unidades"("cnes");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_tenant_schema_key" ON "unidades"("tenant_schema");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_reposicao_numero_key" ON "pedidos_reposicao"("numero");

-- CreateIndex
CREATE INDEX "pedidos_reposicao_unidade_id_idx" ON "pedidos_reposicao"("unidade_id");

-- CreateIndex
CREATE INDEX "pedidos_reposicao_status_idx" ON "pedidos_reposicao"("status");

-- CreateIndex
CREATE INDEX "pedidos_reposicao_motorista_id_idx" ON "pedidos_reposicao"("motorista_id");

-- CreateIndex
CREATE INDEX "pedido_reposicao_itens_pedido_id_idx" ON "pedido_reposicao_itens"("pedido_id");

-- CreateIndex
CREATE INDEX "pedido_reposicao_itens_catmat_codigo_idx" ON "pedido_reposicao_itens"("catmat_codigo");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_prontuario_key" ON "pacientes"("prontuario");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cpf_key" ON "pacientes"("cpf");

-- CreateIndex
CREATE INDEX "pacientes_unidade_origem_id_idx" ON "pacientes"("unidade_origem_id");

-- CreateIndex
CREATE INDEX "fila_regulacao_unidade_esf_id_idx" ON "fila_regulacao"("unidade_esf_id");

-- CreateIndex
CREATE INDEX "fila_regulacao_status_agendamento_idx" ON "fila_regulacao"("status_agendamento");

-- CreateIndex
CREATE INDEX "fila_regulacao_paciente_id_idx" ON "fila_regulacao"("paciente_id");

-- CreateIndex
CREATE INDEX "fila_regulacao_criado_por_usuario_id_idx" ON "fila_regulacao"("criado_por_usuario_id");

-- CreateIndex
CREATE INDEX "pdf_import_rows_import_id_idx" ON "pdf_import_rows"("import_id");

-- CreateIndex
CREATE INDEX "queue_entries_procedimento_id_status_posicao_idx" ON "queue_entries"("procedimento_id", "status", "posicao");

-- CreateIndex
CREATE INDEX "queue_entries_paciente_id_idx" ON "queue_entries"("paciente_id");

-- CreateIndex
CREATE INDEX "messages_log_queue_entry_id_idx" ON "messages_log"("queue_entry_id");

-- CreateIndex
CREATE INDEX "messages_log_wamid_idx" ON "messages_log"("wamid");

-- AddForeignKey
ALTER TABLE "etl_cmed_precos" ADD CONSTRAINT "etl_cmed_precos_codigo_ggrem_fkey" FOREIGN KEY ("codigo_ggrem") REFERENCES "etl_cmed"("codigo_ggrem") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atas" ADD CONSTRAINT "atas_fornecedor_cnpj_fkey" FOREIGN KEY ("fornecedor_cnpj") REFERENCES "fornecedores"("cnpj") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos_ata" ADD CONSTRAINT "medicamentos_ata_ata_id_fkey" FOREIGN KEY ("ata_id") REFERENCES "atas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ata_consumos" ADD CONSTRAINT "ata_consumos_ata_id_fkey" FOREIGN KEY ("ata_id") REFERENCES "atas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ata_consumos" ADD CONSTRAINT "ata_consumos_ata_item_id_fkey" FOREIGN KEY ("ata_item_id") REFERENCES "medicamentos_ata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ata_consumos" ADD CONSTRAINT "ata_consumos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_ata_id_fkey" FOREIGN KEY ("ata_id") REFERENCES "atas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_ata_item_id_fkey" FOREIGN KEY ("ata_item_id") REFERENCES "medicamentos_ata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fiscais" ADD CONSTRAINT "notas_fiscais_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fiscais" ADD CONSTRAINT "notas_fiscais_pedido_compra_id_fkey" FOREIGN KEY ("pedido_compra_id") REFERENCES "pedidos_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota_fiscal_itens" ADD CONSTRAINT "nota_fiscal_itens_nota_fiscal_id_fkey" FOREIGN KEY ("nota_fiscal_id") REFERENCES "notas_fiscais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cd_estoque_lotes" ADD CONSTRAINT "cd_estoque_lotes_nota_fiscal_item_id_fkey" FOREIGN KEY ("nota_fiscal_item_id") REFERENCES "nota_fiscal_itens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_reposicao" ADD CONSTRAINT "pedidos_reposicao_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_reposicao" ADD CONSTRAINT "pedidos_reposicao_solicitado_por_id_fkey" FOREIGN KEY ("solicitado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_reposicao" ADD CONSTRAINT "pedidos_reposicao_motorista_id_fkey" FOREIGN KEY ("motorista_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_reposicao_itens" ADD CONSTRAINT "pedido_reposicao_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos_reposicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_unidade_origem_id_fkey" FOREIGN KEY ("unidade_origem_id") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fila_regulacao" ADD CONSTRAINT "fila_regulacao_unidade_esf_id_fkey" FOREIGN KEY ("unidade_esf_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fila_regulacao" ADD CONSTRAINT "fila_regulacao_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fila_regulacao" ADD CONSTRAINT "fila_regulacao_criado_por_usuario_id_fkey" FOREIGN KEY ("criado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fila_regulacao" ADD CONSTRAINT "fila_regulacao_agendado_por_usuario_id_fkey" FOREIGN KEY ("agendado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_import_rows" ADD CONSTRAINT "pdf_import_rows_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "pdf_imports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "pdf_imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_log" ADD CONSTRAINT "messages_log_queue_entry_id_fkey" FOREIGN KEY ("queue_entry_id") REFERENCES "queue_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
