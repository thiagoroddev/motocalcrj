type Props = {
  ativo: boolean;
  label?: string;
  onClick: () => void;
};

export function Toggle({ ativo, label, onClick }: Props) {
  return (
    <label
      className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative cursor-pointer ${ativo ? 'bg-primary' : 'bg-muted'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={ativo}
        onChange={() => onClick()}
        aria-label={label ?? (ativo ? 'Desativar' : 'Ativar')}
        className="sr-only"
      />
      <span
        className={`block w-3.5 h-3.5 rounded-full bg-foreground absolute top-[3px] transition-transform ${ativo ? 'translate-x-[19px]' : 'translate-x-[3px]'}`}
      />
    </label>
  );
}
