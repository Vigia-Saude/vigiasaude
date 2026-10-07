import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildVercelConfiguration } from './vercel-configuration.mjs';

test('preview requires its own API and cannot route to production', () => {
  assert.throws(() => buildVercelConfiguration({ VERCEL_ENV: 'preview' }), /Configure/);
  assert.throws(() => buildVercelConfiguration({ VERCEL_ENV: 'preview', VIGIA_API_ORIGIN: 'https://api.13.140.41.170.sslip.io' }), /produção/);
});
test('development preserves paths and uses direct external rewrites', () => {
  const config = buildVercelConfiguration({ VERCEL_ENV: 'preview', VIGIA_API_ORIGIN: 'https://api-dev.example' });
  assert.deepEqual(config.rewrites.find(route => route.source === '/api/:path*'), { source: '/api/:path*', destination: 'https://api-dev.example/api/:path*' });
  assert.equal(config.rewrites.at(-1).destination, '/index.html');
  assert.ok(config.rewrites.slice(0, -1).every(route => route.destination.startsWith('https://api-dev.example/')));
});
test('production preserves the existing backend', () => {
  const config = buildVercelConfiguration({ VERCEL_ENV: 'production' });
  assert.equal(config.rewrites[0].destination, 'https://api.13.140.41.170.sslip.io/api/:path*');
});
test('publication rejects credentials, non-HTTPS and a path in the API origin', () => {
  for (const source of ['http://api-dev.example', 'https://secret:secret@api-dev.example', 'https://api-dev.example/api']) {
    assert.throws(() => buildVercelConfiguration({ VERCEL_ENV: 'preview', VIGIA_API_ORIGIN: source }));
  }
});
