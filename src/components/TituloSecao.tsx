import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PropsTituloSecao {
  // Aceita ícones lucide e os gerados pelo unplugin-icons (ambos recebem className).
  icone: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}

// Título de seção padronizado do app: ícone + texto maior em CAPS.
export function TituloSecao({ icone: Icone, children, className }: PropsTituloSecao) {
  return (
    <h2
      className={cn(
        'flex items-center gap-2 text-foreground text-base font-semibold uppercase tracking-wide',
        className,
      )}
    >
      <Icone className="w-5 h-5 text-primary shrink-0" />
      {children}
    </h2>
  );
}
