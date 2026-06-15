// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BateriaConfig, PerfilAction } from '../../types/perfil';
import { CardBateria } from './CardBateria';

afterEach(() => {
  cleanup();
});

const BATERIA: BateriaConfig = { ultimaTrocaAnoMes: null, vidaUtilAnos: 3 };

describe('CardBateria (TASK-RF-8)', () => {
  it('mostra o seletor de vida útil em anos e o título', () => {
    render(<CardBateria bateria={BATERIA} dispatch={vi.fn<(a: PerfilAction) => void>()} />);

    expect(screen.getByText('Bateria')).toBeInTheDocument();
    expect(screen.getByLabelText('Vida útil da bateria em anos')).toBeInTheDocument();
  });
});
