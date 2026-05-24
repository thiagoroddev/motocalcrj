import { useState, useEffect, forwardRef } from 'react';
import type { Dispatch } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { BotaoReset } from '@/components/BotaoReset';
import type { RevisaoAutorizadaPreset } from '../../types/calculos';
import type { PerfilAction, RevisaoAutorizadaOverride } from '../../types/perfil';

interface Props {
  index: number;
  revisao: RevisaoAutorizadaPreset;
  override: RevisaoAutorizadaOverride | null;
  dispatch: Dispatch<PerfilAction>;
  destacado?: boolean;
}

export const LinhaRevisaoHonda = forwardRef<HTMLDivElement, Props>(function LinhaRevisaoHonda(
  { index, revisao, override, dispatch, destacado = false },
  ref,
) {
  const pecasEfetivas = override?.precoPecas ?? revisao.precoPecas;
  const moEfetiva = override?.precoMaoDeObra ?? revisao.precoMaoDeObra;

  const [pecas, setPecas] = useState(pecasEfetivas.toFixed(2));
  const [mo, setMo] = useState(moEfetiva.toFixed(2));

  useEffect(() => {
    setPecas((override?.precoPecas ?? revisao.precoPecas).toFixed(2));
  }, [override?.precoPecas, revisao.precoPecas]);

  useEffect(() => {
    setMo((override?.precoMaoDeObra ?? revisao.precoMaoDeObra).toFixed(2));
  }, [override?.precoMaoDeObra, revisao.precoMaoDeObra]);

  const temOverride = override !== null;
  const totalEfetivo = override?.precoTotal ?? revisao.precoTotal;
  const temOverridePecas =
    temOverride && Math.abs((override?.precoPecas ?? 0) - revisao.precoPecas) >= 0.01;
  const temOverrideMo =
    temOverride && Math.abs((override?.precoMaoDeObra ?? 0) - revisao.precoMaoDeObra) >= 0.01;

  function commitPecas(numPecas: number) {
    const moAtual = override?.precoMaoDeObra ?? revisao.precoMaoDeObra;
    const ambosIguaisAoPreset =
      Math.abs(numPecas - revisao.precoPecas) < 0.01 &&
      Math.abs(moAtual - revisao.precoMaoDeObra) < 0.01;
    if (ambosIguaisAoPreset) {
      if (temOverride) dispatch({ type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE', index });
    } else {
      dispatch({
        type: 'SET_REVISAO_AUTORIZADA_OVERRIDE',
        index,
        precoPecas: numPecas,
        precoMaoDeObra: moAtual,
      });
    }
  }

  function commitMo(numMo: number) {
    const pecasAtual = override?.precoPecas ?? revisao.precoPecas;
    const ambosIguaisAoPreset =
      Math.abs(pecasAtual - revisao.precoPecas) < 0.01 &&
      Math.abs(numMo - revisao.precoMaoDeObra) < 0.01;
    if (ambosIguaisAoPreset) {
      if (temOverride) dispatch({ type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE', index });
    } else {
      dispatch({
        type: 'SET_REVISAO_AUTORIZADA_OVERRIDE',
        index,
        precoPecas: pecasAtual,
        precoMaoDeObra: numMo,
      });
    }
  }

  function handleBlurPecas() {
    const num = parseFloat(pecas.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setPecas(pecasEfetivas.toFixed(2));
      return;
    }
    commitPecas(num);
  }

  function handleBlurMo() {
    const num = parseFloat(mo.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setMo(moEfetiva.toFixed(2));
      return;
    }
    commitMo(num);
  }

  return (
    <div
      ref={ref}
      className={`bg-card rounded-lg p-md space-y-1.5 transition-shadow${destacado ? ' ring-2 ring-primary' : ''}`}
    >
      <span className="label-neutro block">
        {revisao.intervaloKm.toLocaleString('pt-BR')} km · {revisao.intervaloMeses} meses
      </span>
      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-1">
          <span className="label-neutro block">Peças (R$)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverridePecas ? ' border-primary' : ''}`}
            value={pecas}
            onChange={(e) => setPecas(e.target.value)}
            onBlur={handleBlurPecas}
            min={0}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <span className="label-neutro block">Mão de obra (R$)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverrideMo ? ' border-primary' : ''}`}
            value={mo}
            onChange={(e) => setMo(e.target.value)}
            onBlur={handleBlurMo}
            min={0}
            step={0.01}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Total:{' '}
          <span className={temOverride ? 'text-foreground' : ''}>
            R${' '}
            {totalEfetivo.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </span>
        <BotaoReset
          desabilitado={!temOverride}
          onReset={() => dispatch({ type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE', index })}
        />
      </div>
      <Accordion
        type="single"
        collapsible
        className="rounded-md border border-border/70 bg-background/40"
      >
        <AccordionItem value={`detalhes-${index}`} className="border-0">
          <AccordionTrigger className="px-sm py-2 text-xs font-medium text-muted-foreground hover:no-underline">
            O que entra nesta revisão
          </AccordionTrigger>
          <AccordionContent className="px-sm pb-sm pt-0">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-foreground">Peças substituídas</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
                  {revisao.itensSubstituidos.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Serviços executados</p>
                <div className="mt-1 space-y-2">
                  {revisao.servicosExecutados.map((grupo) => (
                    <div key={grupo.categoria}>
                      <p className="text-xs font-medium text-muted-foreground">{grupo.categoria}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {grupo.servicos.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
});
