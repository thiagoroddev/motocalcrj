import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixtureReal from '../fixtures/usuario_teste.json';
import { criarLocalStorageFalso } from '../test/localStorageFalso';
import { CHAVES_PERFIL_STORAGE, LocalStoragePerfilStorage } from './perfilStorage';
import { carregarFixtureDesenvolvimento } from './fixtureDesenvolvimento';

describe('carregarFixtureDesenvolvimento', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', criarLocalStorageFalso());
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('persiste a fixture válida e o preset ativo quando o storage está vazio', async () => {
    const storage = new LocalStoragePerfilStorage();

    const resultado = await carregarFixtureDesenvolvimento(storage, async () => fixtureReal);

    expect(resultado).toBe('carregada');
    expect(storage.carregarPresets()).toHaveLength(2);
    expect(storage.getPresetAtivo()).toBe('preset_trabalho_001');
    expect(console.info).toHaveBeenCalledWith('[DEV] Fixture carregada: 2 presets disponíveis');
  });

  it('preserva dados existentes sem carregar a fixture', async () => {
    const storage = new LocalStoragePerfilStorage();
    const carregarFixture = vi.fn(async () => fixtureReal);
    localStorage.setItem(
      CHAVES_PERFIL_STORAGE.presets,
      JSON.stringify([{ presetId: 'existente' }]),
    );
    localStorage.setItem(CHAVES_PERFIL_STORAGE.presetAtivo, 'existente');

    const resultado = await carregarFixtureDesenvolvimento(storage, carregarFixture);

    expect(resultado).toBe('ignorada');
    expect(carregarFixture).not.toHaveBeenCalled();
    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presets)).toBe(
      JSON.stringify([{ presetId: 'existente' }]),
    );
    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo)).toBe('existente');
  });

  it('não persiste fixture inválida e mantém a falha observável', async () => {
    const storage = new LocalStoragePerfilStorage();
    const fixtureInvalida = {
      [CHAVES_PERFIL_STORAGE.presets]: fixtureReal[CHAVES_PERFIL_STORAGE.presets],
      [CHAVES_PERFIL_STORAGE.presetAtivo]: 'preset-inexistente',
    };

    const resultado = await carregarFixtureDesenvolvimento(storage, async () => fixtureInvalida);

    expect(resultado).toBe('falhou');
    expect(storage.carregarPresets()).toEqual([]);
    expect(storage.getPresetAtivo()).toBeNull();
    expect(console.error).toHaveBeenCalledOnce();
  });

  it('não lança quando o carregador da fixture falha', async () => {
    const storage = new LocalStoragePerfilStorage();

    const resultado = await carregarFixtureDesenvolvimento(storage, async () => {
      throw new Error('fixture indisponível');
    });

    expect(resultado).toBe('falhou');
    expect(console.error).toHaveBeenCalledOnce();
  });
});
