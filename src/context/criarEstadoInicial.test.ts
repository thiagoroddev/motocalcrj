import { describe, it, expect, vi } from 'vitest';
import { criarEstadoInicial, perfilPadrao } from './PerfilContext';
import type { IPerfilStorage } from '../services/perfilStorage';
import type { PresetEntry, PerfilUsuario } from '../types/perfil';

// Storage falso configurável - o ciclo de tarefa pede injeção de storage para
// testar a montagem sem tocar no localStorage real.
function criarStorageFalso(presets: unknown[], ativoId: string | null): IPerfilStorage {
  return {
    carregarPresets: () => presets as PresetEntry[],
    getPresetAtivo: () => ativoId,
    salvarPresets: vi.fn(),
    setPresetAtivo: vi.fn(),
    limpar: vi.fn(),
    preservarCorrompido: vi.fn(),
  };
}

function presetValido(presetId: string, nome = 'Teste'): PresetEntry {
  return {
    presetId,
    nome,
    criadoEm: '2026-05-30T00:00:00.000Z',
    atualizadoEm: '2026-05-30T00:00:00.000Z',
    perfil: perfilPadrao,
  };
}

describe('criarEstadoInicial - validação + fallback recuperável (ADR-010)', () => {
  it('sem presets → estado padrão (sem marcar corrompido)', () => {
    const storage = criarStorageFalso([], null);
    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBeNull();
    expect(estado.presets).toEqual([]);
    expect(storage.preservarCorrompido).not.toHaveBeenCalled();
  });

  it('presets válidos sem ativo → carrega o primeiro preset', () => {
    const storage = criarStorageFalso([presetValido('p1')], null);
    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBe('p1');
    expect(estado.presets).toHaveLength(1);
    expect(estado.perfil).toEqual(perfilPadrao);
    expect(storage.preservarCorrompido).not.toHaveBeenCalled();
  });

  it('múltiplos presets válidos sem ativo → seleciona presets[0]', () => {
    const storage = criarStorageFalso(
      [presetValido('p1', 'Primeiro'), presetValido('p2', 'Segundo')],
      null,
    );
    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBe('p1');
    expect(estado.presets).toHaveLength(2);
    expect(estado.presets[0].nome).toBe('Primeiro');
    expect(storage.preservarCorrompido).not.toHaveBeenCalled();
  });

  it('ativo ausente da lista → cai para presets[0]', () => {
    const storage = criarStorageFalso([presetValido('p1')], 'p-inexistente');
    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBe('p1');
    expect(estado.presets).toHaveLength(1);
    expect(storage.preservarCorrompido).not.toHaveBeenCalled();
  });

  it('preset válido → carrega o perfil e o presetAtivoId', () => {
    const storage = criarStorageFalso([presetValido('p1')], 'p1');
    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBe('p1');
    expect(estado.presets).toHaveLength(1);
    expect(estado.perfil).toEqual(perfilPadrao);
    expect(storage.preservarCorrompido).not.toHaveBeenCalled();
  });

  it('blob corrompido (perfil sem `moto`) → estado padrão e preserva o blob', () => {
    const perfilSemMoto: Record<string, unknown> = { ...perfilPadrao };
    delete perfilSemMoto.moto;
    const presetCorrompido = {
      ...presetValido('p1'),
      perfil: perfilSemMoto as unknown as PerfilUsuario,
    };
    const storage = criarStorageFalso([presetCorrompido], 'p1');

    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBeNull();
    expect(estado.presets).toEqual([]);
    expect(estado.perfil).toEqual(perfilPadrao);
    expect(storage.preservarCorrompido).toHaveBeenCalledTimes(1);
  });

  it('preset corrompido sem ativo → estado padrão e preserva o blob', () => {
    const perfilSemMoto: Record<string, unknown> = { ...perfilPadrao };
    delete perfilSemMoto.moto;
    const presetCorrompido = {
      ...presetValido('p1'),
      perfil: perfilSemMoto as unknown as PerfilUsuario,
    };
    const storage = criarStorageFalso([presetCorrompido], null);

    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBeNull();
    expect(estado.presets).toEqual([]);
    expect(estado.perfil).toEqual(perfilPadrao);
    expect(storage.preservarCorrompido).toHaveBeenCalledTimes(1);
  });

  it('schemaVersion antigo não migra → cai para padrão e preserva', () => {
    const presetAntigo = {
      ...presetValido('p1'),
      perfil: {
        ...perfilPadrao,
        schemaVersion: 23,
      } as unknown as PerfilUsuario,
    };
    const storage = criarStorageFalso([presetAntigo], 'p1');

    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBeNull();
    expect(estado.presets).toEqual([]);
    expect(estado.perfil).toEqual(perfilPadrao);
    expect(storage.preservarCorrompido).toHaveBeenCalledTimes(1);
  });

  it('schemaVersion futuro não quebra → cai para padrão e preserva', () => {
    const presetFuturo = {
      ...presetValido('p1'),
      perfil: {
        ...perfilPadrao,
        schemaVersion: 999,
        campoDoFuturo: true,
      } as unknown as PerfilUsuario,
    };
    const storage = criarStorageFalso([presetFuturo], 'p1');

    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBeNull();
    expect(estado.presets).toEqual([]);
    expect(estado.perfil).toEqual(perfilPadrao);
    expect(storage.preservarCorrompido).toHaveBeenCalledTimes(1);
  });

  it('nunca lança mesmo com lixo total no storage', () => {
    const storage = criarStorageFalso([{ qualquer: 'lixo' }], 'p1');
    expect(() => criarEstadoInicial(storage)).not.toThrow();
    expect(storage.preservarCorrompido).toHaveBeenCalled();
  });
});
