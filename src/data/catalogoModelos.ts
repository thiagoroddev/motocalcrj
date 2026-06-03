import { LISTA_PRESETS } from './repositorioPresets';

export interface DadosModeloCatalogo {
  id: string;
  marca: string;
  nome: string;
  nomeFipe: string;
  codigoFipe: string;
  tabelaFipe: Record<string, number>;
  consumoKmL: number;
  consumoKmLComBau: number;
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
  consumoKmLComBau: preset.consumoKmLComBau,
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
