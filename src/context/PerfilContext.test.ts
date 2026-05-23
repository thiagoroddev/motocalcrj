import { describe, it, expect } from 'vitest';
import { perfilReducer, perfilPadrao, migrarPerfil } from './PerfilContext';
import type { EstadoApp } from './PerfilContext';
import type { PerfilUsuario } from '../types/perfil';

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
          seguro: { ...perfilPadrao.financeiro.seguro, valorAnual: 929.96 },
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
          seguro: { ...perfilPadrao.financeiro.seguro, valorAnual: 929.96 },
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

  // ── Display ───────────────────────────────────

  it('TOGGLE_CATEGORIA inverte a categoria correta', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'TOGGLE_CATEGORIA',
      categoria: 'combustivel',
    });
    expect(resultado.perfil.configuracaoDisplay.categoriasAtivas.combustivel).toBe(false);
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

  // ── RESETAR_AJUSTES_PADRAO (BG-004 / ADR-005) ─

  it('RESETAR_AJUSTES_PADRAO zera custos, mantém uso e não toca em moto/servicos', () => {
    const estadoComCustos: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        moto: { ...perfilPadrao.moto, kmAtual: 15000, marca: 'Honda', modelo: 'pop110i' },
        trabalho: { ...perfilPadrao.trabalho, kmPorDia: 100, diasPorSemana: 6 },
        perfilManutencao: { ...perfilPadrao.perfilManutencao, modoRevisao: 'autorizadas' },
        financeiro: {
          ...perfilPadrao.financeiro,
          internet: 50,
          alimentacaoDia: 25,
          seguro: { valorAnual: 1200, empresa: 'Suhai', periodicidade: 'anual' },
          situacaoMoto: 'financiada',
          parcelaMensal: 500,
          parcelasRestantes: 24,
          gastosCustom: [{ id: 'g1', nome: 'Bag', valorMensal: 8, ativo: true }],
        },
        configuracaoDisplay: {
          categoriasAtivas: {
            combustivel: true,
            alimentacao: true,
            manutencao: true,
            documentacao: true,
            internet: true,
            seguro: true,
            financiamento: true,
          },
        },
      },
    };

    const resultado = perfilReducer(estadoComCustos, { type: 'RESETAR_AJUSTES_PADRAO' });

    // Custos zerados (ADR-005: app não presume gastos)
    expect(resultado.perfil.financeiro.internet).toBe(0);
    expect(resultado.perfil.financeiro.alimentacaoDia).toBe(0);
    expect(resultado.perfil.financeiro.seguro.valorAnual).toBe(0);
    expect(resultado.perfil.financeiro.gastosCustom).toEqual([]);
    expect(resultado.perfil.financeiro.situacaoMoto).toBe('quitada');
    expect(resultado.perfil.financeiro.parcelaMensal).toBeNull();
    expect(resultado.perfil.financeiro.parcelasRestantes).toBeNull();
    expect(resultado.perfil.financeiro.aluguelMensal).toBeNull();
    expect(resultado.perfil.financeiro.aluguelPeriodicidade).toBeNull();

    // Uso e modo de revisão voltam ao padrão (não são custos)
    expect(resultado.perfil.trabalho.kmPorDia).toBe(70);
    expect(resultado.perfil.trabalho.diasPorSemana).toBe(5);
    expect(resultado.perfil.perfilManutencao.modoRevisao).toBe('independentes');

    // Filtros do Detalhamento para custos zerados ficam desligados
    expect(resultado.perfil.configuracaoDisplay.categoriasAtivas.internet).toBe(false);
    expect(resultado.perfil.configuracaoDisplay.categoriasAtivas.seguro).toBe(false);
    expect(resultado.perfil.configuracaoDisplay.categoriasAtivas.alimentacao).toBe(false);
    expect(resultado.perfil.configuracaoDisplay.categoriasAtivas.financiamento).toBe(false);

    // Moto e servicosIndependentes não são tocados
    expect(resultado.perfil.moto).toEqual(estadoComCustos.perfil.moto);
    expect(resultado.perfil.servicosIndependentes).toBe(
      estadoComCustos.perfil.servicosIndependentes,
    );
  });

  // ── Migração de schema ────────────────────────

  // Cascata v8 → v9 → v10 (REF-19 + REF-21): perfis v8 chegam ao schema atual limpos.
  // Constrói o input com cast porque os campos legados foram apagados do tipo.
  it('migrarPerfil cascata v8 → v10 remove todos os campos mortos e chega no schema atual', () => {
    const perfilV8 = {
      ...perfilPadrao,
      schemaVersion: 8,
      perfilManutencao: {
        ...perfilPadrao.perfilManutencao,
        precoMaoDeObraIndependente: 150,
        frequenciaRevisaoKm: 6000,
      },
      configuracaoDisplay: {
        ...perfilPadrao.configuracaoDisplay,
        modoOficinDisplay: 'independentes',
      },
      historicoManutencao: {
        trocasOleo: [],
        revisoes: [],
        trocasPneu: [],
        trocasKitRelacao: [],
        abastecimentos: [],
      },
      diarioTrabalho: [],
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV8) as unknown as Record<string, unknown>;

    expect(migrado.schemaVersion).toBe(10);
    expect(
      (migrado.perfilManutencao as Record<string, unknown>).precoMaoDeObraIndependente,
    ).toBeUndefined();
    expect(
      (migrado.perfilManutencao as Record<string, unknown>).frequenciaRevisaoKm,
    ).toBeUndefined();
    expect(
      (migrado.configuracaoDisplay as Record<string, unknown>).modoOficinDisplay,
    ).toBeUndefined();
    expect(migrado.historicoManutencao).toBeUndefined();
    expect(migrado.diarioTrabalho).toBeUndefined();
    // Campos válidos preservados
    expect((migrado.perfilManutencao as Record<string, unknown>).perfilPecasGlobal).toBe(
      'original',
    );
    expect((migrado.configuracaoDisplay as Record<string, unknown>).categoriasAtivas).toBeDefined();
  });

  // v9 → v10 (REF-21): remove seguro.tem; quando tem===false, força valorAnual: 0
  it('migrarPerfil v9 → v10 com seguro.tem===true preserva valorAnual e remove tem', () => {
    const perfilV9 = {
      ...perfilPadrao,
      schemaVersion: 9,
      financeiro: {
        ...perfilPadrao.financeiro,
        seguro: { tem: true, valorAnual: 1200, empresa: 'Suhai', periodicidade: 'anual' },
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV9) as unknown as Record<string, unknown>;
    const seguro = (migrado.financeiro as Record<string, unknown>).seguro as Record<
      string,
      unknown
    >;

    expect(migrado.schemaVersion).toBe(10);
    expect(seguro.tem).toBeUndefined();
    expect(seguro.valorAnual).toBe(1200);
    expect(seguro.empresa).toBe('Suhai');
    expect(seguro.periodicidade).toBe('anual');
  });

  it('migrarPerfil v9 → v10 com seguro.tem===false força valorAnual: 0 (preserva intenção)', () => {
    // Perfil que tinha seguro desligado mas com valor "esquecido" — sem o force-zero,
    // pós-migração ingênua passaria a contar seguro.
    const perfilV9 = {
      ...perfilPadrao,
      schemaVersion: 9,
      financeiro: {
        ...perfilPadrao.financeiro,
        seguro: { tem: false, valorAnual: 929.96, empresa: null, periodicidade: 'anual' },
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV9) as unknown as Record<string, unknown>;
    const seguro = (migrado.financeiro as Record<string, unknown>).seguro as Record<
      string,
      unknown
    >;

    expect(migrado.schemaVersion).toBe(10);
    expect(seguro.tem).toBeUndefined();
    expect(seguro.valorAnual).toBe(0);
  });

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
