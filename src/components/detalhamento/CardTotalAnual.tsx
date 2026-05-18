import { moeda, cpkFormatado } from '../../utils/formatters';

type Props = {
  totalFiltrado: number;
  mensal: number;
  porKm: number;
};

export function CardTotalAnual({ totalFiltrado, mensal, porKm }: Props) {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-md">
      <p className="text-muted-foreground/60 text-[10px] uppercase tracking-wider mb-1">
        Total anual estimado
      </p>
      <p className="text-foreground font-bold text-3xl">{moeda(totalFiltrado)}</p>
      <div className="flex gap-md mt-2 text-xs text-muted-foreground/60">
        <span>{moeda(mensal)}/mês</span>
        <span>{cpkFormatado(porKm)}/km</span>
      </div>
    </div>
  );
}
