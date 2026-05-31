import { describe, it, expect } from 'vitest';
import {
  perfilReducer,
  perfilPadrao,
  SERVICOS_INDEPENDENTES_PADRAO,
  PRESETS_GASTOS_PADRAO,
} from './PerfilContext';
import { migrarPerfil } from '../services/migracoes';
import type { EstadoApp } from './PerfilContext';
import type { PerfilUsuario, ServicoIndependente } from '../types/perfil';

const estadoVazio: EstadoApp = {
  perfil: perfilPadrao,
  presets: [],
  presetAtivoId: null,
};

function criarPerfilValido({
  moto = {},
  financeiro = {},
}: {
  moto?: Partial<PerfilUsuario['moto']>;
  financeiro?: Partial<PerfilUsuario['financeiro']>;
} = {}): PerfilUsuario {
  return {
    ...perfilPadrao,
    moto: {
      ...perfilPadrao.moto,
      marca: 'Honda',
      modelo: 'pop110i',
      ano: 2024,
      kmAtual: 15000,
      ...moto,
    },
    financeiro: {
      ...perfilPadrao.financeiro,
      ...financeiro,
    },
  };
}

function servicoPadrao(id: string): ServicoIndependente {
  const servico = SERVICOS_INDEPENDENTES_PADRAO.find((s) => s.id === id);
  if (!servico) {
    throw new Error(`Serviço padrão ausente: ${id}`);
  }
  return servico;
}

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
      perfil: criarPerfilValido({
        financeiro: {
          seguro: { ...perfilPadrao.financeiro.seguro, valorAnual: 929.96 },
          internet: 50,
          alimentacaoDia: 20,
          situacaoMoto: 'financiada',
        },
      }),
    };

    const resultado = perfilReducer(estadoComDados, { type: 'COMMIT_ONBOARDING' });

    expect(resultado.perfil.onboardingConcluido).toBe(true);
    expect(resultado.presets).toHaveLength(1);
    expect(resultado.presetAtivoId).toBe(resultado.presets[0].presetId);
  });

  it('COMMIT_ONBOARDING ativa categoriasAtivas com base nas respostas', () => {
    const estadoComDados: EstadoApp = {
      ...estadoVazio,
      perfil: criarPerfilValido({
        financeiro: {
          seguro: { ...perfilPadrao.financeiro.seguro, valorAnual: 929.96 },
          internet: 50,
          alimentacaoDia: 20,
          situacaoMoto: 'financiada',
        },
      }),
    };

    const resultado = perfilReducer(estadoComDados, { type: 'COMMIT_ONBOARDING' });
    const { categoriasAtivas } = resultado.perfil.configuracaoDisplay;

    expect(categoriasAtivas.seguro).toBe(true);
    expect(categoriasAtivas.internet).toBe(true);
    expect(categoriasAtivas.financiamento).toBe(true);
    expect(categoriasAtivas.alimentacao).toBe(true);
  });

  it('COMMIT_ONBOARDING nao ativa categorias quando nao aplicavel', () => {
    const resultado = perfilReducer(
      { ...estadoVazio, perfil: criarPerfilValido() },
      { type: 'COMMIT_ONBOARDING' },
    );
    const { categoriasAtivas } = resultado.perfil.configuracaoDisplay;

    expect(categoriasAtivas.seguro).toBe(false);
    expect(categoriasAtivas.internet).toBe(false);
    expect(categoriasAtivas.financiamento).toBe(false);
  });

  it('COMMIT_ONBOARDING com perfil vazio nao cria preset invalido', () => {
    const resultado = perfilReducer(estadoVazio, { type: 'COMMIT_ONBOARDING' });

    expect(resultado.perfil.onboardingConcluido).toBe(false);
    expect(resultado.presets).toHaveLength(0);
    expect(resultado.presetAtivoId).toBeNull();
    expect(resultado.perfil.moto.modelo).toBe('');
  });

  it('COMMIT_ONBOARDING com modelo ausente do catalogo nao cria preset', () => {
    const estadoComModeloInvalido: EstadoApp = {
      ...estadoVazio,
      perfil: criarPerfilValido({ moto: { modelo: 'modelo-inexistente' } }),
    };

    const resultado = perfilReducer(estadoComModeloInvalido, { type: 'COMMIT_ONBOARDING' });

    expect(resultado.perfil.onboardingConcluido).toBe(false);
    expect(resultado.presets).toHaveLength(0);
    expect(resultado.presetAtivoId).toBeNull();
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

  // ── Mão de obra ──────────────────────────────

  it('SET_SERVICO_INDEPENDENTE aceita reset da bateria temporal com intervalKm 0', () => {
    const bateriaPadrao = servicoPadrao('troca-bateria');
    const estadoComBateriaEditada: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        servicosIndependentes: perfilPadrao.servicosIndependentes.map((servico) =>
          servico.id === 'troca-bateria'
            ? { ...servico, intervalKm: 5000, precoIndependente: 99 }
            : servico,
        ),
      },
    };

    const resultado = perfilReducer(estadoComBateriaEditada, {
      type: 'SET_SERVICO_INDEPENDENTE',
      payload: { ...bateriaPadrao },
    });
    const bateria = resultado.perfil.servicosIndependentes.find((s) => s.id === 'troca-bateria');

    expect(bateria?.intervalKm).toBe(0);
    expect(bateria?.precoIndependente).toBe(bateriaPadrao.precoIndependente);
  });

  it('SET_SERVICO_INDEPENDENTE permite editar preço da bateria mantendo intervalKm 0', () => {
    const bateriaPadrao = servicoPadrao('troca-bateria');

    const resultado = perfilReducer(estadoVazio, {
      type: 'SET_SERVICO_INDEPENDENTE',
      payload: { ...bateriaPadrao, precoIndependente: 75 },
    });
    const bateria = resultado.perfil.servicosIndependentes.find((s) => s.id === 'troca-bateria');

    expect(bateria?.intervalKm).toBe(0);
    expect(bateria?.precoIndependente).toBe(75);
  });

  it('SET_SERVICO_INDEPENDENTE continua rejeitando intervalKm 0 em serviço normal', () => {
    const oleoPadrao = servicoPadrao('troca-oleo');

    const resultado = perfilReducer(estadoVazio, {
      type: 'SET_SERVICO_INDEPENDENTE',
      payload: { ...oleoPadrao, intervalKm: 0, precoIndependente: 999 },
    });
    const oleo = resultado.perfil.servicosIndependentes.find((s) => s.id === 'troca-oleo');

    expect(oleo?.intervalKm).toBe(oleoPadrao.intervalKm);
    expect(oleo?.precoIndependente).toBe(oleoPadrao.precoIndependente);
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
          gastosCustom: [
            { id: 'preset-multa', nome: 'Multa', valorAnual: 800, ativo: true, ehPreset: true },
          ],
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
            imprevistos: true,
          },
          imprevistosSugeridosAtivos: {},
          filtrosManutencao: perfilPadrao.configuracaoDisplay.filtrosManutencao,
        },
      },
    };

    const resultado = perfilReducer(estadoComCustos, { type: 'RESETAR_AJUSTES_PADRAO' });

    // Custos zerados (ADR-005: app não presume gastos)
    expect(resultado.perfil.financeiro.internet).toBe(0);
    expect(resultado.perfil.financeiro.alimentacaoDia).toBe(0);
    expect(resultado.perfil.financeiro.seguro.valorAnual).toBe(0);
    expect(resultado.perfil.financeiro.gastosCustom).toEqual(PRESETS_GASTOS_PADRAO);
    expect(resultado.perfil.financeiro.situacaoMoto).toBe('quitada');
    expect(resultado.perfil.financeiro.parcelaMensal).toBeNull();
    expect(resultado.perfil.financeiro.parcelasRestantes).toBeNull();
    expect(resultado.perfil.financeiro.dataReferenciaParcelas).toBeNull();
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

    // Imprevistos: categoria volta ao default true, sugeridos zerados
    expect(resultado.perfil.configuracaoDisplay.categoriasAtivas.imprevistos).toBe(true);
    expect(resultado.perfil.configuracaoDisplay.imprevistosSugeridosAtivos).toEqual({});
    expect(resultado.perfil.configuracaoDisplay.filtrosManutencao).toEqual({
      revisao: true,
      manutencaoPorPeca: {},
      revisaoPorServico: {},
    });

    // Moto e servicosIndependentes não são tocados
    expect(resultado.perfil.moto).toEqual(estadoComCustos.perfil.moto);
    expect(resultado.perfil.servicosIndependentes).toBe(
      estadoComCustos.perfil.servicosIndependentes,
    );
  });

  // ── SET_PARCELA: snapshot e re-ancoragem (TASK-RF-6.18) ─

  it('SET_PARCELA re-ancora dataReferenciaParcelas quando parcelasRestantes muda', () => {
    const refAntiga = '2026-01-01T00:00:00.000Z';
    const estado: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        financeiro: {
          ...perfilPadrao.financeiro,
          situacaoMoto: 'financiada',
          parcelaMensal: 500,
          parcelasRestantes: 24,
          dataReferenciaParcelas: refAntiga,
        },
      },
    };

    const antes = Date.now();
    const resultado = perfilReducer(estado, {
      type: 'SET_PARCELA',
      parcelaMensal: 500,
      parcelasRestantes: 20,
    });
    const depois = Date.now();

    expect(resultado.perfil.financeiro.parcelasRestantes).toBe(20);
    // âncora re-stampada para "agora" — o relógio reinicia a partir do novo valor
    expect(resultado.perfil.financeiro.dataReferenciaParcelas).not.toBe(refAntiga);
    const novaRef = new Date(resultado.perfil.financeiro.dataReferenciaParcelas!).getTime();
    expect(novaRef).toBeGreaterThanOrEqual(antes);
    expect(novaRef).toBeLessThanOrEqual(depois);
  });

  it('SET_PARCELA preserva dataReferenciaParcelas quando só a parcela mensal muda', () => {
    const refAntiga = '2026-01-01T00:00:00.000Z';
    const estado: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        financeiro: {
          ...perfilPadrao.financeiro,
          situacaoMoto: 'financiada',
          parcelaMensal: 500,
          parcelasRestantes: 24,
          dataReferenciaParcelas: refAntiga,
        },
      },
    };

    const resultado = perfilReducer(estado, {
      type: 'SET_PARCELA',
      parcelaMensal: 600,
      parcelasRestantes: 24,
    });

    // editar só o valor da parcela não pode resetar o decremento (RF-6.18)
    expect(resultado.perfil.financeiro.parcelaMensal).toBe(600);
    expect(resultado.perfil.financeiro.dataReferenciaParcelas).toBe(refAntiga);
  });

  it('SET_PARCELA zera dataReferenciaParcelas quando parcelasRestantes vira null', () => {
    const estado: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        financeiro: {
          ...perfilPadrao.financeiro,
          situacaoMoto: 'financiada',
          parcelaMensal: 500,
          parcelasRestantes: 24,
          dataReferenciaParcelas: '2026-01-01T00:00:00.000Z',
        },
      },
    };

    const resultado = perfilReducer(estado, {
      type: 'SET_PARCELA',
      parcelaMensal: 500,
      parcelasRestantes: null,
    });

    expect(resultado.perfil.financeiro.parcelasRestantes).toBeNull();
    expect(resultado.perfil.financeiro.dataReferenciaParcelas).toBeNull();
  });

  // ── TOGGLE_IMPREVISTO_SUGERIDO (TASK-RF-6.11 cleanup) ─

  it('TOGGLE_IMPREVISTO_SUGERIDO ativa o sugerido quando estava desligado', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'TOGGLE_IMPREVISTO_SUGERIDO',
      id: 'retifica-cabecote',
    });
    expect(
      resultado.perfil.configuracaoDisplay.imprevistosSugeridosAtivos['retifica-cabecote'],
    ).toBe(true);
  });

  it('TOGGLE_IMPREVISTO_SUGERIDO desativa quando já estava ligado', () => {
    const estadoComSugeridoLigado: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        configuracaoDisplay: {
          ...perfilPadrao.configuracaoDisplay,
          imprevistosSugeridosAtivos: { 'retifica-cabecote': true },
        },
      },
    };
    const resultado = perfilReducer(estadoComSugeridoLigado, {
      type: 'TOGGLE_IMPREVISTO_SUGERIDO',
      id: 'retifica-cabecote',
    });
    expect(
      resultado.perfil.configuracaoDisplay.imprevistosSugeridosAtivos['retifica-cabecote'],
    ).toBe(false);
  });

  it('TOGGLE_CATEGORIA com categoria imprevistos inverte o flag persistido', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'TOGGLE_CATEGORIA',
      categoria: 'imprevistos',
    });
    expect(resultado.perfil.configuracaoDisplay.categoriasAtivas.imprevistos).toBe(false);
  });

  // ── Filtros finos de Manutenção persistidos (TASK-BG-014) ─

  it('TOGGLE_REVISAO_MANUTENCAO persiste revisão desligada e religa depois', () => {
    const desligado = perfilReducer(estadoVazio, { type: 'TOGGLE_REVISAO_MANUTENCAO' });
    const religado = perfilReducer(desligado, { type: 'TOGGLE_REVISAO_MANUTENCAO' });

    expect(desligado.perfil.configuracaoDisplay.filtrosManutencao.revisao).toBe(false);
    expect(religado.perfil.configuracaoDisplay.filtrosManutencao.revisao).toBe(true);
  });

  it('TOGGLE_MANUTENCAO_POR_PECA grava false explícito e remove ao religar', () => {
    const desligado = perfilReducer(estadoVazio, {
      type: 'TOGGLE_MANUTENCAO_POR_PECA',
      id: 'oleo_motor',
    });
    const religado = perfilReducer(desligado, {
      type: 'TOGGLE_MANUTENCAO_POR_PECA',
      id: 'oleo_motor',
    });

    expect(
      desligado.perfil.configuracaoDisplay.filtrosManutencao.manutencaoPorPeca.oleo_motor,
    ).toBe(false);
    expect(religado.perfil.configuracaoDisplay.filtrosManutencao.manutencaoPorPeca).toEqual({});
  });

  it('TOGGLE_REVISAO_POR_SERVICO grava false explícito e remove ao religar', () => {
    const desligado = perfilReducer(estadoVazio, {
      type: 'TOGGLE_REVISAO_POR_SERVICO',
      id: 'troca-kit-transmissao',
    });
    const religado = perfilReducer(desligado, {
      type: 'TOGGLE_REVISAO_POR_SERVICO',
      id: 'troca-kit-transmissao',
    });

    expect(
      desligado.perfil.configuracaoDisplay.filtrosManutencao.revisaoPorServico[
        'troca-kit-transmissao'
      ],
    ).toBe(false);
    expect(religado.perfil.configuracaoDisplay.filtrosManutencao.revisaoPorServico).toEqual({});
  });

  it('TOGGLE_CATEGORIA manutencao não apaga filtros finos persistidos', () => {
    const estadoComFiltros: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        configuracaoDisplay: {
          ...perfilPadrao.configuracaoDisplay,
          filtrosManutencao: {
            revisao: false,
            manutencaoPorPeca: { oleo_motor: false },
            revisaoPorServico: { 'troca-kit-transmissao': false },
          },
        },
      },
    };
    const resultado = perfilReducer(estadoComFiltros, {
      type: 'TOGGLE_CATEGORIA',
      categoria: 'manutencao',
    });

    expect(resultado.perfil.configuracaoDisplay.categoriasAtivas.manutencao).toBe(false);
    expect(resultado.perfil.configuracaoDisplay.filtrosManutencao).toEqual(
      estadoComFiltros.perfil.configuracaoDisplay.filtrosManutencao,
    );
  });

  // ── Migração de schema ────────────────────────

  // Cascata v8 → v9 → v10 → v11: perfis v8 chegam ao schema atual limpos.
  // Constrói o input com cast porque os campos legados foram apagados do tipo.
  it('migrarPerfil cascata v8 → v11 remove todos os campos mortos e chega no schema atual', () => {
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

    expect(migrado.schemaVersion).toBe(23);
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

  // v9 → v10 → v11 → v12: remove seguro.tem; quando tem===false, força valorAnual: 0
  it('migrarPerfil v9 → v12 com seguro.tem===true preserva valorAnual e remove tem', () => {
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

    expect(migrado.schemaVersion).toBe(23);
    expect(seguro.tem).toBeUndefined();
    expect(seguro.valorAnual).toBe(1200);
    expect(seguro.empresa).toBe('Suhai');
    expect(seguro.periodicidade).toBe('anual');
  });

  it('migrarPerfil v9 → v12 com seguro.tem===false força valorAnual: 0 (preserva intenção)', () => {
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

    expect(migrado.schemaVersion).toBe(23);
    expect(seguro.tem).toBeUndefined();
    expect(seguro.valorAnual).toBe(0);
  });

  it('migrarPerfil v10 → v12 substitui fazer-motor por retíficas desligadas', () => {
    const servicosNormais = perfilPadrao.servicosIndependentes.filter((s) => !s.ehExcepcional);
    const perfilV10 = {
      ...perfilPadrao,
      schemaVersion: 10,
      servicosIndependentes: [
        ...servicosNormais,
        {
          id: 'fazer-motor',
          nome: 'Fazer motor',
          intervalKm: 70000,
          precoMaoDeObra: 1800,
          ativo: true,
          ehExcepcional: true,
        },
      ],
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV10);
    const ids = migrado.servicosIndependentes.map((s) => s.id);
    const retificaCabecote = migrado.servicosIndependentes.find(
      (s) => s.id === 'retifica-cabecote',
    );
    const retificaCompleta = migrado.servicosIndependentes.find(
      (s) => s.id === 'retifica-completa',
    );

    expect(migrado.schemaVersion).toBe(23);
    expect(ids).not.toContain('fazer-motor');
    expect(retificaCabecote).toMatchObject({
      nome: 'Retífica de cabeçote',
      intervalKm: 80000,
      precoIndependente: 800,
      precoTotalAutorizada: 0,
      incluidoNaRevisaoAutorizada: false,
      ativo: false,
      ehExcepcional: true,
    });
    expect(retificaCompleta).toMatchObject({
      nome: 'Retífica completa',
      intervalKm: 120000,
      precoIndependente: 1800,
      precoTotalAutorizada: 0,
      incluidoNaRevisaoAutorizada: false,
      ativo: false,
      ehExcepcional: true,
    });
  });

  it('migrarPerfil v11 → v12 desliga retíficas existentes sem perder valores editados', () => {
    const perfilV11 = {
      ...perfilPadrao,
      schemaVersion: 11,
      servicosIndependentes: perfilPadrao.servicosIndependentes.map((servico) =>
        servico.id === 'retifica-cabecote'
          ? { ...servico, precoMaoDeObra: 950, ativo: true }
          : { ...servico, ativo: servico.ehExcepcional ? true : servico.ativo },
      ),
    } as PerfilUsuario;

    const migrado = migrarPerfil(perfilV11);
    const retificaCabecote = migrado.servicosIndependentes.find(
      (s) => s.id === 'retifica-cabecote',
    );
    const retificaCompleta = migrado.servicosIndependentes.find(
      (s) => s.id === 'retifica-completa',
    );

    expect(migrado.schemaVersion).toBe(23);
    expect(retificaCabecote?.precoIndependente).toBe(950);
    expect(retificaCabecote?.ativo).toBe(false);
    expect(retificaCompleta?.ativo).toBe(false);
  });

  it('SERVICOS_INDEPENDENTES_PADRAO usa retíficas no lugar de fazer-motor', () => {
    const ids = SERVICOS_INDEPENDENTES_PADRAO.map((s) => s.id);
    const retificas = SERVICOS_INDEPENDENTES_PADRAO.filter((s) => s.ehExcepcional);

    expect(ids).not.toContain('fazer-motor');
    expect(ids).toContain('retifica-cabecote');
    expect(ids).toContain('retifica-completa');
    expect(retificas).toHaveLength(2);
    expect(retificas.every((s) => !s.ativo)).toBe(true);
  });

  // ── TASK-RF-6.9: gastosCustom como presets editáveis ──

  it('perfilPadrao traz os 3 presets de gasto desligados e zerados', () => {
    expect(perfilPadrao.financeiro.gastosCustom).toHaveLength(3);
    expect(perfilPadrao.financeiro.gastosCustom.map((g) => g.id)).toEqual([
      'preset-multa',
      'preset-sinistro',
      'preset-outros',
    ]);
    expect(perfilPadrao.financeiro.gastosCustom.every((g) => g.ehPreset)).toBe(true);
    expect(perfilPadrao.financeiro.gastosCustom.every((g) => !g.ativo)).toBe(true);
    expect(perfilPadrao.financeiro.gastosCustom.every((g) => g.valorAnual === 0)).toBe(true);
  });

  it('SET_GASTO_CUSTOM_VALOR atualiza valorAnual do preset informado', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'SET_GASTO_CUSTOM_VALOR',
      id: 'preset-multa',
      valorAnual: 900,
    });
    const multa = resultado.perfil.financeiro.gastosCustom.find((g) => g.id === 'preset-multa');
    expect(multa?.valorAnual).toBe(900);
  });

  it('SET_GASTO_CUSTOM_VALOR ativa o toggle quando passa de 0 para >0', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'SET_GASTO_CUSTOM_VALOR',
      id: 'preset-multa',
      valorAnual: 900,
    });
    const multa = resultado.perfil.financeiro.gastosCustom.find((g) => g.id === 'preset-multa');
    expect(multa?.ativo).toBe(true);
  });

  it('SET_GASTO_CUSTOM_VALOR não desativa toggle ao zerar valor (preserva intenção)', () => {
    const estadoAtivo: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        financeiro: {
          ...perfilPadrao.financeiro,
          gastosCustom: perfilPadrao.financeiro.gastosCustom.map((g) =>
            g.id === 'preset-multa' ? { ...g, valorAnual: 900, ativo: true } : g,
          ),
        },
      },
    };
    const resultado = perfilReducer(estadoAtivo, {
      type: 'SET_GASTO_CUSTOM_VALOR',
      id: 'preset-multa',
      valorAnual: 0,
    });
    const multa = resultado.perfil.financeiro.gastosCustom.find((g) => g.id === 'preset-multa');
    expect(multa?.valorAnual).toBe(0);
    expect(multa?.ativo).toBe(true);
  });

  it('TOGGLE_GASTO_CUSTOM inverte o ativo do preset', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'TOGGLE_GASTO_CUSTOM',
      id: 'preset-sinistro',
    });
    const sinistro = resultado.perfil.financeiro.gastosCustom.find(
      (g) => g.id === 'preset-sinistro',
    );
    expect(sinistro?.ativo).toBe(true);
  });

  it('migrarPerfil v12 → v13 descarta gastos antigos e semeia os 3 presets', () => {
    const perfilV12 = {
      ...perfilPadrao,
      schemaVersion: 12,
      financeiro: {
        ...perfilPadrao.financeiro,
        gastosCustom: [{ id: 'gasto_001', nome: 'Bag térmica', valorMensal: 8.33, ativo: true }],
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV12);

    expect(migrado.schemaVersion).toBe(23);
    expect(migrado.financeiro.gastosCustom).toEqual(PRESETS_GASTOS_PADRAO);
  });

  it('migrarPerfil é idempotente quando aplicada em perfil já na versão atual', () => {
    const migrado = migrarPerfil(perfilPadrao);
    expect(migrado.schemaVersion).toBe(23);
    expect(migrado.financeiro.gastosCustom).toEqual(PRESETS_GASTOS_PADRAO);
    expect(migrado.configuracaoDisplay.categoriasAtivas.imprevistos).toBe(true);
    expect(migrado.configuracaoDisplay.imprevistosSugeridosAtivos).toEqual({});
    expect(migrado.configuracaoDisplay.filtrosManutencao).toEqual({
      revisao: true,
      manutencaoPorPeca: {},
      revisaoPorServico: {},
    });
  });

  it('migrarPerfil v16 → v17 adiciona filtros finos de Manutenção com defaults ativos', () => {
    const perfilV16 = {
      ...perfilPadrao,
      schemaVersion: 16,
      configuracaoDisplay: {
        categoriasAtivas: perfilPadrao.configuracaoDisplay.categoriasAtivas,
        imprevistosSugeridosAtivos: {},
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV16);

    expect(migrado.schemaVersion).toBe(23);
    expect(migrado.configuracaoDisplay.filtrosManutencao).toEqual({
      revisao: true,
      manutencaoPorPeca: {},
      revisaoPorServico: {},
    });
  });

  it('migrarPerfil v16 → v17 preserva filtros finos quando já existirem', () => {
    const perfilV16 = {
      ...perfilPadrao,
      schemaVersion: 16,
      configuracaoDisplay: {
        ...perfilPadrao.configuracaoDisplay,
        filtrosManutencao: {
          revisao: false,
          manutencaoPorPeca: { oleo_motor: false },
          revisaoPorServico: { 'troca-kit-transmissao': false },
        },
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV16);

    expect(migrado.schemaVersion).toBe(23);
    expect(migrado.configuracaoDisplay.filtrosManutencao).toEqual({
      revisao: false,
      manutencaoPorPeca: { oleo_motor: false },
      revisaoPorServico: { 'troca-kit-transmissao': false },
    });
  });

  // TASK-RF-6.11 cleanup: v13 → v14 adiciona toggle persistido de Imprevistos
  // e mapa de sugeridos ativos. Default: categoria true, mapa vazio.
  it('migrarPerfil v13 → v14 adiciona imprevistos true e imprevistosSugeridosAtivos vazio', () => {
    const perfilV13 = {
      ...perfilPadrao,
      schemaVersion: 13,
      configuracaoDisplay: {
        categoriasAtivas: {
          combustivel: true,
          alimentacao: true,
          manutencao: true,
          documentacao: true,
          internet: false,
          seguro: false,
          financiamento: false,
        },
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV13);

    expect(migrado.schemaVersion).toBe(23);
    expect(migrado.configuracaoDisplay.categoriasAtivas.imprevistos).toBe(true);
    expect(migrado.configuracaoDisplay.imprevistosSugeridosAtivos).toEqual({});
  });

  it('migrarPerfil v13 → v14 preserva imprevistos=false se já estiver gravado (não sobrescreve)', () => {
    const perfilV13 = {
      ...perfilPadrao,
      schemaVersion: 13,
      configuracaoDisplay: {
        categoriasAtivas: {
          combustivel: true,
          alimentacao: true,
          manutencao: true,
          documentacao: true,
          internet: false,
          seguro: false,
          financiamento: false,
          imprevistos: false,
        },
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV13);

    expect(migrado.configuracaoDisplay.categoriasAtivas.imprevistos).toBe(false);
  });

  // ── TASK-RF-6.22 / ADR-007: M.O. por modo + precoTotalAutorizada ─────

  it('migrarPerfil v14 → v15 preserva precoMaoDeObra editado como precoIndependente e popula campos novos por id', () => {
    // Perfil v14 com edição do usuário: kit transmissão com M.O. de 90 e
    // troca-oleo com M.O. de 28 (acima do default 25). Após v14→v15, esses
    // valores devem virar precoIndependente; precoTotalAutorizada e
    // incluidoNaRevisaoAutorizada vêm dos defaults por id.
    const servicosV14 = [
      {
        id: 'troca-oleo',
        nome: 'Troca de óleo',
        intervalKm: 3000,
        precoMaoDeObra: 28,
        ativo: true,
        ehExcepcional: false,
      },
      {
        id: 'troca-kit-transmissao',
        nome: 'Troca kit transmissão',
        intervalKm: 12000,
        precoMaoDeObra: 90,
        ativo: true,
        ehExcepcional: false,
      },
    ];
    const perfilV14 = {
      ...perfilPadrao,
      schemaVersion: 14,
      servicosIndependentes: servicosV14,
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV14);
    const oleo = migrado.servicosIndependentes.find((s) => s.id === 'troca-oleo');
    const kit = migrado.servicosIndependentes.find((s) => s.id === 'troca-kit-transmissao');

    expect(migrado.schemaVersion).toBe(23);
    expect(oleo).toMatchObject({
      precoIndependente: 28,
      precoTotalAutorizada: 0,
      incluidoNaRevisaoAutorizada: true,
    });
    expect(kit).toMatchObject({
      precoIndependente: 90,
      precoTotalAutorizada: 313.56,
      incluidoNaRevisaoAutorizada: false,
    });
  });

  it('migrarPerfil v14 → v15 usa defaults do padrão para id desconhecido (precoTotalAutorizada=0, incluidoNaRevisaoAutorizada=false)', () => {
    const servicosV14 = [
      {
        id: 'servico-custom-futuro',
        nome: 'Custom',
        intervalKm: 5000,
        precoMaoDeObra: 42,
        ativo: true,
        ehExcepcional: false,
      },
    ];
    const perfilV14 = {
      ...perfilPadrao,
      schemaVersion: 14,
      servicosIndependentes: servicosV14,
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV14);
    const custom = migrado.servicosIndependentes.find((s) => s.id === 'servico-custom-futuro');

    expect(custom).toMatchObject({
      precoIndependente: 42,
      precoTotalAutorizada: 0,
      incluidoNaRevisaoAutorizada: false,
    });
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

  // ── SET_RESPONSABILIDADE_ALUGUEL ─────────────

  it('SET_RESPONSABILIDADE_ALUGUEL atualiza um campo sem afetar os outros', () => {
    const estadoComResp: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        financeiro: {
          ...perfilPadrao.financeiro,
          responsabilidadeAluguel: { documentos: 'eu', manutencao: 'eu', seguro: 'eu' },
        },
      },
    };

    const resultado = perfilReducer(estadoComResp, {
      type: 'SET_RESPONSABILIDADE_ALUGUEL',
      config: { manutencao: 'locador' },
    });

    expect(resultado.perfil.financeiro.responsabilidadeAluguel).toEqual({
      documentos: 'eu',
      manutencao: 'locador',
      seguro: 'eu',
    });
  });

  it('SET_RESPONSABILIDADE_ALUGUEL aceita config parcial com múltiplos campos', () => {
    const estadoComResp: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        financeiro: {
          ...perfilPadrao.financeiro,
          responsabilidadeAluguel: { documentos: 'eu', manutencao: 'eu', seguro: 'eu' },
        },
      },
    };

    const resultado = perfilReducer(estadoComResp, {
      type: 'SET_RESPONSABILIDADE_ALUGUEL',
      config: { documentos: 'locador', seguro: 'dividido' },
    });

    expect(resultado.perfil.financeiro.responsabilidadeAluguel).toEqual({
      documentos: 'locador',
      manutencao: 'eu',
      seguro: 'dividido',
    });
  });

  // ── TASK-RF-6.14: mutual exclusion kit_cilindro ↔ retifica-completa ─

  it('TOGGLE_IMPREVISTO_SUGERIDO ativar retifica-completa zera kit_cilindro em manutencaoPorPeca', () => {
    // Estado inicial: kit_cilindro ativo (default), retifica-completa desativada.
    const resultado = perfilReducer(estadoVazio, {
      type: 'TOGGLE_IMPREVISTO_SUGERIDO',
      id: 'retifica-completa',
    });

    expect(
      resultado.perfil.configuracaoDisplay.imprevistosSugeridosAtivos['retifica-completa'],
    ).toBe(true);
    expect(
      resultado.perfil.configuracaoDisplay.filtrosManutencao.manutencaoPorPeca['kit_cilindro'],
    ).toBe(false);
  });

  it('TOGGLE_MANUTENCAO_POR_PECA reativar kit_cilindro zera retifica-completa em imprevistosSugeridosAtivos', () => {
    // Cenário: retifica-completa ativa e kit_cilindro desligado explicitamente.
    const estadoComRetifica: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        configuracaoDisplay: {
          ...perfilPadrao.configuracaoDisplay,
          imprevistosSugeridosAtivos: { 'retifica-completa': true },
          filtrosManutencao: {
            ...perfilPadrao.configuracaoDisplay.filtrosManutencao,
            manutencaoPorPeca: { kit_cilindro: false },
          },
        },
      },
    };

    const resultado = perfilReducer(estadoComRetifica, {
      type: 'TOGGLE_MANUTENCAO_POR_PECA',
      id: 'kit_cilindro',
    });

    expect(
      resultado.perfil.configuracaoDisplay.imprevistosSugeridosAtivos['retifica-completa'],
    ).toBe(false);
    expect(
      resultado.perfil.configuracaoDisplay.filtrosManutencao.manutencaoPorPeca['kit_cilindro'],
    ).toBeUndefined();
  });

  // ── TASK-RF-6.14: migration v17 → v18 ─

  it('migrarPerfil v17 → v18 adiciona troca-bateria, troca-kit-embreagem e troca-kit-cilindro', () => {
    // Perfil v17: sem os 3 serviços novos da v18.
    const servicosV17 = SERVICOS_INDEPENDENTES_PADRAO.filter(
      (s) => !['troca-bateria', 'troca-kit-embreagem', 'troca-kit-cilindro'].includes(s.id),
    );
    const perfilV17 = {
      ...perfilPadrao,
      schemaVersion: 17,
      servicosIndependentes: servicosV17,
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV17);
    const idsServicos = migrado.servicosIndependentes.map((s) => s.id);

    expect(migrado.schemaVersion).toBe(23);
    expect(idsServicos).toContain('troca-bateria');
    expect(idsServicos).toContain('troca-kit-embreagem');
    expect(idsServicos).toContain('troca-kit-cilindro');
    // Preserva serviços anteriores intactos (idempotente, sem duplicar ids).
    expect(new Set(idsServicos).size).toBe(idsServicos.length);
  });

  // ── TASK-RF-6.13 / TASK-RF-6.24: migrations v18 → v20 ─

  it('migrarPerfil v18 → v20 adiciona campos rastreáveis sem kitRevisao', () => {
    const perfilV18 = {
      ...perfilPadrao,
      schemaVersion: 18,
      moto: {
        ...perfilPadrao.moto,
        kmUltimaTrocas: {
          oleo: 12000,
          pneuDianteiro: 25000,
          pneuTraseiro: 18000,
          kitRelacao: 20000,
        },
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV18);

    expect(migrado.schemaVersion).toBe(23);
    expect(migrado.moto.kmUltimaTrocas).toEqual({
      oleo: 12000,
      pneuDianteiro: 25000,
      pneuTraseiro: 18000,
      kitRelacao: 20000,
      velaIgnicao: 0,
      filtroAr: 0,
      sapataFreioDianteiro: 0,
      sapataFreioTraseiro: 0,
      bateria: 0,
      kitEmbreagem: 0,
      kitCilindro: 0,
      retificaCabecote: 0,
      retificaCompleta: 0,
    });
  });

  it('migrarPerfil v19 → v20 remove kitRevisao legado sem perder demais campos', () => {
    const perfilV19 = {
      ...perfilPadrao,
      schemaVersion: 19,
      moto: {
        ...perfilPadrao.moto,
        kmUltimaTrocas: {
          ...perfilPadrao.moto.kmUltimaTrocas,
          kitRevisao: 84000,
          kitCilindro: 1000,
        },
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV19);

    expect(migrado.schemaVersion).toBe(23);
    expect('kitRevisao' in migrado.moto.kmUltimaTrocas).toBe(false);
    expect(migrado.moto.kmUltimaTrocas.kitCilindro).toBe(1000);
  });

  // ── TASK-BG-011: migration v20 → v21 ─
  it('migrarPerfil v20 → v21 renomeia precoMaoDeObraIndependente → precoIndependente preservando o valor', () => {
    const perfilV20 = {
      ...perfilPadrao,
      schemaVersion: 20,
      servicosIndependentes: [
        {
          id: 'retifica-completa',
          nome: 'Retífica completa',
          intervalKm: 120000,
          precoMaoDeObraIndependente: 1500,
          precoTotalAutorizada: 0,
          incluidoNaRevisaoAutorizada: false,
          ativo: false,
          ehExcepcional: true,
        },
      ],
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV20);
    const retifica = migrado.servicosIndependentes.find((s) => s.id === 'retifica-completa');

    expect(migrado.schemaVersion).toBe(23);
    expect(retifica?.precoIndependente).toBe(1500);
    expect(
      (retifica as unknown as Record<string, unknown>).precoMaoDeObraIndependente,
    ).toBeUndefined();
  });

  // ── TASK-BG-012: migration v21 → v22 ─
  it('migrarPerfil v21 → v22 sobe revisao-geral de 80 para 400 (default antigo) e preserva edições', () => {
    const perfilV21 = {
      ...perfilPadrao,
      schemaVersion: 21,
      servicosIndependentes: [
        {
          ...perfilPadrao.servicosIndependentes.find((s) => s.id === 'revisao-geral')!,
          precoIndependente: 80,
        },
        {
          ...perfilPadrao.servicosIndependentes.find((s) => s.id === 'troca-oleo')!,
          precoIndependente: 99,
        },
      ],
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV21);
    const revisao = migrado.servicosIndependentes.find((s) => s.id === 'revisao-geral');
    const oleo = migrado.servicosIndependentes.find((s) => s.id === 'troca-oleo');

    expect(migrado.schemaVersion).toBe(23);
    expect(revisao?.precoIndependente).toBe(400);
    // edição do usuário em outro serviço é preservada
    expect(oleo?.precoIndependente).toBe(99);
  });

  it('migrarPerfil v21 → v22 NÃO altera revisao-geral se o usuário já editou (≠ 80)', () => {
    const perfilV21 = {
      ...perfilPadrao,
      schemaVersion: 21,
      servicosIndependentes: [
        {
          ...perfilPadrao.servicosIndependentes.find((s) => s.id === 'revisao-geral')!,
          precoIndependente: 250,
        },
      ],
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV21);
    const revisao = migrado.servicosIndependentes.find((s) => s.id === 'revisao-geral');

    expect(migrado.schemaVersion).toBe(23);
    expect(revisao?.precoIndependente).toBe(250);
  });

  // ── TASK-RF-6.18: migration v22 → v23 (dataReferenciaParcelas) ─
  it('migrarPerfil v22 → v23 ancora dataReferenciaParcelas em financiada com parcelas e deixa null nos demais', () => {
    const financiada = {
      ...perfilPadrao,
      schemaVersion: 22,
      financeiro: {
        ...perfilPadrao.financeiro,
        situacaoMoto: 'financiada',
        parcelaMensal: 500,
        parcelasRestantes: 24,
        dataReferenciaParcelas: undefined, // v22 não tinha o campo
      },
    } as unknown as PerfilUsuario;
    const quitada = {
      ...perfilPadrao,
      schemaVersion: 22,
      financeiro: { ...perfilPadrao.financeiro, dataReferenciaParcelas: undefined },
    } as unknown as PerfilUsuario;

    const antes = Date.now();
    const migFinanciada = migrarPerfil(financiada);
    const depois = Date.now();
    const migQuitada = migrarPerfil(quitada);

    expect(migFinanciada.schemaVersion).toBe(23);
    expect(migFinanciada.financeiro.dataReferenciaParcelas).not.toBeNull();
    const ref = new Date(migFinanciada.financeiro.dataReferenciaParcelas!).getTime();
    expect(ref).toBeGreaterThanOrEqual(antes);
    expect(ref).toBeLessThanOrEqual(depois);

    expect(migQuitada.schemaVersion).toBe(23);
    expect(migQuitada.financeiro.dataReferenciaParcelas).toBeNull();
  });

  it('migrarPerfil v22 → v23 preserva dataReferenciaParcelas já existente (idempotência do snapshot)', () => {
    const refExistente = '2026-03-15T12:00:00.000Z';
    const perfilV22 = {
      ...perfilPadrao,
      schemaVersion: 22,
      financeiro: {
        ...perfilPadrao.financeiro,
        situacaoMoto: 'financiada',
        parcelaMensal: 500,
        parcelasRestantes: 24,
        dataReferenciaParcelas: refExistente,
      },
    } as unknown as PerfilUsuario;

    const migrado = migrarPerfil(perfilV22);

    expect(migrado.schemaVersion).toBe(23);
    expect(migrado.financeiro.dataReferenciaParcelas).toBe(refExistente);
  });
});
