import { TriangleAlert } from 'lucide-react';

type Props = {
  // Km da próxima revisão prevista (1º marco após a última revisão informada).
  proximaRevisaoKm: number;
  onIrParaAjustes: () => void;
  onIrParaMaoDeObra: () => void;
};

// Aviso persistente na Estimativa quando a próxima revisão já está atrasada
// (TASK-RF-6.27). Não muda o cálculo (amortizado, ADR-016); é um nudge para o
// usuário manter o km da última revisão e os valores de M.O. atualizados.
export function AvisoRevisaoPendente({
  proximaRevisaoKm,
  onIrParaAjustes,
  onIrParaMaoDeObra,
}: Props) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-warning">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1 text-xs leading-relaxed">
        <p className="font-medium">Revisão pendente</p>
        <p>
          A sua próxima revisão periódica, prevista para{' '}
          <span className="font-semibold tabular-nums">
            {proximaRevisaoKm.toLocaleString('pt-BR')} km
          </span>
          , está pendente.
        </p>
        <p>
          Se você já a fez, atualize o km da última revisão em{' '}
          <button
            type="button"
            onClick={onIrParaAjustes}
            className="font-semibold underline underline-offset-2 hover:text-foreground"
          >
            Ajustes
          </button>{' '}
          e os valores em{' '}
          <button
            type="button"
            onClick={onIrParaMaoDeObra}
            className="font-semibold underline underline-offset-2 hover:text-foreground"
          >
            Mão de Obra
          </button>
          .
        </p>
      </div>
    </div>
  );
}
