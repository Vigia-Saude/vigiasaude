-- CreateEnum
CREATE TYPE "PacienteFilaStatus" AS ENUM ('AGUARDANDO', 'CONVOCADO', 'CONFIRMADO', 'RECONFIRMADO', 'RECUSOU', 'NAO_RESPONDEU', 'CANCELADO');

-- CreateEnum
CREATE TYPE "NivelUrgencia" AS ENUM ('NORMAL', 'AMARELO', 'VERMELHO');

-- CreateEnum
CREATE TYPE "MotivoRecusa" AS ENUM ('MELHORA_SINTOMAS', 'SEM_TRANSPORTE', 'COMPROMISSO_TRABALHO', 'PROBLEMAS_FAMILIARES', 'JA_CONSULTOU_PARTICULAR', 'OUTRO');

-- CreateEnum
CREATE TYPE "CicloStatus" AS ENUM ('CONVOCADO', 'CONFIRMADO', 'RECUSADO', 'EXPIRADO');

-- AlterTable
ALTER TABLE "pacientes" ADD COLUMN     "score_confianca" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "queue_entries" ADD COLUMN     "nivel_urgencia" "NivelUrgencia" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "procedimento_nome" TEXT,
ADD COLUMN     "status_paciente" "PacienteFilaStatus" NOT NULL DEFAULT 'AGUARDANDO',
ADD COLUMN     "unidade_id" TEXT;

-- CreateTable
CREATE TABLE "ciclos_confirmacao" (
    "id" TEXT NOT NULL,
    "queue_entry_id" TEXT NOT NULL,
    "unidade_id" TEXT,
    "etapa" INTEGER NOT NULL,
    "tentativa" INTEGER NOT NULL DEFAULT 1,
    "status" "CicloStatus" NOT NULL DEFAULT 'CONVOCADO',
    "template_name" TEXT NOT NULL,
    "callback_id" TEXT NOT NULL,
    "message_id" TEXT,
    "enviado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "respondido_em" TIMESTAMP(3),
    "resposta" TEXT,
    "motivo_recusa" "MotivoRecusa",
    "motivo_texto_livre" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ciclos_confirmacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes_regulacao" (
    "id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "qtd_confirmacoes" INTEGER NOT NULL DEFAULT 2,
    "dias_antes_confirmacao" INTEGER[] DEFAULT ARRAY[7, 1]::INTEGER[],
    "qtd_reenvios" INTEGER NOT NULL DEFAULT 2,
    "intervalo_reenvio_horas" INTEGER NOT NULL DEFAULT 12,
    "timeout_resposta_horas" INTEGER NOT NULL DEFAULT 24,
    "horario_inicio" TEXT NOT NULL DEFAULT '07:00',
    "horario_fim" TEXT NOT NULL DEFAULT '20:00',
    "timezone" TEXT NOT NULL DEFAULT 'America/Campo_Grande',
    "template_confirmacao" TEXT NOT NULL DEFAULT 'confirmacao_agendamento',
    "template_reconfirmacao" TEXT NOT NULL DEFAULT 'reconfirmacao_agendamento',
    "template_coleta_motivo" TEXT NOT NULL DEFAULT 'coleta_motivo_recusa',
    "template_convocacao" TEXT NOT NULL DEFAULT 'convocacao_vaga',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_regulacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_absenteismo" (
    "id" TEXT NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "unidade_id" TEXT,
    "queue_entry_id" TEXT,
    "tipo" TEXT NOT NULL,
    "motivo" TEXT,
    "delta" INTEGER NOT NULL,
    "score_resultante" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_absenteismo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ciclos_confirmacao_callback_id_key" ON "ciclos_confirmacao"("callback_id");

-- CreateIndex
CREATE INDEX "ciclos_confirmacao_queue_entry_id_idx" ON "ciclos_confirmacao"("queue_entry_id");

-- CreateIndex
CREATE INDEX "ciclos_confirmacao_status_expira_em_idx" ON "ciclos_confirmacao"("status", "expira_em");

-- CreateIndex
CREATE INDEX "ciclos_confirmacao_callback_id_idx" ON "ciclos_confirmacao"("callback_id");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_regulacao_unidade_id_key" ON "configuracoes_regulacao"("unidade_id");

-- CreateIndex
CREATE INDEX "historico_absenteismo_paciente_id_idx" ON "historico_absenteismo"("paciente_id");

-- CreateIndex
CREATE INDEX "queue_entries_unidade_id_status_paciente_nivel_urgencia_pos_idx" ON "queue_entries"("unidade_id", "status_paciente", "nivel_urgencia", "posicao");

-- AddForeignKey
ALTER TABLE "ciclos_confirmacao" ADD CONSTRAINT "ciclos_confirmacao_queue_entry_id_fkey" FOREIGN KEY ("queue_entry_id") REFERENCES "queue_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_absenteismo" ADD CONSTRAINT "historico_absenteismo_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
