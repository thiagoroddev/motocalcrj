export type Tema = 'dark' | 'light';

const CHAVE_TEMA = 'motocusto:tema';
const TEMA_PADRAO: Tema = 'dark';

function ehTema(valor: string | null): valor is Tema {
  return valor === 'dark' || valor === 'light';
}

export interface IThemeStorage {
  carregarTema(): Tema;
  salvarTema(tema: Tema): void;
}

export class LocalStorageThemeStorage implements IThemeStorage {
  carregarTema(): Tema {
    try {
      const tema = localStorage.getItem(CHAVE_TEMA);
      return ehTema(tema) ? tema : TEMA_PADRAO;
    } catch {
      return TEMA_PADRAO;
    }
  }

  salvarTema(tema: Tema): void {
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      // Persistência de tema é best-effort. Falha de storage não pode quebrar a UI.
    }
  }
}
