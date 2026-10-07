const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assertDatabaseIsolation, appEnvironment, assertDestination, browserOriginAllowed } = require('../config/environment.cjs');

test('production browser requests refuse local and developer origins, including old aliases',()=>{
  const env={APP_ENV:'production',CORS_ORIGIN:'*'};
  for(const origin of ['http://localhost:5173','https://vigia-saude-git-developer-giancarlo-projects.vercel.app','https://vigiasaude-git-developer-tiscinovacoes-projects.vercel.app','https://random.vercel.app'])assert.equal(browserOriginAllowed(origin,env),false);
  assert.equal(browserOriginAllowed('https://vigiasaude-brown.vercel.app',env),true);
  assert.equal(browserOriginAllowed(undefined,env),true);
  assert.equal(browserOriginAllowed('https://vigiasaude-brown.vercel.app',{APP_ENV:'development'}),false);
});

test('local with production NODE_ENV still refuses production database', () => {
  assert.throws(() => assertDatabaseIsolation({ NODE_ENV: 'production', DATABASE_URL: 'postgres://postgres.oxanubfolkoulklrhrpr:x@pooler.supabase.com:5432/postgres' }), /produção/);
});
test('preview cannot masquerade as production', () => {
  assert.throws(() => appEnvironment({ VERCEL_ENV: 'preview', APP_ENV: 'production' }), /Preview/);
});
test('production remains connected to its designated project', () => {
  assert.equal(assertDatabaseIsolation({ APP_ENV: 'production', DATABASE_URL: 'postgres://postgres:x@db.oxanubfolkoulklrhrpr.supabase.co/postgres' }), 'production');
  assert.throws(() => assertDatabaseIsolation({ APP_ENV: 'production', DATABASE_URL: 'postgres://postgres:x@db.kxtiqahjxpmirqsksopt.supabase.co/postgres' }), /diferente/);
});
test('development accepts its isolated VPS database and rejects mixed direct URL', () => {
  assert.equal(assertDatabaseIsolation({ DATABASE_URL: 'postgres://vigia_dev:x@localhost:5543/vigia_dev' }), 'development');
  assert.throws(() => assertDatabaseIsolation({ DATABASE_URL: 'postgres://vigia_dev:x@localhost/vigia_dev', DIRECT_URL: 'postgres://postgres:x@db.oxanubfolkoulklrhrpr.supabase.co/postgres' }), /produção/);
});
test('production integrations cannot be called by development', () => {
  for (const host of ['taxinha-bot.vercel.app', 'taxinha-bot-vinhedo-virtual.vercel.app', 'taxinha-dashboard.vercel.app', 'taxinha-dashboard-vinhedo-virtual.vercel.app', 'api.13.140.41.170.sslip.io']) assert.throws(() => assertDestination('https://' + host), /produção/);
  assert.equal(assertDestination('http://localhost:3101').hostname, 'localhost');
});
test('wrong integration host fails before any request', () => {
  assert.throws(() => assertDestination('https://unexpected.example', { APP_INTEGRATION_HOSTS: 'bot-dev.example' }), /hosts/);
});

test('production rejects an unidentified direct connection even with the correct Supabase API', () => {
  assert.throws(() => assertDatabaseIsolation({ APP_ENV: 'production', SUPABASE_URL: 'https://oxanubfolkoulklrhrpr.supabase.co', DATABASE_URL: 'postgres://other:x@another-db/postgres' }), /identificadas/);
});
