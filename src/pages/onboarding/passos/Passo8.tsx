import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';

export function Passo8() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const fin = perfil.financeiro;
  const [internet, setInternet] = useState(fin.internet > 0 ? String(fin.internet) : '');
  const [alimentacao, setAlimentacao] = useState(
    fin.alimentacaoDia > 0 ? String(fin.alimentacaoDia) : '',
  );

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: {
        ...fin,
        internet: parseFloat(internet) || 0,
        alimentacaoDia: parseFloat(alimentacao) || 0,
      },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Gastos operacionais"
      subtitulo="Plano de dados e alimentação no dia a dia"
      aoProximo={salvarEAvancar}
    >
      <div className="flex flex-col gap-md">
        <label className="flex flex-col gap-xs">
          <span className="text-neutral text-sm font-medium">Internet (R$/mês)</span>
          <span className="text-neutral/60 text-xs">Plano de dados para apps de entrega</span>
          <input
            type="number"
            value={internet}
            onChange={(e) => setInternet(e.target.value)}
            min={0}
            step={0.01}
            placeholder="0,00"
            className="min-h-touch bg-surface-cont rounded-input border border-surface-bright text-white px-md placeholder:text-neutral/50 focus:outline-none focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-xs">
          <span className="text-neutral text-sm font-medium">Alimentação (R$/dia)</span>
          <span className="text-neutral/60 text-xs">Valor médio por dia trabalhado</span>
          <input
            type="number"
            value={alimentacao}
            onChange={(e) => setAlimentacao(e.target.value)}
            min={0}
            step={0.01}
            placeholder="0,00"
            className="min-h-touch bg-surface-cont rounded-input border border-surface-bright text-white px-md placeholder:text-neutral/50 focus:outline-none focus:border-primary"
          />
        </label>
      </div>
    </PassoLayout>
  );
}
