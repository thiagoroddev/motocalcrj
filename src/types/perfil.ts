// ──────────────────────────────────────────────
// Enums / literais
// ──────────────────────────────────────────────

export type PerfilUso = 'entrega' | 'passageiro';
export type ModoExibicao = 'predefinidos' | 'personalizado';
export type ModoRevisao = 'autorizadas' | 'independentes';
export type TipoCombustivel = 'comum' | 'aditivada' | 'etanol';
export type PerfilPecas = 'original' | 'paralela';
export type SituacaoMoto = 'quitada' | 'financiada' | 'alugada';
export type PeriodicidadeSeguro = 'anual' | 'mensal';
export type PeriodicidadeAluguel = 'mensal' | 'semanal';
export type ResponsabilidadeCusto = 'eu' | 'locador' | 'dividido';

// ──────────────────────────────────────────────
// Interfaces auxiliares
// ──────────────────────────────────────────────

export interface ConfiguracaoCombustivel {
  preco: number;
  autonomia: number;
}

export interface SeguroConfig {
  tem: boolean;
  valorAnual: number;
  empresa: string | null;
  periodicidade: PeriodicidadeSeguro;
}

export interface GastoCustom {
  id: string;
  nome: string;
  valorMensal: number;
  ativo: boolean;
}

export interface ResponsabilidadeAluguel {
  documentos: ResponsabilidadeCusto;
  manutencao: ResponsabilidadeCusto;
  seguro: ResponsabilidadeCusto;
}

export type CategoriaDisplay = {
  combustivel: boolean;
  alimentacao: boolean;
  manutencao: boolean;
  documentacao: boolean;
  internet: boolean;
  seguro: boolean;
  financiamento: boolean;
};

export interface PecaOverride {
  id: string;
  precoEditado: number | null;
  intervaloKmEditado: number | null;
  perfilPecasOverride: PerfilPecas | null;
}

export interface ServicoIndependente {
  id: string;
  nome: string;
  intervalKm: number;
  precoMaoDeObra: number;
  ativo: boolean;
  ehExcepcional: boolean;
}

export interface RevisaoAutorizadaOverride {
  index: number;
  precoTotal: number;
}

export interface FipeCache {
  valor: number;
  dataConsulta: string;
  codigoFipe: string;
  anoModelo: number;
  marca: string;
  modelo: string;
}

// ──────────────────────────────────────────────
// Registros / histórico
// ──────────────────────────────────────────────

export interface TrocaOleo {
  id: string;
  data: string;
  km: number;
  valorTotal: number;
  tipoOleo: string;
  marca: string;
}

export interface RevisaoGeral {
  id: string;
  data: string;
  km: number;
  local: 'autorizada' | 'independente';
  qualRevisao: string;
  status: 'concluido' | 'pendente';
  itensTrocados: string[];
  valorMaoDeObra: number;
  valorPecas: number;
  valorTotal: number;
}

export interface TrocaPneu {
  id: string;
  data: string;
  km: number;
  posicao: 'dianteiro' | 'traseiro';
  marca: string;
  valorTotal: number;
}

export interface TrocaKitRelacao {
  id: string;
  data: string;
  km: number;
  marca: string;
  valorPecas: number;
  valorMaoDeObra: number;
  valorTotal: number;
}

export interface Abastecimento {
  id: string;
  data: string;
  tipo: TipoCombustivel;
  posto: string;
  km: number;
  litros: number;
  precoLitro: number;
  valorTotal: number;
}

export interface DiarioEntry {
  id: string;
  data: string;
  kmInicial: number;
  kmFinal: number;
  kmPercorridos: number;
  comeu: boolean;
  abasteceu: boolean;
  litros: number | null;
  precoLitro: number | null;
}

export interface HistoricoManutencao {
  trocasOleo: TrocaOleo[];
  revisoes: RevisaoGeral[];
  trocasPneu: TrocaPneu[];
  trocasKitRelacao: TrocaKitRelacao[];
  abastecimentos: Abastecimento[];
}

// ──────────────────────────────────────────────
// Perfil principal
// ──────────────────────────────────────────────

export interface PerfilUsuario {
  schemaVersion: number;
  userId: string | null;
  onboardingConcluido: boolean;
  apelido: string | null;
  aplicativos: string[];

  moto: {
    marca: string;
    modelo: string;
    ano: number;
    perfilUso: PerfilUso;
    kmAtual: number;
    kmUltimaRevisao: number | null;
  };

  perfilManutencao: {
    perfilPecasGlobal: PerfilPecas;
    modoRevisao: ModoRevisao;
    precoMaoDeObraIndependente: number;
    frequenciaRevisaoKm: number;
  };

  trabalho: {
    kmPorDia: number;
    diasPorSemana: number;
    horasPorDia: number;
  };

