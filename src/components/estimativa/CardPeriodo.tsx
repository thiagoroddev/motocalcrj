import { Clock } from 'lucide-react';
import { Card } from '../ui/card';
import { IconVelocidade } from '../icons';
import { moeda, kmFormatado } from '../../utils/formatters';

interface PropsCardPeriodo {
  label: string;
  valor: number;
  km?: number;
}

export function CardPeriodo({ label, valor, km }: PropsCardPeriodo) {
  return (
    <Card className="shadow-none border-0 p-md flex flex-col gap-1">
      <p className="label-neutro flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-muted-foreground/50" aria-hidden="true" />
        {label}
      </p>
      {km !== undefined && (
        <div className="flex items-center gap-1 text-secondary text-xs">
          <IconVelocidade className="w-3.5 h-3.5" />
          {kmFormatado(km)}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <p className="text-foreground font-bold text-lg">{moeda(valor)}</p>
      </div>
    </Card>
  );
}
