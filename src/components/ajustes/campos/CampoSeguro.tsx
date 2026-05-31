import { useEffect, useId, useState } from 'react';
import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, PeriodicidadeSeguro } from '../../../types/perfil';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { BotaoReset } from '../../BotaoReset';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Shield } from 'lucide-react';
import { TituloSecao } from '@/components/TituloSecao';
import {
  formatarValorSeguroParaInput,
  rotuloValorSeguro,
  valorSeguroAnualizado,
} from '../../../utils/seguro';

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

export function CampoSeguro({ financeiro, dispatch }: Props) {
  const idValor = useId();
  const { seguro } = financeiro;
  // valorAnual é canônico; o input edita o valor exibido por periodicidade. String
  // local + commit no onBlur (padrão CardServico/CardCombustivel) evita o reformat a
  // cada tecla que colapsava a digitação multi-dígito — ver TASK-BG-017 (revisão).
  const valorDerivado = formatarValorSeguroParaInput(seguro.valorAnual, seguro.periodicidade);
  const [valorInput, setValorInput] = useState(valorDerivado);
  useEffect(() => {
    setValorInput(valorDerivado);
  }, [valorDerivado]);

  function salvarValor() {
    const v = parseFloat(valorInput);
    if (isNaN(v) || v < 0) {
      setValorInput(valorDerivado);
      return;
    }
    dispatch({
      type: 'SET_SEGURO',
      config: { valorAnual: valorSeguroAnualizado(v, seguro.periodicidade) },
    });
  }

  return (
    <section className="bg-card rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <TituloSecao icone={Shield}>Seguro</TituloSecao>
        <BotaoReset
          desabilitado={seguro.valorAnual === 0 && seguro.periodicidade === 'anual'}
          onReset={() =>
            dispatch({ type: 'SET_SEGURO', config: { valorAnual: 0, periodicidade: 'anual' } })
          }
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={idValor} className="text-xs text-muted-foreground font-normal">
          {rotuloValorSeguro(seguro.periodicidade)}
        </Label>
        <Input
          id={idValor}
          type="number"
          inputMode="decimal"
          value={valorInput}
          min={0}
          step={0.01}
          onChange={(e) => setValorInput(e.target.value)}
          onBlur={salvarValor}
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
  );
}
