interface StepperProps {
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

export function Stepper({ valor, min, max, onChange }: StepperProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={valor <= min}
        onClick={() => onChange(valor - 1)}
        className="w-10 h-10 rounded border border-muted flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors text-lg"
        aria-label="Diminuir"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium text-foreground">{valor}</span>
      <button
        type="button"
        disabled={valor >= max}
        onClick={() => onChange(valor + 1)}
        className="w-10 h-10 rounded border border-muted flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors text-lg"
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}
