import type { Dispatch } from 'react';
import type { GastoCustom, PerfilAction } from '../../types/perfil';
import { Card } from '../ui/card';
import { Toggle } from './Toggle';

type Props = {
  gastosCustom: GastoCustom[];
  dispatch: Dispatch<PerfilAction>;
  valorTotal: number;
  expandido: boolean;
  onToggleExpandido: () => void;
  pp: (anual: number) => string;
  pct: (valor: number) => string;
};

export function SecaoImprevistos({
  gastosCustom,
  dispatch,
  valorTotal,
  expandido,
  onToggleExpandido,
  pp,
  pct,
}: Props) {
  return (
    <Card className="shadow-none border-0 overflow-hidden">
      <div className="flex items-center gap-3 p-md cursor-pointer" onClick={onToggleExpandido}>
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-warning/60" />
        <span className="flex-1 text-foreground text-sm font-medium">
          Imprevistos
          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/40">
            {pct(valorTotal)}
          </span>
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">{pp(valorTotal)}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          className={`w-4 h-4 text-muted-foreground/40 flex-shrink-0 transition-transform ${expandido ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {expandido && (
        <div className="px-md pb-md space-y-2 border-t border-muted pt-3">
          {gastosCustom.length > 0 &&
            gastosCustom.map((g) => (
              <div key={g.id} className="flex items-center gap-2">
                <Toggle
                  ativo={g.ativo}
                  onClick={() => dispatch({ type: 'TOGGLE_GASTO_CUSTOM', id: g.id })}
                />
                <span className="flex-1 text-muted-foreground/70 text-xs truncate">{g.nome}</span>
                <span
                  className={`text-xs font-medium tabular-nums ${g.ativo ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
                >
                  {pp(g.valorMensal * 12)}
                </span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'DELETE_GASTO_CUSTOM', id: g.id })}
                  aria-label={`Remover ${g.nome}`}
                  className="p-1 text-muted-foreground/30 hover:text-destructive transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="w-3.5 h-3.5"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" />
                    <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          <div className="pt-2 border-t border-muted">
            <div className="flex items-start gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
                className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              <p className="text-muted-foreground/40 text-xs leading-relaxed">
                Para adicionar despesas vá à aba{' '}
                <span className="text-muted-foreground/60 font-medium">Registros</span> e registre
                um gasto. Ele aparecerá aqui quando o modo{' '}
                <span className="text-muted-foreground/60 font-medium">Personalizado</span> estiver
                ativo ativado automaticamente com o primeiro registro.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
