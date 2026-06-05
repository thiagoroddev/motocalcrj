// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardTotalAnual, type ChipDetalhe } from './CardTotalAnual';

afterEach(cleanup);

describe('CardTotalAnual', () => {
  it('renderiza total, km/cpk e aviso de custo parcial', () => {
    render(
      <CardTotalAnual
        periodo="ano"
        totalPeriodo={1000}
        kmPeriodo="18.200 km/ano"
        porKm={0.71}
        detalhesFixos={[]}
        avisoCustoParcial="Inclui estimativas de mão de obra (~)."
      />,
    );

    expect(screen.getByText('Total estimado no ano')).toBeInTheDocument();
    expect(screen.getByText('18.200 km/ano')).toBeInTheDocument();
    expect(screen.getByText(/Inclui estimativas de mão de obra/)).toBeInTheDocument();
  });

  it('chip clicável vira botão (abre popup) e dispara onClick; chip fixo vira texto', () => {
    const aoClicar = vi.fn();
    const chips: ChipDetalhe[] = [
      { label: 'Revisão Concessionária' },
      { label: 'M.O. estimada ~', onClick: aoClicar, ariaLabel: 'Alterar modo de estimativa' },
    ];

    render(
      <CardTotalAnual
        periodo="mes"
        totalPeriodo={100}
        kmPeriodo="1.500 km/mês"
        porKm={0.71}
        detalhesFixos={chips}
      />,
    );

    // Chip fixo (sem onClick) é um texto, não botão.
    expect(screen.getByText('Revisão Concessionária').tagName).toBe('SPAN');

    // Chip clicável é um botão que abre dialog e dispara o onClick (abre o popup).
    const botao = screen.getByRole('button', { name: 'Alterar modo de estimativa' });
    expect(botao).toHaveAttribute('aria-haspopup', 'dialog');
    fireEvent.click(botao);
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });
});
