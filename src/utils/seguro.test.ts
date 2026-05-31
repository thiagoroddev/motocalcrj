import { describe, expect, it } from 'vitest';
import {
  formatarValorSeguroParaInput,
  rotuloValorSeguro,
  sufixoValorSeguro,
  valorSeguroAnualizado,
  valorSeguroNoPeriodo,
} from './seguro';

describe('seguro utils', () => {
  it('mantem valor anual como canônico quando a periodicidade é anual', () => {
    expect(valorSeguroNoPeriodo(1200, 'anual')).toBe(1200);
    expect(valorSeguroAnualizado(1200, 'anual')).toBe(1200);
    expect(formatarValorSeguroParaInput(1200, 'anual')).toBe('1200.00');
    expect(rotuloValorSeguro('anual')).toBe('Valor anual (R$)');
    expect(sufixoValorSeguro('anual')).toBe('ano');
  });

  it('converte valor anual para mensal apenas na fronteira de exibição', () => {
    expect(valorSeguroNoPeriodo(1200, 'mensal')).toBe(100);
    expect(valorSeguroAnualizado(100, 'mensal')).toBe(1200);
    expect(formatarValorSeguroParaInput(1200, 'mensal')).toBe('100.00');
    expect(rotuloValorSeguro('mensal')).toBe('Valor mensal (R$)');
    expect(sufixoValorSeguro('mensal')).toBe('mês');
  });

  it('não remultiplica ao salvar, reabrir e salvar seguro mensal', () => {
    const valorSalvo = valorSeguroAnualizado(100, 'mensal');
    const valorReaberto = formatarValorSeguroParaInput(valorSalvo, 'mensal');
    const valorSalvoNovamente = valorSeguroAnualizado(parseFloat(valorReaberto), 'mensal');

    expect(valorSalvo).toBe(1200);
    expect(valorReaberto).toBe('100.00');
    expect(valorSalvoNovamente).toBe(valorSalvo);
  });
});
