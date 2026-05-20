import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, PerfilUso } from '../../types/perfil';
import { Input } from '../ui/input';
import { Segmentado } from '../Segmentado';
import { Stepper } from '../Stepper';
import { Linha } from '../Linha';

interface Props {
  moto: PerfilUsuario['moto'];
  trabalho: PerfilUsuario['trabalho'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoUsoDiario({ moto, trabalho, dispatch }: Props) {
  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <p className="label-neutro">Uso Diário</p>
      <p className="text-sm text-foreground">Perfil de trabalho</p>
      <Segmentado
        opcoes={[
          { label: 'Entrega', valor: 'entrega' },
          { label: 'Passageiro', valor: 'passageiro' },
        ]}
        valor={moto.perfilUso}
        onChange={(v) => dispatch({ type: 'SET_PERFIL_USO', perfilUso: v as PerfilUso })}
      />
      <Linha label="Dias na semana">
        <Stepper
          valor={trabalho.diasPorSemana}
          min={1}
          max={7}
          onChange={(v) => dispatch({ type: 'SET_DIAS_POR_SEMANA', valor: v })}
        />
      </Linha>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">KM por dia (média)</p>
        <Input
          type="number"
          value={trabalho.kmPorDia}
          min={1}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v > 0) dispatch({ type: 'SET_KM_POR_DIA', valor: v });
          }}
          className="text-right"
        />
      </div>
    </section>
  );
}
