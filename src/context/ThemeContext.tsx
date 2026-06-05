import { createContext, useContext, useEffect, useState } from 'react';
import { LocalStorageThemeStorage } from '../services/themeStorage';
import type { Tema } from '../services/themeStorage';

export type { Tema } from '../services/themeStorage';

interface ThemeContextValue {
  tema: Tema;
  toggleTema: () => void;
}

const themeStorage = new LocalStorageThemeStorage();

const ThemeContext = createContext<ThemeContextValue>({ tema: 'dark', toggleTema: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => themeStorage.carregarTema());

  useEffect(() => {
    document.documentElement.classList.toggle('light', tema === 'light');
    themeStorage.salvarTema(tema);
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
