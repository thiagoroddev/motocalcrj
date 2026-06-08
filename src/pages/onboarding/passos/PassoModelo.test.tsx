// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { PassoModelo } from './PassoModelo';
import * as catalogoModelos from '../../../data/catalogoModelos';
import * as usePerfilHook from '../../../hooks/usePerfil';
import * as FluxoOnboarding from '../FluxoOnboarding';
import { perfilPadrao } from '../../../context/perfilDefaults';

vi.mock('../../../data/catalogoModelos', () => ({
  getMarcasDisponiveis: vi.fn(() => []),
  getModelosPorMarca: vi.fn(() => []),
}));

vi.mock('../../../hooks/usePerfil', () => ({
  usePerfil: vi.fn(),
}));

vi.mock('../FluxoOnboarding', () => ({
  useOnboarding: vi.fn(),
}));

vi.mock('../PassoLayout', () => ({
  PassoLayout: ({ children, aoProximo, podeContinuar, titulo }: any) => (
    <div data-testid="passo-layout" data-pode-continuar={podeContinuar}>
      <h1>{titulo}</h1>
      {children}
      <button onClick={aoProximo} disabled={!podeContinuar}>
        Avançar
      </button>
    </div>
  ),
}));

describe('PassoModelo', () => {
  const dispatchMock = vi.fn();
  const irParaProximoMock = vi.fn();

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePerfilHook.usePerfil).mockReturnValue({
      perfil: perfilPadrao,
      presets: [],
      presetAtivoId: null,
      temPresetAtivo: false,
      ativarPreset: vi.fn(),
      dispatch: dispatchMock,
    });

    vi.mocked(FluxoOnboarding.useOnboarding).mockReturnValue({
      passo: 'modelo',
      config: { label: 'PASSO 1 DE 10', percentual: 10 },
      irParaProximo: irParaProximoMock,
      irParaAnterior: vi.fn(),
      temAnterior: false,
    });
  });

  test('selecionar marca lista os modelos e botão podeContinuar fica falso', () => {
    vi.mocked(catalogoModelos.getMarcasDisponiveis).mockReturnValue(['Honda', 'Yamaha']);
    vi.mocked(catalogoModelos.getModelosPorMarca).mockImplementation((marca) => {
      if (marca === 'Honda') return [{ id: 'cg160', nome: 'CG 160' } as any, { id: 'biz125', nome: 'Biz 125' } as any];
      return [];
    });

    render(<PassoModelo />);

    // Nenhuma marca selecionada no início (vazio) - Botão Próximo desativado
    const botaoAvancar = screen.getByText('Avançar');
    expect(botaoAvancar).toBeDisabled();

    // Seleciona a marca
    fireEvent.click(screen.getByText('Honda'));

    // Agora deve mostrar os modelos da Honda
    expect(screen.getByText('CG 160')).toBeInTheDocument();
    expect(screen.getByText('Biz 125')).toBeInTheDocument();
    
    // Ainda não pode continuar, pois nenhum modelo foi clicado
    expect(botaoAvancar).toBeDisabled();
  });

  test('marca com 1 modelo auto-seleciona o modelo', () => {
    vi.mocked(catalogoModelos.getMarcasDisponiveis).mockReturnValue(['Shineray']);
    vi.mocked(catalogoModelos.getModelosPorMarca).mockImplementation((marca) => {
      if (marca === 'Shineray') return [{ id: 'shineray-worker', nome: 'Worker 125' } as any];
      return [];
    });

    // Como o getMarcasDisponiveis tem 1 só, o PassoModelo tenta auto-selecionar a marca e modelo inicial
    render(<PassoModelo />);

    // Marca é auto-selecionada, então deve mostrar a Worker 125
    expect(screen.getByText('Worker 125')).toBeInTheDocument();

    // Como só tem 1 modelo, deve auto-selecionar e liberar o botão
    const botaoAvancar = screen.getByText('Avançar');
    expect(botaoAvancar).not.toBeDisabled();
  });

  test('trocar de marca limpa o modelo selecionado', () => {
    vi.mocked(catalogoModelos.getMarcasDisponiveis).mockReturnValue(['Honda', 'Yamaha']);
    vi.mocked(catalogoModelos.getModelosPorMarca).mockImplementation((marca) => {
      if (marca === 'Honda') return [{ id: 'cg160', nome: 'CG 160' } as any, { id: 'biz125', nome: 'Biz 125' } as any];
      if (marca === 'Yamaha') return [{ id: 'fz25', nome: 'Fazer 250' } as any, { id: 'mt03', nome: 'MT-03' } as any];
      return [];
    });

    render(<PassoModelo />);

    // Seleciona Honda e depois o modelo CG 160
    fireEvent.click(screen.getByText('Honda'));
    fireEvent.click(screen.getByText('CG 160'));
    
    expect(screen.getByText('Avançar')).not.toBeDisabled();

    // Troca para Yamaha
    fireEvent.click(screen.getByText('Yamaha'));

    // Botão volta a ficar desabilitado porque o modelo foi limpo
    expect(screen.getByText('Avançar')).toBeDisabled();
  });

  test('avançar dispara o dispatch gravando moto.marca e moto.modelo', () => {
    vi.mocked(catalogoModelos.getMarcasDisponiveis).mockReturnValue(['Honda']);
    vi.mocked(catalogoModelos.getModelosPorMarca).mockImplementation((marca) => {
      if (marca === 'Honda') return [{ id: 'cg160', nome: 'CG 160' } as any];
      return [];
    });

    render(<PassoModelo />);

    // Como é 1 marca e 1 modelo, já deve auto-selecionar e liberar o botão
    const botaoAvancar = screen.getByText('Avançar');
    fireEvent.click(botaoAvancar);

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_ONBOARDING_CAMPO',
        campo: 'moto',
        valor: expect.objectContaining({
          marca: 'Honda',
          modelo: 'cg160'
        })
      })
    );
    expect(irParaProximoMock).toHaveBeenCalled();
  });
});
