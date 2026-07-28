import React from 'react';
import ReactDOM from 'react-dom/client';
import { config as configurarZod } from 'zod';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { carregarFixtureDesenvolvimento } from './services/fixtureDesenvolvimento';
import { LocalStoragePerfilStorage } from './services/perfilStorage';

// Desliga a compilação JIT do Zod (TASK-RNF-015). Por padrão o Zod v4 compila
// cada schema numa função otimizada usando o construtor `Function`, o que é
// `eval` para efeito de CSP — e obrigaria a política a liberar `'unsafe-eval'`
// em `script-src`, justamente a diretiva que contém XSS e dependência
// comprometida. Sem JIT a validação fica mais lenta, o que aqui é irrelevante:
// o app valida perfil ao carregar e ao salvar, não em laço quente.
// Precisa rodar ANTES do primeiro `parse` — daí ficar no topo do entry.
configurarZod({ jitless: true });

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
