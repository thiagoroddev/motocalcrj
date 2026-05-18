import { DonutChart } from './DonutChart';
import type { SegmentoDonut } from './DonutChart';

interface PropsDistribuicaoCustos {
  segmentos: SegmentoDonut[];
}

export function DistribuicaoCustos({ segmentos }: PropsDistribuicaoCustos) {
  return (
    <section className="bg-card rounded-lg p-md">
      <p className="text-foreground text-sm font-semibold mb-md">Distribuição de custos</p>
      <div className="flex items-center gap-md">
        <DonutChart segmentos={segmentos} tamanho={140} />
        <div className="flex-1 space-y-1.5">
          {segmentos
            .filter((s) => s.porcentagem >= 0.5)
            .sort((a, b) => b.porcentagem - a.porcentagem)
            .map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.cor }}
                />
                <span className="text-muted-foreground/70 text-xs flex-1 truncate">{s.label}</span>
                <span className="text-muted-foreground text-xs font-medium">
                  {Math.round(s.porcentagem)}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
