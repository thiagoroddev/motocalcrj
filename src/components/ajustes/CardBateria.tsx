import { useId } from 'react';
import type { Dispatch } from 'react';
import { BatteryCharging } from 'lucide-react';
import type { BateriaConfig, PerfilAction, VidaUtilBateriaAnos } from '../../types/perfil';
import { TituloSecao } from '@/components/TituloSecao';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// Bateria por tempo (TASK-RF-8). Vida útil em ANOS (2/3/4/5, default 3). O custo é
// sempre amortizado (valor ÷ vida útil em anos) — a ancoragem por data foi
// revertida na RF-8.7 (confundia mais que ajudava).
//
// Bloco embutível (TASK-RF-8.8): não tem chrome de card próprio — é renderizado
// dentro de `SecaoUltimasManutencoes`, junto dos demais registros.
const VIDAS_UTEIS: VidaUtilBateriaAnos[] = [2, 3, 4, 5];

interface Props {
  bateria: BateriaConfig;
  dispatch: Dispatch<PerfilAction>;
}

export function CardBateria({ bateria, dispatch }: Props) {
  const idVida = useId();

  return (
    <div className="space-y-3">
      <TituloSecao icone={BatteryCharging}>Bateria</TituloSecao>
      <div className="space-y-1">
        <Label htmlFor={idVida} className="text-xs text-foreground font-medium">
          Vida útil
        </Label>
        <Select
          value={String(bateria.vidaUtilAnos)}
          onValueChange={(valor) =>
            dispatch({
              type: 'SET_BATERIA_VIDA_UTIL',
              anos: Number(valor) as VidaUtilBateriaAnos,
            })
          }
        >
          <SelectTrigger id={idVida} aria-label="Vida útil da bateria em anos">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIDAS_UTEIS.map((anos) => (
              <SelectItem key={anos} value={String(anos)}>
                {anos} anos
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground/70">
        A bateria envelhece por tempo. O custo é distribuído pela vida útil (valor ÷{' '}
        {bateria.vidaUtilAnos} anos).
      </p>
    </div>
  );
}
