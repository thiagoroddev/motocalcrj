import { useState, useEffect, useId } from 'react';
import type { Dispatch } from 'react';
import { Fuel } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BotaoReset } from '@/components/BotaoReset';
import type { PerfilAction, TipoCombustivel, ConfiguracaoCombustivel } from '../../types/perfil';

const NOME_COMBUSTIVEL: Record<TipoCombustivel, string> = {
  comum: 'Gasolina Comum',
  aditivada: 'Gasolina Aditivada',
  etanol: 'Etanol',
};

interface Props {
  tipo: TipoCombustivel;
  config: ConfiguracaoCombustivel;
  padrao: ConfiguracaoCombustivel;
  ehPreferido: boolean;
  dispatch: Dispatch<PerfilAction>;
}

export function CardCombustivel({ tipo, config, padrao, ehPreferido, dispatch }: Props) {
  const idPreco = useId();
  const idAutonomia = useId();
  const [preco, setPreco] = useState(config.preco.toFixed(2));
  const [autonomia, setAutonomia] = useState(config.autonomia.toFixed(1));

  useEffect(() => {
    setPreco(config.preco.toFixed(2));
  }, [config.preco]);
  useEffect(() => {
    setAutonomia(config.autonomia.toFixed(1));
  }, [config.autonomia]);

  const temOverridePreco = Math.abs(config.preco - padrao.preco) >= 0.01;
  const temOverrideAutonomia = Math.abs(config.autonomia - padrao.autonomia) >= 0.1;
  const temOverride = temOverridePreco || temOverrideAutonomia;

  function handleBlurPreco() {
    const num = parseFloat(preco.replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      setPreco(config.preco.toFixed(2));
      return;
    }
    dispatch({ type: 'SET_COMBUSTIVEL', tipo, campo: 'preco', valor: num });
  }

  function handleBlurAutonomia() {
    const num = parseFloat(autonomia.replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      setAutonomia(config.autonomia.toFixed(1));
      return;
    }
    dispatch({ type: 'SET_COMBUSTIVEL', tipo, campo: 'autonomia', valor: num });
  }

  function resetar() {
    dispatch({ type: 'SET_COMBUSTIVEL', tipo, campo: 'preco', valor: padrao.preco });
    dispatch({ type: 'SET_COMBUSTIVEL', tipo, campo: 'autonomia', valor: padrao.autonomia });
  }

  return (
    <div className="bg-card rounded-lg p-md space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm min-w-0">
          <Fuel className="w-6 h-6 text-primary shrink-0" aria-hidden="true" />
          {ehPreferido && <span className="text-xs text-primary">●</span>}
          <span className="text-sm font-medium truncate">{NOME_COMBUSTIVEL[tipo]}</span>
          {ehPreferido && (
            <span className="text-xs text-primary font-medium shrink-0">Preferido</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!ehPreferido && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground px-2"
              onClick={() => dispatch({ type: 'SET_TIPO_COMBUSTIVEL_PREFERIDO', tipo })}
            >
              Usar este
            </Button>
          )}
          <BotaoReset desabilitado={!temOverride} onReset={resetar} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-1">
          <Label htmlFor={idPreco} className="label-neutro block font-normal">
            Preço (R$/L)
          </Label>
          <Input
            id={idPreco}
            type="number"
            inputMode="decimal"
            className={`rounded-input bg-input min-h-touch text-sm${temOverridePreco ? ' border-primary' : ''}`}
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onBlur={handleBlurPreco}
            min={0.01}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={idAutonomia} className="label-neutro block font-normal">
            Autonomia (km/L)
          </Label>
          <Input
            id={idAutonomia}
            type="number"
            inputMode="decimal"
            className={`rounded-input bg-input min-h-touch text-sm${temOverrideAutonomia ? ' border-primary' : ''}`}
            value={autonomia}
            onChange={(e) => setAutonomia(e.target.value)}
            onBlur={handleBlurAutonomia}
            min={0.1}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}
