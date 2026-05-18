import { Card } from '../ui/card';

export type Periodo = 'ano' | 'mes' | 'sem' | 'dia' | 'hora';

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'ano', label: 'Ano' },
  { id: 'mes', label: 'Mês' },
  { id: 'sem', label: 'Sem' },
  { id: 'dia', label: 'Dia' },
  { id: 'hora', label: 'Hora' },
];

type Props = {
  periodo: Periodo;
  onChange: (p: Periodo) => void;
};

export function SeletorPeriodo({ periodo, onChange }: Props) {
  return (
    <Card className="flex gap-1.5 shadow-none border-0 p-1">
      {PERIODOS.map(({ id, label }) => (
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
          {label}
        </button>
      ))}
    </Card>
  );
}
