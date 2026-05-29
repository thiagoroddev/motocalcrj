import { useState } from 'react';
import { DonutChart } from './DonutChart';
import type { SegmentoDonut } from './DonutChart';
import { SeletorPeriodo, type Periodo } from '../SeletorPeriodo';
import { converterAnualParaPeriodo } from '../../utils/calculos';
import { moeda } from '../../utils/formatters';

interface PropsDistribuicaoCustos {
  segmentos: SegmentoDonut[];
  diasAno: number;
  horasDia: number;
}

const PERIODOS_CARD: Periodo[] = ['ano', 'mes', 'sem'];

const ROTULO_PERIODO: Record<Periodo, string> = {
  ano: 'ano',
  mes: 'mês',
  sem: 'semana',
  dia: 'dia',
  hora: 'hora',
};

// Total no centro do donut: sem centavos para caber no furo.
function moedaCompacta(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

export function DistribuicaoCustos({ segmentos, diasAno, horasDia }: PropsDistribuicaoCustos) {
  const [periodo, setPeriodo] = useState<Periodo>('mes');

  // Filtra e ordena uma única vez: donut e legenda usam a MESMA ordem (% desc).
  const visiveis = segmentos
    .filter((s) => s.porcentagem >= 0.5)
    .sort((a, b) => b.porcentagem - a.porcentagem);

  const totalAnual = segmentos.reduce((soma, s) => soma + s.valorAnual, 0);
  const totalPeriodo = converterAnualParaPeriodo(totalAnual, periodo, diasAno, horasDia);

  const centro = (
    <>
      <span className="text-foreground font-bold text-base leading-tight tabular-nums">
        {moedaCompacta(totalPeriodo)}
      </span>
      <span className="text-muted-foreground/60 text-[10px] uppercase tracking-wide leading-tight">
        {ROTULO_PERIODO[periodo]}
      </span>
    </>
  );

  return (
    <section className="bg-card rounded-lg p-md space-y-md">
      <p className="text-foreground text-sm font-semibold">Distribuição de custos</p>

      <div className="flex justify-center">
        <DonutChart segmentos={visiveis} tamanho={150} centro={centro} />
      </div>

      <SeletorPeriodo periodo={periodo} onChange={setPeriodo} periodos={PERIODOS_CARD} />

      <div className="space-y-1.5">
        {visiveis.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.cor }}
            />
            <span className="flex-1 truncate text-muted-foreground/70 text-xs">{s.label}</span>
            <span className="text-foreground text-xs font-medium tabular-nums">
              {moeda(converterAnualParaPeriodo(s.valorAnual, periodo, diasAno, horasDia))}
            </span>
            <span className="w-9 text-right text-muted-foreground/60 text-xs tabular-nums">
              {Math.round(s.porcentagem)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
