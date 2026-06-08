import { describe, it, expect } from 'vitest';
import { getProximoPasso, getPassoAnterior, proximoEmEdicao, parsePasso } from './onboardingUtils';

// Matriz de navegação do onboarding (ADR-020). Cobre os 3 ramos por situação,
// o "voltar" e o modo edição (volta à Confirmação).

const ORDEM_QUITADA = [
  'modelo',
  'ano',
  'km',
  'situacao',
  'seguro',
  'alimentacao',
  'internet',
  'vida-util',
  'mao-de-obra',
  'ultimas-manutencoes',
  'confirmacao',
];

describe('onboardingUtils — ramo quitada (linear)', () => {
  it('próximo encadeia a ordem canônica até concluir', () => {
    const esperado = [...ORDEM_QUITADA.slice(1), 'concluir'];
    ORDEM_QUITADA.forEach((passo, i) => {
      expect(getProximoPasso(passo, 'quitada')).toBe(esperado[i]);
    });
  });

  it('anterior espelha a ordem (modelo é o início)', () => {
    expect(getPassoAnterior('modelo', 'quitada')).toBeNull();
    for (let i = 1; i < ORDEM_QUITADA.length; i++) {
      expect(getPassoAnterior(ORDEM_QUITADA[i], 'quitada')).toBe(ORDEM_QUITADA[i - 1]);
    }
  });
});

describe('onboardingUtils — ramo financiada', () => {
  it('situacao → financiamento → seguro', () => {
    expect(getProximoPasso('situacao', 'financiada')).toBe('situacao/financiamento');
    expect(getProximoPasso('situacao/financiamento', 'financiada')).toBe('seguro');
  });

  it('voltar: seguro → financiamento → situacao', () => {
    expect(getPassoAnterior('seguro', 'financiada')).toBe('situacao/financiamento');
    expect(getPassoAnterior('situacao/financiamento', 'financiada')).toBe('situacao');
  });
});

describe('onboardingUtils — ramo alugada', () => {
  it('situacao → aluguel → responsabilidade → seguro', () => {
    expect(getProximoPasso('situacao', 'alugada')).toBe('situacao/aluguel');
    expect(getProximoPasso('situacao/aluguel', 'alugada')).toBe('situacao/responsabilidade');
    expect(getProximoPasso('situacao/responsabilidade', 'alugada')).toBe('seguro');
  });

  it('voltar: seguro → responsabilidade → aluguel → situacao', () => {
    expect(getPassoAnterior('seguro', 'alugada')).toBe('situacao/responsabilidade');
    expect(getPassoAnterior('situacao/responsabilidade', 'alugada')).toBe('situacao/aluguel');
    expect(getPassoAnterior('situacao/aluguel', 'alugada')).toBe('situacao');
  });
});

describe('onboardingUtils — modo edição (volta à Confirmação)', () => {
  it('passo normal volta direto à Confirmação', () => {
    expect(proximoEmEdicao('seguro', 'quitada')).toBe('confirmacao');
    expect(proximoEmEdicao('km', 'quitada')).toBe('confirmacao');
    expect(proximoEmEdicao('ultimas-manutencoes', 'quitada')).toBe('confirmacao');
  });

  it('editar Situação quitada volta direto', () => {
    expect(proximoEmEdicao('situacao', 'quitada')).toBe('confirmacao');
  });

  it('editar Situação financiada percorre o financiamento e depois volta', () => {
    expect(proximoEmEdicao('situacao', 'financiada')).toBe('situacao/financiamento');
    expect(proximoEmEdicao('situacao/financiamento', 'financiada')).toBe('confirmacao');
  });

  it('editar Situação alugada percorre aluguel → responsabilidade e depois volta', () => {
    expect(proximoEmEdicao('situacao', 'alugada')).toBe('situacao/aluguel');
    expect(proximoEmEdicao('situacao/aluguel', 'alugada')).toBe('situacao/responsabilidade');
    expect(proximoEmEdicao('situacao/responsabilidade', 'alugada')).toBe('confirmacao');
  });
});

describe('onboardingUtils — parsePasso', () => {
  it('extrai a rota (incluindo sub-rotas de situação)', () => {
    expect(parsePasso('/onboarding/modelo')).toBe('modelo');
    expect(parsePasso('/onboarding/situacao/financiamento')).toBe('situacao/financiamento');
  });
});
