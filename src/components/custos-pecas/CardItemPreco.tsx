import { useState, useEffect, useId } from 'react';
import type { Dispatch } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BotaoReset } from '@/components/BotaoReset';
import { iconePeca } from '../icons/pecas';
import type { PerfilAction, PecaOverride } from '../../types/perfil';

interface Props {
  id: string;
  nome: string;
  precoOriginal: number;
  precoParalela: number;
  intervaloKm: number;
  override: PecaOverride | null;
  dispatch: Dispatch<PerfilAction>;
  mostrarDicaAbaMO?: boolean;
}

export function CardItemPreco({
  id,
  nome,
  precoOriginal,
  precoParalela,
  intervaloKm,
  override,
  dispatch,
  mostrarDicaAbaMO = true,
}: Props) {
  const idOriginal = useId();
  const idParalela = useId();
  const IconePeca = iconePeca(id);

  const originalEfetivo = override?.precoEditadoOriginal ?? precoOriginal;
  const paralelaEfetiva = override?.precoEditadaParalela ?? precoParalela;

  const [localOriginal, setLocalOriginal] = useState(originalEfetivo.toFixed(2));
  const [localParalela, setLocalParalela] = useState(paralelaEfetiva.toFixed(2));

  useEffect(() => {
    setLocalOriginal(originalEfetivo.toFixed(2));
  }, [originalEfetivo]);
  useEffect(() => {
    setLocalParalela(paralelaEfetiva.toFixed(2));
  }, [paralelaEfetiva]);

  const temOverride =
    override?.precoEditadoOriginal != null || override?.precoEditadaParalela != null;

  function handleBlurOriginal() {
    const num = parseFloat(localOriginal.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setLocalOriginal(originalEfetivo.toFixed(2));
      return;
    }
    if (Math.abs(num - precoOriginal) < 0.01) {
      if (override?.precoEditadoOriginal != null)
        dispatch({ type: 'RESET_PECA_OVERRIDE', id, campo: 'precoOriginal' });
      return;
    }
    dispatch({ type: 'SET_PECA_OVERRIDE', id, campo: 'precoOriginal', valor: num });
  }

  function handleBlurParalela() {
    const num = parseFloat(localParalela.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setLocalParalela(paralelaEfetiva.toFixed(2));
      return;
    }
    if (Math.abs(num - precoParalela) < 0.01) {
      if (override?.precoEditadaParalela != null)
        dispatch({ type: 'RESET_PECA_OVERRIDE', id, campo: 'precoParalela' });
      return;
    }
    dispatch({ type: 'SET_PECA_OVERRIDE', id, campo: 'precoParalela', valor: num });
  }

  return (
    <div className="bg-card rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 min-w-0">
          <IconePeca className="w-6 h-6 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">{nome}</span>
        </span>
        <BotaoReset
          desabilitado={!temOverride}
          onReset={() => dispatch({ type: 'RESET_PECA_OVERRIDE', id })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={idOriginal} className="label-neutro block font-normal">
            Original (R$)
          </Label>
          <Input
            id={idOriginal}
            type="number"
            inputMode="decimal"
            className={`rounded-input bg-input min-h-touch text-sm${override?.precoEditadoOriginal != null ? ' border-primary' : ''}`}
            value={localOriginal}
            onChange={(e) => setLocalOriginal(e.target.value)}
            onBlur={handleBlurOriginal}
            min={0}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={idParalela} className="label-neutro block font-normal">
            Paralela (R$)
          </Label>
          <Input
            id={idParalela}
            type="number"
            inputMode="decimal"
            className={`rounded-input bg-input min-h-touch text-sm${override?.precoEditadaParalela != null ? ' border-primary' : ''}`}
            value={localParalela}
            onChange={(e) => setLocalParalela(e.target.value)}
            onBlur={handleBlurParalela}
            min={0}
            step={0.01}
          />
        </div>
      </div>

      {mostrarDicaAbaMO && (
        <p className="text-[10px] text-muted-foreground/50 leading-tight">
          Vida útil: {intervaloKm.toLocaleString('pt-BR')} km · Alterar na aba M. Obra
        </p>
      )}
    </div>
  );
}
