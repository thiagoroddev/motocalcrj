export interface SegmentoDonut {
  id: string;
  label: string;
  porcentagem: number;
  cor: string;
}

interface Props {
  segmentos: SegmentoDonut[];
  tamanho?: number;
}

export function DonutChart({ segmentos, tamanho = 160 }: Props) {
  const r = tamanho * 0.36;
  const c = tamanho / 2;
  const espessura = tamanho * 0.14;
  const circum = 2 * Math.PI * r;

  const ativos = segmentos.filter((s) => s.porcentagem > 0.5);
  const maior = [...ativos].sort((a, b) => b.porcentagem - a.porcentagem)[0];

  let acumulado = 0;

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: tamanho, height: tamanho }}
    >
      <svg
        width={tamanho}
        height={tamanho}
        viewBox={`0 0 ${tamanho} ${tamanho}`}
        className="-rotate-90"
      >
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={espessura}
        />

        {ativos.map((seg) => {
          const dashLen = (seg.porcentagem / 100) * circum;
          const offset = circum - (acumulado / 100) * circum;
          acumulado += seg.porcentagem;
          return (
            <circle
              key={seg.id}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={seg.cor}
              strokeWidth={espessura}
              strokeDasharray={`${dashLen} ${circum - dashLen}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>

      {maior && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-white font-bold text-2xl leading-tight">
            {Math.round(maior.porcentagem)}%
          </span>
          <span className="text-neutral/60 text-[10px] uppercase tracking-wide leading-tight max-w-[70px] text-center">
            {maior.label}
          </span>
        </div>
      )}

      {!maior && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-neutral/40 text-xs">Sem dados</span>
        </div>
      )}
    </div>
  );
}
