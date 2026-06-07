// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ControleEstimativaMaoDeObra } from './ControleEstimativaMaoDeObra';

afterEach(cleanup);

describe('ControleEstimativaMaoDeObra', () => {
  it('mostra os rótulos "Padrão" e "Estimado"', () => {
    render(<ControleEstimativaMaoDeObra ligada={false} dispatch={vi.fn()} />);
    expect(screen.getByText('Padrão')).toBeInTheDocument();
    expect(screen.getByText('Estimado')).toBeInTheDocument();
  });

  it('clicar em "Estimado" liga o modo global', () => {
    const dispatch = vi.fn();
    render(<ControleEstimativaMaoDeObra ligada={false} dispatch={dispatch} />);
    fireEvent.click(screen.getByText('Estimado'));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA',
      valor: true,
    });
  });

  it('clicar em "Padrão" desliga o modo global', () => {
    const dispatch = vi.fn();
    render(<ControleEstimativaMaoDeObra ligada={true} dispatch={dispatch} />);
    fireEvent.click(screen.getByText('Padrão'));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA',
      valor: false,
    });
  });
});
