// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { perfilPadrao } from '../../context/PerfilContext';
import type { PerfilAction } from '../../types/perfil';
import { SecaoVeiculo } from './SecaoVeiculo';

afterEach(() => {
  cleanup();
});

describe('SecaoVeiculo - km última revisão periódica', () => {
  it('capa o km da última revisão ao km atual da moto', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(<SecaoVeiculo moto={{ ...perfilPadrao.moto, kmAtual: 80_000 }} dispatch={dispatch} />);

    const campo = screen.getByLabelText('KM última revisão periódica');

    fireEvent.change(campo, { target: { value: '90000' } });
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'SET_KM_ULTIMA_REVISAO', km: 80_000 });

    fireEvent.change(campo, { target: { value: '70000' } });
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'SET_KM_ULTIMA_REVISAO', km: 70_000 });
  });

  it('não capa quando o km atual é 0 (não informado)', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(<SecaoVeiculo moto={{ ...perfilPadrao.moto, kmAtual: 0 }} dispatch={dispatch} />);

    fireEvent.change(screen.getByLabelText('KM última revisão periódica'), {
      target: { value: '50000' },
    });
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'SET_KM_ULTIMA_REVISAO', km: 50_000 });
  });
});
