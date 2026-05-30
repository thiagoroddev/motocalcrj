import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LocalStoragePerfilStorage } from './services/perfilStorage';
import type { PresetEntry } from './types/perfil';

// Carrega fixture de teste em desenvolvimento se nao houver dados reais
if (import.meta.env.DEV) {
  const storage = new LocalStoragePerfilStorage();
  if (storage.carregarPresets().length === 0) {
    import('./fixtures/usuario_teste.json').then((fixture) => {
      const dados = fixture as Record<string, unknown>;
      storage.salvarPresets(dados['motocalc:v5:presets'] as PresetEntry[]);
      storage.setPresetAtivo(String(dados['motocalc:v5:presetAtivo'] ?? ''));
      console.info('[DEV] Fixture carregado: 2 presets disponiveis');
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
