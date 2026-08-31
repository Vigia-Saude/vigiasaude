import cron, { ScheduledTask } from 'node-cron';
import { verificarTimeouts, dispararProgramados } from '../services/confirmacao.service';
import { pingDatabase } from '../config/prisma';

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
  if (tarefas.length > 0) return; // evita registro duplicado

  // Keepalive do banco — mantém o pool aquecido para que a primeira requisição
  // após um período ocioso (ex.: tela de login parada) não pegue uma conexão
  // morta reciclada pelo pooler do Supabase. Sempre ativo, mesmo com os crons
  // de confirmação desabilitados (desative com DB_KEEPALIVE_ENABLED=false).
  if (process.env.DB_KEEPALIVE_ENABLED !== 'false') {
    tarefas.push(
      cron.schedule('*/4 * * * *', () => {
        pingDatabase();
      })
    );
    // Aquecimento imediato no boot (não espera o primeiro tick de 4 min).
    pingDatabase();
    console.log('[scheduler] Keepalive do banco iniciado (ping a cada 4 min).');
  }

  if (process.env.CONFIRMACAO_CRON_ENABLED === 'false') {
    console.log('[scheduler] Cron de confirmação desabilitado (CONFIRMACAO_CRON_ENABLED=false).');
    return;
  }

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
