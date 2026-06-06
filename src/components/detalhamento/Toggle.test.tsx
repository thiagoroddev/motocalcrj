// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle';

afterEach(cleanup);

describe('Toggle', () => {
  it('não propaga o clique para um contêiner clicável ancestral', () => {
    const onClickAncestral = vi.fn();
    const onToggle = vi.fn();

    render(
      <div onClick={onClickAncestral}>
        <Toggle ativo={true} label="Desativar categoria" onClick={onToggle} />
      </div>,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Desativar categoria' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onClickAncestral).not.toHaveBeenCalled();
  });

  it('preserva a posição, desbota e bloqueia interação quando inativo pelo pai', () => {
    const onToggle = vi.fn();
    render(
      <Toggle ativo={true} label="Desativar Revisão Geral" inativoPorPai onClick={onToggle} />,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Desativar Revisão Geral' });
    const trilho = checkbox.closest('label');
    const indicador = trilho?.querySelector('span');

    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
    expect(trilho).toHaveClass('bg-muted/40', 'cursor-not-allowed');
    expect(indicador).toHaveClass('bg-muted-foreground/40', 'translate-x-[19px]');

    fireEvent.click(checkbox);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('preserva à esquerda o subtoggle desligado quando inativo pelo pai', () => {
    render(<Toggle ativo={false} label="Ativar Revisão Geral" inativoPorPai onClick={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Ativar Revisão Geral' });
    const trilho = checkbox.closest('label');
    const indicador = trilho?.querySelector('span');

    expect(checkbox).not.toBeChecked();
    expect(checkbox).toBeDisabled();
    expect(trilho).toHaveClass('bg-muted/40');
    expect(indicador).toHaveClass('bg-muted-foreground/40', 'translate-x-[3px]');
  });
});
