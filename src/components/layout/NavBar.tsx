import { NavLink, useLocation } from 'react-router-dom';

const TABS = [
  {
    to: '/estimativa',
    label: 'ESTIMATIVA',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path d="M3 3v18h18" strokeLinecap="round" />
        <path d="M7 16l4-4 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/mao-de-obra',
    label: 'M. OBRA',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/insumos',
    label: 'INSUMOS',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <circle cx={12} cy={12} r={9} />
        <path d="M12 7v5l3 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/ajustes',
    label: 'AJUSTES',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <circle cx={12} cy={8} r={3} />
        <path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function NavBar() {
  const { pathname } = useLocation();

  return (
    // `max-w-3xl` deve casar com a coluna central em App.tsx (NavBar é `fixed`,
    // então não herda a largura da coluna — manter os dois em sincronia).
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 bg-card border-t border-muted safe-bottom">
      <div className="flex h-16">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => {
              const ativo = isActive || (tab.to === '/ajustes' && pathname === '/perfil');
              return `flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium tracking-wider transition-colors ${
                ativo
                  ? 'bg-primary text-foreground'
                  : 'text-muted-foreground/70 hover:text-muted-foreground'
              }`;
            }}
          >
            {tab.icon}
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
