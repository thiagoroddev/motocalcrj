import { Card } from '../ui/card';
import { Toggle } from './Toggle';
import { BotaoLapisEdicao } from './BotaoLapisEdicao';
import { TileCategoria } from '../icons/categorias';

type Props = {
  label: string;
  categoriaId: string;
  corClasse: string;
  valorExibido: string;
  porcentagem: string;
  ativo: boolean;
  expandido: boolean;
  onToggleAtivo: () => void;
  onToggleExpandido: () => void;
  onEditar?: () => void;
  semExpansao?: boolean;
  children?: React.ReactNode;
};

export function CategoriaAccordion({
  label,
  categoriaId,
  corClasse,
  valorExibido,
  porcentagem,
  ativo,
  expandido,
  onToggleAtivo,
  onToggleExpandido,
  onEditar,
  semExpansao = false,
  children,
}: Props) {
  return (
    <Card className="shadow-none border-0 overflow-hidden">
      <div className="relative flex items-center gap-3 p-4">
        {!semExpansao && (
          <h2 className="absolute inset-0 z-0" aria-label={label}>
            <button
              type="button"
              onClick={onToggleExpandido}
              aria-label={label}
              aria-expanded={expandido}
              className="absolute inset-0 cursor-pointer rounded-lg border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            />
          </h2>
        )}
        <TileCategoria
          categoriaId={categoriaId}
          corClasse={corClasse}
          className="pointer-events-none relative z-10"
        />
        <span className="pointer-events-none relative z-10 flex-1 text-foreground text-sm font-medium">
          {label}
          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/40">
            {porcentagem}
          </span>
        </span>
        <span
          className={`pointer-events-none relative z-10 text-sm font-semibold tabular-nums ${ativo ? 'text-foreground' : 'text-muted-foreground/30'}`}
        >
          {valorExibido}
        </span>
        <div className="relative z-10">
          <Toggle ativo={ativo} onClick={onToggleAtivo} />
        </div>
        {onEditar && (
          <div className="relative z-10">
            <BotaoLapisEdicao onClick={onEditar} ariaLabel={`Editar ${label}`} />
          </div>
        )}
        {!semExpansao && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className={`pointer-events-none relative z-10 w-4 h-4 text-muted-foreground/40 shrink-0 transition-transform ${expandido ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {expandido && children && (
        <div className="px-4 pb-4 space-y-2 border-t border-muted pt-3">{children}</div>
      )}
    </Card>
  );
}
