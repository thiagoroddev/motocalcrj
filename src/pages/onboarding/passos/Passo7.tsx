import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import type { PeriodicidadeSeguro } from '../../../types/perfil';

export function Passo7() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const seg = perfil.financeiro.seguro;
  const [tem, setTem] = useState(seg.tem);
  const [valorAnual, setValorAnual] = useState(String(seg.valorAnual));
  const [empresa, setEmpresa] = useState(seg.empresa ?? '');
  const [periodicidade, setPeriodicidade] = useState<PeriodicidadeSeguro>(seg.periodicidade);

  const valorNum = parseFloat(valorAnual);
  const valido = !tem || (!isNaN(valorNum) && valorNum > 0);

  function salvarEAvancar() {
    dispatch({
      type: 'SET_SEGURO',
      config: {
        tem,
        valorAnual: tem ? (periodicidade === 'mensal' ? valorNum * 12 : valorNum) : seg.valorAnual,
        empresa: tem && empresa.trim() ? empresa.trim() : null,
        periodicidade,
      },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Você tem seguro?"
      subtitulo="Seguro contra roubo, danos ou terceiros"
      aoProximo={salvarEAvancar}
      podeContinuar={valido}
    >
      <div className="flex flex-col gap-lg">
        <div className="flex gap-sm">
          {([false, true] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => setTem(v)}
              className={`flex-1 min-h-touch rounded-btn font-semibold transition-colors ${
                tem === v
                  ? 'bg-primary text-foreground'
                  : 'bg-card border border-muted text-muted-foreground'
              }`}
            >
              {v ? 'Sim' : 'Não'}
            </button>
          ))}
        </div>

        {tem && (
          <div className="flex flex-col gap-md">
            <label className="flex flex-col gap-xs">
              <span className="text-muted-foreground text-sm font-medium">
                {periodicidade === 'mensal' ? 'Valor mensal (R$)' : 'Valor anual (R$)'}
              </span>
              <input
                type="number"
                value={valorAnual}
                onChange={(e) => setValorAnual(e.target.value)}
                min={0}
                step={0.01}
                placeholder="0,00"
                className="min-h-touch bg-card rounded-input border border-muted text-foreground px-md placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
            </label>

            <div className="flex flex-col gap-xs">
              <span className="text-muted-foreground text-sm font-medium">Periodicidade</span>
              <div className="flex gap-sm">
                {(['anual', 'mensal'] as PeriodicidadeSeguro[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriodicidade(p)}
                    className={`flex-1 h-11 rounded-btn text-sm font-semibold transition-colors ${
                      periodicidade === p
                        ? 'bg-primary text-foreground'
                        : 'bg-card border border-muted text-muted-foreground'
                    }`}
                  >
                    {p === 'anual' ? 'Anual' : 'Mensal'}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-xs">
              <span className="text-muted-foreground text-sm font-medium">
                Seguradora (opcional)
              </span>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ex: Porto Seguro, HDI…"
                className="min-h-touch bg-card rounded-input border border-muted text-foreground px-md placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
            </label>
          </div>
        )}
      </div>
    </PassoLayout>
  );
}
