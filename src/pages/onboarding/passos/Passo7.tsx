import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { PeriodicidadeSeguro } from '../../../types/perfil';

export function Passo7() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const seg = perfil.financeiro.seguro;
  const [tem, setTem] = useState(seg.valorAnual > 0);
  const [valorAnual, setValorAnual] = useState(String(seg.valorAnual));
  const [empresa, setEmpresa] = useState(seg.empresa ?? '');
  const [periodicidade, setPeriodicidade] = useState<PeriodicidadeSeguro>(seg.periodicidade);

  const valorNum = parseFloat(valorAnual);
  const valido = !tem || (!isNaN(valorNum) && valorNum > 0);

  function salvarEAvancar() {
    dispatch({
      type: 'SET_SEGURO',
      config: {
        valorAnual: tem ? (periodicidade === 'mensal' ? valorNum * 12 : valorNum) : 0,
        empresa: tem && empresa.trim() ? empresa.trim() : null,
        periodicidade,
      },
    });
    irParaProximo();
  }

  const toggleClassName = (ativo: boolean) =>
    `flex-1 min-h-touch rounded-btn font-semibold transition-colors ${
      ativo
        ? 'bg-primary text-foreground hover:bg-primary/90'
        : 'bg-card border border-muted text-muted-foreground hover:bg-muted/50'
    }`;

  const inputClassName =
    'min-h-touch bg-card rounded-input border-muted text-foreground px-4 placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0';

  return (
    <PassoLayout
      titulo="Você tem seguro?"
      subtitulo="Seguro contra roubo, danos ou terceiros"
      aoProximo={salvarEAvancar}
      podeContinuar={valido}
    >
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          {([false, true] as const).map((v) => (
            <Button
              key={String(v)}
              onClick={() => setTem(v)}
              className={toggleClassName(tem === v)}
            >
              {v ? 'Sim' : 'Não'}
            </Button>
          ))}
        </div>

        {tem && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm font-medium">
                {periodicidade === 'mensal' ? 'Valor mensal (R$)' : 'Valor anual (R$)'}
              </span>
              <Input
                type="number"
                value={valorAnual}
                onChange={(e) => setValorAnual(e.target.value)}
                min={0}
                step={0.01}
                placeholder="0,00"
                className={inputClassName}
              />
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm font-medium">Periodicidade</span>
              <div className="flex gap-2">
                {(['anual', 'mensal'] as PeriodicidadeSeguro[]).map((p) => (
                  <Button
                    key={p}
                    onClick={() => setPeriodicidade(p)}
                    className={toggleClassName(periodicidade === p)}
                  >
                    {p === 'anual' ? 'Anual' : 'Mensal'}
                  </Button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm font-medium">
                Seguradora (opcional)
              </span>
              <Input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ex: Porto Seguro, HDI…"
                className={inputClassName}
              />
            </label>
          </div>
        )}
      </div>
    </PassoLayout>
  );
}
