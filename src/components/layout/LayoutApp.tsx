import { Outlet, Link } from 'react-router-dom';
import { usePerfil } from '../../hooks/usePerfil';
import { getNomeModelo } from '../../data/catalogoModelos';
import { NavBar } from './NavBar';

export function LayoutApp() {
  const { perfil } = usePerfil();
  const nomeModelo = getNomeModelo(perfil.moto.modelo);
  const tipoComb = perfil.financeiro.tipoGasolinaPreferida;
  const consumo = perfil.financeiro.combustiveis[tipoComb].autonomia;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center gap-3 px-md py-3 bg-card border-b border-muted flex-shrink-0">
        <Link
          to="/perfil"
          className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-base font-bold"
          aria-label="Abrir perfil"
        >
          {perfil.moto.marca.charAt(0)}
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold truncate">
            {perfil.moto.marca}: {nomeModelo}
          </p>
          <p className="text-muted-foreground/50 text-xs">
            {perfil.moto.ano} — {consumo} km/L
          </p>
        </div>
        <button
          type="button"
          aria-label="Exportar dados"
          className="p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" strokeLinecap="round" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" strokeLinecap="round" />
            <line x1={6} y1={1} x2={6} y2={4} strokeLinecap="round" />
            <line x1={10} y1={1} x2={10} y2={4} strokeLinecap="round" />
            <line x1={14} y1={1} x2={14} y2={4} strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Notificações"
          className="p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <NavBar />
    </div>
  );
}
