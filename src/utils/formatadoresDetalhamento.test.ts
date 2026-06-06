import { describe, expect, it } from 'vitest';
import {
  formatarKm,
  formatarKmNoPeriodo,
  formatarLitros,
  formatarPrecoLitro,
  formatarQuantidade,
  montarFormulaCombustivel,
} from './formatadoresDetalhamento';

describe('formatadoresDetalhamento', () => {
  it('formata distâncias, quantidades e litros conforme a precisão da tela', () => {
    expect(formatarKm(12.5)).toBe('12,5 km');
    expect(formatarKm(100.4)).toBe('100 km');
    expect(formatarKmNoPeriodo(12.5, 'sem')).toBe('12,5 km/semana');
    expect(formatarQuantidade(4.5, 'dias')).toBe('4,5 dias');
    expect(formatarLitros(3.2)).toBe('3,20 L');
  });

  it('formata preço por litro e a fórmula explicativa de combustível', () => {
    expect(formatarPrecoLitro(6.5)).toContain('6,50');

    const formula = montarFormulaCombustivel(350, 35, 6.5, 'R$ 65,00');
    expect(formula).toContain('350 km / 35,0 km/L');
    expect(formula).toContain('6,50');
    expect(formula).toContain('= R$ 65,00');
  });

  it('orienta informar o consumo quando não é possível montar a fórmula', () => {
    expect(montarFormulaCombustivel(350, 0, 6.5, 'R$ 0,00')).toBe(
      'Informe consumo efetivo para calcular.',
    );
  });
});
