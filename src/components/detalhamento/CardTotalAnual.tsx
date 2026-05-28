import { moeda, cpkFormatado } from '../../utils/formatters';
import type { Periodo } from './SeletorPeriodo';

type Props = {
  periodo: Periodo;
  totalPeriodo: number;
  kmPeriodo: string;
  porKm: number;
  detalhesFixos: string[];
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
      <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 border-t border-primary/15 pt-2">
        {detalhesFixos.map((detalhe) => (
          <span
            key={detalhe}
            className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-muted-foreground/70"
          >
            {detalhe}
          </span>
        ))}
      </div>
    </div>
  );
}
