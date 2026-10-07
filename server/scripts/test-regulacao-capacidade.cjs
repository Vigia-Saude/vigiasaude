// Exercises the exact migration in an isolated schema, with synthetic patients.
// Usage: node scripts/test-regulacao-capacidade.cjs (DATABASE_URL from server/.env).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { Client, Pool } = require('pg');
require('dotenv').config({ quiet: true });
const { assertDatabaseIsolation, appEnvironment } = require('../src/config/environment.cjs');
assertDatabaseIsolation();
if (appEnvironment() !== 'development') throw new Error('Teste de capacidade permitido somente em desenvolvimento.');
const schema = `regulacao_test_${randomUUID().replaceAll('-', '')}`;
const url = process.env.DATABASE_URL;
const client = new Client({ connectionString: url });
let pool;
async function main() {
  await client.connect();
  await client.query(`CREATE SCHEMA "${schema}"`);
  await client.query(`SET search_path="${schema}",public`);
  await client.query(`
    CREATE TABLE pacientes(id text PRIMARY KEY,cpf text NOT NULL);
    CREATE TABLE pdf_imports(id text,rows_found integer);
    CREATE TABLE pdf_import_rows(id text,import_id text);
    CREATE TABLE ciclos_confirmacao(id text);
    CREATE TABLE slots_agenda(id text PRIMARY KEY,unidade_id text,procedimento text,data date,capacidade_total integer NOT NULL);
    CREATE TABLE queue_entries(id text PRIMARY KEY,unidade_id text,procedimento_nome text,procedimento_id text,data_agendada date,status_paciente text NOT NULL);
  `);
  const sql = fs.readFileSync('prisma/migrations/20261006144000_regulacao_confiavel/migration.sql','utf8')
    .replaceAll('public.regulacao_',`"${schema}".regulacao_`)
    .replaceAll('SET search_path=public',`SET search_path="${schema}",public`);
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  pool = new Pool({ connectionString: url, max: 5, options: `-c search_path=${schema},public` });
  await client.query("INSERT INTO slots_agenda(id,unidade_id,procedimento,data,capacidade_total) VALUES('slot','unit','Exame','2027-01-01',1)");
  for(let i=0;i<20;i++) await client.query("INSERT INTO queue_entries VALUES($1,'unit','Exame',null,'2027-01-01','AGUARDANDO',null,null,null)",[`entry-${i}`]);
  const results=await Promise.allSettled(Array.from({length:20},(_,i)=>pool.query("UPDATE queue_entries SET status_paciente='CONVOCADO' WHERE id=$1",[`entry-${i}`])));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1,'Only one concurrent caller may reserve');
  for(const r of results.filter(r=>r.status==='rejected')) assert.equal(r.reason.code,'23514',r.reason.message);
  const winner=(await client.query("SELECT id FROM queue_entries WHERE status_paciente='CONVOCADO'")).rows[0].id;
  async function occupied(n){
    assert.equal((await client.query("SELECT ocupadas FROM slots_agenda WHERE id='slot'")).rows[0].ocupadas,n);
    assert.equal(Number((await client.query('SELECT count(*) AS n FROM reservas_agenda WHERE ativa')).rows[0].n),n);
  }
  await occupied(1);
  await assert.rejects(client.query("UPDATE slots_agenda SET capacidade_total=0 WHERE id='slot'"),e=>e.code==='23514');
  await client.query("UPDATE queue_entries SET status_paciente='CONFIRMADO' WHERE id=$1",[winner]);
  await client.query("UPDATE queue_entries SET status_paciente='RECONFIRMADO' WHERE id=$1",[winner]);
  await occupied(1);
  await client.query("UPDATE queue_entries SET status_paciente='RECUSOU' WHERE id=$1",[winner]);
  await client.query("UPDATE queue_entries SET status_paciente='RECUSOU' WHERE id=$1",[winner]);
  await occupied(0);
  assert.equal((await client.query("SELECT reposicao_pendente FROM slots_agenda WHERE id='slot'")).rows[0].reposicao_pendente,true);
  const next=(await client.query("SELECT id FROM queue_entries WHERE status_paciente='AGUARDANDO' ORDER BY id LIMIT 1")).rows[0].id;
  await client.query("UPDATE queue_entries SET status_paciente='CONVOCADO' WHERE id=$1",[next]);
  await occupied(1);
  await assert.rejects(client.query("UPDATE queue_entries SET data_agendada='2027-01-02' WHERE id=$1",[next]));
  await assert.rejects(client.query("INSERT INTO queue_entries VALUES('missing','unit','Undefined',null,'2027-01-01','CONVOCADO',null,null,null)"));
  await client.query('DELETE FROM queue_entries WHERE id=$1',[next]);
  await occupied(0);
  await client.query("UPDATE slots_agenda SET capacidade_total=0 WHERE id='slot'");
  await assert.rejects(client.query("UPDATE queue_entries SET status_paciente='CONVOCADO' WHERE id=$1",[winner]),e=>e.code==='23514');
  console.log('PASS: concurrency 20/1, counter, duplicate cancellation, replacement, reconfirmation, capacity reduction, missing agenda, zero capacity, deletion.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(async()=>{
  if(pool)await pool.end();
  if(/^regulacao_test_[0-9a-f]{32}$/.test(schema))await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`).catch(()=>{});
  await client.end();
});
