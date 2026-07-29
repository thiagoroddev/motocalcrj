// PRIMEIRO import, de propósito: configura o Zod antes que qualquer módulo
// toque num schema. Ver o comentário em `configurarZod.ts` — a cadeia
// `App → PerfilProvider → reconstruirEstado → repositorioPresets` valida os 16
// presets já no import, então configurar depois seria tarde demais.
import './configurarZod';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { carregarFixtureDesenvolvimento } from './services/fixtureDesenvolvimento';
import { LocalStoragePerfilStorage } from './services/perfilStorage';

async function iniciarAplicacao() {
  if (import.meta.env.DEV) {
    await carregarFixtureDesenvolvimento(new LocalStoragePerfilStorage(), async () => {
      const modulo = await import('./fixtures/usuario_teste.json');
      return modulo.default;
    });
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

void iniciarAplicacao();
