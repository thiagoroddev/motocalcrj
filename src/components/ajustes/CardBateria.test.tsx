// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BateriaConfig, PerfilAction } from '../../types/perfil';
import { CardBateria } from './CardBateria';

afterEach(() => {
  cleanup();
});

const SEM_DATA: BateriaConfig = { ultimaTrocaAnoMes: null, vidaUtilAnos: 3 };

describe('CardBateria (TASK-RF-8.3)', () => {
  it('despacha a data da última troca (AAAA-MM)', () => {
    const dispatch = vi.fn<(a: PerfilAction) => void>();
    render(<CardBateria bateria={SEM_DATA} anoMoto={2022} dispatch={dispatch} />);

    fireEvent.change(screen.getByLabelText('Última troca'), { target: { value: '2025-04' } });

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_BATERIA_ULTIMA_TROCA', anoMes: '2025-04' });
  });

  it('limpar a data despacha null', () => {
    const dispatch = vi.fn<(a: PerfilAction) => void>();
    render(
      <CardBateria
        bateria={{ ultimaTrocaAnoMes: '2024-06', vidaUtilAnos: 3 }}
        anoMoto={2022}
        dispatch={dispatch}
      />,
    );

    fireEvent.change(screen.getByLabelText('Última troca'), { target: { value: '' } });

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_BATERIA_ULTIMA_TROCA', anoMes: null });
  });

  it('sem data: estima a próxima troca a partir do ano da moto (jan + vida útil)', () => {
    const dispatch = vi.fn<(a: PerfilAction) => void>();
    render(<CardBateria bateria={SEM_DATA} anoMoto={2022} dispatch={dispatch} />);

    // janeiro de 2022 + 3 anos = 01/2025
    expect(screen.getByText(/01\/2025/)).toBeInTheDocument();
  });
});
