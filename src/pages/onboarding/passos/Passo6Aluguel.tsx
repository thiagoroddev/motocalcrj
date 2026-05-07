import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import type { PeriodicidadeAluguel } from '../../../types/perfil';

export function Passo6Aluguel() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const fin = perfil.financeiro;
  const [aluguel, setAluguel] = useState(
    fin.aluguelMensal != null ? String(fin.aluguelMensal) : '',
  );
  const [periodicidade, setPeriodicidade] = useState<PeriodicidadeAluguel>(
    fin.aluguelPeriodicidade ?? 'mensal',
  );

  const aluguelNum = parseFloat(aluguel);
  const valido = !isNaN(aluguelNum) && aluguelNum > 0;

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: { ...fin, aluguelMensal: aluguelNum, aluguelPeriodicidade: periodicidade },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Detalhes do aluguel"
      subtitulo="Quanto você paga e com qual frequência"
      aoProximo={salvarEAvancar}
      podeContinuar={valido}
    >
      <div className="flex flex-col gap-md">
        <label className="flex flex-col gap-xs">
          <span className="text-neutral text-sm font-medium">Valor do aluguel (R$)</span>
          <input
            type="number"
            value={aluguel}
            onChange={(e) => setAluguel(e.target.value)}
            min={0}
            step={0.01}
            placeholder="0,00"
            className="min-h-touch bg-surface-cont rounded-input border border-surface-bright text-white px-md placeholder:text-neutral/50 focus:outline-none focus:border-primary"
          />
        </label>

        <div className="flex flex-col gap-xs">
          <span className="text-neutral text-sm font-medium">Periodicidade</span>
          <div className="flex gap-sm">
            {(['mensal', 'semanal'] as PeriodicidadeAluguel[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodicidade(p)}
                className={`flex-1 h-11 rounded-btn text-sm font-semibold transition-colors ${
                  periodicidade === p
                    ? 'bg-primary text-white'
                    : 'bg-surface-cont border border-surface-bright text-neutral'
                }`}
              >
                {p === 'mensal' ? 'Mensal' : 'Semanal'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PassoLayout>
  );
}
