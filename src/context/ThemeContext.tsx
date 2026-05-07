import { createContext, useContext, useEffect, useState } from 'react';

export type Tema = 'dark' | 'light';

interface ThemeContextValue {
  tema: Tema;
  toggleTema: () => void;
}

const CHAVE_TEMA = 'motocalc:tema';

const ThemeContext = createContext<ThemeContextValue>({ tema: 'dark', toggleTema: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(
    () => (localStorage.getItem(CHAVE_TEMA) as Tema | null) ?? 'dark',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light', tema === 'light');
    localStorage.setItem(CHAVE_TEMA, tema);
  }, [tema]);

  return (
    <ThemeContext.Provider
      value={{ tema, toggleTema: () => setTema((t) => (t === 'dark' ? 'light' : 'dark')) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  return useContext(ThemeContext);
}
