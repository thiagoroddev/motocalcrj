import { useId } from 'react';
import type { Dispatch } from 'react';
import { BatteryCharging } from 'lucide-react';
import type { BateriaConfig, PerfilAction, VidaUtilBateriaAnos } from '../../types/perfil';
import { TituloSecao } from '@/components/TituloSecao';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { proximaTrocaBateria } from '../../utils/calculos';

// Bateria por tempo (TASK-RF-8.3). Card próprio em Ajustes/onboarding: data da
// última troca (AAAA-MM) + vida útil em ANOS (2/3/4/5). O custo é amortizado pela
// vida útil; a data só estima idade e próxima troca (não altera o custo).
const VIDAS_UTEIS: VidaUtilBateriaAnos[] = [2, 3, 4, 5];

function formatarAnoMes(anoMes: string): string {
  const [ano, mes] = anoMes.split('-');
  return `${mes}/${ano}`;
}

interface Props {
  bateria: BateriaConfig;
  anoMoto: number;
  dispatch: Dispatch<PerfilAction>;
}

export function CardBateria({ bateria, anoMoto, dispatch }: Props) {
  const idData = useId();
  const idVida = useId();
  const { proximaAnoMes, atrasoMeses } = proximaTrocaBateria(
    bateria.ultimaTrocaAnoMes,
    bateria.vidaUtilAnos,
    anoMoto,
  );

  return (
    <section className="bg-card rounded-lg p-4 space-y-3">
      <TituloSecao icone={BatteryCharging}>Bateria</TituloSecao>
      <div className="grid grid-cols-2 gap-x-2 gap-y-3">
        <div className="space-y-1">
          <Label htmlFor={idData} className="text-xs text-foreground font-medium">
            Última troca
          </Label>
          <Input
            id={idData}
            type="month"
            value={bateria.ultimaTrocaAnoMes ?? ''}
            onChange={(e) =>
              dispatch({
                type: 'SET_BATERIA_ULTIMA_TROCA',
                anoMes: e.target.value === '' ? null : e.target.value,
              })
            }
          />
        </div>
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
      </div>
      <p className="text-xs text-muted-foreground/70">
        {bateria.ultimaTrocaAnoMes
          ? `Próxima troca prevista: ${formatarAnoMes(proximaAnoMes)}`
          : `Sem data — idade estimada desde ${anoMoto}. Próxima troca prevista: ${formatarAnoMes(
              proximaAnoMes,
            )}`}
        {atrasoMeses > 0
          ? ` · atrasada ~${atrasoMeses} ${atrasoMeses === 1 ? 'mês' : 'meses'}`
          : ''}
      </p>
    </section>
  );
}
