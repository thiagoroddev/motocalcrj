import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';

export function Passo8() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const [internet, setInternet] = useState(
    perfil.financeiro.internet > 0 ? String(perfil.financeiro.internet) : '',
  );

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: {
        ...perfil.financeiro,
        internet: parseFloat(internet) || 0,
      },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Plano de Internet"
      subtitulo="Plano de dados para os apps de entrega"
      aoProximo={salvarEAvancar}
    >
      <div className="flex flex-col gap-md">
        <label className="flex flex-col gap-xs">
          <span className="text-muted-foreground text-sm font-medium">Valor mensal (R$)</span>
          <input
            type="number"
            value={internet}
            onChange={(e) => setInternet(e.target.value)}
            min={0}
            step={0.01}
            placeholder="0,00"
            className="min-h-touch bg-card rounded-input border border-muted text-foreground px-md placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
          />
        </label>

        <div className="bg-primary/10 border border-primary/30 rounded-card p-md">
          <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-xs">Dica</p>
          <p className="text-muted-foreground text-sm">
            Este custo será diluído para calcular seu lucro líquido real por hora e quilômetro.
          </p>
        </div>
      </div>
    </PassoLayout>
  );
}
