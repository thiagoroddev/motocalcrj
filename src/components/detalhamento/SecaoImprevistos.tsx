import { useEffect, useState, type Dispatch } from 'react';
import type { GastoCustom, PerfilAction } from '../../types/perfil';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { moeda } from '../../utils/formatters';
import { Toggle } from './Toggle';
import { TileCategoria } from '../icons/categorias';

type Props = {
  gastosCustom: GastoCustom[];
  dispatch: Dispatch<PerfilAction>;
  valorTotal: number;
  categoriaAtiva: boolean;
  onToggleCategoria: () => void;
  expandido: boolean;
  onToggleExpandido: () => void;
  pp: (anual: number) => string;
  pct: (valor: number, ativo?: boolean) => string;
};

// Aceita "1234,56" ou "1234.56" e devolve número. Inválido vira NaN.
function parseValor(texto: string): number {
  const limpo = texto.trim().replace(/\./g, '').replace(',', '.');
  if (limpo === '') return 0;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : NaN;
}

export function SecaoImprevistos({
  gastosCustom,
  dispatch,
  valorTotal,
  categoriaAtiva,
  onToggleCategoria,
  expandido,
  onToggleExpandido,
  pp,
  pct,
}: Props) {
  const [gastoEditando, setGastoEditando] = useState<GastoCustom | null>(null);
  const [valorTemp, setValorTemp] = useState('');

  useEffect(() => {
    if (gastoEditando) {
      setValorTemp(gastoEditando.valorAnual > 0 ? String(gastoEditando.valorAnual) : '');
    }
  }, [gastoEditando]);

  function abrirEdicao(g: GastoCustom) {
    setGastoEditando(g);
  }

  function fecharEdicao() {
    setGastoEditando(null);
  }

  function salvarEdicao() {
    if (!gastoEditando) return;
    const valor = parseValor(valorTemp);
    if (Number.isNaN(valor) || valor < 0) return;
    dispatch({ type: 'SET_GASTO_CUSTOM_VALOR', id: gastoEditando.id, valorAnual: valor });
    fecharEdicao();
  }

  return (
    <>
      <Card className="shadow-none border-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onToggleExpandido}>
          <TileCategoria categoriaId="gastosCustom" corClasse="bg-warning/60" />
          <span className="flex-1 text-foreground text-sm font-medium flex items-center gap-1.5">
            Outros
            <span className="ml-0.5 text-[10px] font-normal text-muted-foreground/40">
              {pct(valorTotal, categoriaAtiva)}
            </span>
          </span>
          <span
            className={`text-sm font-semibold tabular-nums ${categoriaAtiva ? 'text-foreground' : 'text-muted-foreground/30'}`}
          >
            {pp(valorTotal)}
          </span>
          <Toggle
            ativo={categoriaAtiva}
            label={`${categoriaAtiva ? 'Desativar' : 'Ativar'} Outros`}
            onClick={onToggleCategoria}
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className={`w-4 h-4 text-muted-foreground/40 shrink-0 transition-transform ${expandido ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {expandido && (
          <div className="px-4 pb-4 space-y-2 border-t border-muted pt-3">
            <div className="rounded-md border border-border/70 bg-background/25 px-2 py-2 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground/60 text-xs">Valor anual ativo</span>
                <span className="text-muted-foreground text-xs font-medium tabular-nums">
                  {moeda(valorTotal)}
                </span>
              </div>
            </div>
            {gastosCustom.map((g) => {
              const temValor = g.valorAnual > 0;
              return (
                <div key={g.id} className="flex items-center gap-2">
                  <Toggle
                    ativo={g.ativo}
                    label={`${g.ativo ? 'Desativar' : 'Ativar'} ${g.nome}`}
                    inativoPorPai={!categoriaAtiva}
                    onClick={() => dispatch({ type: 'TOGGLE_GASTO_CUSTOM', id: g.id })}
                  />
                  <span className="w-8 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-muted-foreground/70 text-xs truncate">{g.nome}</span>
                  <div className="flex flex-col items-end leading-tight">
                    <span
                      className={`text-xs font-medium tabular-nums ${g.ativo ? 'text-foreground' : 'text-muted-foreground/40'}`}
                    >
                      {moeda(g.valorAnual)}
                    </span>
                    <span
                      className={`text-[10px] tabular-nums ${g.ativo && temValor ? 'text-muted-foreground/70' : 'text-muted-foreground/30'}`}
                    >
                      ≈ {pp(g.valorAnual)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirEdicao(g)}
                    aria-label={`Editar valor de ${g.nome}`}
                    className="p-1 text-muted-foreground/40 hover:text-foreground transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M12 20h9" strokeLinecap="round" />
                      <path
                        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
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
                  Para Multa, Sinistros e Outros, toque no lápis para informar o total acumulado no
                  ano. Esta é a única categoria editável direto aqui.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={gastoEditando !== null} onOpenChange={(aberto) => !aberto && fecharEdicao()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{gastoEditando?.nome}</DialogTitle>
            <DialogDescription>
              Informe o total acumulado no ano (somando tudo que já aconteceu e o que você prevê).
              Quando vier um valor novo, edite somando ao que já estava aqui.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="gasto-valor-input" className="text-xs text-muted-foreground">
              Total no ano (R$)
            </label>
            <Input
              id="gasto-valor-input"
              type="text"
              inputMode="decimal"
              autoFocus
              value={valorTemp}
              onChange={(e) => setValorTemp(e.target.value)}
              placeholder="0,00"
              onKeyDown={(e) => {
                if (e.key === 'Enter') salvarEdicao();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={fecharEdicao}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicao}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
