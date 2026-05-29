/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';

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
