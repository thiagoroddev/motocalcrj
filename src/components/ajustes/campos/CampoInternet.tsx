import { useId } from 'react';
import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction } from '../../../types/perfil';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { BotaoReset } from '../../BotaoReset';
import { Wifi } from 'lucide-react';
import { TituloSecao } from '@/components/TituloSecao';

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

export function CampoInternet({ financeiro, dispatch }: Props) {
  const idValor = useId();
  return (
    <section className="bg-card rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <TituloSecao icone={Wifi}>Internet</TituloSecao>
        <BotaoReset
          desabilitado={financeiro.internet === 0}
          onReset={() => dispatch({ type: 'SET_INTERNET', valor: 0 })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={idValor} className="text-xs text-muted-foreground font-normal">
          Valor por mês (R$)
        </Label>
        <Input
          id={idValor}
          type="number"
          inputMode="decimal"
          value={financeiro.internet}
          min={0}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= 0) dispatch({ type: 'SET_INTERNET', valor: v });
          }}
        />
      </div>
    </section>
  );
}
