import type { SituacaoMoto } from '../../types/perfil';

export interface ConfigPasso {
  label: string;
  percentual: number;
}

// Ordem canônica do onboarding (ADR-020): 10 passos + Confirmação, rotas semânticas.
// Sub-rotas de Situação contam como o mesmo passo 4.
export const CONFIG_PASSOS: Record<string, ConfigPasso> = {
  modelo: { label: 'PASSO 1 DE 10', percentual: 10 },
  ano: { label: 'PASSO 2 DE 10', percentual: 20 },
  km: { label: 'PASSO 3 DE 10', percentual: 30 },
  situacao: { label: 'PASSO 4 DE 10', percentual: 40 },
  'situacao/financiamento': { label: 'PASSO 4 DE 10', percentual: 40 },
  'situacao/aluguel': { label: 'PASSO 4 DE 10', percentual: 40 },
  'situacao/responsabilidade': { label: 'PASSO 4 DE 10', percentual: 40 },
  seguro: { label: 'PASSO 5 DE 10', percentual: 50 },
  alimentacao: { label: 'PASSO 6 DE 10', percentual: 60 },
  internet: { label: 'PASSO 7 DE 10', percentual: 70 },
  'vida-util': { label: 'PASSO 8 DE 10', percentual: 80 },
  'mao-de-obra': { label: 'PASSO 9 DE 10', percentual: 90 },
  'ultimas-manutencoes': { label: 'PASSO 10 DE 10', percentual: 100 },
  confirmacao: { label: 'PASSO FINAL', percentual: 100 },
};

type ProximoFn = string | ((s: SituacaoMoto) => string);

const MAPA_PROXIMO: Record<string, ProximoFn> = {
  modelo: 'ano',
  ano: 'km',
  km: 'situacao',
  situacao: (s) =>
    s === 'financiada' ? 'situacao/financiamento' : s === 'alugada' ? 'situacao/aluguel' : 'seguro',
  'situacao/financiamento': 'seguro',
  'situacao/aluguel': 'situacao/responsabilidade',
  'situacao/responsabilidade': 'seguro',
  seguro: 'alimentacao',
  alimentacao: 'internet',
  internet: 'vida-util',
  'vida-util': 'mao-de-obra',
  'mao-de-obra': 'ultimas-manutencoes',
  'ultimas-manutencoes': 'confirmacao',
  confirmacao: 'concluir',
};

const MAPA_ANTERIOR: Record<string, ProximoFn | null> = {
  modelo: null,
  ano: 'modelo',
  km: 'ano',
  situacao: 'km',
  'situacao/financiamento': 'situacao',
  'situacao/aluguel': 'situacao',
  'situacao/responsabilidade': 'situacao/aluguel',
  seguro: (s) =>
    s === 'financiada'
      ? 'situacao/financiamento'
      : s === 'alugada'
        ? 'situacao/responsabilidade'
        : 'situacao',
  alimentacao: 'seguro',
  internet: 'alimentacao',
  'vida-util': 'internet',
  'mao-de-obra': 'vida-util',
  'ultimas-manutencoes': 'mao-de-obra',
  confirmacao: 'ultimas-manutencoes',
};

function resolver(valor: ProximoFn, situacao: SituacaoMoto): string {
  return typeof valor === 'function' ? valor(situacao) : valor;
}

export function getProximoPasso(passo: string, situacao: SituacaoMoto): string | null {
  const valor = MAPA_PROXIMO[passo];
  return valor !== undefined ? resolver(valor, situacao) : null;
}

export function getPassoAnterior(passo: string, situacao: SituacaoMoto): string | null {
  const valor = MAPA_ANTERIOR[passo];
  if (valor === null || valor === undefined) {
    return null;
  }
  return resolver(valor as ProximoFn, situacao);
}

export function parsePasso(pathname: string): string {
  return pathname.replace(/^\/onboarding\//, '');
}
