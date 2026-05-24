interface OpcaoSegmentado {
  label: string;
  valor: string;
}

interface SegmentadoProps {
  opcoes: OpcaoSegmentado[];
  valor: string;
  onChange: (v: string) => void;
  className?: string;
}

export function Segmentado({ opcoes, valor, onChange, className }: SegmentadoProps) {
  return (
    <div
      className={`flex rounded-md overflow-hidden border border-muted${className ? ` ${className}` : ''}`}
    >
      {opcoes.map((op, i) => (
        <button
          key={op.valor}
          type="button"
          onClick={() => onChange(op.valor)}
          className={`flex-1 h-12 min-h-touch flex items-center justify-center text-[10px] font-medium tracking-wide uppercase transition-colors${i > 0 ? ' border-l border-muted' : ''} ${
            valor === op.valor
              ? 'bg-primary text-foreground'
              : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
