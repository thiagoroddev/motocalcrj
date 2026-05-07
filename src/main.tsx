import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Carrega fixture de teste em desenvolvimento se nao houver dados reais
if (import.meta.env.DEV && !localStorage.getItem('motocalc:v5:presets')) {
  import('./fixtures/usuario_teste.json').then((fixture) => {
    const dados = fixture as Record<string, unknown>;
    localStorage.setItem('motocalc:v5:presets', JSON.stringify(dados['motocalc:v5:presets']));
    localStorage.setItem('motocalc:v5:presetAtivo', String(dados['motocalc:v5:presetAtivo'] ?? ''));
    console.info('[DEV] Fixture carregado: 2 presets disponiveis');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
