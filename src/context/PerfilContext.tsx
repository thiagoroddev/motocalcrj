import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type {
  PerfilUsuario,
  PresetEntry,
  PerfilAction,
  PecaOverride,
  ServicoIndependente,
  GastoCustom,
} from '../types/perfil';
import { LocalStoragePerfilStorage } from '../services/perfilStorage';
import type { IPerfilStorage } from '../services/perfilStorage';
import { CATALOGO } from '../data/catalogoModelos';

// ──────────────────────────────────────────────
// Defaults de serviços independentes (campo RJ)
// ──────────────────────────────────────────────

// Retíficas não existem no modo autorizado — Honda substitui por troca de kit
// cilindro (ver TASK-RF-6.14). precoTotalAutorizada=0 garante que esses
// serviços não apareçam na seção autorizada nem nos imprevistos (ADR-007).
const SERVICO_RETIFICA_CABECOTE_PADRAO: ServicoIndependente = {
  id: 'retifica-cabecote',
  nome: 'Retífica de cabeçote',
  intervalKm: 80000,
  precoMaoDeObraIndependente: 800,
  precoTotalAutorizada: 0,
  incluidoNaRevisaoAutorizada: false,
  ativo: false,
  ehExcepcional: true,
};

const SERVICO_RETIFICA_COMPLETA_PADRAO: ServicoIndependente = {
  id: 'retifica-completa',
  nome: 'Retífica completa',
  intervalKm: 120000,
  precoMaoDeObraIndependente: 1500,
  precoTotalAutorizada: 0,
  incluidoNaRevisaoAutorizada: false,
  ativo: false,
  ehExcepcional: true,
};

// Presets fixos da seção Imprevistos. Lista fechada — usuário não adiciona
// nem remove, apenas edita o valorAnual e o toggle (ver ADR-006).
export const PRESETS_GASTOS_PADRAO: GastoCustom[] = [
  { id: 'preset-multa', nome: 'Multa', valorAnual: 0, ativo: false, ehPreset: true },
  { id: 'preset-sinistro', nome: 'Sinistros', valorAnual: 0, ativo: false, ehPreset: true },
  { id: 'preset-outros', nome: 'Outros', valorAnual: 0, ativo: false, ehPreset: true },
];

// Valores de precoTotalAutorizada são "peça documentada Honda + M.O. estimada"
// e devem ser ajustados pelo usuário no primeiro uso real. Itens com
// incluidoNaRevisaoAutorizada=true têm precoTotalAutorizada=0 (não somam
// extra — já vêm no pacote revisaoAutorizada do Preset). ADR-007.
export const SERVICOS_INDEPENDENTES_PADRAO: ServicoIndependente[] = [
  {
    id: 'troca-oleo',
    nome: 'Troca de óleo',
    intervalKm: 3000,
    precoMaoDeObraIndependente: 25,
    precoTotalAutorizada: 0,
    incluidoNaRevisaoAutorizada: true,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-kit-transmissao',
    nome: 'Troca kit transmissão',
    intervalKm: 12000,
    precoMaoDeObraIndependente: 60,
    precoTotalAutorizada: 313.56,
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-pneu-dianteiro',
    nome: 'Troca pneu dianteiro',
    intervalKm: 25000,
    precoMaoDeObraIndependente: 30,
    precoTotalAutorizada: 249.0,
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-pneu-traseiro',
    nome: 'Troca pneu traseiro',
    intervalKm: 15000,
    precoMaoDeObraIndependente: 30,
    precoTotalAutorizada: 285.0,
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-sapata-dianteira',
    nome: 'Troca sapata de freio dianteira',
    intervalKm: 20000,
    precoMaoDeObraIndependente: 40,
    precoTotalAutorizada: 268.65,
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-sapata-traseira',
    nome: 'Troca sapata de freio traseira',
    intervalKm: 20000,
    precoMaoDeObraIndependente: 40,
    precoTotalAutorizada: 191.65,
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'revisao-geral',
    nome: 'Revisão geral (independente)',
    intervalKm: 6000,
    precoMaoDeObraIndependente: 80,
    precoTotalAutorizada: 0,
    incluidoNaRevisaoAutorizada: true,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-vela',
    nome: 'Troca de vela',
    intervalKm: 6000,
    precoMaoDeObraIndependente: 15,
    precoTotalAutorizada: 0,
    incluidoNaRevisaoAutorizada: true,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-filtro-ar',
    nome: 'Troca filtro de ar',
    intervalKm: 6000,
    precoMaoDeObraIndependente: 15,
    precoTotalAutorizada: 0,
    incluidoNaRevisaoAutorizada: true,
    ativo: true,
    ehExcepcional: false,
  },
  SERVICO_RETIFICA_CABECOTE_PADRAO,
  SERVICO_RETIFICA_COMPLETA_PADRAO,
];

