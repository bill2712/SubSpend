import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Static site: the client build emits a manifest so the prerender script can
// add <link rel="modulepreload"> for each page's own chunk.
export default defineConfig({
  // "/" for Vercel/Cloudflare; "/SubSpend/" for GitHub Pages (set VITE_BASE_PATH).
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  build: {
    manifest: true,
    target: 'es2022',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
