import { useId } from 'react';
import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, PeriodicidadeSeguro } from '../../../types/perfil';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { BotaoReset } from '../../BotaoReset';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

export function CampoSeguro({ financeiro, dispatch }: Props) {
  const idValor = useId();
  const { seguro } = financeiro;

  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-neutro">Seguro</p>
        <BotaoReset
          desabilitado={seguro.valorAnual === 0 && seguro.periodicidade === 'anual'}
          onReset={() =>
            dispatch({ type: 'SET_SEGURO', config: { valorAnual: 0, periodicidade: 'anual' } })
          }
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={idValor} className="text-xs text-muted-foreground font-normal">
          Valor anual (R$)
        </Label>
        <Input
          id={idValor}
          type="number"
          inputMode="decimal"
          value={seguro.valorAnual}
          min={0}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) dispatch({ type: 'SET_SEGURO', config: { valorAnual: v } });
          }}
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Periodicidade do valor</p>
        <Select
          value={seguro.periodicidade}
          onValueChange={(v) =>
            dispatch({ type: 'SET_SEGURO', config: { periodicidade: v as PeriodicidadeSeguro } })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="anual">Anual</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
