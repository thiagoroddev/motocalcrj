type Props = {
  ativo: boolean;
  label?: string;
  inativoPorPai?: boolean;
  onClick: () => void;
};

export function Toggle({ ativo, label, inativoPorPai = false, onClick }: Props) {
  const corTrilho = inativoPorPai ? 'bg-muted/40' : ativo ? 'bg-primary' : 'bg-muted';
  const corIndicador = inativoPorPai ? 'bg-muted-foreground/40' : 'bg-foreground';

  return (
    <label
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${inativoPorPai ? 'cursor-not-allowed' : 'cursor-pointer'} ${corTrilho}`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={ativo}
        disabled={inativoPorPai}
        onChange={() => {
          if (!inativoPorPai) onClick();
        }}
        aria-label={label ?? (ativo ? 'Desativar' : 'Ativar')}
        className="sr-only"
      />
      <span
        className={`absolute top-[3px] block h-3.5 w-3.5 rounded-full transition-all ${corIndicador} ${ativo ? 'translate-x-[19px]' : 'translate-x-[3px]'}`}
      />
    </label>
  );
}
