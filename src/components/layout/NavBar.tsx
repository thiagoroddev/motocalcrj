import { NavLink } from 'react-router-dom';

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
    to: '/vida-util',
    label: 'AUTONOMIA',
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
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-muted z-50 safe-bottom">
      <div className="flex h-16">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium tracking-wider transition-colors ${
                isActive
                  ? 'bg-primary text-foreground'
                  : 'text-muted-foreground/50 hover:text-muted-foreground'
              }`
            }
          >
            {tab.icon}
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
