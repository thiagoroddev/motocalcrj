// ──────────────────────────────────────────────
// Enums / literais
// ──────────────────────────────────────────────

export const VERSAO_SCHEMA_ATUAL = 3 as const;

export type ModoRevisao = 'autorizadas' | 'independentes';
export type TipoCombustivel = 'comum' | 'aditivada' | 'etanol';
export type PerfilPecas = 'original' | 'paralela';
export type SituacaoMoto = 'quitada' | 'financiada' | 'alugada';
export type PeriodicidadeSeguro = 'anual' | 'mensal';
export type PeriodicidadeAluguel = 'mensal' | 'semanal';
export type ResponsabilidadeCusto = 'eu' | 'locador' | 'dividido';
export type StatusPrecoAutorizada = 'informado' | 'nao_informado' | 'informado_usuario';

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
  // Presente apenas quando o usuário editou conscientemente a vida útil.
  // Ausente significa que o intervalo-base do preset continua canônico.
  intervaloKmInformadoUsuario?: boolean;
  // Preço cobrado por oficina independente. É só a M.O.; a peça é precificada
  // à parte em Insumos.
  precoIndependente: number;
  // Preço total Honda (peça + M.O., como o orçamento da concessionária é
  // apresentado). 0 = não aplicável ou serviço incluído no pacote. ADR-007.
  precoTotalAutorizada: number;
  // Status do preço total de concessionária para serviços fora do pacote fixo
  // no MVP (ADR-012 / TASK-REF-32.4). Ausente em dados legados pré-MVP.
  statusPrecoAutorizada?: StatusPrecoAutorizada;
  // O valor oficial da concessionária inclui a peça? Honda informa peça+M.O.
  // juntas (true → esconde a peça avulsa de Insumos); Yamaha informa só M.O.
  // (false → soma a peça). Ausente = true (compat Honda). Ver adendo ADR-014.
  concessionariaIncluiPeca?: boolean;
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
  discoFreioDianteiro: number;
  pastilhaFreioDianteiro: number;
  discoFreioTraseiro: number;
  pastilhaFreioTraseiro: number;
  bateria: number;
  kitEmbreagem: number;
  kitCilindro: number;
  caixaDirecao: number;
  // Campos legados preservados para carregar perfis anteriores à ADR-022.
  // Não têm UI nem participação no cálculo do MVP.
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
    kmAtual: number;
    kmUltimaRevisao: number | null;
    kmUltimaTrocas: KmUltimaTrocas;
    // Campo legado preservado para carregar perfis anteriores à ADR-022.
    // Não tem action, UI nem participação no cálculo do MVP.
    kmMotorRefeito: number | null;
  };

  perfilManutencao: {
    perfilPecasGlobal: PerfilPecas;
    modoRevisao: ModoRevisao;
    // Estimativa de M.O. opt-in (ADR-013). Ausente/false = só valor real.
    incluirEstimativaMaoDeObra?: boolean;
    // Estimativa por serviço (ADR-014, A): liga a estimativa só para serviços
    // específicos sem valor real. Efetivo = global OU este. Ausente = vazio.
    estimativaMaoDeObraPorServico?: Record<string, boolean>;
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
    aluguelValor: number | null;
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
  sufixo: string;
  criadoEm: string;
  atualizadoEm: string;
  perfil: PerfilUsuario;
}

export interface RascunhoPredefinicao {
  sufixo: string;
  presetAtivoAnteriorId: string | null;
  // Quando presente, o rascunho é um RESET de uma predefinição existente: ao
  // concluir o onboarding, o COMMIT sobrescreve esta entrada (mesmo presetId e
  // sufixo) em vez de criar uma nova. Ausente = criação de predefinição nova.
  presetIdEmReset?: string;
}

// ──────────────────────────────────────────────
// Actions do reducer
// ──────────────────────────────────────────────

export type PerfilAction =
  // Onboarding
  | { type: 'INICIAR_NOVA_PREDEFINICAO'; modeloId: string; sufixo: string }
  | { type: 'CANCELAR_NOVA_PREDEFINICAO' }
  | { type: 'SET_ONBOARDING_CAMPO'; campo: string; valor: unknown }
  | { type: 'COMMIT_ONBOARDING' }

  // Rodagem inline
  | { type: 'SET_KM_POR_DIA'; valor: number }
  | { type: 'SET_DIAS_POR_SEMANA'; valor: number }
  | { type: 'SET_KM_ATUAL'; valor: number }

  // Display
  | { type: 'TOGGLE_CATEGORIA'; categoria: keyof CategoriaDisplay }
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
  | { type: 'SET_FIPE_CACHE'; cache: FipeCache | null }

  // Histórico de manutenção
  | { type: 'SET_KM_ULTIMA_TROCA'; componente: keyof KmUltimaTrocas; km: number }

  // Ajustes de predefinição
  | { type: 'SET_ANO_MOTO'; ano: number }
  | { type: 'SET_KM_ULTIMA_REVISAO'; km: number | null }
  | { type: 'SET_MODO_REVISAO'; modo: ModoRevisao }
  | { type: 'SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA'; valor: boolean }
  | { type: 'TOGGLE_ESTIMATIVA_MAO_DE_OBRA_SERVICO'; id: string }
  | { type: 'SET_SITUACAO_MOTO'; situacao: SituacaoMoto }
  | { type: 'SET_PARCELA'; parcelaMensal: number | null; parcelasRestantes: number | null }
  | {
      type: 'SET_ALUGUEL';
      aluguelValor: number | null;
      aluguelPeriodicidade: PeriodicidadeAluguel | null;
    }
  | { type: 'SET_RESPONSABILIDADE_ALUGUEL'; config: Partial<ResponsabilidadeAluguel> }
  | { type: 'RESETAR_AJUSTES_PADRAO' }

  // Presets
  | { type: 'CARREGAR_PERFIL'; presetId: string }
  | { type: 'RENOMEAR_PREDEFINICAO'; presetId: string; sufixo: string }
  | { type: 'DELETAR_PREDEFINICAO'; presetId: string }
  | { type: 'RESETAR_PREDEFINICAO_ATIVA' }
  | { type: 'IMPORTAR_PERFIL'; perfil: PerfilUsuario };
