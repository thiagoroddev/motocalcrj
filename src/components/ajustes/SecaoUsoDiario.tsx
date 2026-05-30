import { useId } from 'react';
import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction } from '../../types/perfil';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Stepper } from '../Stepper';
import { Linha } from '../Linha';
import { BotaoReset } from '../BotaoReset';
import { Route } from 'lucide-react';
import { TituloSecao } from '@/components/TituloSecao';

interface Props {
  trabalho: PerfilUsuario['trabalho'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoUsoDiario({ trabalho, dispatch }: Props) {
  const idKmPorDia = useId();
  const temAlteracao = trabalho.diasPorSemana !== 5 || trabalho.kmPorDia !== 70;

  function resetar() {
    dispatch({ type: 'SET_DIAS_POR_SEMANA', valor: 5 });
    dispatch({ type: 'SET_KM_POR_DIA', valor: 70 });
  }

  return (
    <section className="bg-card rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <TituloSecao icone={Route}>Rodagem</TituloSecao>
        <BotaoReset desabilitado={!temAlteracao} onReset={resetar} />
      </div>
      <div className="space-y-1">
        <Label htmlFor={idKmPorDia} className="text-xs text-muted-foreground font-normal">
          Média de KM rodados por dia
        </Label>
        <Input
          id={idKmPorDia}
          type="number"
          inputMode="numeric"
          value={trabalho.kmPorDia}
          min={1}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v > 0) dispatch({ type: 'SET_KM_POR_DIA', valor: v });
          }}
          className="text-right"
        />
        <Linha label="Dias na semana">
          <Stepper
            valor={trabalho.diasPorSemana}
            min={1}
            max={7}
            onChange={(v) => dispatch({ type: 'SET_DIAS_POR_SEMANA', valor: v })}
          />
        </Linha>
      </div>
    </section>
  );
}
