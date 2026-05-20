import { describe, it, expect } from 'vitest';
import { perfilReducer, perfilPadrao } from './PerfilContext';
import type { EstadoApp } from './PerfilContext';

const estadoVazio: EstadoApp = {
  perfil: perfilPadrao,
  presets: [],
  presetAtivoId: null,
};

describe('perfilReducer', () => {
  // ── Rodagem ──────────────────────────────────

  it('SET_KM_POR_DIA atualiza trabalho.kmPorDia', () => {
    const resultado = perfilReducer(estadoVazio, { type: 'SET_KM_POR_DIA', valor: 90 });
    expect(resultado.perfil.trabalho.kmPorDia).toBe(90);
  });

  it('SET_DIAS_POR_SEMANA atualiza trabalho.diasPorSemana', () => {
    const resultado = perfilReducer(estadoVazio, { type: 'SET_DIAS_POR_SEMANA', valor: 6 });
    expect(resultado.perfil.trabalho.diasPorSemana).toBe(6);
  });

  it('SET_KM_ATUAL atualiza moto.kmAtual', () => {
    const resultado = perfilReducer(estadoVazio, { type: 'SET_KM_ATUAL', valor: 20000 });
    expect(resultado.perfil.moto.kmAtual).toBe(20000);
  });

  // ── COMMIT_ONBOARDING ─────────────────────────

  it('COMMIT_ONBOARDING cria um preset e marca onboardingConcluido', () => {
    const estadoComDados: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        moto: { ...perfilPadrao.moto, marca: 'Honda', modelo: 'pop110i', ano: 2024 },
        financeiro: {
          ...perfilPadrao.financeiro,
          seguro: { ...perfilPadrao.financeiro.seguro, tem: true },
          internet: 50,
          alimentacaoDia: 20,
          situacaoMoto: 'financiada',
        },
      },
    };

    const resultado = perfilReducer(estadoComDados, { type: 'COMMIT_ONBOARDING' });

    expect(resultado.perfil.onboardingConcluido).toBe(true);
    expect(resultado.presets).toHaveLength(1);
    expect(resultado.presetAtivoId).toBe(resultado.presets[0].presetId);
  });

  it('COMMIT_ONBOARDING ativa categoriasAtivas com base nas respostas', () => {
    const estadoComDados: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        financeiro: {
          ...perfilPadrao.financeiro,
          seguro: { ...perfilPadrao.financeiro.seguro, tem: true },
          internet: 50,
          alimentacaoDia: 20,
          situacaoMoto: 'financiada',
        },
      },
    };

    const resultado = perfilReducer(estadoComDados, { type: 'COMMIT_ONBOARDING' });
    const { categoriasAtivas } = resultado.perfil.configuracaoDisplay;

    expect(categoriasAtivas.seguro).toBe(true);
    expect(categoriasAtivas.internet).toBe(true);
    expect(categoriasAtivas.financiamento).toBe(true);
    expect(categoriasAtivas.alimentacao).toBe(true);
  });

  it('COMMIT_ONBOARDING nao ativa categorias quando nao aplicavel', () => {
    const resultado = perfilReducer(estadoVazio, { type: 'COMMIT_ONBOARDING' });
    const { categoriasAtivas } = resultado.perfil.configuracaoDisplay;

    expect(categoriasAtivas.seguro).toBe(false);
    expect(categoriasAtivas.internet).toBe(false);
    expect(categoriasAtivas.financiamento).toBe(false);
  });

  // ── Registros e kmAtual (RN-24) ───────────────

  it('ADD_DIA_TRABALHO atualiza kmAtual quando kmFinal e maior', () => {
    const estadoComKm: EstadoApp = {
      ...estadoVazio,
      perfil: { ...perfilPadrao, moto: { ...perfilPadrao.moto, kmAtual: 10000 } },
    };
    const resultado = perfilReducer(estadoComKm, {
      type: 'ADD_DIA_TRABALHO',
      entrada: {
        data: '2026-05-01',
        kmInicial: 10000,
        kmFinal: 10070,
        kmPercorridos: 70,
        comeu: true,
        abasteceu: false,
        litros: null,
        precoLitro: null,
      },
    });
    expect(resultado.perfil.moto.kmAtual).toBe(10070);
    expect(resultado.perfil.diarioTrabalho).toHaveLength(1);
  });

  it('ADD_DIA_TRABALHO nao diminui kmAtual', () => {
    const estadoComKm: EstadoApp = {
      ...estadoVazio,
      perfil: { ...perfilPadrao, moto: { ...perfilPadrao.moto, kmAtual: 20000 } },
    };
    const resultado = perfilReducer(estadoComKm, {
      type: 'ADD_DIA_TRABALHO',
      entrada: {
        data: '2026-04-01',
        kmInicial: 9900,
        kmFinal: 9970,
        kmPercorridos: 70,
        comeu: false,
        abasteceu: false,
        litros: null,
        precoLitro: null,
      },
    });
    expect(resultado.perfil.moto.kmAtual).toBe(20000);
  });

  it('DELETE_DIA_TRABALHO remove o registro correto', () => {
    const estadoComEntrada: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        diarioTrabalho: [
          {
            id: 'dia-abc',
            data: '2026-05-01',
            kmInicial: 100,
            kmFinal: 170,
            kmPercorridos: 70,
            comeu: true,
            abasteceu: false,
            litros: null,
            precoLitro: null,
          },
        ],
      },
    };
    const resultado = perfilReducer(estadoComEntrada, {
      type: 'DELETE_DIA_TRABALHO',
      id: 'dia-abc',
    });
    expect(resultado.perfil.diarioTrabalho).toHaveLength(0);
  });

  // ── Display ───────────────────────────────────

  it('TOGGLE_CATEGORIA inverte a categoria correta', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'TOGGLE_CATEGORIA',
      categoria: 'combustivel',
    });
    expect(resultado.perfil.configuracaoDisplay.categoriasAtivas.combustivel).toBe(false);
  });

  it('SET_MODO_EXIBICAO atualiza modoExibicao', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'SET_MODO_EXIBICAO',
      modo: 'personalizado',
    });
    expect(resultado.perfil.configuracaoDisplay.modoExibicao).toBe('personalizado');
  });

  // ── Overrides de pecas ────────────────────────

  it('RESET_PECA_OVERRIDE sem campo remove o override completo', () => {
    const estadoComOverride: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        pecasOverrides: [
          {
            id: 'oleo_motor',
            precoEditadoOriginal: 45,
            precoEditadaParalela: null,
            intervaloKmEditado: null,
          },
        ],
      },
    };
    const resultado = perfilReducer(estadoComOverride, {
      type: 'RESET_PECA_OVERRIDE',
      id: 'oleo_motor',
    });
    expect(resultado.perfil.pecasOverrides).toHaveLength(0);
  });

  it('RESET_PECA_OVERRIDE com campo reseta apenas aquele campo para null', () => {
    const estadoComOverride: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        pecasOverrides: [
          {
            id: 'oleo_motor',
            precoEditadoOriginal: 45,
            precoEditadaParalela: null,
            intervaloKmEditado: 800,
          },
        ],
      },
    };
    const resultado = perfilReducer(estadoComOverride, {
      type: 'RESET_PECA_OVERRIDE',
      id: 'oleo_motor',
      campo: 'precoOriginal',
    });
    expect(resultado.perfil.pecasOverrides[0].precoEditadoOriginal).toBeNull();
    expect(resultado.perfil.pecasOverrides[0].intervaloKmEditado).toBe(800);
  });

  // ── Preset management ─────────────────────────

  it('RESETAR_PERFIL limpa presets e volta ao perfilPadrao', () => {
    const estadoComPreset: EstadoApp = {
      perfil: { ...perfilPadrao, onboardingConcluido: true },
      presets: [
        {
          presetId: 'p1',
          nome: 'Teste',
          criadoEm: '2026-01-01',
          atualizadoEm: '2026-01-01',
          perfil: perfilPadrao,
        },
      ],
      presetAtivoId: 'p1',
    };
    const resultado = perfilReducer(estadoComPreset, { type: 'RESETAR_PERFIL' });
    expect(resultado.presets).toHaveLength(0);
    expect(resultado.presetAtivoId).toBeNull();
    expect(resultado.perfil.onboardingConcluido).toBe(false);
  });

  it('CARREGAR_PERFIL troca o perfil ativo e o presetAtivoId', () => {
    const perfilAlternativo = { ...perfilPadrao, apelido: 'Pessoal' };
    const estadoInicial: EstadoApp = {
      perfil: perfilPadrao,
      presets: [
        {
          presetId: 'p2',
          nome: 'Pessoal',
          criadoEm: '2026-01-01',
          atualizadoEm: '2026-01-01',
          perfil: perfilAlternativo,
        },
      ],
      presetAtivoId: null,
    };
    const resultado = perfilReducer(estadoInicial, {
      type: 'CARREGAR_PERFIL',
      perfil: perfilAlternativo,
      presetId: 'p2',
    });
    expect(resultado.perfil.apelido).toBe('Pessoal');
    expect(resultado.presetAtivoId).toBe('p2');
  });

  // ── Sincronizacao com presets ─────────────────

  it('SET_KM_POR_DIA sincroniza a alteracao com o preset ativo', () => {
    const presetId = 'preset-sync-test';
    const estadoComPreset: EstadoApp = {
      perfil: { ...perfilPadrao, trabalho: { ...perfilPadrao.trabalho, kmPorDia: 70 } },
      presets: [
        {
          presetId,
          nome: 'Sync Test',
          criadoEm: '2026-01-01',
          atualizadoEm: '2026-01-01',
          perfil: { ...perfilPadrao, trabalho: { ...perfilPadrao.trabalho, kmPorDia: 70 } },
        },
      ],
      presetAtivoId: presetId,
    };
    const resultado = perfilReducer(estadoComPreset, { type: 'SET_KM_POR_DIA', valor: 100 });
    expect(resultado.perfil.trabalho.kmPorDia).toBe(100);
    expect(resultado.presets[0].perfil.trabalho.kmPorDia).toBe(100);
  });
});
