'use strict';

const PRODUCTION_PROJECTS = ['oxanubfolkoulklrhrpr', 'kxtiqahjxpmirqsksopt'];
const PRODUCTION_HOSTS = ['api.13.140.41.170.sslip.io', 'taxinha-bot.vercel.app', 'taxinha-bot-vinhedo-virtual.vercel.app', 'taxinha-dashboard.vercel.app', 'taxinha-dashboard-vinhedo-virtual.vercel.app', 'vigiasaude-brown.vercel.app', 'vigiasaude-tiscinovacoes-projects.vercel.app'];

function appEnvironment(env = process.env) {
  const value = env.APP_ENV || (env.VERCEL_ENV === 'production' ? 'production' : 'development');
  if (!['production', 'development'].includes(value)) throw new Error('APP_ENV deve ser production ou development.');
  if (env.VERCEL_ENV && env.VERCEL_ENV !== 'production' && value === 'production') {
    throw new Error('Preview não pode usar APP_ENV=production.');
  }
  return value;
}

function projectReference(value) {
  const url = new URL(value);
  const direct = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  const api = url.hostname.match(/^([a-z0-9]+)\.supabase\.co$/);
  const user = decodeURIComponent(url.username).match(/^postgres\.([a-z0-9]+)$/);
  return direct?.[1] || api?.[1] || user?.[1] || null;
}

function assertDatabaseIsolation(env = process.env, productionProject = PRODUCTION_PROJECTS[0]) {
  const mode = appEnvironment(env);
  const values = ['DATABASE_URL', 'DIRECT_URL', 'DATABASE_URL_DIRECT', 'SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']
    .filter(key => env[key]).map(key => ({ key, ref: projectReference(env[key]) }));
  const refs = [...new Set(values.map(item => item.ref).filter(Boolean))];
  if (refs.length > 1) throw new Error('URLs de banco e Supabase pertencem a projetos diferentes.');
  if (mode === 'development' && refs.some(ref => PRODUCTION_PROJECTS.includes(ref))) {
    throw new Error('Desenvolvimento bloqueado: a configuração aponta para um banco de produção.');
  }
  if (mode === 'production' && refs.some(ref => ref !== productionProject)) {
    throw new Error('Produção bloqueada: projeto Supabase diferente do banco de produção esperado.');
  }
  if (env.APP_SUPABASE_REF && refs.some(ref => ref !== env.APP_SUPABASE_REF)) {
    throw new Error('APP_SUPABASE_REF não corresponde às conexões configuradas.');
  }
  const databases = ['DATABASE_URL', 'DIRECT_URL', 'DATABASE_URL_DIRECT'].filter(key => env[key]).map(key => new URL(env[key]));
  if (mode === 'production' && databases.some(url => projectReference(url.href) !== productionProject)) {
    throw new Error('Produção exige conexões identificadas do projeto Supabase esperado.');
  }
  if (env.APP_DATABASE_NAME && databases.some(url => decodeURIComponent(url.pathname.slice(1)) !== env.APP_DATABASE_NAME)) {
    throw new Error('APP_DATABASE_NAME não corresponde ao banco configurado.');
  }
  if (env.APP_DATABASE_HOST && databases.some(url => url.hostname !== env.APP_DATABASE_HOST)) {
    throw new Error('APP_DATABASE_HOST não corresponde à conexão configurada.');
  }
  if (env.APP_DATABASE_USER && databases.some(url => decodeURIComponent(url.username) !== env.APP_DATABASE_USER)) {
    throw new Error('APP_DATABASE_USER não corresponde à conexão configurada.');
  }
  const selfHosted = env.APP_DATABASE_HOST && env.APP_DATABASE_NAME && env.APP_DATABASE_USER && env.APP_SUPABASE_ORIGIN;
  if (env.APP_SUPABASE_ORIGIN) {
    const expectedOrigin = new URL(env.APP_SUPABASE_ORIGIN).origin;
    for (const key of ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']) {
      if (env[key] && new URL(env[key]).origin !== expectedOrigin) throw new Error('URL Supabase fora do ambiente configurado.');
    }
  }
  if (env.VERCEL_ENV && (!env.DATABASE_URL || (!refs.length && !selfHosted))) {
    throw new Error('Publicação exige DATABASE_URL de um projeto Supabase identificado.');
  }
  return mode;
}

function assertDestination(value, env = process.env) {
  const mode = appEnvironment(env);
  const url = new URL(value);
  if (mode === 'development' && PRODUCTION_HOSTS.includes(url.hostname)) {
    throw Object.assign(new Error('Desenvolvimento bloqueado: destino de produção.'), { definitive: true });
  }
  if (mode === 'development' && env.APP_INTEGRATION_HOSTS) {
    const allowed = env.APP_INTEGRATION_HOSTS.split(',').map(host => host.trim());
    if (!allowed.includes(url.hostname)) throw Object.assign(new Error('Destino fora dos hosts do ambiente.'), { definitive: true });
  }
  return url;
}

function browserOriginAllowed(origin, env = process.env) {
  if(!origin)return true;
  let url;try{url=new URL(origin);}catch{return false;}
  if(appEnvironment(env)==='development')return !PRODUCTION_HOSTS.includes(url.hostname);
  if(['localhost','127.0.0.1','[::1]'].includes(url.hostname)||/git-developer|(?:^|[.-])dev(?:[.-]|$)/.test(url.hostname))return false;
  const allowed=['https://vigiasaude-brown.vercel.app','https://vigiasaude-tiscinovacoes-projects.vercel.app','https://vigiasaude-git-main-tiscinovacoes-projects.vercel.app'];
  allowed.push(...(env.CORS_ORIGIN||'').split(',').map(value=>value.trim()).filter(value=>value&&value!=='*'));
  return allowed.includes(url.origin);
}

module.exports = { appEnvironment, projectReference, assertDatabaseIsolation, assertDestination, browserOriginAllowed };
