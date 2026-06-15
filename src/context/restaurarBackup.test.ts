import { describe, it, expect } from 'vitest';
import { perfilReducer, type EstadoApp } from './perfilReducer';
import { perfilPadrao } from './perfilDefaults';
import type { PresetEntry } from '../types/perfil';

function preset(presetId: string, sufixo = presetId): PresetEntry {
  return {
    presetId,
    nome: `pop110i_${sufixo}`,
    sufixo,
    criadoEm: '2026-06-15T00:00:00.000Z',
    atualizadoEm: '2026-06-15T00:00:00.000Z',
    perfil: { ...perfilPadrao, moto: { ...perfilPadrao.moto, modelo: 'pop110i' } },
  };
}

function estadoCom(presetId: string): EstadoApp {
  return {
    perfil: { ...perfilPadrao, moto: { ...perfilPadrao.moto, modelo: 'pop110i' } },
    presets: [preset(presetId)],
    presetAtivoId: presetId,
    rascunhoPredefinicao: null,
  };
}

describe('reducer RESTAURAR_BACKUP', () => {
  it('substitui TODAS as predefinições pelas do backup e ativa o id informado', () => {
    const estado = estadoCom('atual');

    const novo = perfilReducer(estado, {
      type: 'RESTAURAR_BACKUP',
      presets: [preset('x'), preset('y')],
      presetAtivoId: 'y',
    });

    expect(novo.presets.map((p) => p.presetId)).toEqual(['x', 'y']);
    expect(novo.presetAtivoId).toBe('y');
    expect(novo.presets.some((p) => p.presetId === 'atual')).toBe(false);
  });

  it('cai para a primeira predefinição quando o ativo do backup não existe', () => {
    const novo = perfilReducer(estadoCom('atual'), {
      type: 'RESTAURAR_BACKUP',
      presets: [preset('x'), preset('y')],
      presetAtivoId: 'inexistente',
    });

    expect(novo.presetAtivoId).toBe('x');
  });

  it('ignora backup sem predefinições (mantém o estado)', () => {
    const estado = estadoCom('atual');

    const novo = perfilReducer(estado, {
      type: 'RESTAURAR_BACKUP',
      presets: [],
      presetAtivoId: null,
    });

    expect(novo).toBe(estado);
  });
});
