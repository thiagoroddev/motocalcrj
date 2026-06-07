import { LISTA_PRESETS } from './repositorioPresets';

export interface DadosModeloCatalogo {
  id: string;
  marca: string;
  nome: string;
  nomeFipe: string;
  codigoFipe: string;
  tabelaFipe: Record<string, number>;
  consumoKmL: number;
  aceitaEtanol: boolean;
}

const LISTA: DadosModeloCatalogo[] = LISTA_PRESETS.map(({ id, preset }) => ({
  id,
  marca: preset.marca,
  nome: preset.nomeCurto,
  nomeFipe: preset.nomeFipe,
  codigoFipe: preset.codigoFipe,
  tabelaFipe: preset.tabelaFipe,
  consumoKmL: preset.consumoKmL,
  aceitaEtanol: preset.aceitaEtanol,
})).sort((a, b) => a.marca.localeCompare(b.marca) || a.nome.localeCompare(b.nome));

export const CATALOGO: Record<string, DadosModeloCatalogo> = Object.fromEntries(
  LISTA.map((m) => [m.id, m]),
);

export function getMarcasDisponiveis(): string[] {
  return [...new Set(LISTA.map((m) => m.marca))];
}

export function getModelosPorMarca(marca: string): DadosModeloCatalogo[] {
  return LISTA.filter((m) => m.marca === marca);
}

export function getNomeModelo(modeloId: string): string {
  return CATALOGO[modeloId]?.nome ?? modeloId;
}

// Consumo é característica do MODELO (manual/INMETRO/relato), não varia por ano.
export function obterConsumoKmL(modeloId: string): number | undefined {
  return CATALOGO[modeloId]?.consumoKmL;
}

// Anos suportados de um modelo = anos que a tabela FIPE conhece (a FIPE precifica
// cada ano-modelo). Auto-mantida pelo script de atualização FIPE. Ordenados desc.
export function obterAnosModelo(modeloId: string): number[] {
  return Object.keys(CATALOGO[modeloId]?.tabelaFipe ?? {})
    .map(Number)
    .sort((a, b) => b - a);
}
