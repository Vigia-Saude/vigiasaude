import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
vi.mock('../config/prisma', () => ({ default: {} }));
import prisma from '../config/prisma';
import { CONFIG_PADRAO, convocarEntrada, processarResposta, verificarTimeouts } from '../services/confirmacao.service';
import { prepararDisparo, processarOutbox, parseCalendarDate, validPhone } from '../services/regulacaoConfiavel.service';
import { setMessagingGateway } from '../services/messaging';
import { ConfirmacaoController } from '../controllers/ConfirmacaoController';
const p: any = prisma;
let entries: any[], cycles: any[], outbox: any[], events: Set<string>;
let slot: any, patient: any, config: any, gateway: any;
function matches(row: any, where: any = {}): boolean {
  return Object.entries(where).every(([key, val]: any) => {
    if (val === undefined) return true;
    if (key === 'OR') return val.some((w: any) => matches(row, w));
    if (val && typeof val === 'object' && !(val instanceof Date)) {
      return (!val.in || val.in.includes(row[key])) && (val.not === undefined || row[key] !== val.not) &&
        (val.gte === undefined || row[key] >= val.gte) && (val.lt === undefined || row[key] < val.lt);
    }
    return val instanceof Date ? row[key]?.getTime() === val.getTime() : row[key] === val;
  });
}
function model(rows: any[]) {
  const find = (where: any) => rows.find(r => matches(r, where));
  return {
    findUnique: vi.fn(async ({ where }: any) => find(where) || null),
    findUniqueOrThrow: vi.fn(async ({ where }: any) => { const r = find(where); if (!r) throw Error('Missing record'); return r; }),
    findFirst: vi.fn(async ({ where }: any) => rows.filter(r => matches(r, where)).sort((a,b)=>a.posicao-b.posicao)[0] || null),
    findMany: vi.fn(async ({ where }: any = {}) => rows.filter(r => matches(r, where))),
    count: vi.fn(async ({ where }: any) => rows.filter(r => matches(r, where)).length),
    create: vi.fn(async ({ data }: any) => { const r = { id: `record-${rows.length}`, status:'PENDING', ...data }; rows.push(r); return r; }),
    update: vi.fn(async ({ where, data }: any) => Object.assign(find(where), data)),
    updateMany: vi.fn(async ({ where, data }: any) => { const rs=rows.filter(r=>matches(r,where)); rs.forEach(r=>Object.assign(r,data)); return {count:rs.length}; }),
  };
}
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });vi.setSystemTime(new Date('2026-10-06T16:00:00Z'));
  events=new Set();cycles=[];outbox=[];
  config={...CONFIG_PADRAO,timezone:'UTC',horarioInicio:'07:00',horarioFim:'20:00'};
  slot={id:'slot',ocupadas:0,capacidade_total:1,capacidadeTotal:1};
  patient={id:'patient',nomeCompleto:'PACIENTE DE TESTE',celular:'67999990001',scoreConfianca:90,cartaoSus:'700000000000001',dataNascimento:new Date('1980-01-01T00:00:00Z')};
  entries=[1,2].map(posicao=>({id:`entry-${posicao}`,pacienteId:'patient',unidadeId:'unit',procedimentoNome:'Exame',procedimentoId:null,
    dataAgendada:new Date('2026-10-20T00:00:00Z'),horaAgendada:'08:00',localAtendimento:'Local cadastrado',
    statusPaciente:'AGUARDANDO',status:'PENDING',nivelUrgencia:'NORMAL',posicao,bloqueioEnvio:null}));
  Object.assign(p,{queueEntry:model(entries),cicloConfirmacao:model(cycles),regulacaoOutbox:model(outbox),paciente:model([patient]),
    messageLog:model([]),historicoAbsenteismo:model([]),slotAgenda:model([slot]),configuracaoRegulacao:{findUnique:vi.fn(async()=>config)},
    unidade:model([{id:'unit',nome:'Unidade responsável'}]),$transaction:vi.fn(async(fn:any)=>Array.isArray(fn)?Promise.all(fn):fn(p)),
    $queryRaw:vi.fn(async(strings:any,...args:any[])=>{if(strings.join('').includes('INSERT INTO regulacao_eventos')){
      if(events.has(args[0]))return [];events.add(args[0]);return [{event_id:args[0]}];}return slot?[slot]:[];}),
  });
  gateway={enviarConfirmacao:vi.fn(async()=>({messageId:'wamid.test',status:'SENT'})),enviarConvocacao:vi.fn(async()=>({messageId:'wamid.test',status:'SENT'})),
    enviarLembrete:vi.fn(async()=>({messageId:'wamid.test',status:'SENT'})),consultarEnvio:vi.fn(async()=>({messageId:'wamid.test',status:'SENT'}))};
  setMessagingGateway(gateway);
});
afterEach(()=>{vi.useRealTimers();vi.unstubAllEnvs();setMessagingGateway(null)});
async function send(){await convocarEntrada('unit','entry-1');return cycles[0];}
describe('Regulação persistente: jornada e falhas',()=>{
  it('retentativa manual de falha técnica preserva vaga e tentativa; resultado incerto não repete',async()=>{
    gateway.enviarConvocacao.mockRejectedValueOnce(Object.assign(new Error('Pagamento recusado'),{definitive:true}));const failed=await send();
    expect(failed.deliveryStatus).toBe('FAILED');await convocarEntrada('unit','entry-1');
    expect(failed.status).toBe('EXPIRADO');expect(cycles[1].tentativa).toBe(1);expect(entries[0].statusPaciente).toBe('CONVOCADO');
    expect(gateway.enviarConvocacao).toHaveBeenCalledTimes(2);await expect(convocarEntrada('unit','entry-1')).rejects.toThrow('AGUARDANDO');
    cycles[1].deliveryStatus='UNKNOWN';await expect(convocarEntrada('unit','entry-1')).rejects.toThrow('AGUARDANDO');expect(gateway.enviarConvocacao).toHaveBeenCalledTimes(2);
  });
  it('configuração ausente em produção registra falha visível sem disparar',async()=>{
    setMessagingGateway(null);vi.stubEnv('NODE_ENV','production');vi.stubEnv('MESSAGING_GATEWAY','mock');
    const c=await send();expect(c.deliveryStatus).toBe('FAILED');expect(c.envioErro).toContain('Gateway real');
    expect(outbox[0].status).toBe('FAILED');expect(entries[0].statusPaciente).toBe('CONVOCADO');expect(patient.scoreConfianca).toBe(90);
  });
  it('bloqueia horário, nascimento e identificação ausentes antes de reservar ou enviar',async()=>{
    entries[0].horaAgendada=null;await expect(send()).rejects.toThrow('horário válido');entries[0].horaAgendada='08:00';
    patient.dataNascimento=null;await expect(send()).rejects.toThrow('nascimento');patient.dataNascimento=new Date('1980-01-01');
    patient.cartaoSus=null;p.pdfImportRow={findFirst:vi.fn(async()=>null)};await expect(send()).rejects.toThrow('identificação');expect(outbox).toHaveLength(0);expect(gateway.enviarConvocacao).not.toHaveBeenCalled();
  });
  it('cancelamento repetido não convoca uma segunda reposição mesmo com capacidade restante',async()=>{
    slot.capacidade_total=3;entries.push({...entries[1],id:'entry-3',posicao:3});const c=await send();
    await processarResposta(c.callbackId,{eventId:'cancel-1',resposta:'NAO'});
    await processarResposta(c.callbackId,{eventId:'cancel-1',resposta:'NAO'});
    await processarResposta(c.callbackId,{eventId:'cancel-2',resposta:'NAO'});
    expect(gateway.enviarConvocacao).toHaveBeenCalledTimes(2);expect(entries[2].statusPaciente).toBe('AGUARDANDO');
  });
  it('callback atrasado calcula prazo a partir da entrega real',async()=>{
    const c=await send();const delivered=new Date('2026-10-06T15:00:00Z');
    await processarResposta(c.callbackId,{eventId:'actual-delivery',eventType:'DELIVERY',deliveryStatus:'DELIVERED',timestamp:delivered.toISOString()});
    expect(c.deliveredAt.getTime()).toBe(delivered.getTime());expect(c.expiraEm.getTime()).toBe(delivered.getTime()+config.timeoutRespostaHoras*3600000);
  });

  it('não ultrapassa a posição anterior nem cria saída',async()=>{
    await expect(convocarEntrada('unit','entry-2')).rejects.toThrow('anterior');expect(outbox).toHaveLength(0);
  });
  it('capacidade ausente e zero impedem envio',async()=>{
    slot=null;await expect(convocarEntrada('unit','entry-1')).rejects.toThrow('capacidade');
    slot={id:'slot',ocupadas:0,capacidade_total:0};await expect(prepararDisparo({entry:entries[0],etapa:1,config,tipo:'CONVOCACAO'})).rejects.toThrow('Sem vagas');
    expect(outbox).toHaveLength(0);
  });
  it('saída é persistida antes do envio; aceitação não comprova entrega',async()=>{
    gateway.enviarConvocacao.mockImplementation(async()=>{expect(outbox[0].status).toBe('SENDING');expect(cycles[0].deliveryStatus).toBe('QUEUED');return {messageId:'wamid.real',status:'SENT'}});
    const c=await send();expect(c.deliveryStatus).toBe('ACCEPTED');expect(c.deliveredAt).toBeUndefined();expect(outbox[0].status).toBe('ACCEPTED');
  });
  it('timeout mantém reserva, não reenvia e reconcilia pelo callbackId',async()=>{
    gateway.enviarConvocacao.mockRejectedValue(new Error('timeout'));const c=await send();expect(c.deliveryStatus).toBe('UNKNOWN');expect(entries[0].statusPaciente).toBe('CONVOCADO');
    await processarOutbox(c.callbackId);expect(gateway.enviarConvocacao).toHaveBeenCalledTimes(1);expect(gateway.consultarEnvio).toHaveBeenCalledWith(c.callbackId);expect(outbox[0].status).toBe('ACCEPTED');
  });
  it('falha definitiva não penaliza paciente nem libera automaticamente',async()=>{
    gateway.enviarConvocacao.mockRejectedValue(Object.assign(new Error('Celular recusado'),{definitive:true}));const c=await send();
    expect(c.deliveryStatus).toBe('FAILED');expect(c.envioErro).toBe('Celular recusado');expect(patient.scoreConfianca).toBe(90);expect(entries[0].statusPaciente).toBe('CONVOCADO');
  });
  it('envio só aceito nunca gera ausência',async()=>{
    await send();vi.setSystemTime(new Date('2026-10-09T16:00:00Z'));const r=await verificarTimeouts();expect(r.naoResponderam).toBe(0);expect(patient.scoreConfianca).toBe(90);
  });
  it('entrega inicia prazo; atualização atrasada não rebaixa leitura',async()=>{
    const c=await send();vi.setSystemTime(new Date('2026-10-07T16:00:00Z'));
    await processarResposta(c.callbackId,{eventId:'delivered',eventType:'DELIVERY',deliveryStatus:'DELIVERED'});expect(c.expiraEm.getTime()).toBe(Date.now()+config.timeoutRespostaHoras*3600000);
    await processarResposta(c.callbackId,{eventId:'read',eventType:'DELIVERY',deliveryStatus:'READ'});
    await processarResposta(c.callbackId,{eventId:'sent-late',eventType:'DELIVERY',deliveryStatus:'SENT'});expect(c.deliveryStatus).toBe('READ');
  });
  it('confirmação duplicada tem efeito único',async()=>{
    const c=await send();const payload={eventId:'response',resposta:'SIM' as const};expect((await processarResposta(c.callbackId,payload)).ok).toBe(true);
    expect((await processarResposta(c.callbackId,payload)).ok).toBe(true);expect(patient.scoreConfianca).toBe(92);expect(p.historicoAbsenteismo.create).toHaveBeenCalledTimes(1);
  });
  it('desistência repõe próximo; motivo não desconta novamente',async()=>{
    const c=await send();await processarResposta(c.callbackId,{eventId:'refusal',resposta:'NAO'});expect(entries[0].statusPaciente).toBe('RECUSOU');expect(entries[1].statusPaciente).toBe('CONVOCADO');
    await processarResposta(c.callbackId,{eventId:'reason',eventType:'MOTIVO',resposta:'NAO',motivoRecusa:'SEM_TRANSPORTE'});expect(patient.scoreConfianca).toBe(85);expect(gateway.enviarConvocacao).toHaveBeenCalledTimes(2);expect(p.historicoAbsenteismo.create).toHaveBeenCalledTimes(1);
  });
  it('fora do horário registra desistência sem disparo imediato',async()=>{
    const c=await send();vi.setSystemTime(new Date('2026-10-06T22:00:00Z'));await processarResposta(c.callbackId,{eventId:'late-refusal',resposta:'NAO'});
    expect(entries[0].statusPaciente).toBe('RECUSOU');expect(entries[1].statusPaciente).toBe('AGUARDANDO');expect(gateway.enviarConvocacao).toHaveBeenCalledTimes(1);
  });
  it('resposta antiga não confirma vaga já liberada',async()=>{
    const c=await send();c.status='EXPIRADO';entries[0].statusPaciente='NAO_RESPONDEU';expect((await processarResposta(c.callbackId,{resposta:'SIM'})).ok).toBe(false);expect(patient.scoreConfianca).toBe(90);
  });
  it('reenvio respeita intervalo após entrega',async()=>{
    const c=await send();await processarResposta(c.callbackId,{eventType:'DELIVERY',deliveryStatus:'DELIVERED'});expect((await verificarTimeouts(new Date(Date.now()+config.intervaloReenvioHoras*3600000-1))).reenviados).toBe(0);
  });
  it('último envio ainda aguarda prazo final de resposta',async()=>{
    const c=await send();c.tentativa=config.qtdReenvios+1;await processarResposta(c.callbackId,{eventType:'DELIVERY',deliveryStatus:'DELIVERED'});expect((await verificarTimeouts(new Date(c.expiraEm.getTime()-1))).naoResponderam).toBe(0);
  });
  it('lembrete conserva confirmação e identifica o mesmo agendamento',async()=>{
    const c=await send();await processarResposta(c.callbackId,{resposta:'SIM'});const reminder=await prepararDisparo({entry:entries[0],etapa:config.qtdConfirmacoes,config,tipo:'LEMBRETE'});
    expect(entries[0].statusPaciente).toBe('CONFIRMADO');expect(reminder.tipo).toBe('LEMBRETE');expect(outbox[1].payload.queueEntryId).toBe(entries[0].id);
  });
  it('rejeita callback sem segredo e simulação em produção',async()=>{
    const controller=new ConfirmacaoController();const res:any={status:vi.fn().mockReturnThis(),json:vi.fn()};vi.stubEnv('VIGIA_WEBHOOK_SECRET','test-secret');
    await controller.callback({headers:{},body:{}} as any,res);expect(res.status).toHaveBeenCalledWith(401);vi.stubEnv('NODE_ENV','production');await controller.simularResposta({body:{}} as any,res);expect(res.status).toHaveBeenCalledWith(404);
  });
  it('datas e telefones inválidos são recusados',()=>{
    expect(parseCalendarDate('31/02/2026')).toBeNull();expect(parseCalendarDate('2026-10-06')?.toISOString()).toBe('2026-10-06T00:00:00.000Z');expect(validPhone('00000000000')).toBe(false);expect(validPhone('67999990001')).toBe(true);
  });
});
