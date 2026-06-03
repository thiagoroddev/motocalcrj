import { useState, useEffect } from 'react';
import type { Dispatch } from 'react';
import { Input } from '@/components/ui/input';
import { BotaoReset } from '@/components/BotaoReset';
import { iconePeca } from '../icons/pecas';
import { SERVICOS_INDEPENDENTES_PADRAO } from '../../context/PerfilContext';
import { resolverStatusPrecoAutorizada } from '../../utils/statusPrecoAutorizada';
import type { ServicoIndependente, PerfilAction } from '../../types/perfil';

type ModoCard = 'independente' | 'autorizada';

interface Props {
  servico: ServicoIndependente;
  servicoPadrao?: ServicoIndependente;
  dispatch: Dispatch<PerfilAction>;
  modo?: ModoCard;
}

export function CardServico({ servico, servicoPadrao, dispatch, modo = 'independente' }: Props) {
  const padrao = servicoPadrao ?? SERVICOS_INDEPENDENTES_PADRAO.find((s) => s.id === servico.id);
  const statusAutorizada = resolverStatusPrecoAutorizada(servico);
  const statusPadrao = padrao ? resolverStatusPrecoAutorizada(padrao) : undefined;

  const valorAtual =
    modo === 'autorizada'
      ? statusAutorizada === 'nao_informado'
        ? 0
        : servico.precoTotalAutorizada
      : servico.precoIndependente;
  const valorPadrao =
    modo === 'autorizada'
      ? statusPadrao === 'nao_informado'
        ? 0
        : padrao?.precoTotalAutorizada
      : padrao?.precoIndependente;
  const rotuloPreco =
    modo === 'autorizada'
      ? 'Preço completo concessionária (R$)'
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

  const temOverridePreco =
    valorPadrao !== undefined &&
    (valorAtual !== valorPadrao || (modo === 'autorizada' && statusAutorizada !== statusPadrao));
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
        ? {
            ...servico,
            precoTotalAutorizada: num,
            statusPrecoAutorizada: num > 0 ? 'informado_usuario' : 'nao_informado',
          }
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
    <div className="bg-card rounded-lg p-4 space-y-2">
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
      <div className="grid grid-cols-2 gap-2">
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
          {modo === 'autorizada' && statusAutorizada === 'nao_informado' && (
            <p className="text-[10px] leading-tight text-warning">
              Valor de concessionária ainda não informado.
            </p>
          )}
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
