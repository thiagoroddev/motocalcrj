// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { perfilPadrao } from '../../../context/PerfilContext';
import type { PerfilAction, PerfilUsuario } from '../../../types/perfil';
import { CampoAlimentacao } from './CampoAlimentacao';
import { CampoInternet } from './CampoInternet';

afterEach(() => {
  cleanup();
});

function financeiroCom(overrides: Partial<PerfilUsuario['financeiro']> = {}) {
  return { ...perfilPadrao.financeiro, ...overrides };
}

describe('Campos financeiros de Ajustes — validação de domínio', () => {
  it('CampoAlimentacao não despacha valor negativo', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(
      <CampoAlimentacao financeiro={financeiroCom({ alimentacaoDia: 20 })} dispatch={dispatch} />,
    );

    fireEvent.change(screen.getByLabelText('Valor por dia (R$)'), {
      target: { value: '-10' },
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('CampoInternet não despacha valor negativo', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(<CampoInternet financeiro={financeiroCom({ internet: 50 })} dispatch={dispatch} />);

    fireEvent.change(screen.getByLabelText('Valor por mês (R$)'), {
      target: { value: '-10' },
    });

    expect(dispatch).not.toHaveBeenCalled();
  });
});
