import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { Input } from '../../../components/ui/input';

export function Passo8() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const [internet, setInternet] = useState(
    perfil.financeiro.internet > 0 ? String(perfil.financeiro.internet) : '',
  );

  function salvarEAvancar() {
    const internetNum = parseFloat(internet);
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: {
        ...perfil.financeiro,
        internet: !isNaN(internetNum) && internetNum > 0 ? internetNum : 0,
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
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">Valor mensal (R$)</span>
          <Input
            type="number"
            value={internet}
            onChange={(e) => setInternet(e.target.value)}
            min={0}
            step={0.01}
            placeholder="0,00"
            className="min-h-touch bg-card rounded-input border-muted text-foreground px-4 placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </label>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">Dica</p>
          <p className="text-muted-foreground text-sm">
            Este custo será diluído para calcular seu lucro líquido real por hora e quilômetro.
          </p>
        </div>
      </div>
    </PassoLayout>
  );
}
