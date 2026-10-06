import {beforeEach,describe,expect,it,vi} from 'vitest';
vi.mock('../config/prisma',()=>{
  const db:any={
    unidade:{findFirst:vi.fn()},paciente:{findFirst:vi.fn(),create:vi.fn(),update:vi.fn(),findUniqueOrThrow:vi.fn()},
    queueEntry:{findFirst:vi.fn(),create:vi.fn(),findUniqueOrThrow:vi.fn(),update:vi.fn()},
    regulacaoOutbox:{create:vi.fn()},reservaAgenda:{create:vi.fn()},$executeRaw:vi.fn(),$queryRaw:vi.fn(),$transaction:vi.fn(),
  };
  db.$transaction.mockImplementation((fn:any)=>fn(db));return {default:db};
});
import prisma from '../config/prisma';
import {ConfirmacaoController} from '../controllers/ConfirmacaoController';
import {identificacaoPacienteFilaSchema,pendenciasPacienteFila} from '../schemas/cadastroFila.schema';
const db=prisma as any;
const controller=new ConfirmacaoController();
const body={unidadeId:'00000000-0000-4000-8000-000000000001',nomeCompleto:'PACIENTE SINTETICO',telefone:'67999990001',procedimentoNome:'EXAME TESTE',dataAgendada:'2026-10-20',horaAgendada:'09:00',localAtendimento:'LOCAL TESTE'};
function response(){const res:any={status:vi.fn(),json:vi.fn()};res.status.mockReturnValue(res);return res;}
beforeEach(()=>{
  vi.clearAllMocks();db.unidade.findFirst.mockResolvedValue({id:body.unidadeId});db.paciente.findFirst.mockResolvedValue(null);
  db.paciente.create.mockImplementation(async({data}:any)=>({id:'patient',...data}));db.queueEntry.findFirst.mockResolvedValue(null);
  db.queueEntry.create.mockImplementation(async({data}:any)=>({id:'entry',...data}));db.$queryRaw.mockResolvedValue([{ultima:40}]);
});
describe('Cadastro de pacientes na fila com identificação pendente',()=>{
  it('aceita campos omitidos ou em branco sem inventar CNS/nascimento',()=>{
    for(const input of [{},{cartaoSus:'',dataNascimento:' '},{cartaoSus:null,dataNascimento:null}]){
      expect(identificacaoPacienteFilaSchema.parse(input)).toEqual({cartaoSus:null,dataNascimento:null});
    }
  });
  it('valida CNS e nascimento somente quando informados',()=>{
    for(const input of [{cartaoSus:'123'},{dataNascimento:'2026-02-31'},{dataNascimento:'2070-01-01'}])expect(identificacaoPacienteFilaSchema.safeParse(input).success).toBe(false);
    const parsed=identificacaoPacienteFilaSchema.parse({cartaoSus:'700000000000001',dataNascimento:'01/01/1980'});
    expect(parsed.dataNascimento?.toISOString()).toBe('1980-01-01T00:00:00.000Z');
  });
  it('registra paciente sem CNS/nascimento no fim da fila, sem reservar ou enviar',async()=>{
    const res=response();await controller.inserirFila({body:{...body,cartaoSus:'',dataNascimento:''}} as any,res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(db.paciente.create.mock.calls[0][0].data).toMatchObject({cartaoSus:null,dataNascimento:null});
    expect(db.paciente.findFirst).not.toHaveBeenCalled();
    expect(db.queueEntry.create.mock.calls[0][0].data).toMatchObject({posicao:41,statusPaciente:'AGUARDANDO'});
    expect(db.regulacaoOutbox.create).not.toHaveBeenCalled();expect(db.reservaAgenda.create).not.toHaveBeenCalled();
  });
  it('omitir nascimento não apaga a data de um paciente identificado por CNS',async()=>{
    db.paciente.findFirst.mockResolvedValue({id:'known',nomeCompleto:body.nomeCompleto,dataNascimento:new Date('1980-01-01')});
    const res=response();await controller.inserirFila({body:{...body,cartaoSus:'700000000000001'}} as any,res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(db.paciente.update.mock.calls[0][0].data).not.toHaveProperty('dataNascimento');
  });
  it('completa dados do mesmo paciente sem criar nem reposicionar entradas',async()=>{
    db.queueEntry.findUniqueOrThrow.mockResolvedValue({id:'entry',pacienteId:'patient',posicao:41});
    db.paciente.findUniqueOrThrow.mockResolvedValue({id:'patient',cartaoSus:null,dataNascimento:null});
    db.paciente.update.mockImplementation(async({data}:any)=>({id:'patient',...data}));
    const res=response();await controller.completarCadastro({params:{queueEntryId:'entry'},body:{cartaoSus:'700000000000001',dataNascimento:'1980-01-01'}} as any,res);
    expect(res.json.mock.calls[0][0].pendenciasCadastro).toEqual([]);
    expect(db.queueEntry.update).not.toHaveBeenCalled();expect(db.queueEntry.create).not.toHaveBeenCalled();
    expect(db.regulacaoOutbox.create).not.toHaveBeenCalled();
  });
  it('não atribui CNS já pertencente a outra pessoa',async()=>{
    db.queueEntry.findUniqueOrThrow.mockResolvedValue({pacienteId:'patient'});
    db.paciente.findUniqueOrThrow.mockResolvedValue({id:'patient',cartaoSus:null,dataNascimento:null});
    db.paciente.findFirst.mockResolvedValue({id:'other'});
    const res=response();await controller.completarCadastro({params:{queueEntryId:'entry'},body:{cartaoSus:'700000000000001'}} as any,res);
    expect(res.status).toHaveBeenCalledWith(400);expect(db.paciente.update).not.toHaveBeenCalled();
  });
  it('sinaliza campos ausentes e remove pendências depois do preenchimento',()=>{
    expect(pendenciasPacienteFila({cartaoSus:null,dataNascimento:null})).toEqual(['CNS','data de nascimento']);
    expect(pendenciasPacienteFila({cartaoSus:'700000000000001',dataNascimento:new Date('1980-01-01')})).toEqual([]);
  });
});
