import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import type { KmUltimaTrocas } from '../../../types/perfil';

const ITENS: { key: keyof KmUltimaTrocas; label: string }[] = [
  { key: 'oleo', label: 'Troca de óleo' },
  { key: 'pneuDianteiro', label: 'Pneu dianteiro' },
  { key: 'pneuTraseiro', label: 'Pneu traseiro' },
  { key: 'kitRelacao', label: 'Kit relação' },
];

export function Passo5Trocas() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();
  const [marcados, setMarcados] = useState<Set<keyof KmUltimaTrocas>>(new Set());
  const [motorMarcado, setMotorMarcado] = useState(false);

  const { kmUltimaRevisao, kmAtual } = perfil.moto;
  const mostrarMotor = kmAtual >= 60_000;

  function toggleItem(key: keyof KmUltimaTrocas) {
    setMarcados((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function aoProximo() {
    const kmRevisao = kmUltimaRevisao ?? 0;
    if (marcados.size > 0) {
      dispatch({
        type: 'MARCAR_TROCAS_REVISAO',
        componentesMarcados: Array.from(marcados),
        kmRevisao,
      });
    }
    if (motorMarcado) {
      dispatch({ type: 'SET_MOTOR_REFEITO', km: kmRevisao });
    }
    irParaProximo();
  }

  const subtitulo =
    kmUltimaRevisao != null
      ? `Na revisão de ${kmUltimaRevisao.toLocaleString('pt-BR')} km`
      : 'Passo opcional';

  return (
    <PassoLayout
      titulo="O que foi trocado?"
      subtitulo={subtitulo}
      aoProximo={aoProximo}
      podeContinuar
    >
      <div className="flex flex-col gap-sm">
        {kmUltimaRevisao == null && (
          <p className="text-xs text-muted-foreground/60 px-xs pb-xs">
            Sem km de referência — itens marcados serão salvos com km&nbsp;0.
          </p>
        )}

        {ITENS.map(({ key, label }) => {
          const checked = marcados.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleItem(key)}
              className={`flex items-center gap-3 w-full p-md min-h-touch rounded-lg border transition-colors text-left ${
                checked ? 'border-primary bg-primary/20' : 'border-muted bg-card'
              }`}
            >
              <span
                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  checked ? 'bg-primary border-primary text-foreground' : 'border-muted'
                }`}
              >
                {checked && (
                  <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="w-3 h-3">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className={`text-sm font-medium ${checked ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
            </button>
          );
        })}

        {mostrarMotor && (
          <button
            type="button"
            onClick={() => setMotorMarcado((v) => !v)}
            className={`flex items-center gap-3 w-full p-md min-h-touch rounded-lg border transition-colors text-left ${
              motorMarcado ? 'border-primary bg-primary/20' : 'border-muted bg-card'
            }`}
          >
            <span
              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                motorMarcado ? 'bg-primary border-primary text-foreground' : 'border-muted'
              }`}
            >
              {motorMarcado && (
                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="w-3 h-3">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span
              className={`text-sm font-medium ${motorMarcado ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Motor refeito
            </span>
          </button>
        )}
      </div>
    </PassoLayout>
  );
}
