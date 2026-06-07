import type { ModoRevisao, ServicoIndependente, StatusPrecoAutorizada } from './perfil';

// ──────────────────────────────────────────────
// Tipos do preset (pop110i.json e futuros)
// ──────────────────────────────────────────────

export interface PecaPreset {
  id: string;
  nome: string;
  // Peças com driver temporal (ex.: bateria) omitem `intervaloKm` e usam
  // apenas `intervaloMeses`. Sem nenhum dos dois, a peça é ignorada no cálculo.
  intervaloKm?: number;
  intervaloMeses?: number;
  precoOriginal: number;
  precoParalela: number;
  // true = peça trocada nas revisões periódicas Honda. No modo de revisão
  // autorizado não entra no cálculo por peça, para evitar dupla contagem
  // (o custo já está no pacote de revisaoAutorizada). Ver ADR-006.
  incluidoNaRevisaoAutorizada: boolean;
}

export interface PneuPreset {
  id: string;
  posicao: 'dianteiro' | 'traseiro';
  vidaUtilKm: number;
  precoOriginal: number;
  precoParalela: number;
}

export interface ServicosExecutadosRevisaoPreset {
  categoria: string;
  servicos: string[];
}

export interface RevisaoAutorizadaPreset {
  intervaloKm: number;
  intervaloMeses: number;
  precoPecas: number;
  precoMaoDeObra: number;
  precoTotal: number; // precoPecas + precoMaoDeObra
  itensSubstituidos: string[];
  servicosExecutados: ServicosExecutadosRevisaoPreset[];
}

export interface PresetMoto {
  // Metadados de catálogo ficam opcionais aqui para permitir mocks pequenos nos
  // testes de cálculo. O repositório de presets exige esses campos no JSON real.
  marca?: string;
  modelo?: string;
  nomeCurto?: string;
  nomeFipe?: string;
  codigoFipe?: string;
  tabelaFipe?: Record<string, number>;
  aceitaEtanol?: boolean;
  consumoKmLPorAno: Record<string, number>;
  pecas: PecaPreset[];
  pneus: PneuPreset[];
  revisaoAutorizada: RevisaoAutorizadaPreset[];
  // Lista de serviços de manutenção aplicáveis ao modelo. No MVP, controla
  // quais avulsos de concessionária aparecem e podem gerar pendência de preço.
  servicosManutencao?: ServicoIndependente[];
  // Fator multiplicador da mão de obra estimada do modelo (proxy de cilindrada).
  // Ver ADR-013 / docs/arquitetura/estimativa-mao-de-obra.md. Default 1.0.
  fatorMaoDeObra?: number;
}

export interface PresetMotoCatalogo extends PresetMoto {
  marca: string;
  modelo: string;
  nomeCurto: string;
  nomeFipe: string;
  codigoFipe: string;
  tabelaFipe: Record<string, number>;
  aceitaEtanol: boolean;
}

// ──────────────────────────────────────────────
// Dados estáticos do estado
// ──────────────────────────────────────────────

export interface DadosRJ {
  ipva: {
    aliquotaMotos: number;
    isencaoIdadeMinimaMeses: number;
  };
  licenciamento: {
    tabela: Record<string, number>;
  };
  autonomiaEtanolFatorReducao: number;
}

// ──────────────────────────────────────────────
// Saídas dos cálculos
// ──────────────────────────────────────────────

export interface GranularidadesCusto {
  anual: number;
  mensal: number;
  semanal: number;
  diario: number;
  porKm: number;
}

export interface CustoPeca {
  pecaId: string;
  label: string;
  cpk: number;
  custoAnual: number;
  intervaloKm: number;
  intervaloMeses?: number;
  preco: number;
  fonte: 'preset' | 'registro';
  proximaTrocaKm: number;
  modo: 'amortizado' | 'ancorado';
  kmUltimaTroca: number;
  kmDasProximasTrocas: number[];
  // Trocas projetadas para os próximos 12 meses. Com km da última troca
  // informado, é a contagem cíclica ancorada nele; senão, valor amortizado
  // (kmAnual / intervalo). Ver ADR-006 / RF-6.7.
  trocasNoAno: number;
}

export interface CustoServicoRevisao {
  servicoId: string;
  label: string;
  custoAnual: number;
  intervalKm: number;
  precoMaoDeObra: number;
  precoServico: number;
  statusPrecoAutorizada: StatusPrecoAutorizada;
  // true = M.O. veio da estimativa opt-in (ADR-013), não de valor real.
  maoDeObraEstimada?: boolean;
  eventosNoAno: number;
  ehExcepcional: boolean;
  modo: 'amortizado' | 'ancorado';
  kmUltimaTroca: number;
  kmDasProximasTrocas: number[];
}

export interface PendenciaMaoDeObraConcessionaria {
  servicoId: string;
  label: string;
  intervalKm: number;
  statusPrecoAutorizada: 'nao_informado';
}

export interface CustoImprevistoSugerido {
  id: string;
  label: string;
  custoAnual: number;
  intervalKm: number;
  precoServico: number;
  eventosNoAno: number;
  // true = M.O. veio da estimativa opt-in (ADR-013), não de valor real.
  maoDeObraEstimada?: boolean;
}

export interface CustosPorCategoria {
  documentos: {
    total: number;
    detalhes: { ipva: number; licenciamento: number };
  };
  revisao: {
    total: number;
    detalhes: {
      modo: ModoRevisao;
      base: number;
      eventosNoAno: number;
      servicos: Map<string, CustoServicoRevisao>;
      custoIncompleto: boolean;
      pendenciasMaoDeObra: PendenciaMaoDeObraConcessionaria[];
    };
  };
  manutencao: {
    total: number;
    detalhes: Map<string, CustoPeca>;
  };
  combustivel: {
    total: number;
    detalhes: { cpk: number; kmAnual: number; consumoEfetivo: number };
  };
  internet: { total: number; ativo: boolean };
  seguro: { total: number; ativo: boolean };
  alimentacao: { total: number; ativo: boolean };
  financiamento: { total: number; ativo: boolean };
  gastosCustom: {
    total: number;
    ativo: boolean;
    detalhes: {
      sugeridos: Map<string, CustoImprevistoSugerido>;
    };
  };
}

export interface FiltrosCategorias {
  documentos: boolean;
  revisao: boolean;
  manutencao: boolean;
  manutencaoPorPeca: Record<string, boolean>;
  revisaoPorServico: Record<string, boolean>;
  imprevistosSugeridos: Record<string, boolean>;
  combustivel: boolean;
  internet: boolean;
  seguro: boolean;
  alimentacao: boolean;
  financiamento: boolean;
  gastosCustom: boolean;
}

export const filtrosPadrao: FiltrosCategorias = {
  documentos: true,
  revisao: true,
  manutencao: true,
  manutencaoPorPeca: {},
  revisaoPorServico: {},
  imprevistosSugeridos: {},
  combustivel: true,
  internet: true,
  seguro: true,
  alimentacao: true,
  financiamento: true,
  gastosCustom: true,
};

export interface ResultadoCalculo {
  custos: CustosPorCategoria;
  granularidades: GranularidadesCusto;
  granularidadesMoto: GranularidadesCusto;
  kmAnual: number;
  diasAno: number;
}

// Janela de tempo usada para ratear custos anuais (seletor de período).
export type Periodo = 'ano' | 'mes' | 'sem' | 'dia' | 'hora';
