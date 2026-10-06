-- Additive migration. Queue status changes reserve/release slots even for legacy callers.
ALTER TABLE pdf_imports ADD COLUMN queue_base_position integer, ADD COLUMN unidade_responsavel_id text;
ALTER TABLE pdf_import_rows ADD COLUMN source_index integer, ADD COLUMN source_page integer;
CREATE UNIQUE INDEX pdf_import_rows_import_id_source_index_key ON pdf_import_rows(import_id,source_index);
ALTER TABLE pacientes ALTER COLUMN cpf DROP NOT NULL;
ALTER TABLE queue_entries ADD COLUMN bloqueio_envio text, ADD COLUMN local_atendimento text, ADD COLUMN unidade_solicitante text;
ALTER TABLE ciclos_confirmacao ADD COLUMN tipo text NOT NULL DEFAULT 'CONFIRMACAO', ADD COLUMN delivery_status text NOT NULL DEFAULT 'QUEUED', ADD COLUMN delivered_at timestamp(3), ADD COLUMN envio_erro text;
ALTER TABLE slots_agenda ADD COLUMN ocupadas integer NOT NULL DEFAULT 0, ADD COLUMN reposicao_pendente boolean NOT NULL DEFAULT false;
ALTER TABLE slots_agenda ADD CONSTRAINT slots_capacity_guard CHECK (ocupadas >= 0 AND ocupadas <= capacidade_total);
CREATE TABLE reservas_agenda (
 id text PRIMARY KEY, slot_id text NOT NULL REFERENCES slots_agenda(id),
 queue_entry_id text NOT NULL UNIQUE REFERENCES queue_entries(id) ON DELETE CASCADE,
 ativa boolean NOT NULL DEFAULT true, criado_em timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX reservas_agenda_slot_idx ON reservas_agenda(slot_id,ativa);
CREATE TABLE regulacao_outbox (
 id text PRIMARY KEY, callback_id text NOT NULL UNIQUE,
 queue_entry_id text NOT NULL REFERENCES queue_entries(id) ON DELETE CASCADE,
 payload jsonb NOT NULL, status text NOT NULL DEFAULT 'PENDING', attempts integer NOT NULL DEFAULT 0,
 error text, atualizado_em timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, criado_em timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX regulacao_outbox_pending_idx ON regulacao_outbox(status,criado_em);
CREATE TABLE regulacao_eventos (event_id text PRIMARY KEY, callback_id text NOT NULL, criado_em timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE FUNCTION public.regulacao_reservation_count() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' AND NEW.slot_id<>OLD.slot_id AND OLD.ativa THEN RAISE EXCEPTION 'Não é permitido mover uma reserva entre agendas.'; END IF;
 IF TG_OP='DELETE' THEN
  IF OLD.ativa THEN UPDATE slots_agenda SET ocupadas=ocupadas-1, reposicao_pendente=true WHERE id=OLD.slot_id; END IF;
  RETURN OLD;
 END IF;
 IF NEW.ativa AND (TG_OP='INSERT' OR NOT OLD.ativa) THEN
  UPDATE slots_agenda SET ocupadas=ocupadas+1 WHERE id=NEW.slot_id AND ocupadas<capacidade_total;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sem vagas disponíveis para esta agenda.' USING ERRCODE='23514'; END IF;
 ELSIF TG_OP='UPDATE' AND OLD.ativa AND NOT NEW.ativa THEN
  UPDATE slots_agenda SET ocupadas=ocupadas-1, reposicao_pendente=true WHERE id=OLD.slot_id;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER regulacao_reservation_count BEFORE INSERT OR UPDATE OR DELETE ON reservas_agenda FOR EACH ROW EXECUTE FUNCTION public.regulacao_reservation_count();

-- Existing reservations are reconciled only against explicitly configured capacities.
-- An existing excess aborts the migration instead of silently increasing capacity.
INSERT INTO reservas_agenda(id,slot_id,queue_entry_id)
 SELECT gen_random_uuid()::text,s.id,q.id FROM queue_entries q JOIN slots_agenda s
 ON s.unidade_id=q.unidade_id AND s.procedimento=COALESCE(q.procedimento_nome,q.procedimento_id,'Regulação') AND s.data=q.data_agendada
 WHERE q.status_paciente IN ('CONVOCADO','CONFIRMADO','RECONFIRMADO');
UPDATE queue_entries q SET bloqueio_envio='Agenda sem capacidade definida: conciliar antes de novos disparos.'
 WHERE q.status_paciente IN ('CONVOCADO','CONFIRMADO','RECONFIRMADO') AND NOT EXISTS (SELECT 1 FROM reservas_agenda r WHERE r.queue_entry_id=q.id);

CREATE FUNCTION public.regulacao_queue_reserve() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE sid text;
BEGIN
 IF NEW.status_paciente IN ('CONVOCADO','CONFIRMADO','RECONFIRMADO') THEN
  IF TG_OP='UPDATE' AND OLD.status_paciente IN ('CONVOCADO','CONFIRMADO','RECONFIRMADO') AND
    (NEW.unidade_id IS DISTINCT FROM OLD.unidade_id OR NEW.procedimento_nome IS DISTINCT FROM OLD.procedimento_nome OR NEW.data_agendada IS DISTINCT FROM OLD.data_agendada)
  THEN RAISE EXCEPTION 'Libere a reserva antes de alterar a agenda.'; END IF;
  SELECT id INTO sid FROM slots_agenda WHERE unidade_id=NEW.unidade_id AND procedimento=COALESCE(NEW.procedimento_nome,NEW.procedimento_id,'Regulação') AND data=NEW.data_agendada FOR UPDATE;
  IF sid IS NULL THEN RAISE EXCEPTION 'Defina a capacidade desta agenda antes de convocar.' USING ERRCODE='23514'; END IF;
  UPDATE reservas_agenda SET slot_id=sid,ativa=true WHERE queue_entry_id=NEW.id;
  IF NOT FOUND THEN
    INSERT INTO reservas_agenda(id,slot_id,queue_entry_id,ativa) VALUES(gen_random_uuid()::text,sid,NEW.id,true);
  END IF;
 ELSE
  UPDATE reservas_agenda SET ativa=false WHERE queue_entry_id=NEW.id AND ativa;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER regulacao_queue_reserve AFTER INSERT OR UPDATE OF status_paciente,unidade_id,procedimento_nome,data_agendada ON queue_entries FOR EACH ROW EXECUTE FUNCTION public.regulacao_queue_reserve();

ALTER TABLE reservas_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulacao_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulacao_eventos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON reservas_agenda,regulacao_outbox,regulacao_eventos FROM anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.regulacao_reservation_count(),public.regulacao_queue_reserve() FROM PUBLIC;
