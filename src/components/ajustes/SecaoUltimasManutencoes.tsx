import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, KmUltimaTrocas } from '../../types/perfil';
import { Input } from '../ui/input';

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
  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <p className="label-neutro">Últimas manutenções</p>
      <div className="grid grid-cols-2 gap-2">
        {COMPONENTES_TROCA.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <Input
              type="number"
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
        ))}
      </div>
      {moto.kmAtual >= 60_000 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Fazer motor (KM)</p>
          <Input
            type="number"
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
