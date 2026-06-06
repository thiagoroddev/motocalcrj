import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { criarLocalStorageFalso } from '../test/localStorageFalso';
import { LocalStorageThemeStorage } from './themeStorage';

describe('LocalStorageThemeStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', criarLocalStorageFalso());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna dark quando não há tema salvo', () => {
    const storage = new LocalStorageThemeStorage();

    expect(storage.carregarTema()).toBe('dark');
  });

  it('salva e lê tema válido', () => {
    const storage = new LocalStorageThemeStorage();

    storage.salvarTema('light');

    expect(storage.carregarTema()).toBe('light');
  });

  it('ignora tema inválido salvo', () => {
    const storage = new LocalStorageThemeStorage();
    localStorage.setItem('motocalc:tema', 'solarized');

    expect(storage.carregarTema()).toBe('dark');
  });

  it('retorna dark quando leitura do localStorage falha', () => {
    const storage = new LocalStorageThemeStorage();
    vi.mocked(localStorage.getItem).mockImplementation(() => {
      throw new Error('storage indisponivel');
    });

    expect(storage.carregarTema()).toBe('dark');
  });

  it('não lança quando escrita do localStorage falha', () => {
    const storage = new LocalStorageThemeStorage();
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('quota excedida');
    });

    expect(() => storage.salvarTema('light')).not.toThrow();
  });
});