  financeiro: {
    tipoGasolinaPreferida: TipoCombustivel;
    combustiveis: Record<TipoCombustivel, ConfiguracaoCombustivel>;
    internet: number;
    seguro: SeguroConfig;
    situacaoMoto: SituacaoMoto;
    parcelaMensal: number | null;
    parcelasRestantes: number | null;
    aluguelMensal: number | null;
    aluguelPeriodicidade: PeriodicidadeAluguel | null;
    alimentacaoDia: number;
    gastosCustom: GastoCustom[];
    responsabilidadeAluguel: ResponsabilidadeAluguel;
  };

  configuracaoDisplay: {
    modoExibicao: ModoExibicao;
    modoOficinDisplay: ModoRevisao;
    categoriasAtivas: CategoriaDisplay;
  };

  pecasOverrides: PecaOverride[];
  servicosIndependentes: ServicoIndependente[];
  revisaoAutorizadaOverrides: RevisaoAutorizadaOverride[];

  fipeCache: FipeCache | null;

  historicoManutencao: HistoricoManutencao;
  diarioTrabalho: DiarioEntry[];
}

// ──────────────────────────────────────────────
// Preset (envelope do localStorage)
// ──────────────────────────────────────────────

export interface PresetEntry {
  presetId: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
  perfil: PerfilUsuario;
}

// ──────────────────────────────────────────────
// Actions do reducer
// ──────────────────────────────────────────────

export type PerfilAction =
  // Onboarding
  | { type: 'SET_ONBOARDING_CAMPO'; campo: string; valor: unknown }
  | { type: 'COMMIT_ONBOARDING' }

  // Rodagem inline
  | { type: 'SET_KM_POR_DIA'; valor: number }
  | { type: 'SET_DIAS_POR_SEMANA'; valor: number }
  | { type: 'SET_KM_ATUAL'; valor: number }

  // Display
  | { type: 'SET_MODO_EXIBICAO'; modo: ModoExibicao }
  | { type: 'SET_MODO_OFICINA'; modo: ModoRevisao }
  | { type: 'TOGGLE_CATEGORIA'; categoria: keyof CategoriaDisplay }

  // Overrides de peças
  | {
      type: 'SET_PECA_OVERRIDE';
      id: string;
      campo: 'preco' | 'intervaloKm' | 'perfilPecas';
      valor: number | PerfilPecas;
    }
  | { type: 'RESET_PECA_OVERRIDE'; id: string; campo?: 'preco' | 'intervaloKm' | 'perfilPecas' }

  // Mão de obra
  | { type: 'SET_SERVICO_INDEPENDENTE'; payload: ServicoIndependente }
  | { type: 'TOGGLE_SERVICO_INDEPENDENTE'; payload: { id: string } }
  | { type: 'RESET_SERVICOS_INDEPENDENTES' }
  | { type: 'SET_REVISAO_AUTORIZADA_OVERRIDE'; index: number; precoTotal: number }
  | { type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE'; index: number }

  // Financeiro
  | { type: 'SET_INTERNET'; valor: number }
  | { type: 'SET_SEGURO'; config: Partial<SeguroConfig> }
  | { type: 'SET_ALIMENTACAO'; valorDia: number }
  | { type: 'SET_COMBUSTIVEL'; tipo: TipoCombustivel; campo: 'preco' | 'autonomia'; valor: number }
  | { type: 'SET_TIPO_COMBUSTIVEL_PREFERIDO'; tipo: TipoCombustivel }
  | { type: 'ADD_GASTO_CUSTOM'; gasto: Omit<GastoCustom, 'id'> }
  | { type: 'TOGGLE_GASTO_CUSTOM'; id: string }
  | { type: 'DELETE_GASTO_CUSTOM'; id: string }

  // Registros
  | { type: 'ADD_TROCA_OLEO'; registro: Omit<TrocaOleo, 'id'> }
  | { type: 'DELETE_TROCA_OLEO'; id: string }
  | { type: 'ADD_REVISAO'; registro: Omit<RevisaoGeral, 'id'> }
  | { type: 'DELETE_REVISAO'; id: string }
  | { type: 'ADD_TROCA_PNEU'; registro: Omit<TrocaPneu, 'id'> }
  | { type: 'DELETE_TROCA_PNEU'; id: string }
  | { type: 'ADD_TROCA_KIT_RELACAO'; registro: Omit<TrocaKitRelacao, 'id'> }
  | { type: 'DELETE_TROCA_KIT_RELACAO'; id: string }
  | { type: 'ADD_ABASTECIMENTO'; registro: Omit<Abastecimento, 'id'> }
  | { type: 'DELETE_ABASTECIMENTO'; id: string }
  | { type: 'ADD_DIA_TRABALHO'; entrada: Omit<DiarioEntry, 'id'> }
  | { type: 'DELETE_DIA_TRABALHO'; id: string }

  // FIPE
  | { type: 'SET_FIPE_CACHE'; cache: FipeCache }

  // Presets
  | { type: 'CARREGAR_PERFIL'; perfil: PerfilUsuario; presetId: string }
  | { type: 'RESETAR_PERFIL' }
  | { type: 'IMPORTAR_PERFIL'; perfil: PerfilUsuario };
