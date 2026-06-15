// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { perfilPadrao } from '../../context/PerfilContext';
import type { PerfilAction } from '../../types/perfil';
import { SecaoUltimasManutencoes } from './SecaoUltimasManutencoes';

afterEach(() => {
  cleanup();
});

describe('SecaoUltimasManutencoes - validação de domínio', () => {
  it('não despacha km negativo para última troca', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(<SecaoUltimasManutencoes moto={perfilPadrao.moto} dispatch={dispatch} />);

    fireEvent.change(screen.getByLabelText('Troca de óleo'), {
      target: { value: '-100' },
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('não mostra campos de retífica mesmo com quilometragem alta', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(
      <SecaoUltimasManutencoes
        moto={{ ...perfilPadrao.moto, kmAtual: 60_000 }}
        dispatch={dispatch}
      />,
    );

    expect(screen.queryByText(/Retífica/i)).not.toBeInTheDocument();
  });
});
