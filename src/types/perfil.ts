// ──────────────────────────────────────────────
// Enums / literais
// ──────────────────────────────────────────────

export const VERSAO_SCHEMA_ATUAL = 1 as const;

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
  // para valores personalizados após ADR-003 - ver ADR-006.
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

export interface FiltrosManutencaoDisplay {
  revisao: boolean;
  manutencaoPorPeca: Record<string, boolean>;
  revisaoPorServico: Record<string, boolean>;
}

export interface PecaOverride {
  id: string;
  precoEditadoOriginal: number | null;
  precoEditadaParalela: number | null;
  intervaloKmEditado: number | null;
}

export interface ServicoIndependente {
  id: string;
  nome: string;
  // Serviços km-driven exigem valor > 0. Temporais conhecidos (ex.: bateria)
  // usam 0 como marcador de "sem driver por km".
  intervalKm: number;
  // Preço cobrado por oficina independente. Para serviços NORMAIS é só a M.O.
  // (a peça é precificada à parte nos Insumos). Para serviços EXCEPCIONAIS
  // (ehExcepcional=true, ex.: retíficas) é o valor ÚNICO peças + M.O., pois a
  // retífica não é orçada separando peça de mão de obra (ADR-007).
  precoIndependente: number;
  // Preço total Honda (peça + M.O., como o orçamento da concessionária é
  // apresentado). 0 = não aplicável (ex.: serviços incluídos no pacote ou
  // serviços que Honda não executa, como retíficas). ADR-007.
  precoTotalAutorizada: number;
  // true = serviço já consta no pacote revisaoAutorizada do Preset; o cálculo
  // do modo autorizado não soma precoTotalAutorizada para esses. ADR-007.
  incluidoNaRevisaoAutorizada: boolean;
  ativo: boolean;
  ehExcepcional: boolean;
}

export interface RevisaoAutorizadaOverride {
  index: number;
  precoPecas: number;
  precoMaoDeObra: number;
  precoTotal: number; // precoPecas + precoMaoDeObra - usado pelo calculador
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
  velaIgnicao: number;
  filtroAr: number;
  sapataFreioDianteiro: number;
  sapataFreioTraseiro: number;
  bateria: number;
  kitEmbreagem: number;
  kitCilindro: number;
  retificaCabecote: number;
  retificaCompleta: number;
}

// ──────────────────────────────────────────────
// Perfil principal
// ──────────────────────────────────────────────

export interface PerfilUsuario {
  schemaVersion: typeof VERSAO_SCHEMA_ATUAL;
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
    // Parcelas restantes informadas pelo usuário na dataReferenciaParcelas.
    // O valor "de hoje" é DERIVADO (não mutado): ver calcularParcelasRestantesAtuais.
    parcelasRestantes: number | null;
    // Mês de referência (ISO) em que parcelasRestantes foi informado. Permite
    // decrementar as parcelas pelo tempo sem escrever no perfil periodicamente
    // (modelagem Snapshot - TASK-RF-6.18 / ADR-009).
    dataReferenciaParcelas: string | null;
    aluguelMensal: number | null;
    aluguelPeriodicidade: PeriodicidadeAluguel | null;
    alimentacaoDia: number;
    gastosCustom: GastoCustom[];
    responsabilidadeAluguel: ResponsabilidadeAluguel;
  };

  configuracaoDisplay: {
    categoriasAtivas: CategoriaDisplay;
    imprevistosSugeridosAtivos: Record<string, boolean>;
    filtrosManutencao: FiltrosManutencaoDisplay;
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
  | { type: 'TOGGLE_REVISAO_MANUTENCAO' }
  | { type: 'TOGGLE_MANUTENCAO_POR_PECA'; id: string }
  | { type: 'TOGGLE_REVISAO_POR_SERVICO'; id: string }

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
