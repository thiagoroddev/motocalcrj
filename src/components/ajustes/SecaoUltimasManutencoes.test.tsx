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

const bateria = perfilPadrao.perfilManutencao.bateria;

describe('SecaoUltimasManutencoes - validação de domínio', () => {
  it('não despacha km negativo para última troca', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(
      <SecaoUltimasManutencoes moto={perfilPadrao.moto} bateria={bateria} dispatch={dispatch} />,
    );

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
        bateria={bateria}
        dispatch={dispatch}
      />,
    );

    expect(screen.queryByText(/Retífica/i)).not.toBeInTheDocument();
  });

  it('usa o título "Registro" e embute o controle da bateria no mesmo card', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(
      <SecaoUltimasManutencoes moto={perfilPadrao.moto} bateria={bateria} dispatch={dispatch} />,
    );

    expect(screen.getByText('Registro últimas trocas/manutenções')).toBeInTheDocument();
    expect(screen.queryByText('KM - últimas trocas/manutenções')).not.toBeInTheDocument();
    expect(screen.getByText('Bateria')).toBeInTheDocument();
    expect(screen.getByLabelText('Vida útil da bateria em anos')).toBeInTheDocument();
  });
});
