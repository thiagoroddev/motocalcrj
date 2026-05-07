import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { PerfilUsuario, PresetEntry, PerfilAction, PecaOverride } from '../types/perfil';
import { CATALOGO } from '../data/catalogoModelos';

// ──────────────────────────────────────────────
// Estado inicial padrão (pre-onboarding)
// ──────────────────────────────────────────────

export const perfilPadrao: PerfilUsuario = {
  schemaVersion: 5,
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
  },

  perfilManutencao: {
    perfilPecasGlobal: 'original',
    modoRevisao: 'independentes',
    precoMaoDeObraIndependente: 150,
    frequenciaRevisaoKm: 6000,
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
      tem: false,
      valorAnual: 929.96,
      empresa: null,
      periodicidade: 'anual',
    },
    situacaoMoto: 'quitada',
    parcelaMensal: null,
    parcelasRestantes: null,
    aluguelMensal: null,
    aluguelPeriodicidade: null,
    alimentacaoDia: 20,
    gastosCustom: [],
    responsabilidadeAluguel: {
      documentos: 'eu',
      manutencao: 'eu',
      seguro: 'eu',
    },
  },

  configuracaoDisplay: {
    modoExibicao: 'predefinidos',
    modoOficinDisplay: 'independentes',
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

  pecasOverrides: [],
  servicosMaoDeObra: {
    trocaOleo: 30,
    trocaKitTransmissao: 50,
    trocaPneu: 30,
    revisaoGeral: 150,
    avulso: 80,
  },
  revisaoAutorizadaOverrides: [],

  fipeCache: null,

  historicoManutencao: {
    trocasOleo: [],
    revisoes: [],
    trocasPneu: [],
    trocasKitRelacao: [],
    abastecimentos: [],
  },

  diarioTrabalho: [],
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
  preco: 'precoEditado',
  intervaloKm: 'intervaloKmEditado',
  perfilPecas: 'perfilPecasOverride',
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
      const autonomiaEtanol = Math.round(autonomiaGas * 0.79);

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
            seguro: financeiro.seguro.tem,
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
    case 'SET_MODO_EXIBICAO':
      return comPerfil({
        ...state.perfil,
        configuracaoDisplay: { ...state.perfil.configuracaoDisplay, modoExibicao: action.modo },
      });

    case 'SET_MODO_OFICINA':
      return comPerfil({
        ...state.perfil,
        configuracaoDisplay: {
          ...state.perfil.configuracaoDisplay,
          modoOficinDisplay: action.modo,
        },
      });

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

    // ── Overrides de peças ──────────────────────
    case 'SET_PECA_OVERRIDE': {
      const campo = campoOverrideMap[action.campo as CampoOverrideChave];
      const existente = state.perfil.pecasOverrides.find((o) => o.id === action.id);
      const novoOverride: PecaOverride = existente
        ? { ...existente, [campo]: action.valor }
        : {
            id: action.id,
            precoEditado: null,
            intervaloKmEditado: null,
            perfilPecasOverride: null,
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
    case 'SET_SERVICO_MAO_DE_OBRA':
      return comPerfil({
        ...state.perfil,
        servicosMaoDeObra: { ...state.perfil.servicosMaoDeObra, [action.servico]: action.valor },
      });

    case 'RESET_SERVICO_MAO_DE_OBRA':
      return comPerfil({
        ...state.perfil,
        servicosMaoDeObra: {
          ...state.perfil.servicosMaoDeObra,
          [action.servico]: perfilPadrao.servicosMaoDeObra[action.servico],
        },
      });

    case 'SET_REVISAO_AUTORIZADA_OVERRIDE': {
      const existente = state.perfil.revisaoAutorizadaOverrides.find(
        (o) => o.index === action.index,
      );
      const novosOverrides = existente
        ? state.perfil.revisaoAutorizadaOverrides.map((o) =>
            o.index === action.index ? { ...o, precoTotal: action.precoTotal } : o,
          )
        : [
            ...state.perfil.revisaoAutorizadaOverrides,
            { index: action.index, precoTotal: action.precoTotal },
          ];
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

    case 'ADD_GASTO_CUSTOM':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          gastosCustom: [
            ...state.perfil.financeiro.gastosCustom,
            { ...action.gasto, id: crypto.randomUUID() },
          ],
        },
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

    case 'DELETE_GASTO_CUSTOM':
      return comPerfil({
        ...state.perfil,
        financeiro: {
          ...state.perfil.financeiro,
          gastosCustom: state.perfil.financeiro.gastosCustom.filter((g) => g.id !== action.id),
        },
      });

    // ── Registros ────────────────────────────────
    case 'ADD_TROCA_OLEO': {
      const novo = { ...action.registro, id: crypto.randomUUID() };
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, kmAtual: Math.max(state.perfil.moto.kmAtual, novo.km) },
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          trocasOleo: [...state.perfil.historicoManutencao.trocasOleo, novo],
        },
        configuracaoDisplay: { ...state.perfil.configuracaoDisplay, modoExibicao: 'personalizado' },
      });
    }

    case 'DELETE_TROCA_OLEO':
      return comPerfil({
        ...state.perfil,
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          trocasOleo: state.perfil.historicoManutencao.trocasOleo.filter((r) => r.id !== action.id),
        },
      });

    case 'ADD_REVISAO': {
      const novo = { ...action.registro, id: crypto.randomUUID() };
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, kmAtual: Math.max(state.perfil.moto.kmAtual, novo.km) },
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          revisoes: [...state.perfil.historicoManutencao.revisoes, novo],
        },
        configuracaoDisplay: { ...state.perfil.configuracaoDisplay, modoExibicao: 'personalizado' },
      });
    }

    case 'DELETE_REVISAO':
      return comPerfil({
        ...state.perfil,
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          revisoes: state.perfil.historicoManutencao.revisoes.filter((r) => r.id !== action.id),
        },
      });

    case 'ADD_TROCA_PNEU': {
      const novo = { ...action.registro, id: crypto.randomUUID() };
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, kmAtual: Math.max(state.perfil.moto.kmAtual, novo.km) },
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          trocasPneu: [...state.perfil.historicoManutencao.trocasPneu, novo],
        },
        configuracaoDisplay: { ...state.perfil.configuracaoDisplay, modoExibicao: 'personalizado' },
      });
    }

    case 'DELETE_TROCA_PNEU':
      return comPerfil({
        ...state.perfil,
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          trocasPneu: state.perfil.historicoManutencao.trocasPneu.filter((r) => r.id !== action.id),
        },
      });

    case 'ADD_TROCA_KIT_RELACAO': {
      const novo = { ...action.registro, id: crypto.randomUUID() };
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, kmAtual: Math.max(state.perfil.moto.kmAtual, novo.km) },
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          trocasKitRelacao: [...state.perfil.historicoManutencao.trocasKitRelacao, novo],
        },
        configuracaoDisplay: { ...state.perfil.configuracaoDisplay, modoExibicao: 'personalizado' },
      });
    }

    case 'DELETE_TROCA_KIT_RELACAO':
      return comPerfil({
        ...state.perfil,
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          trocasKitRelacao: state.perfil.historicoManutencao.trocasKitRelacao.filter(
            (r) => r.id !== action.id,
          ),
        },
      });

    case 'ADD_ABASTECIMENTO': {
      const novo = { ...action.registro, id: crypto.randomUUID() };
      return comPerfil({
        ...state.perfil,
        moto: { ...state.perfil.moto, kmAtual: Math.max(state.perfil.moto.kmAtual, novo.km) },
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          abastecimentos: [...state.perfil.historicoManutencao.abastecimentos, novo],
        },
        configuracaoDisplay: { ...state.perfil.configuracaoDisplay, modoExibicao: 'personalizado' },
      });
    }

    case 'DELETE_ABASTECIMENTO':
      return comPerfil({
        ...state.perfil,
        historicoManutencao: {
          ...state.perfil.historicoManutencao,
          abastecimentos: state.perfil.historicoManutencao.abastecimentos.filter(
            (r) => r.id !== action.id,
          ),
        },
      });

    case 'ADD_DIA_TRABALHO': {
      const novo = { ...action.entrada, id: crypto.randomUUID() };
      return comPerfil({
        ...state.perfil,
        moto: {
          ...state.perfil.moto,
          kmAtual: Math.max(state.perfil.moto.kmAtual, novo.kmFinal),
        },
        diarioTrabalho: [...state.perfil.diarioTrabalho, novo],
        configuracaoDisplay: { ...state.perfil.configuracaoDisplay, modoExibicao: 'personalizado' },
      });
    }

    case 'DELETE_DIA_TRABALHO':
      return comPerfil({
        ...state.perfil,
        diarioTrabalho: state.perfil.diarioTrabalho.filter((d) => d.id !== action.id),
      });

    // ── FIPE ────────────────────────────────────
    case 'SET_FIPE_CACHE':
      return comPerfil({ ...state.perfil, fipeCache: action.cache });

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

