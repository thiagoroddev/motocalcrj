import { Coins } from 'lucide-react';
import { cpkFormatado } from '../../utils/formatters';

interface PropsCardCpk {
  porKm: number;
  porKmSemAlimentacao?: number;
}

export function CardCpk({ porKm, porKmSemAlimentacao }: PropsCardCpk) {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-md">
      <p className="label-destaque mb-1 flex items-center gap-1.5">
        <Coins className="w-5 h-5 text-primary" aria-hidden="true" />
        Custo de operação por km
      </p>
      <p className="text-foreground font-bold text-3xl">{cpkFormatado(porKm)}</p>
      {porKmSemAlimentacao !== undefined && (
        <p className="text-muted-foreground/50 text-xs mt-1">
          Sem alimentação: {cpkFormatado(porKmSemAlimentacao)}
        </p>
      )}
    </div>
  );
}
