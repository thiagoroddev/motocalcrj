import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, PeriodicidadeSeguro } from '../../types/perfil';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoFinanceiro({ financeiro, dispatch }: Props) {
  const { seguro } = financeiro;

  return (
    <>
      <section className="bg-card rounded-lg p-md space-y-3">
        <p className="label-neutro">Seguro</p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Valor anual (R$)</p>
          <Input
            type="number"
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

      <section className="bg-card rounded-lg p-md space-y-3">
        <p className="label-neutro">Alimentação</p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Valor por dia (R$)</p>
          <Input
            type="number"
            value={financeiro.alimentacaoDia}
            min={0}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) dispatch({ type: 'SET_ALIMENTACAO', valorDia: v });
            }}
          />
        </div>
      </section>

      <section className="bg-card rounded-lg p-md space-y-3">
        <p className="label-neutro">Internet</p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Valor por mês (R$)</p>
          <Input
            type="number"
            value={financeiro.internet}
            min={0}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) dispatch({ type: 'SET_INTERNET', valor: v });
            }}
          />
        </div>
      </section>
    </>
  );
}
