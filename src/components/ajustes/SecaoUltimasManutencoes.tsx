import { useId } from 'react';
import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, KmUltimaTrocas } from '../../types/perfil';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { BotaoReset } from '../BotaoReset';

const COMPONENTES_TROCA: { key: keyof KmUltimaTrocas; label: string }[] = [
  { key: 'oleo', label: 'Troca de óleo' },
  { key: 'pneuDianteiro', label: 'Pneu dianteiro' },
  { key: 'pneuTraseiro', label: 'Pneu traseiro' },
  { key: 'kitRelacao', label: 'Kit relação' },
];

interface Props {
  moto: PerfilUsuario['moto'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoUltimasManutencoes({ moto, dispatch }: Props) {
  const idMotor = useId();
  const idPrefix = useId();
  const temAlteracao =
    COMPONENTES_TROCA.some(({ key }) => moto.kmUltimaTrocas[key] > 0) ||
    moto.kmMotorRefeito != null;

  function resetar() {
    COMPONENTES_TROCA.forEach(({ key }) =>
      dispatch({ type: 'SET_KM_ULTIMA_TROCA', componente: key, km: 0 }),
    );
    dispatch({ type: 'SET_MOTOR_REFEITO', km: null });
  }

  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-neutro">Últimas manutenções</p>
        <BotaoReset desabilitado={!temAlteracao} onReset={resetar} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {COMPONENTES_TROCA.map(({ key, label }) => {
          const inputId = `${idPrefix}-${key}`;
          return (
            <div key={key} className="space-y-1">
              <Label htmlFor={inputId} className="text-xs text-muted-foreground font-normal">
                {label}
              </Label>
              <Input
                id={inputId}
                type="number"
                inputMode="numeric"
                value={moto.kmUltimaTrocas[key] || ''}
                min={0}
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.value;
                  const v = parseInt(raw, 10);
                  dispatch({
                    type: 'SET_KM_ULTIMA_TROCA',
                    componente: key,
                    km: raw === '' || isNaN(v) ? 0 : v,
                  });
                }}
              />
            </div>
          );
        })}
      </div>
      {moto.kmAtual >= 60_000 && (
        <div className="space-y-1">
          <Label htmlFor={idMotor} className="text-xs text-muted-foreground font-normal">
            Retífica do motor (KM)
          </Label>
          <Input
            id={idMotor}
            type="number"
            inputMode="numeric"
            value={moto.kmMotorRefeito ?? ''}
            min={0}
            placeholder="0"
            onChange={(e) => {
              const raw = e.target.value;
              const v = parseInt(raw, 10);
              dispatch({ type: 'SET_MOTOR_REFEITO', km: raw === '' ? null : isNaN(v) ? null : v });
            }}
          />
        </div>
      )}
    </section>
  );
}
