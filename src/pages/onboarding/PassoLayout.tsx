import type { ReactNode } from 'react';
import { useOnboarding } from './FluxoOnboarding';

interface Props {
  titulo: string;
  subtitulo?: string;
  aoProximo: () => void;
  podeContinuar?: boolean;
  textoBotao?: string;
  children: ReactNode;
}

export function PassoLayout({
  titulo,
  subtitulo,
  aoProximo,
  podeContinuar = true,
  textoBotao,
  children,
}: Props) {
  const { config, passo, irParaAnterior, temAnterior } = useOnboarding();
  const labelBotao = textoBotao ?? (passo === '9' ? 'Concluir' : 'Próximo');

  return (
    <div className="min-h-screen bg-background flex flex-col ">
      <div className="px-md pt-md pb-sm">
        <div className="flex items-center justify-between mb-xs">
          <span className="text-label-sm text-muted-foreground">{config.label}</span>
          <span className="text-label-sm text-muted-foreground">{config.percentual}%</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${config.percentual}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-md py-lg">
        <h1 className="text-foreground text-2xl font-semibold mb-xs">{titulo}</h1>
        {subtitulo && <p className="text-muted-foreground text-sm mb-lg">{subtitulo}</p>}
        {children}
      </div>

      <div className="p-md pt-md border-t border-muted flex gap-sm">
        {temAnterior && (
          <button
            type="button"
            onClick={irParaAnterior}
            className="flex-1 min-h-touch rounded-btn border border-muted text-muted-foreground font-medium"
          >
            Voltar
          </button>
        )}
        <button
          type="button"
          onClick={aoProximo}
          disabled={!podeContinuar}
          className="flex-1 min-h-touch rounded-btn bg-primary text-foreground font-semibold disabled:opacity-40"
        >
          {labelBotao}
        </button>
      </div>
    </div>
  );
}
