import type {
  PerfilUsuario,
  PresetEntry,
  PerfilAction,
  PecaOverride,
  ServicoIndependente,
} from '../types/perfil';
import { perfilSchema } from '../schemas/perfilSchema';
import { CATALOGO, obterConsumoKmLPorAno } from '../data/catalogoModelos';
import { dadosRJ } from '../data/dadosRJ';
import { perfilProntoParaCommit } from '../utils/onboardingGuards';
import {
  perfilPadrao,
  SERVICOS_INDEPENDENTES_PADRAO,
  PRESETS_GASTOS_PADRAO,
  FILTROS_MANUTENCAO_PADRAO,
} from './perfilDefaults';

export interface EstadoApp {
  perfil: PerfilUsuario;
  presets: PresetEntry[];
  presetAtivoId: string | null;
}

export const estadoPadrao: EstadoApp = {
  perfil: perfilPadrao,
  presets: [],
  presetAtivoId: null,
};

// ──────────────────────────────────────────────
// Reducer
// ──────────────────────────────────────────────

const campoOverrideMap = {
  precoOriginal: 'precoEditadoOriginal',
  precoParalela: 'precoEditadaParalela',
  intervaloKm: 'intervaloKmEditado',
} as const;

function servicoIndependenteComIntervaloValido(servico: ServicoIndependente): boolean {
  if (servico.intervalKm > 0) {
    return true;
  }

  if (servico.intervalKm !== 0) {
    return false;
  }

  return SERVICOS_INDEPENDENTES_PADRAO.some(
    (padrao) => padrao.id === servico.id && padrao.intervalKm === 0,
  );
}

type CampoOverrideChave = keyof typeof campoOverrideMap;

function alternarFiltroDefaultAtivo(
  filtros: Record<string, boolean>,
  id: string,
): Record<string, boolean> {
  const novo = { ...filtros };
  const ativoAtual = novo[id] ?? true;
  if (ativoAtual) {
    novo[id] = false;
  } else {
    delete novo[id];
  }
  return novo;
}

