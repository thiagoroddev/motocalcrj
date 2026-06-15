/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Este ambiente roda com NODE_ENV=production (ver .npmrc / TASK-CHORE-011). Sem
// isto, o Vite resolveria o build de PRODUÇÃO do React nos testes, onde
// `React.act` não existe e o @testing-library/react v16 quebra (TASK-CHORE-013).
// A guarda VITEST garante que isto só afeta `vitest`, nunca o `vite build`.
if (process.env.VITEST) {
  process.env.NODE_ENV = 'test';
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    Icons({ compiler: 'jsx', jsx: 'react' }),
    // PWA: instalável + offline após o 1º acesso (precache do build). O app é
    // client-only (dados bundlados + localStorage, FIPE hardcoded), então não há
    // dependência de rede em runtime. Não roda sob vitest (guarda VITEST).
    ...(process.env.VITEST
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png'],
            manifest: {
              name: 'MotoCalcRJ',
              short_name: 'MotoCalcRJ',
              description:
                'Custo operacional real da sua moto no RJ: combustível, manutenção, revisões e documentos.',
              lang: 'pt-BR',
              start_url: '/',
              scope: '/',
              display: 'standalone',
              theme_color: '#0078FF',
              background_color: '#0d1321',
              icons: [
                { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                {
                  src: 'pwa-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any maskable',
                },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
            },
          }),
        ]),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
