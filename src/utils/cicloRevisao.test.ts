import { describe, expect, it } from 'vitest';
import { montarCicloRevisao, projetarProximasRevisoes, proximaRevisaoApos } from './cicloRevisao';
import type { RevisaoAutorizadaPreset } from '../types/calculos';

// Cronograma sintético: amaciamento (1.000) + 3 regulares a cada 6.000, custos distintos.
const cronograma: RevisaoAutorizadaPreset[] = [
  {
    intervaloKm: 1000,
    intervaloMeses: 6,
    precoPecas: 100,
    precoMaoDeObra: 0,
    precoTotal: 100,
    itensSubstituidos: [],
    servicosExecutados: [],
  },
  {
    intervaloKm: 6000,
    intervaloMeses: 12,
    precoPecas: 200,
    precoMaoDeObra: 0,
    precoTotal: 200,
    itensSubstituidos: [],
    servicosExecutados: [],
  },
  {
    intervaloKm: 12000,
    intervaloMeses: 18,
    precoPecas: 500,
    precoMaoDeObra: 0,
    precoTotal: 500,
    itensSubstituidos: [],
    servicosExecutados: [],
  },
  {
    intervaloKm: 18000,
    intervaloMeses: 24,
    precoPecas: 300,
    precoMaoDeObra: 0,
    precoTotal: 300,
    itensSubstituidos: [],
    servicosExecutados: [],
  },
];

describe('montarCicloRevisao', () => {
  it('soma o ciclo, deriva o km do ciclo e aplica overrides', () => {
    const ciclo = montarCicloRevisao(cronograma, [
      { index: 2, precoPecas: 0, precoMaoDeObra: 0, precoTotal: 600 },
    ]);

    expect(ciclo.kmCiclo).toBe(18000);
    expect(ciclo.custoCicloCompleto).toBe(100 + 200 + 600 + 300); // override no índice 2
    expect(ciclo.revisoes[2]).toMatchObject({
      ordem: 3,
      intervaloKm: 12000,
      precoTotal: 600,
      editado: true,
    });
    expect(ciclo.revisoes[0].editado).toBe(false);
  });
});

describe('projetarProximasRevisoes', () => {
  it('inclui as revisões da janela; amaciamento (1ª) não recorre', () => {
    // janela (6.500, 18.500]: 12.000 e 18.000 (custos do próprio marco no 1º ciclo)
    const proximas = projetarProximasRevisoes(cronograma, [], { kmAtual: 6500, kmAnual: 12000 });

    expect(proximas).toEqual([
      { km: 12000, precoTotal: 500 },
      { km: 18000, precoTotal: 300 },
    ]);
  });

  it('recorre as regulares a cada intervalo, ciclando os custos (acima do ciclo)', () => {
    // janela (20.000, 32.000]: 24.000 e 30.000; custos ciclam (24.000 ≈ 6.000, 30.000 ≈ 12.000)
    const proximas = projetarProximasRevisoes(cronograma, [], { kmAtual: 20000, kmAnual: 12000 });

    expect(proximas).toEqual([
      { km: 24000, precoTotal: 200 },
      { km: 30000, precoTotal: 500 },
    ]);
  });

  it('inclui o amaciamento quando ele cai na janela', () => {
    const proximas = projetarProximasRevisoes(cronograma, [], { kmAtual: 0, kmAnual: 6000 });
    expect(proximas[0]).toEqual({ km: 1000, precoTotal: 100 });
    expect(proximas).toContainEqual({ km: 6000, precoTotal: 200 });
  });

  it('retorna vazio sem janela', () => {
    expect(projetarProximasRevisoes(cronograma, [], { kmAtual: 5000, kmAnual: 0 })).toEqual([]);
  });

  it('conta a partir da última revisão informada, sem assumir revisões não confirmadas', () => {
    // última informada 12.000 e moto com 18.010 → a próxima é 18.000 (não pula p/ 24.000)
    const proximas = projetarProximasRevisoes(cronograma, [], {
      kmAtual: 18010,
      kmAnual: 12000,
      kmUltimaRevisao: 12000,
    });
    expect(proximas).toEqual([
      { km: 18000, precoTotal: 300 },
      { km: 24000, precoTotal: 200 },
      { km: 30000, precoTotal: 500 },
    ]);
  });
});

describe('proximaRevisaoApos', () => {
  it('retorna o 1º marco do cronograma após a referência', () => {
    expect(proximaRevisaoApos(cronograma, 12000)).toBe(18000);
    expect(proximaRevisaoApos(cronograma, 6000)).toBe(12000);
    expect(proximaRevisaoApos(cronograma, 0)).toBe(1000);
  });

  it('acima do último marco, segue a recorrência das regulares', () => {
    // marcos 1.000/6.000/12.000/18.000; após 18.000 → 24.000 (regulares a cada 6.000)
    expect(proximaRevisaoApos(cronograma, 18000)).toBe(24000);
    expect(proximaRevisaoApos(cronograma, 25000)).toBe(30000);
  });

  it('retorna null sem cronograma', () => {
    expect(proximaRevisaoApos([], 5000)).toBeNull();
  });
});
