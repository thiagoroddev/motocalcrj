import { describe, expect, it } from 'vitest';
import { perfilPadrao } from '../context/PerfilContext';
import type { PresetEntry } from '../types/perfil';
import {
  gerarNomePredefinicao,
  normalizarSufixoPredefinicao,
  obterErroSufixoPredefinicao,
  sugerirSufixoPredefinicao,
} from './predefinicoes';

function criarPreset(presetId: string, modelo: string, sufixo: string): PresetEntry {
  return {
    presetId,
    nome: gerarNomePredefinicao(modelo, sufixo),
    sufixo,
    criadoEm: '2026-06-12T12:00:00.000Z',
    atualizadoEm: '2026-06-12T12:00:00.000Z',
    perfil: {
      ...perfilPadrao,
      moto: { ...perfilPadrao.moto, modelo },
    },
  };
}

describe('predefinições', () => {
  it('sugere a próxima versão numérica usada no mesmo modelo', () => {
    const presets = [
      criarPreset('p1', 'pop110i', 'v1'),
      criarPreset('p2', 'pop110i', 'v2'),
      criarPreset('p3', 'factor125i', 'v8'),
    ];

    expect(sugerirSufixoPredefinicao('pop110i', presets)).toBe('v3');
    expect(sugerirSufixoPredefinicao('factor150', presets)).toBe('v1');
  });

  it('normaliza caixa e espaços para o nome técnico', () => {
    expect(normalizarSufixoPredefinicao('  Trabalho_2 ')).toBe('trabalho_2');
    expect(gerarNomePredefinicao('pop110i', '  Trabalho_2 ')).toBe('pop110i_trabalho_2');
  });

  it('rejeita colisão no mesmo modelo sem diferenciar maiúsculas', () => {
    const presets = [criarPreset('p1', 'pop110i', 'trabalho')];

    expect(obterErroSufixoPredefinicao('TRABALHO', 'pop110i', presets)).toBe(
      'Esse sufixo já existe para o modelo.',
    );
    expect(obterErroSufixoPredefinicao('trabalho', 'factor125i', presets)).toBeNull();
  });

  it('rejeita sufixo acima de 15 caracteres e caracteres fora do formato', () => {
    expect(obterErroSufixoPredefinicao('1234567890123456', 'pop110i', [])).toBe(
      'Use no máximo 15 caracteres.',
    );
    expect(obterErroSufixoPredefinicao('uso diário', 'pop110i', [])).toBe(
      'Use letras sem acento, números, hífen ou sublinhado.',
    );
  });
});