export function perfilReducer(state: EstadoApp, action: PerfilAction): EstadoApp {
  // Atualiza perfil e sincroniza com o preset ativo
  const comPerfil = (novoPerfil: PerfilUsuario): EstadoApp => {
    const validacao = perfilSchema.safeParse(novoPerfil);
    if (!validacao.success) {
      return state;
    }

    return {
      ...state,
      perfil: novoPerfil,
      presets: state.presetAtivoId
        ? state.presets.map((p) =>
            p.presetId === state.presetAtivoId
              ? { ...p, perfil: novoPerfil, atualizadoEm: new Date().toISOString() }
              : p,
          )
        : state.presets,
    };
  };

  switch (action.type) {
    // ── Onboarding ─────────────────────────────
    case 'SET_ONBOARDING_CAMPO':
      return comPerfil({ ...state.perfil, [action.campo]: action.valor } as PerfilUsuario);

    case 'COMMIT_ONBOARDING': {
      if (!perfilProntoParaCommit(state.perfil)) {
        return state;
      }

      const modeloDados = CATALOGO[state.perfil.moto.modelo];
      const autonomiaGas = obterConsumoKmLPorAno(state.perfil.moto.modelo, state.perfil.moto.ano);

      if (!modeloDados || autonomiaGas === undefined) {
        return state;
      }

      const autonomiaEtanol = Math.round(autonomiaGas * dadosRJ.autonomiaEtanolFatorReducao);

      const combustiveisComBase = {
        comum: { ...state.perfil.financeiro.combustiveis.comum, autonomia: autonomiaGas },
        aditivada: {
          ...state.perfil.financeiro.combustiveis.aditivada,
          autonomia: autonomiaGas,
        },
        etanol: modeloDados.aceitaEtanol
          ? { ...state.perfil.financeiro.combustiveis.etanol, autonomia: autonomiaEtanol }
          : state.perfil.financeiro.combustiveis.etanol,
      };

      const financeiro = { ...state.perfil.financeiro, combustiveis: combustiveisComBase };

      const novoPerfil: PerfilUsuario = {
        ...state.perfil,
        financeiro,
        onboardingConcluido: true,
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          categoriasAtivas: {
            ...state.perfil.configuracaoDisplay.categoriasAtivas,
            internet: financeiro.internet > 0,
            seguro: financeiro.seguro.valorAnual > 0,
            financiamento: financeiro.situacaoMoto !== 'quitada',
            alimentacao: financeiro.alimentacaoDia > 0,
          },
        },
      };
      const agora = new Date().toISOString();
      const novoId = crypto.randomUUID();
      const nomePreset =
        novoPerfil.apelido ??
        `${novoPerfil.moto.marca} ${novoPerfil.moto.modelo} ${novoPerfil.moto.ano}`;
      const novoPreset: PresetEntry = {
        presetId: novoId,
        nome: nomePreset,
        criadoEm: agora,
        atualizadoEm: agora,
        perfil: novoPerfil,
      };
      return {
        perfil: novoPerfil,
        presets: [...state.presets, novoPreset],
        presetAtivoId: novoId,
      };
    }

    // ── Rodagem inline ──────────────────────────
    case 'SET_KM_POR_DIA':
      return comPerfil({
        ...state.perfil,
        trabalho: { ...state.perfil.trabalho, kmPorDia: action.valor },
      });

    case 'SET_DIAS_POR_SEMANA':
      return comPerfil({
        ...state.perfil,
        trabalho: { ...state.perfil.trabalho, diasPorSemana: action.valor },
      });

    case 'SET_KM_ATUAL':
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, kmAtual: action.valor },
      });

    // ── Display ─────────────────────────────────
    case 'TOGGLE_CATEGORIA':
      return comPerfil({
        ...state.perfil,
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          categoriasAtivas: {
            ...state.perfil.configuracaoDisplay.categoriasAtivas,
            [action.categoria]:
              !state.perfil.configuracaoDisplay.categoriasAtivas[action.categoria],
          },
        },
      });

    case 'TOGGLE_IMPREVISTO_SUGERIDO': {
      const atual = state.perfil.configuracaoDisplay.imprevistosSugeridosAtivos[action.id] ?? false;
      const novoValor = !atual;

      // Mutual exclusion kit_cilindro ↔ retifica-completa (TASK-RF-6.14):
      // ativar retífica completa desativa kit cilindro como peça regular.
      const filtrosManutencao = state.perfil.configuracaoDisplay.filtrosManutencao;
      const manutencaoPorPecaAtualizada =
        action.id === 'retifica-completa' && novoValor
          ? { ...filtrosManutencao.manutencaoPorPeca, kit_cilindro: false }
          : filtrosManutencao.manutencaoPorPeca;

      return comPerfil({
        ...state.perfil,
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          imprevistosSugeridosAtivos: {
            ...state.perfil.configuracaoDisplay.imprevistosSugeridosAtivos,
            [action.id]: novoValor,
          },
          filtrosManutencao: {
            ...filtrosManutencao,
            manutencaoPorPeca: manutencaoPorPecaAtualizada,
          },
        },
      });
    }

    case 'TOGGLE_REVISAO_MANUTENCAO':
      return comPerfil({
        ...state.perfil,
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          filtrosManutencao: {
            ...state.perfil.configuracaoDisplay.filtrosManutencao,
            revisao: !state.perfil.configuracaoDisplay.filtrosManutencao.revisao,
          },
        },
      });

    case 'TOGGLE_MANUTENCAO_POR_PECA': {
      const manutencaoPorPeca =
        state.perfil.configuracaoDisplay.filtrosManutencao.manutencaoPorPeca;
      const ativoAtual = manutencaoPorPeca[action.id] ?? true;
      const novoEstado = !ativoAtual;

      // Mutual exclusion kit_cilindro ↔ retifica-completa (TASK-RF-6.14):
      // ativar kit cilindro como peça desativa retífica completa nos imprevistos.
      const imprevistosAtualizados =
        action.id === 'kit_cilindro' && novoEstado
          ? {
              ...state.perfil.configuracaoDisplay.imprevistosSugeridosAtivos,
              'retifica-completa': false,
            }
          : state.perfil.configuracaoDisplay.imprevistosSugeridosAtivos;

      return comPerfil({
        ...state.perfil,
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          imprevistosSugeridosAtivos: imprevistosAtualizados,
          filtrosManutencao: {
            ...state.perfil.configuracaoDisplay.filtrosManutencao,
            manutencaoPorPeca: alternarFiltroDefaultAtivo(manutencaoPorPeca, action.id),
          },
        },
      });
    }

    case 'TOGGLE_REVISAO_POR_SERVICO':
      return comPerfil({
        ...state.perfil,
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          filtrosManutencao: {
            ...state.perfil.configuracaoDisplay.filtrosManutencao,
            revisaoPorServico: alternarFiltroDefaultAtivo(
              state.perfil.configuracaoDisplay.filtrosManutencao.revisaoPorServico,
              action.id,
            ),
          },
        },
      });

    // ── Overrides de peças ──────────────────────
    case 'SET_PECA_OVERRIDE': {
      const campo = campoOverrideMap[action.campo as CampoOverrideChave];
      const existente = state.perfil.pecasOverrides.find((o) => o.id === action.id);
      const novoOverride: PecaOverride = existente
        ? { ...existente, [campo]: action.valor }
        : {
            id: action.id,
            precoEditadoOriginal: null,
            precoEditadaParalela: null,
            intervaloKmEditado: null,
            [campo]: action.valor,
          };
      const novosOverrides = existente
        ? state.perfil.pecasOverrides.map((o) => (o.id === action.id ? novoOverride : o))
        : [...state.perfil.pecasOverrides, novoOverride];
      return comPerfil({ ...state.perfil, pecasOverrides: novosOverrides });
    }

    case 'RESET_PECA_OVERRIDE': {
      if (!action.campo) {
        return comPerfil({
          ...state.perfil,
          pecasOverrides: state.perfil.pecasOverrides.filter((o) => o.id !== action.id),
        });
      }
      const campo = campoOverrideMap[action.campo as CampoOverrideChave];
      return comPerfil({
        ...state.perfil,
        pecasOverrides: state.perfil.pecasOverrides.map((o) =>
          o.id === action.id ? ({ ...o, [campo]: null } as PecaOverride) : o,
        ),
      });
    }

    // ── Mão de obra ─────────────────────────────
    case 'SET_SERVICO_INDEPENDENTE': {
      if (!servicoIndependenteComIntervaloValido(action.payload)) return state; // INV-MANUT-1
      const novos = state.perfil.servicosIndependentes.some((s) => s.id === action.payload.id)
        ? state.perfil.servicosIndependentes.map((s) =>
            s.id === action.payload.id ? action.payload : s,
          )
        : [...state.perfil.servicosIndependentes, action.payload];
      return comPerfil({ ...state.perfil, servicosIndependentes: novos });
    }

    case 'RESET_SERVICOS_INDEPENDENTES':
      return comPerfil({ ...state.perfil, servicosIndependentes: SERVICOS_INDEPENDENTES_PADRAO });

    case 'SET_REVISAO_AUTORIZADA_OVERRIDE': {
      const precoTotal = action.precoPecas + action.precoMaoDeObra;
      const novoOverride = {
        index: action.index,
        precoPecas: action.precoPecas,
        precoMaoDeObra: action.precoMaoDeObra,
        precoTotal,
      };
      const existente = state.perfil.revisaoAutorizadaOverrides.find(
        (o) => o.index === action.index,
      );
      const novosOverrides = existente
        ? state.perfil.revisaoAutorizadaOverrides.map((o) =>
            o.index === action.index ? novoOverride : o,
          )
        : [...state.perfil.revisaoAutorizadaOverrides, novoOverride];
      return comPerfil({ ...state.perfil, revisaoAutorizadaOverrides: novosOverrides });
    }

    case 'RESET_REVISAO_AUTORIZADA_OVERRIDE':
      return comPerfil({
        ...state.perfil,
        revisaoAutorizadaOverrides: state.perfil.revisaoAutorizadaOverrides.filter(
          (o) => o.index !== action.index,
        ),
      });

    // ── Financeiro ───────────────────────────────
    case 'SET_INTERNET':
      return comPerfil({
        ...state.perfil,
        financeiro: { ...state.perfil.financeiro, internet: action.valor },
      });

    case 'SET_SEGURO':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          seguro: { ...state.perfil.financeiro.seguro, ...action.config },
        },
      });

    case 'SET_ALIMENTACAO':
      return comPerfil({
        ...state.perfil,
        financeiro: { ...state.perfil.financeiro, alimentacaoDia: action.valorDia },
      });

    case 'SET_COMBUSTIVEL':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          combustiveis: {
            ...state.perfil.financeiro.combustiveis,
            [action.tipo]: {
              ...state.perfil.financeiro.combustiveis[action.tipo],
              [action.campo]: action.valor,
            },
          },
        },
      });

    case 'SET_TIPO_COMBUSTIVEL_PREFERIDO':
      return comPerfil({
        ...state.perfil,
        financeiro: { ...state.perfil.financeiro, tipoGasolinaPreferida: action.tipo },
      });

    case 'TOGGLE_GASTO_CUSTOM':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          gastosCustom: state.perfil.financeiro.gastosCustom.map((g) =>
            g.id === action.id ? { ...g, ativo: !g.ativo } : g,
          ),
        },
      });

    case 'SET_GASTO_CUSTOM_VALOR':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          gastosCustom: state.perfil.financeiro.gastosCustom.map((g) =>
            g.id === action.id
              ? {
                  ...g,
                  valorAnual: action.valorAnual,
                  // Conveniência: ao informar um valor > 0 num item desligado,
                  // ativa o toggle (o usuário acabou de declarar o custo).
                  // Não desativa automaticamente ao zerar - quem zera mantém
                  // controle explícito do toggle.
                  ativo: action.valorAnual > 0 && !g.ativo ? true : g.ativo,
                }
              : g,
          ),
        },
      });

    // ── FIPE ────────────────────────────────────
    case 'SET_FIPE_CACHE':
      return comPerfil({ ...state.perfil, fipeCache: action.cache });

    // ── Ajustes de predefinição ─────────────────
    case 'SET_ANO_MOTO': {
      const modeloDados = CATALOGO[state.perfil.moto.modelo];
      const autonomiaGas = obterConsumoKmLPorAno(state.perfil.moto.modelo, action.ano);

      if (!modeloDados || autonomiaGas === undefined) {
        return state;
      }

      const autonomiaEtanol = Math.round(autonomiaGas * dadosRJ.autonomiaEtanolFatorReducao);
      const valorFipe = modeloDados.tabelaFipe[String(action.ano)];
      const fipeCache =
        valorFipe === undefined
          ? null
          : {
              valor: valorFipe,
              codigoFipe: modeloDados.codigoFipe,
              dataConsulta: new Date().toISOString().slice(0, 10),
              anoModelo: action.ano,
              marca: modeloDados.marca,
              modelo: state.perfil.moto.modelo,
            };

      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, ano: action.ano },
        fipeCache,
        financeiro: {
          ...state.perfil.financeiro,
          combustiveis: {
            comum: {
              ...state.perfil.financeiro.combustiveis.comum,
              autonomia: autonomiaGas,
            },
            aditivada: {
              ...state.perfil.financeiro.combustiveis.aditivada,
              autonomia: autonomiaGas,
            },
            etanol: modeloDados.aceitaEtanol
              ? {
                  ...state.perfil.financeiro.combustiveis.etanol,
                  autonomia: autonomiaEtanol,
                }
              : state.perfil.financeiro.combustiveis.etanol,
          },
        },
      });
    }

    case 'SET_KM_ULTIMA_REVISAO':
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, kmUltimaRevisao: action.km },
      });

    case 'SET_MODO_REVISAO':
      return comPerfil({
        ...state.perfil,
        perfilManutencao: { ...state.perfil.perfilManutencao, modoRevisao: action.modo },
      });

    case 'SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA':
      return comPerfil({
        ...state.perfil,
        perfilManutencao: {
          ...state.perfil.perfilManutencao,
          incluirEstimativaMaoDeObra: action.valor,
        },
      });

    case 'TOGGLE_ESTIMATIVA_MAO_DE_OBRA_SERVICO': {
      const atual = state.perfil.perfilManutencao.estimativaMaoDeObraPorServico ?? {};
      return comPerfil({
        ...state.perfil,
        perfilManutencao: {
          ...state.perfil.perfilManutencao,
          estimativaMaoDeObraPorServico: {
            ...atual,
            [action.id]: !(atual[action.id] ?? false),
          },
        },
      });
    }

    case 'SET_SITUACAO_MOTO':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          situacaoMoto: action.situacao,
          parcelaMensal:
            action.situacao !== 'financiada' ? null : state.perfil.financeiro.parcelaMensal,
          parcelasRestantes:
            action.situacao !== 'financiada' ? null : state.perfil.financeiro.parcelasRestantes,
          dataReferenciaParcelas:
            action.situacao !== 'financiada'
              ? null
              : state.perfil.financeiro.dataReferenciaParcelas,
          aluguelValor: action.situacao !== 'alugada' ? null : state.perfil.financeiro.aluguelValor,
          aluguelPeriodicidade:
            action.situacao !== 'alugada' ? null : state.perfil.financeiro.aluguelPeriodicidade,
        },
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          categoriasAtivas: {
            ...state.perfil.configuracaoDisplay.categoriasAtivas,
            financiamento: action.situacao !== 'quitada',
          },
        },
      });

    case 'SET_PARCELA': {
      // Re-stampa a dataReferenciaParcelas SÓ quando parcelasRestantes muda - editar
      // apenas o valor da parcela não pode resetar o relógio de decremento (RF-6.18).
      const restantesMudou = action.parcelasRestantes !== state.perfil.financeiro.parcelasRestantes;
      const dataReferenciaParcelas =
        action.parcelasRestantes == null
          ? null
          : restantesMudou
            ? new Date().toISOString()
            : state.perfil.financeiro.dataReferenciaParcelas;
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          parcelaMensal: action.parcelaMensal,
          parcelasRestantes: action.parcelasRestantes,
          dataReferenciaParcelas,
        },
      });
    }

    case 'SET_ALUGUEL':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          aluguelValor: action.aluguelValor,
          aluguelPeriodicidade: action.aluguelPeriodicidade,
        },
      });

    case 'SET_RESPONSABILIDADE_ALUGUEL':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          responsabilidadeAluguel: {
            ...state.perfil.financeiro.responsabilidadeAluguel,
            ...action.config,
          },
        },
      });

    // ── Histórico de manutenção ─────────────────
    case 'SET_KM_ULTIMA_TROCA':
      return comPerfil({
        ...state.perfil,
        moto: {
          ...state.perfil.moto,
          kmUltimaTrocas: { ...state.perfil.moto.kmUltimaTrocas, [action.componente]: action.km },
        },
      });

    case 'SET_MOTOR_REFEITO':
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, kmMotorRefeito: action.km },
      });

    case 'MARCAR_TROCAS_REVISAO':
      return comPerfil({
        ...state.perfil,
        moto: {
          ...state.perfil.moto,
          kmUltimaTrocas: {
            ...state.perfil.moto.kmUltimaTrocas,
            ...Object.fromEntries(action.componentesMarcados.map((c) => [c, action.kmRevisao])),
          },
        },
      });

    case 'RESETAR_AJUSTES_PADRAO':
      // ADR-005: o reset ZERA os custos; o app não presume gastos.
      // Uso (kmPorDia, diasPorSemana) e modo de revisão voltam ao padrão por serem
      // parâmetros de cálculo, não gastos - zerar km/dia quebraria divisões.
      return comPerfil({
        ...state.perfil,
        trabalho: { ...state.perfil.trabalho, kmPorDia: 70, diasPorSemana: 5 },
        perfilManutencao: { ...state.perfil.perfilManutencao, modoRevisao: 'autorizadas' },
        financeiro: {
          ...state.perfil.financeiro,
          internet: 0,
          alimentacaoDia: 0,
          seguro: { valorAnual: 0, empresa: null, periodicidade: 'anual' },
          situacaoMoto: 'quitada',
          parcelaMensal: null,
          parcelasRestantes: null,
          dataReferenciaParcelas: null,
          aluguelValor: null,
          aluguelPeriodicidade: null,
          gastosCustom: PRESETS_GASTOS_PADRAO,
        },
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          categoriasAtivas: {
            ...state.perfil.configuracaoDisplay.categoriasAtivas,
            internet: false,
            seguro: false,
            alimentacao: false,
            financiamento: false,
            imprevistos: true,
          },
          imprevistosSugeridosAtivos: {},
          filtrosManutencao: FILTROS_MANUTENCAO_PADRAO,
        },
      });

    // ── Presets ──────────────────────────────────
    case 'CARREGAR_PERFIL': {
      const preset = state.presets.find((p) => p.presetId === action.presetId);
      if (!preset) return state;

      const validacao = perfilSchema.safeParse(preset.perfil);
      if (!validacao.success) return state;
      return { ...state, perfil: preset.perfil, presetAtivoId: preset.presetId };
    }

    case 'RESETAR_PERFIL':
      return { perfil: perfilPadrao, presets: [], presetAtivoId: null };

    case 'IMPORTAR_PERFIL': {
      const validacao = perfilSchema.safeParse(action.perfil);
      if (!validacao.success) return state;

      const agora = new Date().toISOString();
      const id = crypto.randomUUID();
      const perfilImportado = action.perfil;
      const nome =
        perfilImportado.apelido ??
        `${perfilImportado.moto.marca} ${perfilImportado.moto.modelo} importado`;
      const importado: PresetEntry = {
        presetId: id,
        nome,
        criadoEm: agora,
        atualizadoEm: agora,
        perfil: perfilImportado,
      };
      return {
        perfil: perfilImportado,
        presets: [...state.presets, importado],
        presetAtivoId: id,
      };
    }

    default: {
      const _exaustivo: never = action;
      return _exaustivo;
    }
  }
}
