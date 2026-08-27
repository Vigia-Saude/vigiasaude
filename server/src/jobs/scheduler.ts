import cron, { ScheduledTask } from 'node-cron';
import { verificarTimeouts, dispararProgramados } from '../services/confirmacao.service';

// ====================================================================
// Agendador do módulo de Confirmação Automatizada (cron jobs — seção 7)
//
// Registrado após app.listen e finalizado no gracefulShutdown.
// Desabilite com CONFIRMACAO_CRON_ENABLED=false (útil em testes ou quando
// houver mais de uma instância — nesse caso prefira um trigger externo).
// ====================================================================

const TIMEZONE = process.env.CRON_TIMEZONE || 'America/Campo_Grande';

let tarefas: ScheduledTask[] = [];
let rodandoTimeouts = false;
let rodandoProgramados = false;

async function comGuarda(nome: string, jaRodando: () => boolean, setRodando: (v: boolean) => void, fn: () => Promise<unknown>) {
  if (jaRodando()) {
    console.log(`[scheduler] "${nome}" ainda em execução — pulando este tick.`);
    return;
  }
  setRodando(true);
  try {
    const resultado = await fn();
    console.log(`[scheduler] "${nome}" concluído:`, resultado);
  } catch (err) {
    console.error(`[scheduler] "${nome}" falhou:`, err);
  } finally {
    setRodando(false);
  }
}

export function startSchedulers(): void {
  if (process.env.CONFIRMACAO_CRON_ENABLED === 'false') {
    console.log('[scheduler] Cron de confirmação desabilitado (CONFIRMACAO_CRON_ENABLED=false).');
    return;
  }
  if (tarefas.length > 0) return; // evita registro duplicado

  // 7.1 — Verificação de timeouts / reenvios (a cada 15 minutos)
  tarefas.push(
    cron.schedule(
      '*/15 * * * *',
      () =>
        comGuarda('verificarTimeouts', () => rodandoTimeouts, (v) => (rodandoTimeouts = v), () =>
          verificarTimeouts()
        ),
      { timezone: TIMEZONE }
    )
  );

  // 7.2 — Disparos automáticos programados (diário, 08:00 local)
  tarefas.push(
    cron.schedule(
      '0 8 * * *',
      () =>
        comGuarda('dispararProgramados', () => rodandoProgramados, (v) => (rodandoProgramados = v), () =>
          dispararProgramados()
        ),
      { timezone: TIMEZONE }
    )
  );

  console.log(`[scheduler] Cron de confirmação iniciado (timezone=${TIMEZONE}).`);
}

export function stopSchedulers(): void {
  for (const t of tarefas) {
    try {
      t.stop();
    } catch {
      /* noop */
    }
  }
  tarefas = [];
}
