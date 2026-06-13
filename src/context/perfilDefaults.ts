import type {
  PerfilUsuario,
  ServicoIndependente,
  GastoCustom,
  FiltrosManutencaoDisplay,
  KmUltimaTrocas,
} from '../types/perfil';
import { VERSAO_SCHEMA_ATUAL } from '../types/perfil';

// ──────────────────────────────────────────────
// Defaults do perfil (extraídos de PerfilContext pela TASK-REF-28).
//
// Módulo-folha: depende só de `types/perfil`. O contexto, schema e serviços
// leem os defaults daqui sem criar ciclos de import.
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// Defaults de serviços independentes (campo RJ)
// ──────────────────────────────────────────────

// Retíficas não existem no modo autorizado - Honda substitui por troca de kit
// cilindro (ver TASK-RF-6.14). precoTotalAutorizada=0 garante que esses
// serviços não apareçam na seção autorizada nem nos imprevistos (ADR-007).
export const SERVICO_RETIFICA_CABECOTE_PADRAO: ServicoIndependente = {
  id: 'retifica-cabecote',
  nome: 'Retífica de cabeçote',
  intervalKm: 80000,
  precoIndependente: 800,
  precoTotalAutorizada: 0,
  statusPrecoAutorizada: 'nao_informado',
  incluidoNaRevisaoAutorizada: false,
  ativo: false,
  ehExcepcional: true,
};

export const SERVICO_RETIFICA_COMPLETA_PADRAO: ServicoIndependente = {
  id: 'retifica-completa',
  nome: 'Retífica completa',
  intervalKm: 120000,
  precoIndependente: 1500,
  precoTotalAutorizada: 0,
  statusPrecoAutorizada: 'nao_informado',
  incluidoNaRevisaoAutorizada: false,
  ativo: false,
  ehExcepcional: true,
};

// Presets fixos da seção Imprevistos. Lista fechada - usuário não adiciona
// nem remove, apenas edita o valorAnual e o toggle (ver ADR-006).
export const PRESETS_GASTOS_PADRAO: GastoCustom[] = [
  { id: 'preset-multa', nome: 'Multa', valorAnual: 0, ativo: false, ehPreset: true },
  { id: 'preset-sinistro', nome: 'Sinistros', valorAnual: 0, ativo: false, ehPreset: true },
  { id: 'preset-outros', nome: 'Outros', valorAnual: 0, ativo: false, ehPreset: true },
];

export const FILTROS_MANUTENCAO_PADRAO: FiltrosManutencaoDisplay = {
  revisao: true,
  manutencaoPorPeca: {},
  revisaoPorServico: {},
};

export const KM_ULTIMA_TROCAS_PADRAO: KmUltimaTrocas = {
  oleo: 0,
  pneuDianteiro: 0,
  pneuTraseiro: 0,
  kitRelacao: 0,
  velaIgnicao: 0,
  filtroAr: 0,
  sapataFreioDianteiro: 0,
  sapataFreioTraseiro: 0,
  discoFreioDianteiro: 0,
  pastilhaFreioDianteiro: 0,
  discoFreioTraseiro: 0,
  pastilhaFreioTraseiro: 0,
  bateria: 0,
  kitEmbreagem: 0,
  kitCilindro: 0,
  caixaDirecao: 0,
  retificaCabecote: 0,
  retificaCompleta: 0,
};

// No MVP (ADR-012), serviços avulsos de concessionária sem fonte documentada
// não entram como estimativa: ficam `nao_informado` até o usuário preencher.
// Itens incluídos no pacote fixo seguem com preço 0 porque já vêm na revisão.
export const SERVICOS_INDEPENDENTES_PADRAO: ServicoIndependente[] = [
  {
    id: 'troca-oleo',
    nome: 'Troca de óleo',
    intervalKm: 3000,
    precoIndependente: 25,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'informado',
    incluidoNaRevisaoAutorizada: true,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-kit-transmissao',
    nome: 'Troca kit transmissão',
    intervalKm: 12000,
    precoIndependente: 60,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-pneu-dianteiro',
    nome: 'Troca pneu dianteiro',
    intervalKm: 25000,
    precoIndependente: 30,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-pneu-traseiro',
    nome: 'Troca pneu traseiro',
    intervalKm: 15000,
    precoIndependente: 30,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-sapata-dianteira',
    nome: 'Troca sapata de freio dianteira',
    intervalKm: 20000,
    precoIndependente: 40,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-sapata-traseira',
    nome: 'Troca sapata de freio traseira',
    intervalKm: 20000,
    precoIndependente: 40,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'revisao-geral',
    nome: 'Revisão geral (independente)',
    intervalKm: 6000,
    precoIndependente: 400,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'informado',
    incluidoNaRevisaoAutorizada: true,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-vela',
    nome: 'Troca de vela',
    intervalKm: 6000,
    precoIndependente: 15,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'informado',
    incluidoNaRevisaoAutorizada: true,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-filtro-ar',
    nome: 'Troca filtro de ar',
    intervalKm: 6000,
    precoIndependente: 15,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'informado',
    incluidoNaRevisaoAutorizada: true,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-bateria',
    nome: 'Troca de bateria',
    // Driver temporal - não há intervalo em km. Bateria envelhece por tempo.
    intervalKm: 0,
    precoIndependente: 50,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-kit-embreagem',
    nome: 'Troca kit embreagem',
    intervalKm: 40000,
    precoIndependente: 50,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    id: 'troca-kit-cilindro',
    nome: 'Troca kit cilindro',
    intervalKm: 100000,
    precoIndependente: 50,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
    ativo: true,
    ehExcepcional: false,
  },
  {
    // Serviço extra incompleto (TASK-RF-6.37): a concessionária executa, mas não
    // publica o preço → nasce nao_informado (só M.O., estimada opcionalmente).
    id: 'troca-caixa-direcao',
    nome: 'Troca do kit caixa de direção',
    intervalKm: 40000,
    precoIndependente: 80,
    precoTotalAutorizada: 0,
    statusPrecoAutorizada: 'nao_informado',
    incluidoNaRevisaoAutorizada: false,
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
  schemaVersion: VERSAO_SCHEMA_ATUAL,
  userId: null,
  onboardingConcluido: false,
  apelido: null,
  aplicativos: [],

  moto: {
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    kmAtual: 0,
    kmUltimaRevisao: null,
    kmUltimaTrocas: KM_ULTIMA_TROCAS_PADRAO,
    kmMotorRefeito: null,
  },

  perfilManutencao: {
    perfilPecasGlobal: 'original',
    modoRevisao: 'autorizadas',
    incluirEstimativaMaoDeObra: false,
  },

  trabalho: {
    kmPorDia: 70,
    diasPorSemana: 5,
    horasPorDia: 8,
  },

  financeiro: {
    tipoGasolinaPreferida: 'comum',
    // Fallback válido antes de existir modelo selecionado. O commit do onboarding
    // substitui as autonomias pela referência profissional do preset escolhido.
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
    dataReferenciaParcelas: null,
    aluguelValor: null,
    aluguelPeriodicidade: null,
    alimentacaoDia: 0,
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
      alimentacao: false,
      manutencao: true,
      documentacao: true,
      internet: false,
      seguro: false,
      financiamento: false,
      imprevistos: true,
    },
    imprevistosSugeridosAtivos: {},
    filtrosManutencao: FILTROS_MANUTENCAO_PADRAO,
  },

  pecasOverrides: [],
  servicosIndependentes: SERVICOS_INDEPENDENTES_PADRAO,
  revisaoAutorizadaOverrides: [],

  fipeCache: null,
};
