import type { ReactNode } from 'react';
import { BotaoLapisEdicao } from './BotaoLapisEdicao';

interface NotaRodapeProps {
  children: ReactNode;
  onEditar?: () => void;
  ariaLabel?: string;
}

export function NotaRodape({ children, onEditar, ariaLabel }: NotaRodapeProps) {
  return (
    <div className="flex items-start gap-2 border-t border-muted/70 pt-2">
      <p className="flex-1 min-w-0 text-[11px] leading-relaxed text-muted-foreground/45">
        {children}
      </p>
      {onEditar && <BotaoLapisEdicao onClick={onEditar} ariaLabel={ariaLabel ?? 'Editar'} />}
    </div>
  );
}

interface LinhaDetalheTextoProps {
  label: string;
  valor: string;
}

export function LinhaDetalheTexto({ label, valor }: LinhaDetalheTextoProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground/60 text-xs">{label}</span>
      <span className="min-w-0 text-right text-muted-foreground text-xs font-medium tabular-nums break-words">
        {valor}
      </span>
    </div>
  );
}
