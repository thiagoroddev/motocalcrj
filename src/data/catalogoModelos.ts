import pop110i from '../presets/pop110i.json';

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

const LISTA: DadosModeloCatalogo[] = [
  {
    id: 'pop110i',
    marca: pop110i.marca,
    nome: pop110i.nomeCurto,
    nomeFipe: 'POP 110I',
    codigoFipe: pop110i.codigoFipe,
    tabelaFipe: pop110i.tabelaFipe as Record<string, number>,
    consumoKmL: pop110i.consumoKmL,
    consumoKmLComBau: pop110i.consumoKmLComBau,
    aceitaEtanol: false,
  },
];

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
