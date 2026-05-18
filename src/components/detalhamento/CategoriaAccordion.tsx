import { Card } from '../ui/card';
import { Toggle } from './Toggle';

type Props = {
  label: string;
  corClasse: string;
  valorExibido: string;
  porcentagem: string;
  ativo: boolean;
  expandido: boolean;
  onToggleAtivo: () => void;
  onToggleExpandido: () => void;
  semExpansao?: boolean;
  children?: React.ReactNode;
};

export function CategoriaAccordion({
  label,
  corClasse,
  valorExibido,
  porcentagem,
  ativo,
  expandido,
  onToggleAtivo,
  onToggleExpandido,
  semExpansao = false,
  children,
}: Props) {
  return (
    <Card className="shadow-none border-0 overflow-hidden">
      <div
        className={`flex items-center gap-3 p-md ${!semExpansao ? 'cursor-pointer' : ''}`}
        onClick={!semExpansao ? onToggleExpandido : undefined}
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${corClasse}`} />
        <span className="flex-1 text-foreground text-sm font-medium">
          {label}
          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/40">
            {porcentagem}
          </span>
        </span>
        <span
          className={`text-sm font-semibold tabular-nums ${ativo ? 'text-foreground' : 'text-muted-foreground/30'}`}
        >
          {valorExibido}
        </span>
        <Toggle ativo={ativo} onClick={onToggleAtivo} />
        {!semExpansao && (
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
        )}
      </div>
      {expandido && children && (
        <div className="px-md pb-md space-y-2 border-t border-muted pt-3">{children}</div>
      )}
    </Card>
  );
}
