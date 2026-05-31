/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';

// Este ambiente roda com NODE_ENV=production (ver .npmrc / TASK-CHORE-011). Sem
// isto, o Vite resolveria o build de PRODUÇÃO do React nos testes, onde
// `React.act` não existe e o @testing-library/react v16 quebra (TASK-CHORE-013).
// A guarda VITEST garante que isto só afeta `vitest`, nunca o `vite build`.
if (process.env.VITEST) {
  process.env.NODE_ENV = 'test';
}

export default defineConfig({
  plugins: [tailwindcss(), react(), Icons({ compiler: 'jsx', jsx: 'react' })],
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