// ──────────────────────────────────────────────
// Estado inicial padrão (pre-onboarding)
// ──────────────────────────────────────────────

export const perfilPadrao: PerfilUsuario = {
  schemaVersion: 16,
  userId: null,
  onboardingConcluido: false,
  apelido: null,
  aplicativos: [],

  moto: {
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    perfilUso: 'entrega',
    kmAtual: 0,
    kmUltimaRevisao: null,
    kmUltimaTrocas: { oleo: 0, pneuDianteiro: 0, pneuTraseiro: 0, kitRelacao: 0 },
    kmMotorRefeito: null,
  },

  perfilManutencao: {
    perfilPecasGlobal: 'original',
    modoRevisao: 'independentes',
  },

  trabalho: {
    kmPorDia: 70,
    diasPorSemana: 5,
    horasPorDia: 8,
  },

  financeiro: {
    tipoGasolinaPreferida: 'comum',
    combustiveis: {
      comum: { preco: 6.61, autonomia: 36 },
      aditivada: { preco: 6.99, autonomia: 36 },
      etanol: { preco: 4.29, autonomia: 28 },
    },
    internet: 0,
    seguro: {
      valorAnual: 0,
      empresa: null,
      periodicidade: 'anual',
    },
    situacaoMoto: 'quitada',
    parcelaMensal: null,
    parcelasRestantes: null,
    aluguelMensal: null,
    aluguelPeriodicidade: null,
    alimentacaoDia: 20,
    gastosCustom: PRESETS_GASTOS_PADRAO,
    responsabilidadeAluguel: {
      documentos: 'eu',
      manutencao: 'eu',
      seguro: 'eu',
    },
  },

  configuracaoDisplay: {
    categoriasAtivas: {
      combustivel: true,
      alimentacao: true,
      manutencao: true,
      documentacao: true,
      internet: false,
      seguro: false,
      financiamento: false,
      imprevistos: true,
    },
    imprevistosSugeridosAtivos: {},
  },

  pecasOverrides: [],
  servicosIndependentes: SERVICOS_INDEPENDENTES_PADRAO,
  revisaoAutorizadaOverrides: [],

  fipeCache: null,
};

// ──────────────────────────────────────────────
// Estado do app
// ──────────────────────────────────────────────

export interface EstadoApp {
  perfil: PerfilUsuario;
  presets: PresetEntry[];
  presetAtivoId: string | null;
}

