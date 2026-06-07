import { useState } from 'react';
import type { Dispatch } from 'react';
import { Input } from '@/components/ui/input';
import { iconePeca } from '../icons/pecas';
import type { ServicoIndependente, PerfilAction } from '../../types/perfil';

interface Props {
  servico: ServicoIndependente;
  dispatch: Dispatch<PerfilAction>;
}

// Card enxuto do onboarding: só ícone + nome + o input de vida útil (km).
// Edita a MESMA fonte da aba Mão de Obra (`SET_SERVICO_INDEPENDENTE` + flag de
// procedência da REF-42); sem preço, estimativa de M.O., toggle ou reset (ADR-018).
export function CardVidaUtilOnboarding({ servico, dispatch }: Props) {
  // Estado local string + commit no onBlur (padrão BG-017): derivar o value do
  // store com formatação colapsa a digitação.
  const [intervalo, setIntervalo] = useState(String(servico.intervalKm));
  const IconePeca = iconePeca(servico.id);
  const idInput = `vida-util-${servico.id}`;

  function handleBlur() {
    const num = parseInt(intervalo, 10);
    if (isNaN(num) || num <= 0) {
      setIntervalo(String(servico.intervalKm));
      return;
    }
    // Só marca como informado pelo usuário quando o valor realmente muda.
    if (num === servico.intervalKm) {
      return;
    }
    dispatch({
      type: 'SET_SERVICO_INDEPENDENTE',
      payload: { ...servico, intervalKm: num, intervaloKmInformadoUsuario: true },
    });
  }

  return (
    <div className="bg-card rounded-lg p-4 flex items-center gap-3">
      <IconePeca className="w-6 h-6 text-primary shrink-0" />
      <label
        htmlFor={idInput}
        className="text-sm font-medium text-foreground flex-1 min-w-0 truncate"
      >
        {servico.nome}
      </label>
      <div className="relative w-36 shrink-0">
        <Input
          id={idInput}
          type="number"
          inputMode="numeric"
          aria-label={`Vida útil estimada em km de ${servico.nome}`}
          className="rounded-input bg-input min-h-touch text-sm text-right pr-9"
          value={intervalo}
          onChange={(e) => setIntervalo(e.target.value)}
          onBlur={handleBlur}
          min={0}
          step={500}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          km
        </span>
      </div>
    </div>
  );
}
