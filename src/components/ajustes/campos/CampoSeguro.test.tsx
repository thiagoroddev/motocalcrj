// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useReducer } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { perfilReducer, perfilPadrao } from '../../../context/PerfilContext';
import type { EstadoApp } from '../../../context/PerfilContext';
import type { PerfilAction, PerfilUsuario, PeriodicidadeSeguro } from '../../../types/perfil';
import { CampoSeguro } from './CampoSeguro';

afterEach(() => {
  cleanup();
});

function renderizarCampoSeguro(seguro: Partial<PerfilUsuario['financeiro']['seguro']>) {
  const financeiro: PerfilUsuario['financeiro'] = {
    ...perfilPadrao.financeiro,
    seguro: { ...perfilPadrao.financeiro.seguro, ...seguro },
  };
  const dispatch = vi.fn<(action: PerfilAction) => void>();

  render(<CampoSeguro financeiro={financeiro} dispatch={dispatch} />);

  return dispatch;
}

// Wrapper com o reducer REAL: o dispatch realimenta o `value` (igual ao app). O
// dispatch mockado dos outros testes não re-renderiza, então não exercita a
// digitação tecla a tecla.
function CampoSeguroConectado({
  valorAnual,
  periodicidade,
}: {
  valorAnual: number;
  periodicidade: PeriodicidadeSeguro;
}) {
  const [estado, dispatch] = useReducer(perfilReducer, {
    perfil: {
      ...perfilPadrao,
      financeiro: {
        ...perfilPadrao.financeiro,
        seguro: { valorAnual, empresa: null, periodicidade },
      },
    },
    presets: [],
    presetAtivoId: null,
  } as EstadoApp);

  return <CampoSeguro financeiro={estado.perfil.financeiro} dispatch={dispatch} />;
}

describe('CampoSeguro', () => {
  it('exibe valor mensal derivado do anual e salva (no blur) como anualizado', () => {
    const dispatch = renderizarCampoSeguro({ valorAnual: 1200, periodicidade: 'mensal' });

    const inputValor = screen.getByLabelText('Valor mensal (R$)') as HTMLInputElement;
    expect(inputValor.value).toBe('100.00');

    fireEvent.change(inputValor, { target: { value: '200' } });
    fireEvent.blur(inputValor);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SEGURO',
      config: { valorAnual: 2400 },
    });
  });

  it('mantem valor anual direto quando a periodicidade é anual', () => {
    const dispatch = renderizarCampoSeguro({ valorAnual: 1200, periodicidade: 'anual' });

    const inputValor = screen.getByLabelText('Valor anual (R$)') as HTMLInputElement;
    expect(inputValor.value).toBe('1200.00');

    fireEvent.change(inputValor, { target: { value: '1500' } });
    fireEvent.blur(inputValor);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SEGURO',
      config: { valorAnual: 1500 },
    });
  });

  // Regressão TASK-BG-017 (revisão): digitar dígito a dígito não pode reformatar a
  // cada tecla (o `toFixed(2)` derivado do store colapsava para "1.00").
  it('permite digitar valor de vários dígitos sem reformatar a cada tecla', () => {
    render(<CampoSeguroConectado valorAnual={1200} periodicidade="anual" />);

    const inputValor = screen.getByLabelText('Valor anual (R$)') as HTMLInputElement;

    fireEvent.change(inputValor, { target: { value: '1' } });
    fireEvent.change(inputValor, { target: { value: '15' } });
    fireEvent.change(inputValor, { target: { value: '150' } });
    fireEvent.change(inputValor, { target: { value: '1500' } });
    expect(inputValor.value).toBe('1500'); // não colapsou durante a digitação

    fireEvent.blur(inputValor);
    expect(inputValor.value).toBe('1500.00'); // commit + format só no blur
  });
});
