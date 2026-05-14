import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';

export function Passo9() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const [comeNaRua, setComeNaRua] = useState(perfil.financeiro.alimentacaoDia > 0);
  const [gastoDia, setGastoDia] = useState(
    perfil.financeiro.alimentacaoDia > 0 ? String(perfil.financeiro.alimentacaoDia) : '20',
  );

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: {
        ...perfil.financeiro,
        alimentacaoDia: comeNaRua ? parseFloat(gastoDia) || 0 : 0,
      },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Alimentação no trabalho"
      subtitulo="Você costuma comer fora durante o expediente?"
      aoProximo={salvarEAvancar}
      textoBotao="Próximo →"
    >
      <div className="flex flex-col gap-md">
        <div className="grid grid-cols-2 gap-sm">
          <button
            type="button"
            onClick={() => setComeNaRua(true)}
            className={`flex flex-col items-center gap-xs p-md rounded-card border-2 transition-colors ${
              comeNaRua
                ? 'border-primary bg-primary/10 text-white'
                : 'border-surface-bright bg-surface-cont text-neutral'
            }`}
          >
            <span className="text-2xl">🍴</span>
            <span className="text-sm font-medium text-center">Sim, como na rua</span>
          </button>

          <button
            type="button"
            onClick={() => setComeNaRua(false)}
            className={`flex flex-col items-center gap-xs p-md rounded-card border-2 transition-colors ${
              !comeNaRua
                ? 'border-primary bg-primary/10 text-white'
                : 'border-surface-bright bg-surface-cont text-neutral'
            }`}
          >
            <span className="text-2xl">🥡</span>
            <span className="text-sm font-medium text-center">Não, levo de casa</span>
          </button>
        </div>

        {comeNaRua && (
          <label className="flex flex-col gap-xs">
            <span className="text-neutral text-sm font-medium">Gasto médio por dia (R$)</span>
            <input
              type="number"
              value={gastoDia}
              onChange={(e) => setGastoDia(e.target.value)}
              min={0}
              step={0.01}
              placeholder="20,00"
              className="min-h-touch bg-surface-cont rounded-input border border-surface-bright text-white px-md placeholder:text-neutral/50 focus:outline-none focus:border-primary"
            />
          </label>
        )}

        <p className="text-neutral/50 text-xs text-center">
          Fique tranquilo! Estes valores podem ser atualizados a qualquer momento em Configurações.
        </p>
      </div>
    </PassoLayout>
  );
}
