import { describe,it,expect,vi } from 'vitest';
import PDFDocument from 'pdfkit';
vi.mock('../config/prisma',()=>({default:{}}));
import { lerPdf,validarLinhaPdf } from '../services/pdfImportacao.service';

// Synthetic fixtures only: no patient data from the production PDFs is versioned.
async function fixture(count:number,declared=count):Promise<Buffer>{
  const doc=new PDFDocument({size:'A4',margin:35,compress:true});const chunks:Buffer[]=[];
  const result=new Promise<Buffer>((resolve,reject)=>{doc.on('data',chunk=>chunks.push(chunk));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject)});
  for(let i=0;i<count;i++){
    if(i%5===0){if(i)doc.addPage();doc.fontSize(9).text('PROFISSIONAL: TESTE - UNIDADE LOCAL TESTE / PONTA PORA').text('AGENDA: 20/10/2026').text(`QUANTIDADE ATENDIMENTO: ${declared}`);}
    const suffix=String.fromCharCode(65+Math.floor(i/26))+String.fromCharCode(65+i%26);
    const name=i%7===0?`PACIENTE\nSINTETICO ${suffix}`:`PACIENTE SINTETICO ${suffix}`;
    doc.fontSize(8).text(`08:00 -\nEXAME - EXTERNO MAMOGRAFIA\n${1000000+i}${name}\nCNS:\n${700000000000000+i}\nTELEFONE: 67\n999990001\n-01/01/1980\nUBS SOLICITANTE / PONTA PORA\nOCI\nZ123 - EXAME`);
  }
  doc.end();return result;
}
describe('PDF: leitura, sequência e campos obrigatórios',()=>{
  it('lê PDF pequeno sem corromper Buffer e preserva campos',async()=>{
    const original=await fixture(1),copy=Buffer.from(original);const result=await lerPdf(original);
    expect(original.equals(copy)).toBe(true);expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({name:'PACIENTE SINTETICO AA',source_index:1,source_page:1,phone_raw:'67999990001',birth_date_raw:'01/01/1980',hora_raw:'08:00',scheduled_date_raw:'20/10/2026',procedure_name:'MAMOGRAFIA',local_atendimento:'LOCAL TESTE / PONTA PORA',unidade_solicitante:'UBS SOLICITANTE / PONTA PORA'});
    expect(validarLinhaPdf(result.rows[0])).toBeNull();
  });
  it('preserva 49 registros, nomes quebrados e cabeçalhos em 10 páginas',async()=>{
    const result=await lerPdf(await fixture(49));expect(result.rows).toHaveLength(49);expect(result.warning).toBeNull();
    result.rows.forEach((row,i)=>{expect(row.source_index).toBe(i+1);expect(row.source_page).toBe(Math.floor(i/5)+1);expect(row.ficha).toBe(String(1000000+i));expect(row.cns_raw).toBe(String(700000000000000+i));expect(validarLinhaPdf(row)).toBeNull()});
  });
  it('informa divergência com a quantidade declarada',async()=>{
    const result=await lerPdf(await fixture(1,2));expect(result.declaredCount).toBe(2);expect(result.warning).toContain('extraídos 1');
  });
  it('campos ausentes ou inválidos ficam visíveis e não recebem valores fictícios',()=>{
    const raw={name:'',phone_raw:'6799990001',cns_raw:'',ficha:'',scheduled_date_raw:'31/02/2026',hora_raw:'29:70',birth_date_raw:'',procedure_name:'',local_atendimento:''};
    expect(validarLinhaPdf(raw)).toMatch(/Nome obrigatório.*CNS.*Celular inválido.*Local.*Procedimento.*Data.*Horário.*nascimento/);
    expect(raw.phone_raw).toBe('6799990001');expect(raw.birth_date_raw).toBe('');
  });
});
