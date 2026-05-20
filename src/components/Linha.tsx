import type { ReactNode } from 'react';

export function Linha({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="flex-1 min-w-0 text-sm text-foreground">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
