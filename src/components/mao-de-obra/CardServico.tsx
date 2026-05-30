import { useState, useEffect } from 'react';
import type { Dispatch } from 'react';
import { Input } from '@/components/ui/input';
import { BotaoReset } from '@/components/BotaoReset';
import { iconePeca } from '../icons/pecas';
import { SERVICOS_INDEPENDENTES_PADRAO } from '../../context/PerfilContext';
import type { ServicoIndependente, PerfilAction } from '../../types/perfil';

type ModoCard = 'independente' | 'autorizada';

interface Props {
  servico: ServicoIndependente;
  dispatch: Dispatch<PerfilAction>;
  modo?: ModoCard;
}

export function CardServico({ servico, dispatch, modo = 'independente' }: Props) {
  const padrao = SERVICOS_INDEPENDENTES_PADRAO.find((s) => s.id === servico.id);

  const valorAtual =
    modo === 'autorizada' ? servico.precoTotalAutorizada : servico.precoIndependente;
  const valorPadrao =
    modo === 'autorizada' ? padrao?.precoTotalAutorizada : padrao?.precoIndependente;
  const rotuloPreco =
    modo === 'autorizada'
      ? 'Preço total Honda (R$)'
      : servico.ehExcepcional
        ? 'Peças + Mão de Obra (R$)'
        : 'Preço Mão de Obra (R$)';

  const IconePeca = iconePeca(servico.id);

  const [preco, setPreco] = useState(valorAtual.toFixed(2));
  const [intervalo, setIntervalo] = useState(String(servico.intervalKm));

  useEffect(() => {
    setPreco(valorAtual.toFixed(2));
  }, [valorAtual]);

  useEffect(() => {
    setIntervalo(String(servico.intervalKm));
  }, [servico.intervalKm]);

  const temOverridePreco = valorPadrao !== undefined && valorAtual !== valorPadrao;
  const temOverrideIntervalo = padrao !== undefined && servico.intervalKm !== padrao.intervalKm;
  const temOverride = temOverridePreco || temOverrideIntervalo;

  function handleBlurPreco() {
    const num = parseFloat(preco.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setPreco(valorAtual.toFixed(2));
      return;
    }
    const payload: ServicoIndependente =
      modo === 'autorizada'
        ? { ...servico, precoTotalAutorizada: num }
        : { ...servico, precoIndependente: num };
    dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload });
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
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 min-w-0">
          <IconePeca className="w-6 h-6 text-primary shrink-0" />
          <span className="text-sm font-medium truncate min-w-0 text-foreground">
            {servico.nome}
          </span>
        </span>
        <BotaoReset
          desabilitado={!temOverride}
          onReset={() => {
            if (padrao) dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...padrao } });
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-1">
          <span className="label-neutro block">{rotuloPreco}</span>
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
