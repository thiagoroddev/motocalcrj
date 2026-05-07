import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';

export function Passo5() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();
  const [kmPorDia, setKmPorDia] = useState(String(perfil.trabalho.kmPorDia));
  const [diasPorSemana, setDiasPorSemana] = useState(perfil.trabalho.diasPorSemana);

  const kmNum = parseInt(kmPorDia, 10);
  const valido = !isNaN(kmNum) && kmNum > 0;

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'trabalho',
      valor: { ...perfil.trabalho, kmPorDia: kmNum, diasPorSemana },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Quanto você roda?"
      subtitulo="Informe a distância média e os dias trabalhados"
      aoProximo={salvarEAvancar}
      podeContinuar={valido}
    >
      <div className="flex flex-col gap-lg">
        <label className="flex flex-col gap-xs">
          <span className="text-neutral text-sm font-medium">Km por dia</span>
          <input
            type="number"
            value={kmPorDia}
            onChange={(e) => setKmPorDia(e.target.value)}
            min={1}
            placeholder="70"
            className="min-h-touch bg-surface-cont rounded-input border border-surface-bright text-white px-md placeholder:text-neutral/50 focus:outline-none focus:border-primary"
          />
        </label>

        <div className="flex flex-col gap-sm">
          <span className="text-neutral text-sm font-medium">Dias por semana</span>
          <div className="flex gap-xs">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiasPorSemana(d)}
                className={`flex-1 h-11 rounded-btn text-sm font-semibold transition-colors ${
                  diasPorSemana === d
                    ? 'bg-primary text-white'
                    : 'bg-surface-cont border border-surface-bright text-neutral'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PassoLayout>
  );
}
