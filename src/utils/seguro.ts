import type { PeriodicidadeSeguro } from '../types/perfil';

export function valorSeguroNoPeriodo(
  valorAnual: number,
  periodicidade: PeriodicidadeSeguro,
): number {
  return periodicidade === 'mensal' ? valorAnual / 12 : valorAnual;
}

export function valorSeguroAnualizado(
  valorInformado: number,
  periodicidade: PeriodicidadeSeguro,
): number {
  return periodicidade === 'mensal' ? valorInformado * 12 : valorInformado;
}

export function formatarValorSeguroParaInput(
  valorAnual: number,
  periodicidade: PeriodicidadeSeguro,
): string {
  const valorNoPeriodo = valorSeguroNoPeriodo(valorAnual, periodicidade);
  return Number.isFinite(valorNoPeriodo) ? valorNoPeriodo.toFixed(2) : '';
}

export function rotuloValorSeguro(periodicidade: PeriodicidadeSeguro): string {
  return periodicidade === 'mensal' ? 'Valor mensal (R$)' : 'Valor anual (R$)';
}

export function sufixoValorSeguro(periodicidade: PeriodicidadeSeguro): string {
  return periodicidade === 'mensal' ? 'mês' : 'ano';
}
