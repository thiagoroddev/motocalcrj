import { vi } from 'vitest';

export function criarLocalStorageFalso(): Storage {
  const dados = new Map<string, string>();

  return {
    get length() {
      return dados.size;
    },
    clear: vi.fn(() => dados.clear()),
    getItem: vi.fn((chave: string) => dados.get(chave) ?? null),
    key: vi.fn((indice: number) => [...dados.keys()][indice] ?? null),
    removeItem: vi.fn((chave: string) => {
      dados.delete(chave);
    }),
    setItem: vi.fn((chave: string, valor: string) => {
      dados.set(chave, String(valor));
    }),
  };
}
