import { Route } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { TituloSecao } from '../TituloSecao';

interface PropsSecaoRodagem {
  kmDiaInput: string;
  onKmDiaChange: (valor: string) => void;
  onKmDiaBlur: () => void;
  dias: number;
  onStepDias: (delta: number) => void;
}

export function SecaoRodagem({
  kmDiaInput,
  onKmDiaChange,
  onKmDiaBlur,
  dias,
  onStepDias,
}: PropsSecaoRodagem) {
  return (
    <section className="bg-card rounded-lg p-md space-y-md">
      <TituloSecao icone={Route}>Rodagem</TituloSecao>
      <div>
        <Label
          htmlFor="km-dia"
          className="text-[10px] uppercase tracking-wider font-medium text-label mb-1 block"
        >
          Média de KM rodados por dia
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="km-dia"
            type="number"
            value={kmDiaInput}
            onChange={(e) => onKmDiaChange(e.target.value)}
            onBlur={onKmDiaBlur}
            className="flex-1 bg-muted border-muted rounded-input h-10"
            min={1}
            max={999}
          />
          <span className="text-muted-foreground/60 text-sm font-medium">KM</span>
        </div>
      </div>

      <div>
        <p className="label-neutro mb-1">Dias trabalhados / semana</p>
        <div className="flex items-center gap-md">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onStepDias(-1)}
            disabled={dias <= 1}
            className="w-9 h-9 rounded-full border-muted hover:border-primary"
          >
            −
          </Button>
          <span className="text-foreground font-bold text-xl w-6 text-center">{dias}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onStepDias(1)}
            disabled={dias >= 7}
            className="w-9 h-9 rounded-full border-muted hover:border-primary"
          >
            +
          </Button>
        </div>
        {dias === 1 && (
          <p className="text-muted-foreground/60 text-xs mt-xs">
            Com 1 dia por semana, os valores diário e semanal serão iguais nos cálculos.
          </p>
        )}
      </div>
    </section>
  );
}
