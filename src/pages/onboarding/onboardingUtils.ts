import type { SituacaoMoto } from '../../types/perfil';

export interface ConfigPasso {
  label: string;
  percentual: number;
}

export const CONFIG_PASSOS: Record<string, ConfigPasso> = {
  '1': { label: 'PASSO 1 DE 9', percentual: 11 },
  '2': { label: 'PASSO 2 DE 9', percentual: 22 },
  '3': { label: 'PASSO 3 DE 9', percentual: 33 },
  '4': { label: 'PASSO 4 DE 9', percentual: 44 },
  '5': { label: 'PASSO 5 DE 9', percentual: 55 },
  '6': { label: 'PASSO 6 DE 9', percentual: 66 },
  '6/financiamento': { label: 'PASSO 6 DE 9', percentual: 66 },
  '6/aluguel': { label: 'PASSO 6 DE 9', percentual: 66 },
  '6/responsabilidade': { label: 'PASSO 8 DE 9', percentual: 90 },
  '7': { label: 'PASSO 7 DE 9', percentual: 77 },
  '8': { label: 'PASSO 8 DE 9', percentual: 88 },
  '9': { label: 'PASSO FINAL', percentual: 100 },
  confirmacao: { label: 'PASSO FINAL', percentual: 100 },
};

type ProximoFn = string | ((s: SituacaoMoto) => string);

const MAPA_PROXIMO: Record<string, ProximoFn> = {
  '1': '2',
  '2': '3',
  '3': '4',
  '4': '5',
  '5': '6',
  '6': (s) => (s === 'financiada' ? '6/financiamento' : s === 'alugada' ? '6/aluguel' : '7'),
  '6/financiamento': '7',
  '6/aluguel': '6/responsabilidade',
  '6/responsabilidade': '7',
  '7': '8',
  '8': '9',
  '9': 'confirmacao',
  confirmacao: 'concluir',
};

const MAPA_ANTERIOR: Record<string, ProximoFn | null> = {
  '1': null,
  '2': '1',
  '3': '2',
  '4': '3',
  '5': '4',
  '6': '5',
  '6/financiamento': '6',
  '6/aluguel': '6',
  '6/responsabilidade': '6/aluguel',
  '7': (s) =>
    s === 'financiada' ? '6/financiamento' : s === 'alugada' ? '6/responsabilidade' : '6',
  '8': '7',
  '9': '8',
  confirmacao: '9',
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
