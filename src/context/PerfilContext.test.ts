import { describe, it, expect } from 'vitest';
import {
  perfilReducer,
  perfilPadrao,
  SERVICOS_INDEPENDENTES_PADRAO,
  PRESETS_GASTOS_PADRAO,
} from './PerfilContext';
import type { EstadoApp } from './PerfilContext';
import type { PerfilUsuario, ServicoIndependente } from '../types/perfil';
import { dadosRJ } from '../data/dadosRJ';

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
  it('perfilPadrao não presume custos opcionais do onboarding', () => {
    expect(perfilPadrao.financeiro.internet).toBe(0);
    expect(perfilPadrao.financeiro.seguro.valorAnual).toBe(0);
    expect(perfilPadrao.financeiro.alimentacaoDia).toBe(0);
    expect(perfilPadrao.configuracaoDisplay.categoriasAtivas.internet).toBe(false);
    expect(perfilPadrao.configuracaoDisplay.categoriasAtivas.seguro).toBe(false);
    expect(perfilPadrao.configuracaoDisplay.categoriasAtivas.alimentacao).toBe(false);
  });

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

  it('rejeita actions de rodagem fora do domínio', () => {
    expect(perfilReducer(estadoVazio, { type: 'SET_KM_POR_DIA', valor: 0 })).toBe(estadoVazio);
    expect(perfilReducer(estadoVazio, { type: 'SET_DIAS_POR_SEMANA', valor: 8 })).toBe(estadoVazio);
    expect(perfilReducer(estadoVazio, { type: 'SET_KM_ATUAL', valor: -1 })).toBe(estadoVazio);
  });

  it('rejeita actions financeiras negativas ou denominador zero', () => {
    expect(perfilReducer(estadoVazio, { type: 'SET_INTERNET', valor: -1 })).toBe(estadoVazio);
    expect(perfilReducer(estadoVazio, { type: 'SET_ALIMENTACAO', valorDia: -1 })).toBe(estadoVazio);
    expect(
      perfilReducer(estadoVazio, {
        type: 'SET_COMBUSTIVEL',
        tipo: 'comum',
        campo: 'autonomia',
        valor: 0,
      }),
    ).toBe(estadoVazio);
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

  it('COMMIT_ONBOARDING preserva o consumo semeado no passo de km (não re-semeia do modelo)', () => {
    // RF-6.33: o consumo é gravado no passo de km/consumo (default = consumo do
    // modelo). O commit preserva a autonomia presente, não a recalcula do modelo.
    const estadoComDados: EstadoApp = {
      ...estadoVazio,
      perfil: criarPerfilValido({
        moto: { ano: 2024 },
        financeiro: {
          combustiveis: {
            ...perfilPadrao.financeiro.combustiveis,
            comum: { ...perfilPadrao.financeiro.combustiveis.comum, autonomia: 54 },
            aditivada: { ...perfilPadrao.financeiro.combustiveis.aditivada, autonomia: 54 },
          },
        },
      }),
    };

    const resultado = perfilReducer(estadoComDados, { type: 'COMMIT_ONBOARDING' });

    expect(resultado.perfil.financeiro.combustiveis.comum.autonomia).toBe(54);
    expect(resultado.perfil.financeiro.combustiveis.aditivada.autonomia).toBe(54);
  });

  it('COMMIT_ONBOARDING preserva um consumo personalizado (editado no onboarding)', () => {
    const estadoComDados: EstadoApp = {
      ...estadoVazio,
      perfil: criarPerfilValido({
        moto: { ano: 2018 },
        financeiro: {
          combustiveis: {
            ...perfilPadrao.financeiro.combustiveis,
            comum: { ...perfilPadrao.financeiro.combustiveis.comum, autonomia: 45 },
            aditivada: { ...perfilPadrao.financeiro.combustiveis.aditivada, autonomia: 45 },
          },
        },
      }),
    };

    const resultado = perfilReducer(estadoComDados, { type: 'COMMIT_ONBOARDING' });

    expect(resultado.perfil.financeiro.combustiveis.comum.autonomia).toBe(45);
    expect(resultado.perfil.financeiro.combustiveis.aditivada.autonomia).toBe(45);
  });

  it('COMMIT_ONBOARDING deriva o etanol a partir do consumo informado', () => {
    // Factor 125i aceita etanol; etanol = round(consumo * fator regional).
    const estadoComDados: EstadoApp = {
      ...estadoVazio,
      perfil: criarPerfilValido({
        moto: { marca: 'Yamaha', modelo: 'factor125i' },
        financeiro: {
          combustiveis: {
            ...perfilPadrao.financeiro.combustiveis,
            comum: { ...perfilPadrao.financeiro.combustiveis.comum, autonomia: 40 },
          },
        },
      }),
    };

    const resultado = perfilReducer(estadoComDados, { type: 'COMMIT_ONBOARDING' });

    expect(resultado.perfil.financeiro.combustiveis.etanol.autonomia).toBe(
      Math.round(40 * dadosRJ.autonomiaEtanolFatorReducao),
    );
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
    expect(categoriasAtivas.alimentacao).toBe(false);
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

  it('SET_ANO_MOTO muda o ano e preserva a autonomia (consumo é do modelo, não do ano)', () => {
    const estado2024: EstadoApp = {
      ...estadoVazio,
      perfil: criarPerfilValido({
        financeiro: {
          combustiveis: {
            ...perfilPadrao.financeiro.combustiveis,
            comum: {
              ...perfilPadrao.financeiro.combustiveis.comum,
              autonomia: 60,
            },
          },
        },
      }),
    };

    const resultado = perfilReducer(estado2024, { type: 'SET_ANO_MOTO', ano: 2023 });

    expect(resultado.perfil.moto.ano).toBe(2023);
    expect(resultado.perfil.financeiro.combustiveis.comum.autonomia).toBe(60);
  });

  it('SET_ANO_MOTO limpa FIPE anterior quando o novo ano não possui valor', () => {
    const estado2024: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...criarPerfilValido(),
        fipeCache: {
          valor: 12126,
          codigoFipe: '811132-4',
          dataConsulta: '2026-06-06',
          anoModelo: 2024,
          marca: 'Honda',
          modelo: 'pop110i',
        },
      },
    };

    const resultado = perfilReducer(estado2024, { type: 'SET_ANO_MOTO', ano: 2025 });

    expect(resultado.perfil.fipeCache).toBeNull();
  });

  it('SET_ANO_MOTO atualiza a FIPE quando o novo ano possui valor', () => {
    const estado2024: EstadoApp = {
      ...estadoVazio,
      perfil: criarPerfilValido(),
    };

    const resultado = perfilReducer(estado2024, { type: 'SET_ANO_MOTO', ano: 2023 });

    expect(resultado.perfil.fipeCache).toMatchObject({
      valor: 11802,
      codigoFipe: '811132-4',
      anoModelo: 2023,
      marca: 'Honda',
      modelo: 'pop110i',
    });
  });

  it('SET_ANO_MOTO aceita ano fora da tabela FIPE: atualiza o ano e limpa o cache', () => {
    const estado2024: EstadoApp = {
      ...estadoVazio,
      perfil: criarPerfilValido(),
    };

    const resultado = perfilReducer(estado2024, { type: 'SET_ANO_MOTO', ano: 2026 });

    expect(resultado.perfil.moto.ano).toBe(2026);
    expect(resultado.perfil.fipeCache).toBeNull();
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

  it('SET_SERVICO_INDEPENDENTE preserva status informado_usuario no preço de concessionária', () => {
    const kitPadrao = servicoPadrao('troca-kit-transmissao');

    const resultado = perfilReducer(estadoVazio, {
      type: 'SET_SERVICO_INDEPENDENTE',
      payload: {
        ...kitPadrao,
        precoTotalAutorizada: 410,
        statusPrecoAutorizada: 'informado_usuario',
      },
    });
    const kit = resultado.perfil.servicosIndependentes.find(
      (s) => s.id === 'troca-kit-transmissao',
    );

    expect(kit?.precoTotalAutorizada).toBe(410);
    expect(kit?.statusPrecoAutorizada).toBe('informado_usuario');
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

  it('SET_SERVICO_INDEPENDENTE rejeita preço negativo', () => {
    const oleoPadrao = servicoPadrao('troca-oleo');
    const resultado = perfilReducer(estadoVazio, {
      type: 'SET_SERVICO_INDEPENDENTE',
      payload: { ...oleoPadrao, precoIndependente: -1 },
    });

    expect(resultado).toBe(estadoVazio);
  });

  it('SET_ONBOARDING_CAMPO rejeita bloco que violaria o schema', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: { ...perfilPadrao.financeiro, alimentacaoDia: -20 },
    });

    expect(resultado).toBe(estadoVazio);
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
      presetId: 'p2',
    });
    expect(resultado.perfil.apelido).toBe('Pessoal');
    expect(resultado.presetAtivoId).toBe('p2');
  });

  it('CARREGAR_PERFIL ignora presetId inexistente e preserva o estado', () => {
    const estadoInicial: EstadoApp = {
      perfil: perfilPadrao,
      presets: [
        {
          presetId: 'p1',
          nome: 'Trabalho',
          criadoEm: '2026-01-01',
          atualizadoEm: '2026-01-01',
          perfil: { ...perfilPadrao, apelido: 'Trabalho' },
        },
      ],
      presetAtivoId: 'p1',
    };

    const resultado = perfilReducer(estadoInicial, {
      type: 'CARREGAR_PERFIL',
      presetId: 'inexistente',
    });

    expect(resultado).toBe(estadoInicial);
  });

  it('CARREGAR_PERFIL ignora preset com perfil inválido', () => {
    const perfilInvalido = {
      ...perfilPadrao,
      moto: { ...perfilPadrao.moto, kmAtual: -1 },
    } as PerfilUsuario;
    const estadoInicial: EstadoApp = {
      perfil: perfilPadrao,
      presets: [
        {
          presetId: 'p-invalido',
          nome: 'Inválido',
          criadoEm: '2026-01-01',
          atualizadoEm: '2026-01-01',
          perfil: perfilInvalido,
        },
      ],
      presetAtivoId: null,
    };

    const resultado = perfilReducer(estadoInicial, {
      type: 'CARREGAR_PERFIL',
      presetId: 'p-invalido',
    });

    expect(resultado).toBe(estadoInicial);
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
    expect(resultado.perfil.financeiro.aluguelValor).toBeNull();
    expect(resultado.perfil.financeiro.aluguelPeriodicidade).toBeNull();

    // Uso e modo de revisão voltam ao padrão (não são custos)
    expect(resultado.perfil.trabalho.kmPorDia).toBe(70);
    expect(resultado.perfil.trabalho.diasPorSemana).toBe(5);
    expect(resultado.perfil.perfilManutencao.modoRevisao).toBe('autorizadas');

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
    // âncora re-stampada para "agora" - o relógio reinicia a partir do novo valor
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

  // ── SET_ALUGUEL: valor-base e periodicidade (TASK-REF-38) ─

  it('SET_ALUGUEL grava aluguelValor e periodicidade', () => {
    const resultado = perfilReducer(estadoVazio, {
      type: 'SET_ALUGUEL',
      aluguelValor: 250,
      aluguelPeriodicidade: 'semanal',
    });

    expect(resultado.perfil.financeiro.aluguelValor).toBe(250);
    expect(resultado.perfil.financeiro.aluguelPeriodicidade).toBe('semanal');
  });

  it('SET_SITUACAO_MOTO limpa o aluguel ao sair de alugada', () => {
    const estadoAlugado: EstadoApp = {
      ...estadoVazio,
      perfil: {
        ...perfilPadrao,
        financeiro: {
          ...perfilPadrao.financeiro,
          situacaoMoto: 'alugada',
          aluguelValor: 800,
          aluguelPeriodicidade: 'mensal',
        },
      },
    };

    const resultado = perfilReducer(estadoAlugado, {
      type: 'SET_SITUACAO_MOTO',
      situacao: 'quitada',
    });

    expect(resultado.perfil.financeiro.aluguelValor).toBeNull();
    expect(resultado.perfil.financeiro.aluguelPeriodicidade).toBeNull();
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

  it('TOGGLE_ESTIMATIVA_MAO_DE_OBRA_SERVICO liga e desliga a estimativa por serviço', () => {
    const ligado = perfilReducer(estadoVazio, {
      type: 'TOGGLE_ESTIMATIVA_MAO_DE_OBRA_SERVICO',
      id: 'troca-kit-transmissao',
    });
    const desligado = perfilReducer(ligado, {
      type: 'TOGGLE_ESTIMATIVA_MAO_DE_OBRA_SERVICO',
      id: 'troca-kit-transmissao',
    });

    expect(
      ligado.perfil.perfilManutencao.estimativaMaoDeObraPorServico?.['troca-kit-transmissao'],
    ).toBe(true);
    expect(
      desligado.perfil.perfilManutencao.estimativaMaoDeObraPorServico?.['troca-kit-transmissao'],
    ).toBe(false);
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
});
