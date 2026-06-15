import type {
  PerfilUsuario,
  PresetEntry,
  PerfilAction,
  PecaOverride,
  RascunhoPredefinicao,
  ServicoIndependente,
} from '../types/perfil';
import { perfilSchema } from '../schemas/perfilSchema';
import { CATALOGO } from '../data/catalogoModelos';
import { dadosRJ } from '../data/dadosRJ';
import { perfilProntoParaCommit } from '../utils/onboardingGuards';
import {
  gerarNomePredefinicao,
  normalizarSufixoPredefinicao,
  obterErroSufixoPredefinicao,
  sugerirSufixoPredefinicao,
} from '../utils/predefinicoes';
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
  rascunhoPredefinicao: RascunhoPredefinicao | null;
}

export const estadoPadrao: EstadoApp = {
  perfil: perfilPadrao,
  presets: [],
  presetAtivoId: null,
  rascunhoPredefinicao: null,
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
      presets:
        state.presetAtivoId && !state.rascunhoPredefinicao
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
    case 'INICIAR_NOVA_PREDEFINICAO': {
      const modelo = CATALOGO[action.modeloId];
      const sufixo = normalizarSufixoPredefinicao(action.sufixo);
      const erroSufixo = obterErroSufixoPredefinicao(sufixo, action.modeloId, state.presets);

      if (!modelo || erroSufixo) {
        return state;
      }

      return {
        perfil: {
          ...perfilPadrao,
          moto: {
            ...perfilPadrao.moto,
            marca: modelo.marca,
            modelo: modelo.id,
          },
        },
        presets: state.presets,
        presetAtivoId: state.presetAtivoId,
        rascunhoPredefinicao: {
          sufixo,
          presetAtivoAnteriorId: state.presetAtivoId,
        },
      };
    }

    case 'CANCELAR_NOVA_PREDEFINICAO': {
      if (!state.rascunhoPredefinicao) {
        return state;
      }

      const presetAnterior = state.presets.find(
        (preset) => preset.presetId === state.rascunhoPredefinicao?.presetAtivoAnteriorId,
      );

      return {
        ...state,
        perfil: presetAnterior?.perfil ?? perfilPadrao,
        presetAtivoId: presetAnterior?.presetId ?? null,
        rascunhoPredefinicao: null,
      };
    }

    case 'SET_ONBOARDING_CAMPO':
      return comPerfil({ ...state.perfil, [action.campo]: action.valor } as PerfilUsuario);

    case 'COMMIT_ONBOARDING': {
      if (
        !perfilProntoParaCommit(state.perfil) ||
        (state.perfil.onboardingConcluido && !state.rascunhoPredefinicao)
      ) {
        return state;
      }

      const modeloDados = CATALOGO[state.perfil.moto.modelo];

      if (!modeloDados) {
        return state;
      }

      // Consumo é semeado pelo passo de km/consumo do onboarding (RF-6.33), que
      // pré-preenche com o consumo do modelo e permite editar. O commit preserva
      // o valor escolhido (não re-semeia do modelo) e deriva o etanol dele.
      const autonomiaGas = state.perfil.financeiro.combustiveis.comum.autonomia;
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

      // RESET de predefinição existente (TASK-RF-6.36): sobrescreve a entrada
      // (mesmo presetId/sufixo/nome/criadoEm) em vez de criar uma nova. Não
      // re-checa unicidade de sufixo — o sufixo já é o da própria entrada.
      const presetIdEmReset = state.rascunhoPredefinicao?.presetIdEmReset;
      if (presetIdEmReset) {
        const existente = state.presets.find((p) => p.presetId === presetIdEmReset);
        if (!existente) {
          return state;
        }
        const atualizado: PresetEntry = { ...existente, perfil: novoPerfil, atualizadoEm: agora };
        return {
          perfil: novoPerfil,
          presets: state.presets.map((p) => (p.presetId === existente.presetId ? atualizado : p)),
          presetAtivoId: existente.presetId,
          rascunhoPredefinicao: null,
        };
      }

      const novoId = crypto.randomUUID();
      const sufixo =
        state.rascunhoPredefinicao?.sufixo ??
        sugerirSufixoPredefinicao(novoPerfil.moto.modelo, state.presets);
      const erroSufixo = obterErroSufixoPredefinicao(sufixo, novoPerfil.moto.modelo, state.presets);

      if (erroSufixo) {
        return state;
      }

      const novoPreset: PresetEntry = {
        presetId: novoId,
        nome: gerarNomePredefinicao(novoPerfil.moto.modelo, sufixo),
        sufixo,
        criadoEm: agora,
        atualizadoEm: agora,
        perfil: novoPerfil,
      };
      return {
        perfil: novoPerfil,
        presets: [...state.presets, novoPreset],
        presetAtivoId: novoId,
        rascunhoPredefinicao: null,
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

      return comPerfil({
        ...state.perfil,
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
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
      // Consumo é do modelo e não muda com o ano; trocar o ano só atualiza a FIPE
      // (que é por ano) e o próprio ano. A autonomia gravada permanece editável.
      const modeloDados = CATALOGO[state.perfil.moto.modelo];
      const valorFipe = modeloDados?.tabelaFipe[String(action.ano)];
      const fipeCache =
        modeloDados && valorFipe !== undefined
          ? {
              valor: valorFipe,
              codigoFipe: modeloDados.codigoFipe,
              dataConsulta: new Date().toISOString().slice(0, 10),
              anoModelo: action.ano,
              marca: modeloDados.marca,
              modelo: state.perfil.moto.modelo,
            }
          : null;

      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, ano: action.ano },
        fipeCache,
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

    case 'SET_BATERIA_ULTIMA_TROCA':
      return comPerfil({
        ...state.perfil,
        perfilManutencao: {
          ...state.perfil.perfilManutencao,
          bateria: { ...state.perfil.perfilManutencao.bateria, ultimaTrocaAnoMes: action.anoMes },
        },
      });

    case 'SET_BATERIA_VIDA_UTIL':
      return comPerfil({
        ...state.perfil,
        perfilManutencao: {
          ...state.perfil.perfilManutencao,
          bateria: { ...state.perfil.perfilManutencao.bateria, vidaUtilAnos: action.anos },
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
      return {
        ...state,
        perfil: preset.perfil,
        presetAtivoId: preset.presetId,
        rascunhoPredefinicao: null,
      };
    }

    case 'RENOMEAR_PREDEFINICAO': {
      const preset = state.presets.find((item) => item.presetId === action.presetId);
      if (!preset || state.rascunhoPredefinicao) {
        return state;
      }

      const sufixo = normalizarSufixoPredefinicao(action.sufixo);
      const erroSufixo = obterErroSufixoPredefinicao(
        sufixo,
        preset.perfil.moto.modelo,
        state.presets,
        preset.presetId,
      );

      if (erroSufixo) {
        return state;
      }

      return {
        ...state,
        presets: state.presets.map((item) =>
          item.presetId === preset.presetId
            ? {
                ...item,
                sufixo,
                nome: gerarNomePredefinicao(item.perfil.moto.modelo, sufixo),
                atualizadoEm: new Date().toISOString(),
              }
            : item,
        ),
      };
    }

    case 'DELETAR_PREDEFINICAO': {
      // A ativa é protegida aqui (não só na UI): deletar a referência ativa
      // deixaria perfil e presetAtivoId apontando para um preset inexistente.
      // Durante um rascunho de onboarding também não se exclui nada.
      const existe = state.presets.some((p) => p.presetId === action.presetId);
      if (!existe || state.rascunhoPredefinicao || action.presetId === state.presetAtivoId) {
        return state;
      }

      return {
        ...state,
        presets: state.presets.filter((p) => p.presetId !== action.presetId),
      };
    }

    case 'RESETAR_PREDEFINICAO_ATIVA': {
      // Reseta APENAS a predefinição ativa: abre um rascunho marcado como reset
      // (presetIdEmReset) e zera o perfil para o padrão, preservando o modelo.
      // O perfil antigo continua em `presets` até o COMMIT — cancelar o
      // onboarding o restaura via CANCELAR_NOVA_PREDEFINICAO. (TASK-RF-6.36)
      if (!state.presetAtivoId || state.rascunhoPredefinicao) {
        return state;
      }

      const ativo = state.presets.find((p) => p.presetId === state.presetAtivoId);
      if (!ativo) {
        return state;
      }

      return {
        perfil: {
          ...perfilPadrao,
          moto: {
            ...perfilPadrao.moto,
            marca: ativo.perfil.moto.marca,
            modelo: ativo.perfil.moto.modelo,
          },
        },
        presets: state.presets,
        presetAtivoId: state.presetAtivoId,
        rascunhoPredefinicao: {
          sufixo: ativo.sufixo,
          presetAtivoAnteriorId: state.presetAtivoId,
          presetIdEmReset: state.presetAtivoId,
        },
      };
    }

    case 'IMPORTAR_PERFIL': {
      const validacao = perfilSchema.safeParse(action.perfil);
      if (!validacao.success) return state;

      const agora = new Date().toISOString();
      const id = crypto.randomUUID();
      const perfilImportado = action.perfil;
      const sufixo = sugerirSufixoPredefinicao(perfilImportado.moto.modelo, state.presets);
      const importado: PresetEntry = {
        presetId: id,
        nome: gerarNomePredefinicao(perfilImportado.moto.modelo, sufixo),
        sufixo,
        criadoEm: agora,
        atualizadoEm: agora,
        perfil: perfilImportado,
      };
      return {
        perfil: perfilImportado,
        presets: [...state.presets, importado],
        presetAtivoId: id,
        rascunhoPredefinicao: null,
      };
    }

    default: {
      const _exaustivo: never = action;
      return _exaustivo;
    }
  }
}
