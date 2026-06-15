// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { perfilPadrao } from '../../context/PerfilContext';
import type { PerfilAction } from '../../types/perfil';
import { SecaoUltimasManutencoes } from './SecaoUltimasManutencoes';

afterEach(() => {
  cleanup();
});

const bateria = perfilPadrao.perfilManutencao.bateria;

describe('SecaoUltimasManutencoes - validação de domínio', () => {
  it('não despacha km negativo para última troca', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(
      <SecaoUltimasManutencoes moto={perfilPadrao.moto} bateria={bateria} dispatch={dispatch} />,
    );

    fireEvent.change(screen.getByLabelText('Troca de óleo'), {
      target: { value: '-100' },
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('capa o km da última troca ao km atual da moto', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(
      <SecaoUltimasManutencoes
        moto={{ ...perfilPadrao.moto, kmAtual: 80_000 }}
        bateria={bateria}
        dispatch={dispatch}
      />,
    );

    const campoOleo = screen.getByLabelText('Troca de óleo');

    // Acima do km atual: capa em 80.000.
    fireEvent.change(campoOleo, { target: { value: '90000' } });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'SET_KM_ULTIMA_TROCA',
      componente: 'oleo',
      km: 80_000,
    });

    // Abaixo do km atual: passa intacto.
    fireEvent.change(campoOleo, { target: { value: '70000' } });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'SET_KM_ULTIMA_TROCA',
      componente: 'oleo',
      km: 70_000,
    });
  });

  it('não capa quando o km atual é 0 (não informado)', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(
      <SecaoUltimasManutencoes
        moto={{ ...perfilPadrao.moto, kmAtual: 0 }}
        bateria={bateria}
        dispatch={dispatch}
      />,
    );

    fireEvent.change(screen.getByLabelText('Troca de óleo'), { target: { value: '50000' } });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'SET_KM_ULTIMA_TROCA',
      componente: 'oleo',
      km: 50_000,
    });
  });

  it('não mostra campos de retífica mesmo com quilometragem alta', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(
      <SecaoUltimasManutencoes
        moto={{ ...perfilPadrao.moto, kmAtual: 60_000 }}
        bateria={bateria}
        dispatch={dispatch}
      />,
    );

    expect(screen.queryByText(/Retífica/i)).not.toBeInTheDocument();
  });

  it('usa o título "Registro" e embute o controle da bateria no mesmo card', () => {
    const dispatch = vi.fn<(action: PerfilAction) => void>();
    render(
      <SecaoUltimasManutencoes moto={perfilPadrao.moto} bateria={bateria} dispatch={dispatch} />,
    );

    expect(screen.getByText('Registro últimas trocas/manutenções')).toBeInTheDocument();
    expect(screen.queryByText('KM - últimas trocas/manutenções')).not.toBeInTheDocument();
    expect(screen.getByText('Bateria')).toBeInTheDocument();
    expect(screen.getByLabelText('Vida útil da bateria em anos')).toBeInTheDocument();
  });
});
