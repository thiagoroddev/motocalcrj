import type { Periodo } from '../types/calculos';
import { moeda } from './formatters';

export const ROTULO_PERIODO_CURTO: Record<Periodo, string> = {
  ano: 'ano',
  mes: 'mês',
  sem: 'semana',
  dia: 'dia',
  hora: 'hora',
};

function formatarNumeroPtBr(
  valor: number,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits, maximumFractionDigits });
}

/** Formata distâncias calculadas, preservando uma casa decimal abaixo de 100 km. */
export function formatarKm(valor: number): string {
  const casasDecimais = Number.isInteger(valor) || valor >= 100 ? 0 : 1;
  return `${formatarNumeroPtBr(valor, casasDecimais, casasDecimais)} km`;
}

export function formatarKmNoPeriodo(valor: number, periodo: Periodo): string {
  return `${formatarKm(valor)}/${ROTULO_PERIODO_CURTO[periodo]}`;
}

export function formatarQuantidade(valor: number, unidade: string): string {
  const casasDecimais = Number.isInteger(valor) ? 0 : 1;
  return `${formatarNumeroPtBr(valor, casasDecimais, casasDecimais)} ${unidade}`;
}

export function formatarLitros(valor: number): string {
  return `${formatarNumeroPtBr(valor, 2, 2)} L`;
}

export function formatarPrecoLitro(valor: number): string {
  return `${moeda(valor)}/L`;
}

export function montarFormulaCombustivel(
  kmPeriodo: number,
  consumoEfetivo: number,
  precoLitro: number,
  totalPeriodo: string,
): string {
  if (consumoEfetivo <= 0) {
    return 'Informe consumo efetivo para calcular.';
  }

  return `${formatarKm(kmPeriodo)} / ${formatarNumeroPtBr(
    consumoEfetivo,
    1,
    1,
  )} km/L x ${formatarPrecoLitro(precoLitro)} = ${totalPeriodo}`;
}
