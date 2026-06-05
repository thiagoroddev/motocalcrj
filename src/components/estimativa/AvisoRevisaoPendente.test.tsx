// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AvisoRevisaoPendente } from './AvisoRevisaoPendente';

afterEach(cleanup);

describe('AvisoRevisaoPendente', () => {
  it('mostra a próxima revisão pendente e aciona os dois links', () => {
    const irAjustes = vi.fn();
    const irMaoDeObra = vi.fn();

    render(
      <AvisoRevisaoPendente
        proximaRevisaoKm={18000}
        onIrParaAjustes={irAjustes}
        onIrParaMaoDeObra={irMaoDeObra}
      />,
    );

    expect(screen.getByText('Revisão pendente')).toBeInTheDocument();
    expect(screen.getByText('18.000 km')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ajustes' }));
    expect(irAjustes).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Mão de Obra' }));
    expect(irMaoDeObra).toHaveBeenCalledTimes(1);
  });
});
