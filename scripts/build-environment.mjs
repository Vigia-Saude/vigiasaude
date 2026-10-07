import fs from 'node:fs';
import { loadEnv } from 'vite';
import policy from '../server/src/config/environment.cjs';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const mode = policy.appEnvironment(env);
const source = env.VIGIA_API_ORIGIN || (mode === 'production' ? 'https://api.13.140.41.170.sslip.io' : 'http://localhost:3001');
policy.assertDestination(source, env);
if (env.VITE_CHAT_PANEL_URL) policy.assertDestination(env.VITE_CHAT_PANEL_URL, env);
if (env.VERCEL_ENV && mode === 'development' && !env.VIGIA_API_ORIGIN) {
  throw new Error('Preview exige VIGIA_API_ORIGIN de desenvolvimento.');
}
const origin = new URL(source).origin;
const manifest = {
  environment: mode,
  apiOrigin: origin,
  commit: env.VERCEL_GIT_COMMIT_SHA || env.APP_COMMIT || null,
};
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/environment.json', JSON.stringify(manifest));
console.log(`Ambiente validado: ${mode}`);
