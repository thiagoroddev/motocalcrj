import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

interface PropsAvisoFonte {
  children: ReactNode;
  className?: string;
}

// Aviso curto e SEMPRE visível (ícone + texto) sobre a origem de um dado e o
// risco de estar desatualizado. Diferente do `AjudaInline` (que esconde o texto
// atrás de um toque no "?"), aqui o aviso fica à mostra — é a garantia de que o
// usuário vê a procedência sem precisar abrir nada (TASK-RF-10).
export function AvisoFonte({ children, className }: PropsAvisoFonte) {
  return (
    <p
      className={`flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground/60 ${
        className ?? ''
      }`}
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
