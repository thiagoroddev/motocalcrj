import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import type { Periodo } from '../types/calculos';

export type { Periodo };

const ROTULOS: Record<Periodo, string> = {
  ano: 'Ano',
  mes: 'Mês',
  sem: 'Sem',
  dia: 'Dia',
  hora: 'Hora',
};

const PERIODOS_PADRAO: Periodo[] = ['ano', 'mes', 'sem', 'dia', 'hora'];

type Props = {
  periodo: Periodo;
  onChange: (p: Periodo) => void;
  // Subconjunto/ordem de períodos a exibir. Default: os cinco.
  periodos?: Periodo[];
  className?: string;
};

export function SeletorPeriodo({
  periodo,
  onChange,
  periodos = PERIODOS_PADRAO,
  className,
}: Props) {
  return (
    <Card className={cn('flex gap-1.5 shadow-none border-0 p-1', className)}>
      {periodos.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex-1 h-8 rounded text-xs font-medium transition-colors ${
            periodo === id
              ? 'bg-primary text-foreground'
              : 'text-muted-foreground/60 hover:text-foreground'
          }`}
        >
          {ROTULOS[id]}
        </button>
      ))}
    </Card>
  );
}
