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
});
