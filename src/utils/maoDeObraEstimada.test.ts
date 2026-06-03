import { describe, expect, it } from 'vitest';
import { estimarMaoDeObra, taxaHoraDaMarca } from './maoDeObraEstimada';

describe('estimarMaoDeObra', () => {
  it('estima horas × taxa × fator (kit transmissão 2h × 110 × 1.0 = 220)', () => {
    expect(estimarMaoDeObra('troca-kit-transmissao', 'Yamaha', 1)).toBe(220);
  });

  it('bate o real da vela calibrado (0,12h × 110 ≈ 13)', () => {
    expect(estimarMaoDeObra('troca-vela', 'Honda', 1)).toBeCloseTo(13.2, 1);
  });

  it('aplica o fator do modelo (250cc = 1.35)', () => {
    expect(estimarMaoDeObra('troca-kit-transmissao', 'Yamaha', 1.35)).toBeCloseTo(297, 0);
  });

  it('retorna 0 para serviço sem tempário', () => {
    expect(estimarMaoDeObra('servico-desconhecido', 'Honda', 1)).toBe(0);
  });

  it('usa a taxa padrão para marca desconhecida e fator inválido vira 1', () => {
    expect(taxaHoraDaMarca('Suzuki')).toBe(110);
    expect(estimarMaoDeObra('troca-sapata-traseira', undefined, 0)).toBeCloseTo(71.5, 1);
  });
});
