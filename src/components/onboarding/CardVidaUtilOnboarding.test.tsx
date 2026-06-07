// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardVidaUtilOnboarding } from './CardVidaUtilOnboarding';
import type { ServicoIndependente } from '../../types/perfil';

const servico: ServicoIndependente = {
  id: 'troca-kit-transmissao',
  nome: 'Kit transmissão',
  intervalKm: 18000,
  precoIndependente: 200,
  precoTotalAutorizada: 0,
  statusPrecoAutorizada: 'nao_informado',
  incluidoNaRevisaoAutorizada: false,
  ativo: true,
  ehExcepcional: false,
};

afterEach(cleanup);

describe('CardVidaUtilOnboarding', () => {
  it('mostra só o nome e o input de vida útil (sem preço/M.O./reset)', () => {
    render(<CardVidaUtilOnboarding servico={servico} dispatch={vi.fn()} />);

    expect(screen.getByText('Kit transmissão')).toBeInTheDocument();
    expect(screen.getByDisplayValue('18000')).toBeInTheDocument();
    expect(screen.queryByText(/Preço/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('editar o intervalo despacha SET_SERVICO_INDEPENDENTE com a marca de procedência', () => {
    const dispatch = vi.fn();
    render(<CardVidaUtilOnboarding servico={servico} dispatch={dispatch} />);

    const input = screen.getByDisplayValue('18000');
    fireEvent.change(input, { target: { value: '21000' } });
    fireEvent.blur(input);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SERVICO_INDEPENDENTE',
      payload: { ...servico, intervalKm: 21000, intervaloKmInformadoUsuario: true },
    });
  });

  it('não despacha quando o valor não muda (não marca como editado)', () => {
    const dispatch = vi.fn();
    render(<CardVidaUtilOnboarding servico={servico} dispatch={dispatch} />);

    const input = screen.getByDisplayValue('18000');
    fireEvent.blur(input);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('valor inválido (<= 0) é revertido ao do serviço, sem despachar', () => {
    const dispatch = vi.fn();
    render(<CardVidaUtilOnboarding servico={servico} dispatch={dispatch} />);

    const input = screen.getByDisplayValue('18000');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.blur(input);

    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('18000')).toBeInTheDocument();
  });
});
