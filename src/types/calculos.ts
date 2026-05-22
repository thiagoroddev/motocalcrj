import type { ModoExibicao, ModoRevisao } from './perfil';

// ──────────────────────────────────────────────
// Tipos do preset (pop110i.json e futuros)
// ──────────────────────────────────────────────

export interface PecaPreset {
  id: string;
  nome: string;
  intervaloKm: number;
  intervaloKmEntrega: number;
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

export interface RevisaoAutorizadaPreset {
  intervaloKm: number;
  intervaloMeses: number;
  precoPecas: number;
  precoMaoDeObra: number;
  precoTotal: number; // precoPecas + precoMaoDeObra
}

export interface PresetMoto {
  consumoKmL: number;
  consumoKmLComBau: number;
  pecas: PecaPreset[];
  pneus: PneuPreset[];
  revisaoAutorizada: RevisaoAutorizadaPreset[];
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
}

// ──────────────────────────────────────────────
// Registro genérico de manutenção
// Adaptado dos tipos específicos de HistoricoManutencao
// ──────────────────────────────────────────────

export interface RegistroManutencao {
  pecaId: string;
  kmNaTroca: number;
  kmDesdeAnterior: number;
  preco: number;
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
  preco: number;
  fonte: 'preset' | 'registro';
  proximaTrocaKm: number;
  // Trocas projetadas para os próximos 12 meses. Com km da última troca
  // informado, é a contagem cíclica ancorada nele; senão, valor amortizado
  // (kmAnual / intervalo). Ver ADR-006 / RF-6.7.
  trocasNoAno: number;
}

export interface CustosPorCategoria {
  documentos: {
    total: number;
    detalhes: { ipva: number; licenciamento: number };
  };
  revisao: {
    total: number;
    detalhes: { modo: ModoRevisao };
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
  gastosCustom: { total: number; ativo: boolean };
}

export interface FiltrosCategorias {
  documentos: boolean;
  revisao: boolean;
  manutencao: boolean;
  manutencaoPorPeca: Record<string, boolean>;
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
  modoAtivo: ModoExibicao;
}