// Interface definida aqui para uso interno do provider
interface IPerfilStorage {
  carregarPresets(): PresetEntry[];
  salvarPresets(presets: PresetEntry[]): void;
  getPresetAtivo(): string | null;
  setPresetAtivo(presetId: string | null): void;
}

class LocalStoragePerfilStorage implements IPerfilStorage {
  private readonly CHAVE_PRESETS = 'motocalc:v5:presets';
  private readonly CHAVE_ATIVO = 'motocalc:v5:presetAtivo';

  carregarPresets(): PresetEntry[] {
    try {
      const raw = localStorage.getItem(this.CHAVE_PRESETS);
      return raw ? (JSON.parse(raw) as PresetEntry[]) : [];
    } catch {
      return [];
    }
  }

  salvarPresets(presets: PresetEntry[]): void {
    localStorage.setItem(this.CHAVE_PRESETS, JSON.stringify(presets));
  }

  getPresetAtivo(): string | null {
    return localStorage.getItem(this.CHAVE_ATIVO);
  }

  setPresetAtivo(presetId: string | null): void {
    if (presetId) {
      localStorage.setItem(this.CHAVE_ATIVO, presetId);
    } else {
      localStorage.removeItem(this.CHAVE_ATIVO);
    }
  }
}

function criarEstadoInicial(storage: IPerfilStorage): EstadoApp {
  const presets = storage.carregarPresets();
  const ativoId = storage.getPresetAtivo();

  if (presets.length === 0 || !ativoId) {
    return estadoPadrao;
  }

  const preset = presets.find((p) => p.presetId === ativoId) ?? presets[0];
  return { perfil: preset.perfil, presets, presetAtivoId: preset.presetId };
}

export function PerfilProvider({ children, storage }: PerfilProviderProps) {
  const storageRef = useRef<IPerfilStorage>(storage ?? new LocalStoragePerfilStorage());

  const [estado, dispatch] = useReducer(perfilReducer, null, () =>
    criarEstadoInicial(storageRef.current),
  );

  // Persiste sempre que o estado muda (ignora montagem inicial)
  const primeiraMontagem = useRef(true);
  useEffect(() => {
    if (primeiraMontagem.current) {
      primeiraMontagem.current = false;
      return;
    }
    storageRef.current.salvarPresets(estado.presets);
    storageRef.current.setPresetAtivo(estado.presetAtivoId);
  }, [estado]);

  return <PerfilContext.Provider value={{ estado, dispatch }}>{children}</PerfilContext.Provider>;
}
