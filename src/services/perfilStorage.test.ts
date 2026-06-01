import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStoragePerfilStorage } from './perfilStorage';
import type { PresetEntry } from '../types/perfil';

function criarLocalStorageFalso(): Storage {
  const dados = new Map<string, string>();

  return {
    get length() {
      return dados.size;
    },
    clear: vi.fn(() => dados.clear()),
    getItem: vi.fn((chave: string) => dados.get(chave) ?? null),
    key: vi.fn((indice: number) => [...dados.keys()][indice] ?? null),
    removeItem: vi.fn((chave: string) => {
      dados.delete(chave);
    }),
    setItem: vi.fn((chave: string, valor: string) => {
      dados.set(chave, String(valor));
    }),
  };
}

describe('LocalStoragePerfilStorage — namespace pré-lançamento', () => {
  let localStorageFalso: Storage;

  beforeEach(() => {
    localStorageFalso = criarLocalStorageFalso();
    vi.stubGlobal('localStorage', localStorageFalso);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ignora chaves antigas motocalc:v5', () => {
    localStorage.setItem('motocalc:v5:presets', JSON.stringify([{ legado: true }]));
    localStorage.setItem('motocalc:v5:presetAtivo', 'preset-legado');

    const storage = new LocalStoragePerfilStorage();

    expect(storage.carregarPresets()).toEqual([]);
    expect(storage.getPresetAtivo()).toBeNull();
  });

  it('salva e lê apenas o namespace estimamoto:v1', () => {
    const presets = [{ presetId: 'p1' }] as PresetEntry[];
    const storage = new LocalStoragePerfilStorage();

    storage.salvarPresets(presets);
    storage.setPresetAtivo('p1');

    expect(localStorage.getItem('estimamoto:v1:presets')).toBe(JSON.stringify(presets));
    expect(localStorage.getItem('estimamoto:v1:presetAtivo')).toBe('p1');
    expect(storage.carregarPresets()).toEqual(presets);
    expect(storage.getPresetAtivo()).toBe('p1');
  });

  it('preserva blob corrompido no namespace atual', () => {
    const storage = new LocalStoragePerfilStorage();
    localStorage.setItem('estimamoto:v1:presets', '{quebrado');

    storage.preservarCorrompido();

    const preservado = JSON.parse(localStorage.getItem('estimamoto:v1:presets.corrupted')!);
    expect(preservado.raw).toBe('{quebrado');
    expect(typeof preservado.carimbo).toBe('string');
  });
});
