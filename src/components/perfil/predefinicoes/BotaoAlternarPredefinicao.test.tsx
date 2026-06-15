// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { BotaoAlternarPredefinicao } from './BotaoAlternarPredefinicao';
import * as usePerfilHook from '../../../hooks/usePerfil';

vi.mock('../../../hooks/usePerfil', () => ({
  usePerfil: vi.fn(),
}));

// O diálogo real depende de muito contexto; aqui só queremos saber se ele é
// montado quando o botão é clicado.
vi.mock('./DialogAlternarPredefinicao', () => ({
  DialogAlternarPredefinicao: () => <div data-testid="dialog-alternar" />,
}));

const usePerfilMock = vi.mocked(usePerfilHook.usePerfil);

function mockarPresets(quantidade: number) {
  usePerfilMock.mockReturnValue({
    presets: Array.from({ length: quantidade }, (_, i) => ({ presetId: `p${i}` })),
  } as unknown as ReturnType<typeof usePerfilHook.usePerfil>);
}

afterEach(cleanup);

describe('BotaoAlternarPredefinicao', () => {
  test('com 2+ predefinições: habilitado e abre o diálogo ao clicar', () => {
    mockarPresets(2);
    render(<BotaoAlternarPredefinicao />);

    const botao = screen.getByRole('button', { name: 'Alternar predefinição' });
    expect(botao).toBeEnabled();
    expect(screen.queryByTestId('dialog-alternar')).not.toBeInTheDocument();

    fireEvent.click(botao);
    expect(screen.getByTestId('dialog-alternar')).toBeInTheDocument();
  });

  test('com 1 predefinição: desabilitado e não abre o diálogo', () => {
    mockarPresets(1);
    render(<BotaoAlternarPredefinicao />);

    const botao = screen.getByRole('button', { name: 'Alternar predefinição' });
    expect(botao).toBeDisabled();

    fireEvent.click(botao);
    expect(screen.queryByTestId('dialog-alternar')).not.toBeInTheDocument();
  });
});
