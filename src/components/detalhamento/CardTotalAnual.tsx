import { moeda, cpkFormatado } from '../../utils/formatters';
import type { Periodo } from '../SeletorPeriodo';

export type ChipDetalhe = {
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
};

type Props = {
  periodo: Periodo;
  totalPeriodo: number;
  kmPeriodo: string;
  porKm: number;
  detalhesFixos: ChipDetalhe[];
};

const ROTULO_PERIODO: Record<Periodo, string> = {
  ano: 'ano',
  mes: 'mês',
  sem: 'semana',
  dia: 'dia',
  hora: 'hora',
};

export function CardTotalAnual({ periodo, totalPeriodo, kmPeriodo, porKm, detalhesFixos }: Props) {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-md">
      <p className="text-muted-foreground/60 text-[10px] uppercase tracking-wider mb-1">
        Total estimado no {ROTULO_PERIODO[periodo]}
      </p>
      <p className="text-foreground font-bold text-3xl">{moeda(totalPeriodo)}</p>
      <div className="flex flex-wrap gap-x-md gap-y-1 mt-2 text-xs text-muted-foreground/60">
        <span>{kmPeriodo}</span>
        <span>{cpkFormatado(porKm)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-primary/15 pt-2">
        {detalhesFixos.map((chip) =>
          chip.onClick ? (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onClick}
              aria-label={chip.ariaLabel ?? chip.label}
              aria-haspopup="dialog"
              className="inline-flex items-center min-h-touch rounded bg-primary/10 px-2 text-[10px] text-muted-foreground/80 hover:bg-primary/20 hover:text-foreground transition-colors"
            >
              {chip.label}
            </button>
          ) : (
            <span
              key={chip.label}
              className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-muted-foreground/70"
            >
              {chip.label}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