const estadoPadrao: EstadoApp = {
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

type CampoOverrideChave = keyof typeof campoOverrideMap;

export function perfilReducer(state: EstadoApp, action: PerfilAction): EstadoApp {
  // Atualiza perfil e sincroniza com o preset ativo
  const comPerfil = (novoPerfil: PerfilUsuario): EstadoApp => ({
    ...state,
    perfil: novoPerfil,
    presets: state.presetAtivoId
      ? state.presets.map((p) =>
          p.presetId === state.presetAtivoId
            ? { ...p, perfil: novoPerfil, atualizadoEm: new Date().toISOString() }
            : p,
        )
      : state.presets,
  });

  switch (action.type) {
    // ── Onboarding ─────────────────────────────
    case 'SET_ONBOARDING_CAMPO':
      return {
        ...state,
        perfil: { ...state.perfil, [action.campo]: action.valor } as PerfilUsuario,
      };

    case 'COMMIT_ONBOARDING': {
      const modeloDados = CATALOGO[state.perfil.moto.modelo];
      const usaComBau = state.perfil.moto.perfilUso === 'entrega';
      const autonomiaGas = modeloDados
        ? usaComBau
          ? modeloDados.consumoKmLComBau
          : modeloDados.consumoKmL
        : state.perfil.financeiro.combustiveis.comum.autonomia;
      const autonomiaEtanol = Math.round(autonomiaGas * 0.78);

      const combustiveisComBase = modeloDados
        ? {
            comum: { ...state.perfil.financeiro.combustiveis.comum, autonomia: autonomiaGas },
            aditivada: {
              ...state.perfil.financeiro.combustiveis.aditivada,
              autonomia: autonomiaGas,
            },
            etanol: modeloDados.aceitaEtanol
              ? { ...state.perfil.financeiro.combustiveis.etanol, autonomia: autonomiaEtanol }
              : state.perfil.financeiro.combustiveis.etanol,
          }
        : state.perfil.financeiro.combustiveis;

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
      return comPerfil({
        ...state.perfil,
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          imprevistosSugeridosAtivos: {
            ...state.perfil.configuracaoDisplay.imprevistosSugeridosAtivos,
            [action.id]: !atual,
          },
        },
      });
    }

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
      if (action.payload.intervalKm <= 0) return state; // INV-MANUT-1
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
                  // Não desativa automaticamente ao zerar — quem zera mantém
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
    case 'SET_ANO_MOTO':
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, ano: action.ano },
      });

    case 'SET_KM_ULTIMA_REVISAO':
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, kmUltimaRevisao: action.km },
      });

    case 'SET_PERFIL_USO':
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, perfilUso: action.perfilUso },
      });

    case 'SET_MODO_REVISAO':
      return comPerfil({
        ...state.perfil,
        perfilManutencao: { ...state.perfil.perfilManutencao, modoRevisao: action.modo },
      });

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
          aluguelMensal:
            action.situacao !== 'alugada' ? null : state.perfil.financeiro.aluguelMensal,
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

    case 'SET_PARCELA':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          parcelaMensal: action.parcelaMensal,
          parcelasRestantes: action.parcelasRestantes,
        },
      });

    case 'SET_ALUGUEL':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          aluguelMensal: action.aluguelMensal,
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
      // parâmetros de cálculo, não gastos — zerar km/dia quebraria divisões.
      return comPerfil({
        ...state.perfil,
        trabalho: { ...state.perfil.trabalho, kmPorDia: 70, diasPorSemana: 5 },
        perfilManutencao: { ...state.perfil.perfilManutencao, modoRevisao: 'independentes' },
        financeiro: {
          ...state.perfil.financeiro,
          internet: 0,
          alimentacaoDia: 0,
          seguro: { valorAnual: 0, empresa: null, periodicidade: 'anual' },
          situacaoMoto: 'quitada',
          parcelaMensal: null,
          parcelasRestantes: null,
          aluguelMensal: null,
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
        },
      });

    // ── Presets ──────────────────────────────────
    case 'CARREGAR_PERFIL':
      return { ...state, perfil: action.perfil, presetAtivoId: action.presetId };

    case 'RESETAR_PERFIL':
      return { perfil: perfilPadrao, presets: [], presetAtivoId: null };

    case 'IMPORTAR_PERFIL': {
      const agora = new Date().toISOString();
      const id = crypto.randomUUID();
      const nome =
        action.perfil.apelido ??
        `${action.perfil.moto.marca} ${action.perfil.moto.modelo} importado`;
      const importado: PresetEntry = {
        presetId: id,
        nome,
        criadoEm: agora,
        atualizadoEm: agora,
        perfil: action.perfil,
      };
      return {
        perfil: action.perfil,
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

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

interface PerfilContextValue {
  estado: EstadoApp;
  dispatch: React.Dispatch<PerfilAction>;
}

export const PerfilContext = createContext<PerfilContextValue | null>(null);

export function usePerfilContext(): PerfilContextValue {
  const ctx = useContext(PerfilContext);
  if (!ctx) {
    throw new Error('usePerfilContext deve ser usado dentro de PerfilProvider');
  }
  return ctx;
}

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

interface PerfilProviderProps {
  children: React.ReactNode;
  // Injecao do storage — facilita testes
  storage?: IPerfilStorage;
}

export function migrarPerfil(perfil: PerfilUsuario): PerfilUsuario {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dados = perfil as any;

  if (dados.schemaVersion < 6) {
    // v5 → v6: descarta servicosMaoDeObra (orphan), inicializa servicosIndependentes
    const resto = { ...dados };
    delete resto.servicosMaoDeObra;
    dados = { ...resto, schemaVersion: 6, servicosIndependentes: SERVICOS_INDEPENDENTES_PADRAO };
  }

  if (dados.schemaVersion === 6) {
    // v6 → v7: adiciona kmUltimaTrocas e kmMotorRefeito em moto
    dados = {
      ...dados,
      schemaVersion: 7,
      moto: {
        ...dados.moto,
        kmUltimaTrocas: {
          oleo: dados.moto.kmUltimaRevisao ?? 0,
          pneuDianteiro: 0,
          pneuTraseiro: 0,
          kitRelacao: 0,
        },
        kmMotorRefeito: null,
      },
    };
  }

  if (dados.schemaVersion === 7) {
    // v7 → v8: remove configuracaoDisplay.modoExibicao (ADR-003 / REF-18)
    const configDisplaySemModo = { ...(dados.configuracaoDisplay ?? {}) };
    delete configDisplaySemModo.modoExibicao;
    dados = { ...dados, schemaVersion: 8, configuracaoDisplay: configDisplaySemModo };
  }

  if (dados.schemaVersion === 8) {
    // v8 → v9: remove campos mortos consolidados pela REF-19 (ADR-003 / ADR-006)
    // - configuracaoDisplay.modoOficinDisplay (nunca lido)
    // - perfilManutencao.precoMaoDeObraIndependente, .frequenciaRevisaoKm (aposentados por ADR-004)
    // - historicoManutencao, diarioTrabalho (Registros adiados por ADR-003)
    const novoConfigDisplay = { ...(dados.configuracaoDisplay ?? {}) };
    delete novoConfigDisplay.modoOficinDisplay;
    const novoPerfilManutencao = { ...(dados.perfilManutencao ?? {}) };
    delete novoPerfilManutencao.precoMaoDeObraIndependente;
    delete novoPerfilManutencao.frequenciaRevisaoKm;
    const novoPerfil = { ...dados, schemaVersion: 9 };
    delete novoPerfil.historicoManutencao;
    delete novoPerfil.diarioTrabalho;
    novoPerfil.configuracaoDisplay = novoConfigDisplay;
    novoPerfil.perfilManutencao = novoPerfilManutencao;
    dados = novoPerfil;
  }

  if (dados.schemaVersion === 9) {
    // v9 → v10: remove seguro.tem (ADR-005 / REF-21).
    // Custo de seguro passa a ser derivado de valorAnual > 0.
    // Preserva a intenção do usuário: se tem===false, força valorAnual: 0
    // antes de deletar tem (perfis com tem=false mantinham valorAnual antigo
    // "esquecido"; pós-migração ingênua passariam a contar seguro).
    const novoSeguro = { ...(dados.financeiro?.seguro ?? {}) };
    if (novoSeguro.tem === false) {
      novoSeguro.valorAnual = 0;
    }
    delete novoSeguro.tem;
    dados = {
      ...dados,
      schemaVersion: 10,
      financeiro: { ...dados.financeiro, seguro: novoSeguro },
    };
  }

  if (dados.schemaVersion === 10) {
    // v10 → v11: substitui "fazer motor" por duas retíficas (ADR-006 / RF-6.10).
    // Se o usuário já tinha editado o item legado, a retífica completa herda
    // preço, ativação e intervalo customizado (exceto o intervalo padrão antigo).
    // Dados v10 ainda tinham o campo legado `precoMaoDeObra` (renomeado para
    // `precoMaoDeObraIndependente` apenas na v14→v15) — daí o cast estendido.
    type ServicoLegadoV10 = { id: string; precoMaoDeObra?: number; intervalKm: number };
    const servicos = Array.isArray(dados.servicosIndependentes)
      ? (dados.servicosIndependentes as ServicoLegadoV10[])
      : (SERVICOS_INDEPENDENTES_PADRAO as unknown as ServicoLegadoV10[]);
    const fazerMotorLegado = servicos.find((s) => s.id === 'fazer-motor');
    const cabecoteExistente = servicos.find((s) => s.id === 'retifica-cabecote');
    const completaExistente = servicos.find((s) => s.id === 'retifica-completa');
    const servicosSemMotorERetificas = servicos.filter(
      (s) => s.id !== 'fazer-motor' && s.id !== 'retifica-cabecote' && s.id !== 'retifica-completa',
    );

    const retificaCompletaMigrada =
      completaExistente ??
      (fazerMotorLegado
        ? {
            ...(SERVICO_RETIFICA_COMPLETA_PADRAO as unknown as ServicoLegadoV10),
            precoMaoDeObra:
              fazerMotorLegado.precoMaoDeObra ??
              SERVICO_RETIFICA_COMPLETA_PADRAO.precoMaoDeObraIndependente,
            intervalKm:
              fazerMotorLegado.intervalKm === 70000
                ? SERVICO_RETIFICA_COMPLETA_PADRAO.intervalKm
                : fazerMotorLegado.intervalKm,
          }
        : (SERVICO_RETIFICA_COMPLETA_PADRAO as unknown as ServicoLegadoV10));

    dados = {
      ...dados,
      schemaVersion: 11,
      servicosIndependentes: [
        ...servicosSemMotorERetificas,
        cabecoteExistente ?? SERVICO_RETIFICA_CABECOTE_PADRAO,
        retificaCompletaMigrada,
      ],
    };
  }

  if (dados.schemaVersion === 11) {
    // v11 → v12: retíficas deixam de entrar em Revisão/Manutenção e passam
    // a aparecer em Imprevistos como sugestões desligadas por padrão.
    const servicos = Array.isArray(dados.servicosIndependentes)
      ? (dados.servicosIndependentes as ServicoIndependente[])
      : SERVICOS_INDEPENDENTES_PADRAO;
    dados = {
      ...dados,
      schemaVersion: 12,
      servicosIndependentes: servicos.map((servico) =>
        servico.ehExcepcional ? { ...servico, ativo: false } : servico,
      ),
    };
  }

  if (dados.schemaVersion === 12) {
    // v12 → v13: gastosCustom vira lista fechada de presets (Multa, Sinistros,
    // Outros). Gastos livres pré-existentes são descartados — não há usuários
    // em produção e a Decisão 2 da TASK-RF-6.9 fechou o modelo de cadastro
    // avulso. Campo valorMensal eliminado em favor de valorAnual (padrão único
    // acumulado, ver ADR-003/ADR-006).
    dados = {
      ...dados,
      schemaVersion: 13,
      financeiro: {
        ...dados.financeiro,
        gastosCustom: PRESETS_GASTOS_PADRAO,
      },
    };
  }

  if (dados.schemaVersion === 13) {
    // v13 → v14: toggles de imprevistos persistem no perfil (TASK-RF-6.11 cleanup).
    // - Nova chave `categoriasAtivas.imprevistos` (default true — categoria
    //   sempre apareceu sem toggle; mantém comportamento anterior).
    // - Novo mapa `imprevistosSugeridosAtivos` (default vazio = retíficas
    //   continuam desligadas, como na v12).
    const configDisplay = { ...(dados.configuracaoDisplay ?? { categoriasAtivas: {} }) };
    const categoriasAtivas = {
      ...(configDisplay.categoriasAtivas ?? {}),
      imprevistos:
        typeof configDisplay.categoriasAtivas?.imprevistos === 'boolean'
          ? configDisplay.categoriasAtivas.imprevistos
          : true,
    };
    const imprevistosSugeridosAtivos =
      configDisplay.imprevistosSugeridosAtivos &&
      typeof configDisplay.imprevistosSugeridosAtivos === 'object'
        ? configDisplay.imprevistosSugeridosAtivos
        : {};
    dados = {
      ...dados,
      schemaVersion: 14,
      configuracaoDisplay: {
        ...configDisplay,
        categoriasAtivas,
        imprevistosSugeridosAtivos,
      },
    };
  }

  if (dados.schemaVersion === 14) {
    // v14 → v15: ServicoIndependente ganha precoMaoDeObraIndependente (rename
    // de precoMaoDeObra), precoTotalAutorizada e incluidoNaRevisaoAutorizada
    // (ADR-007). Além disso, mescla defaults novos que apareceram após v14
    // (sapatas dianteira/traseira) — perfis salvos em v14 não os tinham.
    // Preserva edições do usuário no campo legado migrando para o novo nome;
    // popula campos novos pelos defaults por id em SERVICOS_INDEPENDENTES_PADRAO.
    // Ids desconhecidos (custom no futuro) recebem precoTotalAutorizada=0,
    // incluidoNaRevisaoAutorizada=false.
    type ServicoLegadoV14 = {
      id: string;
      nome: string;
      intervalKm: number;
      precoMaoDeObra?: number;
      ativo: boolean;
      ehExcepcional: boolean;
    };
    const servicosLegados = Array.isArray(dados.servicosIndependentes)
      ? (dados.servicosIndependentes as ServicoLegadoV14[])
      : (SERVICOS_INDEPENDENTES_PADRAO as ServicoIndependente[]).map((s) => ({
          ...s,
          precoMaoDeObra: s.precoMaoDeObraIndependente,
        }));
    const servicosMigrados: ServicoIndependente[] = servicosLegados.map((s) => {
      const padrao = SERVICOS_INDEPENDENTES_PADRAO.find((p) => p.id === s.id);
      return {
        id: s.id,
        nome: s.nome,
        intervalKm: s.intervalKm,
        precoMaoDeObraIndependente: s.precoMaoDeObra ?? padrao?.precoMaoDeObraIndependente ?? 0,
        precoTotalAutorizada: padrao?.precoTotalAutorizada ?? 0,
        incluidoNaRevisaoAutorizada: padrao?.incluidoNaRevisaoAutorizada ?? false,
        ativo: s.ativo,
        ehExcepcional: s.ehExcepcional,
      };
    });
    const idsExistentes = new Set(servicosMigrados.map((s) => s.id));
    const defaultsFaltantes = SERVICOS_INDEPENDENTES_PADRAO.filter((p) => !idsExistentes.has(p.id));
    dados = {
      ...dados,
      schemaVersion: 15,
      servicosIndependentes: [...servicosMigrados, ...defaultsFaltantes],
    };
  }

  if (dados.schemaVersion === 15) {
    // v15 → v16: adiciona ServicoIndependente defaults novos que apareceram
    // após o bump da v15 (sapatas dianteira/traseira). Necessário porque
    // perfis já em v15 não re-executam a migration v14→v15 e ficariam sem
    // os ids novos. Idempotente: só adiciona ids ainda ausentes.
    const servicos = Array.isArray(dados.servicosIndependentes)
      ? (dados.servicosIndependentes as ServicoIndependente[])
      : SERVICOS_INDEPENDENTES_PADRAO;
    const idsExistentes = new Set(servicos.map((s) => s.id));
    const defaultsFaltantes = SERVICOS_INDEPENDENTES_PADRAO.filter((p) => !idsExistentes.has(p.id));
    dados = {
      ...dados,
      schemaVersion: 16,
      servicosIndependentes: [...servicos, ...defaultsFaltantes],
    };
  }

  return dados as PerfilUsuario;
}

function criarEstadoInicial(storage: IPerfilStorage): EstadoApp {
  const presetsRaw = storage.carregarPresets();
  const ativoId = storage.getPresetAtivo();

  if (presetsRaw.length === 0 || !ativoId) {
    return estadoPadrao;
  }

  const presets = presetsRaw.map((p) => ({ ...p, perfil: migrarPerfil(p.perfil) }));
  const preset = presets.find((p) => p.presetId === ativoId) ?? presets[0];
  return { perfil: preset.perfil, presets, presetAtivoId: preset.presetId };
}

export function PerfilProvider({ children, storage }: PerfilProviderProps) {
  const storageRef = useRef<IPerfilStorage>(storage ?? new LocalStoragePerfilStorage());

  const [estado, dispatch] = useReducer(perfilReducer, null, () =>
    criarEstadoInicial(storageRef.current),
  );

  // Persiste apenas após COMMIT_ONBOARDING (presetAtivoId só existe depois do commit)
  const primeiraMontagem = useRef(true);
  useEffect(() => {
    if (primeiraMontagem.current) {
      primeiraMontagem.current = false;
      return;
    }
    if (!estado.presetAtivoId) {
      return;
    }
    storageRef.current.salvarPresets(estado.presets);
    storageRef.current.setPresetAtivo(estado.presetAtivoId);
  }, [estado]);

  return <PerfilContext.Provider value={{ estado, dispatch }}>{children}</PerfilContext.Provider>;
}
