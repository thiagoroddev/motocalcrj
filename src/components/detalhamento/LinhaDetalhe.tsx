import { moeda } from '../../utils/formatters';

type Props = {
  label: string;
  valor: number;
  formatter?: (v: number) => string;
  suffix?: string;
};

export function LinhaDetalhe({ label, valor, formatter = moeda, suffix }: Props) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground/60 text-xs">{label}</span>
      <span className="text-muted-foreground text-xs font-medium">
        {suffix ? `${valor.toFixed(1)} ${suffix}` : formatter(valor)}
      </span>
    </div>
  );
}
