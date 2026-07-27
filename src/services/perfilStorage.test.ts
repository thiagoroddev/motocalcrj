import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { criarLocalStorageFalso } from '../test/localStorageFalso';
import { CHAVES_PERFIL_STORAGE, LocalStoragePerfilStorage } from './perfilStorage';
import type { PresetEntry } from '../types/perfil';

describe('LocalStoragePerfilStorage - namespace pré-lançamento', () => {
  let localStorageFalso: Storage;

  beforeEach(() => {
    localStorageFalso = criarLocalStorageFalso();
    vi.stubGlobal('localStorage', localStorageFalso);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ignora chaves antigas motocalc:v5 e estimamoto:v0', () => {
    localStorage.setItem('motocalc:v5:presets', JSON.stringify([{ legado: true }]));
    localStorage.setItem('motocalc:v5:presetAtivo', 'preset-legado');
    localStorage.setItem('estimamoto:v0:presets', JSON.stringify([{ legado: true }]));
    localStorage.setItem('estimamoto:v0:presetAtivo', 'preset-legado');

    const storage = new LocalStoragePerfilStorage();

    expect(storage.carregarPresets()).toEqual([]);
    expect(storage.getPresetAtivo()).toBeNull();
  });

  it('salva e lê apenas o namespace motocusto:v0', () => {
    const presets = [{ presetId: 'p1' }] as PresetEntry[];
    const storage = new LocalStoragePerfilStorage();

    storage.salvarPresets(presets);
    storage.setPresetAtivo('p1');

    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presets)).toBe(JSON.stringify(presets));
    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo)).toBe('p1');
    expect(storage.carregarPresets()).toEqual(presets);
    expect(storage.getPresetAtivo()).toBe('p1');
  });

  it('preserva blob corrompido no namespace atual', () => {
    const storage = new LocalStoragePerfilStorage();
    localStorage.setItem(CHAVES_PERFIL_STORAGE.presets, '{quebrado');

    storage.preservarCorrompido();

    const preservado = JSON.parse(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetsCorrompidos)!);
    expect(preservado.raw).toBe('{quebrado');
    expect(typeof preservado.carimbo).toBe('string');
  });

  it('remove preset ativo quando recebe null', () => {
    const storage = new LocalStoragePerfilStorage();
    storage.setPresetAtivo('p1');

    storage.setPresetAtivo(null);

    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo)).toBeNull();
    expect(storage.getPresetAtivo()).toBeNull();
  });

  it('retorna lista vazia quando presets salvos têm JSON inválido', () => {
    const storage = new LocalStoragePerfilStorage();
    localStorage.setItem(CHAVES_PERFIL_STORAGE.presets, '{quebrado');

    expect(storage.carregarPresets()).toEqual([]);
  });

  it('preservarCorrompido nunca lança quando localStorage falha', () => {
    const storage = new LocalStoragePerfilStorage();
    vi.mocked(localStorage.getItem).mockImplementation(() => {
      throw new Error('storage indisponivel');
    });

    expect(() => storage.preservarCorrompido()).not.toThrow();
  });

  it('retorna null quando preset ativo não pode ser lido', () => {
    const storage = new LocalStoragePerfilStorage();
    vi.mocked(localStorage.getItem).mockImplementation(() => {
      throw new Error('storage indisponivel');
    });

    expect(storage.getPresetAtivo()).toBeNull();
  });

  it('não lança quando salvarPresets falha', () => {
    const storage = new LocalStoragePerfilStorage();
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('quota excedida');
    });

    expect(() => storage.salvarPresets([{ presetId: 'p1' }] as PresetEntry[])).not.toThrow();
  });

  it('não lança quando setPresetAtivo falha', () => {
    const storage = new LocalStoragePerfilStorage();
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('quota excedida');
    });
    vi.mocked(localStorage.removeItem).mockImplementation(() => {
      throw new Error('storage indisponivel');
    });

    expect(() => storage.setPresetAtivo('p1')).not.toThrow();
    expect(() => storage.setPresetAtivo(null)).not.toThrow();
  });

  it('não lança quando limpar falha', () => {
    const storage = new LocalStoragePerfilStorage();
    vi.mocked(localStorage.removeItem).mockImplementation(() => {
      throw new Error('storage indisponivel');
    });

    expect(() => storage.limpar()).not.toThrow();
  });
});
