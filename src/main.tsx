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
