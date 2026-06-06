export function moeda(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Formata leituras de odômetro e intervalos, exibidos em quilômetros inteiros. */
export function kmFormatado(v: number): string {
  return Math.round(v).toLocaleString('pt-BR') + ' km';
}

export function cpkFormatado(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/km`;
}
