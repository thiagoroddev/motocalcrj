import { useId } from 'react';
import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction } from '../../../types/perfil';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { BotaoReset } from '../../BotaoReset';
import { Utensils } from 'lucide-react';
import { TituloSecao } from '@/components/TituloSecao';

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

export function CampoAlimentacao({ financeiro, dispatch }: Props) {
  const idValor = useId();
  return (
    <section className="bg-card rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <TituloSecao icone={Utensils}>Alimentação</TituloSecao>
        <BotaoReset
          desabilitado={financeiro.alimentacaoDia === 0}
          onReset={() => dispatch({ type: 'SET_ALIMENTACAO', valorDia: 0 })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={idValor} className="text-xs text-muted-foreground font-normal">
          Valor por dia (R$)
        </Label>
        <Input
          id={idValor}
          type="number"
          inputMode="decimal"
          value={financeiro.alimentacaoDia}
          min={0}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) dispatch({ type: 'SET_ALIMENTACAO', valorDia: v });
          }}
        />
      </div>
    </section>
  );
}
