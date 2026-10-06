// Run after npm run build. Default is read-only; use --apply for the approved recovery.
// Matches stored PDF identities, preserves operator edits and existing queue positions, never sends messages.
const fs=require('node:fs');const path=require('node:path');const {Client}=require('pg');require('dotenv').config({quiet:true});
const {lerPdf,validarLinhaPdf}=require('../dist/services/pdfImportacao.service');
const apply=process.argv.includes('--apply');const digit=v=>String(v||'').replace(/\D/g,'');
const key=r=>`${digit(r.ficha)}|${digit(r.cns_raw)}`;
(async()=>{const db=new Client({connectionString:process.env.DATABASE_URL});let recovered=0,blocked=0;try{
 await db.connect();const docs=(await db.query('SELECT * FROM pdf_imports ORDER BY criado_em,id')).rows;
 for(const doc of docs){
  const rows=(await db.query('SELECT * FROM pdf_import_rows WHERE import_id=$1 ORDER BY criado_em,id',[doc.id])).rows;
  if(rows.every(r=>r.source_index!==null))continue;
  let buffer=doc.file_data;
  if(!buffer){const file=path.join(__dirname,'../uploads/pdf-imports',path.basename(doc.storage_path));if(fs.existsSync(file))buffer=fs.readFileSync(file)}
  if(!buffer){blocked+=rows.length;if(apply)await db.query("UPDATE pdf_imports SET error_log='PDF original indisponível: recupere o arquivo para restaurar a ordem.' WHERE id=$1",[doc.id]);continue;}
  const parsed=await lerPdf(buffer);const updates=[];const used=new Set();let manualIndex=Math.max(parsed.rows.length,...rows.map(r=>r.source_index||0));
  for(const row of rows){
   if(row.source_index!==null)continue;
   const raw=row.raw_data;const candidates=parsed.rows.filter(item=>key(item)===key(raw));
   if(!raw.ficha && doc.processed_at && row.criado_em>doc.processed_at && candidates.length===0){
    const merged={...raw,source_index:++manualIndex,source_page:null,source_origin:'MANUAL',local_atendimento:raw.local_atendimento||parsed.rows[0]?.local_atendimento};
    updates.push({id:row.id,source_index:manualIndex,source_page:null,raw_data:merged,error:validarLinhaPdf(merged)});recovered++;continue;
   }
   if(candidates.length!==1||used.has(candidates[0]?.source_index)){
    blocked++;updates.push({id:row.id,source_index:null,source_page:null,raw_data:raw,error:'Não foi possível recuperar esta posição do PDF com segurança. Confira a identificação.'});continue;
   }
   const source=candidates[0];used.add(source.source_index);
   const merged={...raw,source_index:source.source_index,source_page:source.source_page,local_atendimento:raw.local_atendimento||source.local_atendimento};
   updates.push({id:row.id,source_index:source.source_index,source_page:source.source_page,raw_data:merged,error:validarLinhaPdf(merged)});recovered++;
  }
  if(apply){await db.query('BEGIN');try{
   await db.query("SELECT pg_advisory_xact_lock(hashtext('regulacao-importacao'))");
   await db.query(`UPDATE pdf_import_rows r SET source_index=x.source_index,source_page=x.source_page,raw_data=x.raw_data,error=x.error FROM jsonb_to_recordset($1::jsonb) AS x(id text,source_index integer,source_page integer,raw_data jsonb,error text) WHERE r.id=x.id AND r.import_id=$2`,[JSON.stringify(updates),doc.id]);
   // Preserve already sent/attended entries. Fill explicit locations only; no status/date/position change.
   await db.query(`UPDATE queue_entries q SET local_atendimento=COALESCE(q.local_atendimento,r.raw_data->>'local_atendimento'),unidade_solicitante=COALESCE(q.unidade_solicitante,r.raw_data->>'unidade_solicitante') FROM pdf_import_rows r WHERE r.import_id=$1 AND r.queue_entry_id=q.id`,[doc.id]);
   const linked=(await db.query('SELECT q.posicao,q.unidade_id,r.source_index FROM pdf_import_rows r JOIN queue_entries q ON r.queue_entry_id=q.id WHERE r.import_id=$1 ORDER BY r.source_index',[doc.id])).rows;
   if(linked.length===1&&linked[0].source_index){await db.query('UPDATE pdf_imports SET queue_base_position=COALESCE(queue_base_position,$2),unidade_responsavel_id=COALESCE(unidade_responsavel_id,$3) WHERE id=$1',[doc.id,linked[0].posicao-linked[0].source_index+1,linked[0].unidade_id])}
   if(parsed.warning)await db.query('UPDATE pdf_imports SET error_log=$2 WHERE id=$1',[doc.id,parsed.warning]);
   await db.query('COMMIT');
  }catch(err){await db.query('ROLLBACK');throw err}}
 }
 console.log(JSON.stringify({apply,documents:docs.length,recovered,blocked,messagesSent:0}));
 }finally{await db.end()}})().catch(err=>{console.error(err.message);process.exit(1)});
