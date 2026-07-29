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
              name: 'MotoCustoRJ',
              short_name: 'MotoCustoRJ',
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
  // Code-splitting (TASK-REF-47). Antes era um chunk único de 921 kB baixado de
  // uma vez no primeiro acesso — caro justamente para o público do app, que está
  // em 4G. Os grupos abaixo são separados por *estabilidade de cache*: vendor
  // muda a cada poucos meses, código do app muda toda semana, então quem volta
  // ao app rebaixa só o que mudou de fato.
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom') || id.includes('/scheduler/')) return 'vendor-react-dom';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('/zod/')) return 'vendor-zod';
          if (id.includes('@radix-ui') || id.includes('@floating-ui')) return 'vendor-radix';
          return 'vendor';
        },
      },
    },
  },
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
