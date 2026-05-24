import { useState, useEffect } from 'react';
import type { Dispatch } from 'react';
import { Input } from '@/components/ui/input';
import { BotaoReset } from '@/components/BotaoReset';
import { SERVICOS_INDEPENDENTES_PADRAO } from '../../context/PerfilContext';
import type { ServicoIndependente, PerfilAction } from '../../types/perfil';

interface Props {
  servico: ServicoIndependente;
  dispatch: Dispatch<PerfilAction>;
}

export function CardServico({ servico, dispatch }: Props) {
  const padrao = SERVICOS_INDEPENDENTES_PADRAO.find((s) => s.id === servico.id);

  const [preco, setPreco] = useState(servico.precoMaoDeObra.toFixed(2));
  const [intervalo, setIntervalo] = useState(String(servico.intervalKm));

  useEffect(() => {
    setPreco(servico.precoMaoDeObra.toFixed(2));
  }, [servico.precoMaoDeObra]);

  useEffect(() => {
    setIntervalo(String(servico.intervalKm));
  }, [servico.intervalKm]);

  const temOverridePreco = padrao !== undefined && servico.precoMaoDeObra !== padrao.precoMaoDeObra;
  const temOverrideIntervalo = padrao !== undefined && servico.intervalKm !== padrao.intervalKm;
  const temOverride = temOverridePreco || temOverrideIntervalo;

  function handleBlurPreco() {
    const num = parseFloat(preco.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setPreco(servico.precoMaoDeObra.toFixed(2));
      return;
    }
    dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...servico, precoMaoDeObra: num } });
  }

  function handleBlurIntervalo() {
    const num = parseInt(intervalo, 10);
    if (isNaN(num) || num <= 0) {
      setIntervalo(String(servico.intervalKm));
      return;
    }
    dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...servico, intervalKm: num } });
  }

  return (
    <div className="bg-card rounded-lg p-md space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium truncate min-w-0 text-foreground">{servico.nome}</span>
        <BotaoReset
          desabilitado={!temOverride}
          onReset={() => {
            if (padrao) dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...padrao } });
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-1">
          <span className="label-neutro block">
            {servico.ehExcepcional ? 'Peças + MO (R$)' : 'Preço MO (R$)'}
          </span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverridePreco ? ' border-primary' : ''}`}
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onBlur={handleBlurPreco}
            min={0}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <span className="label-neutro block">Intervalo (km)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverrideIntervalo ? ' border-primary' : ''}`}
            value={intervalo}
            onChange={(e) => setIntervalo(e.target.value)}
            onBlur={handleBlurIntervalo}
            min={0}
            step={500}
          />
        </div>
      </div>
    </div>
  );
}
