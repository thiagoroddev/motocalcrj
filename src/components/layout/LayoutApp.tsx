import { Outlet, Link, useLocation } from 'react-router-dom';
import { usePerfil } from '../../hooks/usePerfil';
import { getNomeModelo } from '../../data/catalogoModelos';
import { kmFormatado } from '../../utils/formatters';
import { NavBar } from './NavBar';
import { PopupAjuda } from '../PopupAjuda';
import type { ChaveAjuda } from '../../data/conteudoAjuda';

function resolverChaveAjuda(pathname: string): ChaveAjuda {
  if (pathname.startsWith('/mao-de-obra')) return 'maoDeObra';
  if (pathname.startsWith('/insumos')) return 'insumos';
  if (pathname.startsWith('/ajustes')) return 'ajustes';
  return 'estimativa';
}

export function LayoutApp() {
  const { perfil } = usePerfil();
  const { pathname } = useLocation();
  const chaveAjuda = resolverChaveAjuda(pathname);
  const nomeModelo = getNomeModelo(perfil.moto.modelo);
  const tipoComb = perfil.financeiro.tipoGasolinaPreferida;
  const consumo = perfil.financeiro.combustiveis[tipoComb].autonomia;
  const kmUltimaRevisaoTexto =
    perfil.moto.kmUltimaRevisao !== null ? kmFormatado(perfil.moto.kmUltimaRevisao) : '-';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-start gap-3 px-4 py-2 bg-card border-b border-muted shrink-0">
        <Link
          to="/perfil"
          className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-base font-bold shrink-0 mt-0.5"
          aria-label="Abrir perfil"
        >
          {perfil.moto.marca.charAt(0)}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to="/perfil"
            aria-label="Editar perfil e modelo"
            className="block py-1 -my-1 hover:underline underline-offset-2 decoration-muted-foreground/40"
          >
            <p className="text-foreground text-sm font-semibold truncate">
              {perfil.moto.marca}: {nomeModelo}
            </p>
          </Link>
          <p className="text-muted-foreground/50 text-xs">
            {perfil.moto.ano} -{' '}
            <Link
              to="/insumos"
              aria-label="Editar consumo em Insumos"
              className="hover:underline underline-offset-2 decoration-muted-foreground/40"
            >
              {consumo} km/L
            </Link>
          </p>
          <Link
            to="/ajustes"
            state={{ focoSecao: 'veiculo' }}
            aria-label="Editar km do veículo em Ajustes"
            className="flex items-center gap-1.5 mt-1 -mx-1 px-1 min-h-touch rounded hover:bg-muted/20"
          >
            <span className="px-1.5 py-0.5 bg-primary/15 text-primary text-xs font-medium rounded">
              {kmFormatado(perfil.moto.kmAtual)}
            </span>
            <span className="px-1.5 py-0.5 bg-muted/30 text-muted-foreground text-xs rounded">
              última rev: {kmUltimaRevisaoTexto}
            </span>
          </Link>
        </div>
        <PopupAjuda chave={chaveAjuda} className="mt-0.5" />
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <NavBar />
    </div>
  );
}
