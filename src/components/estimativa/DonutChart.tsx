import type { ReactNode } from 'react';
import { PieChart } from 'react-minimal-pie-chart';

export interface SegmentoDonut {
  id: string;
  label: string;
  porcentagem: number;
  // Valor anual em R$ da categoria; a legenda converte para o período escolhido.
  valorAnual: number;
  cor: string;
}

interface Props {
  // Já vem filtrado e ordenado pelo chamador — a ordem dos segmentos no anel
  // espelha a ordem da legenda.
  segmentos: SegmentoDonut[];
  tamanho?: number;
  // Conteúdo sobreposto no furo do donut (ex.: total do período).
  centro?: ReactNode;
}

// Espessura do anel em % do raio. Menor = furo maior (mais espaço pro centro).
const ESPESSURA_ANEL = 20;
// Gap entre fatias, em graus.
const GAP_FATIAS = 2;

export function DonutChart({ segmentos, tamanho = 160, centro }: Props) {
  const temDados = segmentos.length > 0;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: tamanho, height: tamanho }}
    >
      {temDados ? (
        <PieChart
          data={segmentos.map((s) => ({ title: s.label, value: s.porcentagem, color: s.cor }))}
          lineWidth={ESPESSURA_ANEL}
          paddingAngle={GAP_FATIAS}
          startAngle={-90}
          background="rgba(255,255,255,0.06)"
        />
      ) : (
        <span className="text-muted-foreground/40 text-xs">Sem dados</span>
      )}

      {temDados && centro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 pointer-events-none">
          {centro}
        </div>
      )}
    </div>
  );
}
