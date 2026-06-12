// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AjudaInline } from './AjudaInline';

afterEach(cleanup);

describe('AjudaInline', () => {
  it('o gatilho "?" tem aria-label e abre o sheet com o conteúdo', () => {
    render(
      <AjudaInline titulo="Valor Incompleto (apenas M.O)">
        Apenas mão de obra; a peça vai em Insumos.
      </AjudaInline>,
    );

    const gatilho = screen.getByRole('button', {
      name: 'Ajuda: Valor Incompleto (apenas M.O)',
    });
    fireEvent.click(gatilho);

    expect(screen.getByText('Apenas mão de obra; a peça vai em Insumos.')).toBeInTheDocument();
  });
});
