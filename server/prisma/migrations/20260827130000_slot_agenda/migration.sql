-- CreateTable
CREATE TABLE "slots_agenda" (
    "id" TEXT NOT NULL,
    "unidade_id" TEXT NOT NULL,
    "procedimento" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "capacidade_total" INTEGER NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'MANUAL',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slots_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "slots_agenda_unidade_id_data_idx" ON "slots_agenda"("unidade_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "slots_agenda_unidade_id_procedimento_data_key" ON "slots_agenda"("unidade_id", "procedimento", "data");
