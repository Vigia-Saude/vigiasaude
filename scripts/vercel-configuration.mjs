import policy from '../server/src/config/environment.cjs';

export function buildVercelConfiguration(env = process.env) {
  const mode = policy.appEnvironment(env);
  const source = env.VIGIA_API_ORIGIN || (mode === 'production' ? 'https://api.13.140.41.170.sslip.io' : '');
  if (!source) throw new Error('Configure VIGIA_API_ORIGIN antes de publicar desenvolvimento.');
  const url = policy.assertDestination(source, env);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
    url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VIGIA_API_ORIGIN deve conter somente a origem HTTP da API.');
  }
  if (env.VERCEL_ENV && url.protocol !== 'https:') throw new Error('Publicação exige API HTTPS.');
  return {
    git: { deploymentEnabled: false },
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    framework: 'vite',
    rewrites: [
      ...['api', 'auth', 'uploads', 'webhooks'].map(prefix => ({
        source: `/${prefix}/:path*`, destination: `${url.origin}/${prefix}/:path*`,
      })),
      { source: '/health', destination: `${url.origin}/health` },
      { source: '/(.*)', destination: '/index.html' },
    ],
  };
}
