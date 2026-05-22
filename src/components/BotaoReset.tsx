import { useState } from 'react';
import { IconReset } from './icons';
import { DialogConfirmacao } from './DialogConfirmacao';

interface BotaoResetProps {
  onReset: () => void;
  desabilitado?: boolean;
  titulo?: string;
  descricao?: string;
}

/**
 * Botão-ícone de reset, sempre visível. Esmaecido e não-clicável quando
 * `desabilitado` (nada a resetar). Ao clicar, pede confirmação antes de
 * disparar `onReset`. Usa o ícone central `IconReset`.
 */
export function BotaoReset({
  onReset,
  desabilitado = false,
  titulo = 'Restaurar valor padrão?',
  descricao = 'O valor volta ao padrão. Esta ação não pode ser desfeita.',
}: BotaoResetProps) {
  const [dialogAberto, setDialogAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={desabilitado}
        onClick={() => setDialogAberto(true)}
        className="w-8 h-8 shrink-0 flex items-center justify-center text-muted-foreground/40 transition-colors hover:text-primary disabled:opacity-30 disabled:hover:text-muted-foreground/40"
        aria-label="Restaurar valor padrão"
      >
        <IconReset className="w-4 h-4" />
      </button>
      <DialogConfirmacao
        aberto={dialogAberto}
        onOpenChange={setDialogAberto}
        onConfirmar={onReset}
        titulo={titulo}
        descricao={descricao}
      />
    </>
  );
}
