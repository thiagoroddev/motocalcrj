import { useState } from 'react';
import { ChartPie } from 'lucide-react';
import { DonutChart } from './DonutChart';
import type { SegmentoDonut } from './DonutChart';
import { SeletorPeriodo, type Periodo } from '../SeletorPeriodo';
import { TileCategoria } from '../icons/categorias';
import { TituloSecao } from '../TituloSecao';
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
    <section className="bg-card rounded-lg p-4 space-y-4">
      <TituloSecao icone={ChartPie}>Distribuição de custos</TituloSecao>

      <div className="flex justify-center">
        <DonutChart segmentos={visiveis} tamanho={150} centro={centro} />
      </div>

      <SeletorPeriodo
        periodo={periodo}
        onChange={setPeriodo}
        periodos={PERIODOS_CARD}
        className="bg-muted/40"
      />

      <div className="divide-y divide-muted/50">
        {visiveis.map((s) => (
          <div key={s.id} className="flex items-center gap-2 py-2.5 first:pt-0 last:pb-0">
            <TileCategoria categoriaId={s.id} corHex={s.cor} />
            <span className="flex-1 truncate text-muted-foreground/70 text-xs">{s.label}</span>
            <span className="text-foreground text-xs font-medium tabular-nums">
              {moeda(converterAnualParaPeriodo(s.valorAnual, periodo, diasAno, horasDia))}
            </span>
            <span className="w-9 text-right text-muted-foreground/60 text-xs tabular-nums">
              {s.porcentagem < 1 ? s.porcentagem.toFixed(1).replace('.', ',') : Math.round(s.porcentagem)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
