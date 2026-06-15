import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { IconAlternar } from '../../icons';
import { DialogAlternarPredefinicao } from './DialogAlternarPredefinicao';

interface Props {
  className?: string;
}

// Atalho no header (LayoutApp) para alternar a predefinição ativa sem passar
// pelo Perfil. Autocontido como o PopupAjuda: guarda o próprio estado do
// diálogo. Com menos de 2 predefinições não há para onde alternar, então o
// botão fica desabilitado e desbotado (não escondido).
export function BotaoAlternarPredefinicao({ className }: Props) {
  const { presets } = usePerfil();
  const [aberto, setAberto] = useState(false);
  const habilitado = presets.length >= 2;

  return (
    <>
      <button
        type="button"
        aria-label="Alternar predefinição"
        disabled={!habilitado}
        onClick={() => setAberto(true)}
        className={`p-1 text-muted-foreground/50 transition-colors enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40${
          className ? ` ${className}` : ''
        }`}
      >
        <IconAlternar className="w-5 h-5" />
      </button>
      {aberto && <DialogAlternarPredefinicao onClose={() => setAberto(false)} />}
    </>
  );
}
