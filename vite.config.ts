/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { appEnvironment, assertDestination } from './server/src/config/environment.cjs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  if (env.VITE_API_URL) assertDestination(env.VITE_API_URL, env);
  if (env.VITE_CHAT_PANEL_URL) {
    const panel = assertDestination(env.VITE_CHAT_PANEL_URL, env);
    if (!['http:', 'https:'].includes(panel.protocol)) throw new Error('URL do painel WhatsApp inválida.');
  }
  return {
  define: { 'import.meta.env.VITE_APP_ENV': JSON.stringify(appEnvironment(env)) },
  cacheDir: '.cache/vite',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) {
              return 'vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('zod') || id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }
            return 'vendor-libs';
          }
        }
      }
    }
  },
  server: {
    host: true, // Listen on all local IPs
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**'],
  },
  };
})
