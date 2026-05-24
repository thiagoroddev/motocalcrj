// ──────────────────────────────────────────────
// Enums / literais
// ──────────────────────────────────────────────

export type PerfilUso = 'entrega' | 'passageiro';
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
  valorAnual: number;
  empresa: string | null;
  periodicidade: PeriodicidadeSeguro;
}

export interface GastoCustom {
  id: string;
  nome: string;
  // Valor único acumulado no ano (não recorrência mensal). Padrão do app
  // para valores personalizados após ADR-003 — ver ADR-006.
  valorAnual: number;
  ativo: boolean;
  // Presets fixos (Multa, Sinistros, Outros) não podem ser deletados.
  ehPreset: boolean;
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
  imprevistos: boolean;
};

export interface PecaOverride {
  id: string;
  precoEditadoOriginal: number | null;
  precoEditadaParalela: number | null;
  intervaloKmEditado: number | null;
}

export interface ServicoIndependente {
  id: string;
  nome: string;
  intervalKm: number;
  // Em serviços excepcionais, este campo representa o preço total do serviço
  // (peças + mão de obra). Nome mantido por compatibilidade de schema.
  precoMaoDeObra: number;
  ativo: boolean;
  ehExcepcional: boolean;
}

export interface RevisaoAutorizadaOverride {
  index: number;
  precoPecas: number;
  precoMaoDeObra: number;
  precoTotal: number; // precoPecas + precoMaoDeObra — usado pelo calculador
}

export interface FipeCache {
  valor: number;
  dataConsulta: string;
  codigoFipe: string;
  anoModelo: number;
  marca: string;
  modelo: string;
}

export interface KmUltimaTrocas {
  oleo: number;
  pneuDianteiro: number;
  pneuTraseiro: number;
  kitRelacao: number;
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
    kmUltimaTrocas: KmUltimaTrocas;
    kmMotorRefeito: number | null;
  };

  perfilManutencao: {
    perfilPecasGlobal: PerfilPecas;
    modoRevisao: ModoRevisao;
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
    categoriasAtivas: CategoriaDisplay;
    imprevistosSugeridosAtivos: Record<string, boolean>;
  };

  pecasOverrides: PecaOverride[];
  servicosIndependentes: ServicoIndependente[];
  revisaoAutorizadaOverrides: RevisaoAutorizadaOverride[];

  fipeCache: FipeCache | null;
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
  | { type: 'TOGGLE_CATEGORIA'; categoria: keyof CategoriaDisplay }
  | { type: 'TOGGLE_IMPREVISTO_SUGERIDO'; id: string }

  // Overrides de peças
  | {
      type: 'SET_PECA_OVERRIDE';
      id: string;
      campo: 'precoOriginal' | 'precoParalela' | 'intervaloKm';
      valor: number;
    }
  | {
      type: 'RESET_PECA_OVERRIDE';
      id: string;
      campo?: 'precoOriginal' | 'precoParalela' | 'intervaloKm';
    }

  // Mão de obra
  | { type: 'SET_SERVICO_INDEPENDENTE'; payload: ServicoIndependente }
  | { type: 'RESET_SERVICOS_INDEPENDENTES' }
  | {
      type: 'SET_REVISAO_AUTORIZADA_OVERRIDE';
      index: number;
      precoPecas: number;
      precoMaoDeObra: number;
    }
  | { type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE'; index: number }

  // Financeiro
  | { type: 'SET_INTERNET'; valor: number }
  | { type: 'SET_SEGURO'; config: Partial<SeguroConfig> }
  | { type: 'SET_ALIMENTACAO'; valorDia: number }
  | { type: 'SET_COMBUSTIVEL'; tipo: TipoCombustivel; campo: 'preco' | 'autonomia'; valor: number }
  | { type: 'SET_TIPO_COMBUSTIVEL_PREFERIDO'; tipo: TipoCombustivel }
  | { type: 'TOGGLE_GASTO_CUSTOM'; id: string }
  | { type: 'SET_GASTO_CUSTOM_VALOR'; id: string; valorAnual: number }

  // FIPE
  | { type: 'SET_FIPE_CACHE'; cache: FipeCache }

  // Histórico de manutenção
  | { type: 'SET_KM_ULTIMA_TROCA'; componente: keyof KmUltimaTrocas; km: number }
  | { type: 'SET_MOTOR_REFEITO'; km: number | null }
  | {
      type: 'MARCAR_TROCAS_REVISAO';
      componentesMarcados: (keyof KmUltimaTrocas)[];
      kmRevisao: number;
    }

  // Ajustes de predefinição
  | { type: 'SET_ANO_MOTO'; ano: number }
  | { type: 'SET_KM_ULTIMA_REVISAO'; km: number | null }
  | { type: 'SET_PERFIL_USO'; perfilUso: PerfilUso }
  | { type: 'SET_MODO_REVISAO'; modo: ModoRevisao }
  | { type: 'SET_SITUACAO_MOTO'; situacao: SituacaoMoto }
  | { type: 'SET_PARCELA'; parcelaMensal: number | null; parcelasRestantes: number | null }
  | {
      type: 'SET_ALUGUEL';
      aluguelMensal: number | null;
      aluguelPeriodicidade: PeriodicidadeAluguel | null;
    }
  | { type: 'SET_RESPONSABILIDADE_ALUGUEL'; config: Partial<ResponsabilidadeAluguel> }
  | { type: 'RESETAR_AJUSTES_PADRAO' }

  // Presets
  | { type: 'CARREGAR_PERFIL'; perfil: PerfilUsuario; presetId: string }
  | { type: 'RESETAR_PERFIL' }
  | { type: 'IMPORTAR_PERFIL'; perfil: PerfilUsuario };
