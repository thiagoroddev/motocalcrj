import { describe, it, expect, vi } from 'vitest';
import { criarEstadoInicial, perfilPadrao } from './PerfilContext';
import type { IPerfilStorage } from '../services/perfilStorage';
import type { PresetEntry, PerfilUsuario } from '../types/perfil';
import { PRESETS } from '../data/repositorioPresets';

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

function perfilPopComOrfaos(sufixo: string): PerfilUsuario {
  const servicoValido = PRESETS.pop110i.servicosManutencao?.[0];
  if (!servicoValido) {
    throw new Error('Preset de teste sem serviço de manutenção');
  }

  return {
    ...perfilPadrao,
    moto: { ...perfilPadrao.moto, marca: 'Honda', modelo: 'pop110i' },
    perfilManutencao: {
      ...perfilPadrao.perfilManutencao,
      estimativaMaoDeObraPorServico: {
        [servicoValido.id]: false,
        [`servico-orfao-${sufixo}`]: true,
      },
    },
    configuracaoDisplay: {
      ...perfilPadrao.configuracaoDisplay,
      filtrosManutencao: {
        ...perfilPadrao.configuracaoDisplay.filtrosManutencao,
        revisaoPorServico: {
          [servicoValido.id]: false,
          [`servico-orfao-${sufixo}`]: false,
        },
      },
    },
    pecasOverrides: [
      {
        id: PRESETS.pop110i.pecas[0].id,
        precoEditadoOriginal: 10,
        precoEditadaParalela: null,
        intervaloKmEditado: null,
      },
      {
        id: `peca-orfa-${sufixo}`,
        precoEditadoOriginal: 20,
        precoEditadaParalela: null,
        intervaloKmEditado: null,
      },
    ],
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

  it('normaliza todos os presets, seleciona o ativo limpo e persiste uma única vez', () => {
    const primeiro = {
      ...presetValido('p1', 'Primeiro'),
      perfil: perfilPopComOrfaos('primeiro'),
    };
    const segundo = {
      ...presetValido('p2', 'Segundo'),
      perfil: perfilPopComOrfaos('segundo'),
    };
    const storage = criarStorageFalso([primeiro, segundo], 'p2');

    const estado = criarEstadoInicial(storage);

    expect(estado.presets[0].perfil.pecasOverrides.map((override) => override.id)).toEqual([
      PRESETS.pop110i.pecas[0].id,
    ]);
    expect(estado.presets[1].perfil.pecasOverrides.map((override) => override.id)).toEqual([
      PRESETS.pop110i.pecas[0].id,
    ]);
    expect(estado.perfil).toBe(estado.presets[1].perfil);
    expect(estado.presets[0].atualizadoEm).toBe(primeiro.atualizadoEm);
    expect(estado.presets[1].atualizadoEm).toBe(segundo.atualizadoEm);
    expect(storage.salvarPresets).toHaveBeenCalledTimes(1);
    expect(storage.salvarPresets).toHaveBeenCalledWith(estado.presets);
    expect(storage.preservarCorrompido).not.toHaveBeenCalled();
  });

  it('não regrava o storage quando o perfil já está consistente com o preset', () => {
    const perfilLimpo: PerfilUsuario = {
      ...perfilPadrao,
      moto: { ...perfilPadrao.moto, marca: 'Honda', modelo: 'pop110i' },
    };
    const storage = criarStorageFalso([{ ...presetValido('p1'), perfil: perfilLimpo }], 'p1');

    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBe('p1');
    expect(storage.salvarPresets).not.toHaveBeenCalled();
    expect(storage.preservarCorrompido).not.toHaveBeenCalled();
  });

  it('preserva referências quando o modelo ainda não possui preset canônico', () => {
    const perfilSemPreset = {
      ...perfilPopComOrfaos('modelo-futuro'),
      moto: {
        ...perfilPadrao.moto,
        marca: 'Marca futura',
        modelo: 'modelo-futuro',
      },
    };
    const storage = criarStorageFalso([{ ...presetValido('p1'), perfil: perfilSemPreset }], 'p1');

    const estado = criarEstadoInicial(storage);

    expect(estado.perfil.pecasOverrides).toHaveLength(2);
    expect(storage.salvarPresets).not.toHaveBeenCalled();
    expect(storage.preservarCorrompido).not.toHaveBeenCalled();
  });

  it('mantém o estado normalizado quando a persistência do reparo falha', () => {
    const storage = criarStorageFalso(
      [{ ...presetValido('p1'), perfil: perfilPopComOrfaos('falha') }],
      'p1',
    );
    vi.mocked(storage.salvarPresets).mockImplementation(() => {
      throw new Error('storage indisponível');
    });

    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBe('p1');
    expect(estado.perfil.pecasOverrides.map((override) => override.id)).toEqual([
      PRESETS.pop110i.pecas[0].id,
    ]);
    expect(storage.salvarPresets).toHaveBeenCalledTimes(1);
    expect(storage.preservarCorrompido).not.toHaveBeenCalled();
  });

  it('schema v2 não é migrado no pré-lançamento e cai para o estado recuperável', () => {
    const presetV2 = {
      ...presetValido('p1'),
      perfil: {
        ...perfilPadrao,
        schemaVersion: 2,
      } as unknown as PerfilUsuario,
    };
    const storage = criarStorageFalso([presetV2], 'p1');

    const estado = criarEstadoInicial(storage);

    expect(estado.presetAtivoId).toBeNull();
    expect(estado.presets).toEqual([]);
    expect(estado.perfil).toEqual(perfilPadrao);
    expect(storage.preservarCorrompido).toHaveBeenCalledTimes(1);
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

  it('schemaVersion histórico não suportado → cai para padrão e preserva', () => {
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
