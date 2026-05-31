import { useId } from 'react';
import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction } from '../../types/perfil';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Bike } from 'lucide-react';
import { TituloSecao } from '@/components/TituloSecao';

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: ANO_ATUAL - 1989 }, (_, i) => ANO_ATUAL + 1 - i);

interface Props {
  moto: PerfilUsuario['moto'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoVeiculo({ moto, dispatch }: Props) {
  const idKmAtual = useId();
  const idKmUltimaRevisao = useId();
  return (
    <section className="bg-card rounded-lg p-4 space-y-3">
      <TituloSecao icone={Bike}>Veículo</TituloSecao>
      <p className="text-xs text-muted-foreground/60">
        {moto.marca} · {moto.modelo}
      </p>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Ano de fabricação</p>
        <Select
          value={String(moto.ano)}
          onValueChange={(v) => dispatch({ type: 'SET_ANO_MOTO', ano: parseInt(v, 10) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANOS.map((ano) => (
              <SelectItem key={ano} value={String(ano)}>
                {ano}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={idKmAtual} className="text-xs text-muted-foreground font-normal">
            KM atual
          </Label>
          <Input
            id={idKmAtual}
            type="number"
            inputMode="numeric"
            value={moto.kmAtual}
            min={0}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 0) dispatch({ type: 'SET_KM_ATUAL', valor: v });
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={idKmUltimaRevisao} className="text-xs text-muted-foreground font-normal">
            KM última revisão
          </Label>
          <Input
            id={idKmUltimaRevisao}
            type="number"
            inputMode="numeric"
            value={moto.kmUltimaRevisao ?? ''}
            min={0}
            placeholder="—"
            onChange={(e) => {
              const raw = e.target.value;
              const v = parseInt(raw, 10);
              if (raw === '') {
                dispatch({ type: 'SET_KM_ULTIMA_REVISAO', km: null });
                return;
              }
              if (!isNaN(v) && v >= 0) {
                dispatch({ type: 'SET_KM_ULTIMA_REVISAO', km: v });
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}
