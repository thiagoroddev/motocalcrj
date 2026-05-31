// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Componente que sempre lança — dispara o getDerivedStateFromError do boundary.
const ComponenteQueLanca = (): never => {
  throw new Error('erro de teste');
};

describe('ErrorBoundary — render (jsdom)', () => {
  let consoleErroSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // React e o componentDidCatch logam o erro capturado no console.error —
    // silencia o ruído esperado para manter a saída de teste limpa.
    consoleErroSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErroSpy.mockRestore();
    cleanup();
  });

  it('renderiza os filhos quando não há erro', () => {
    render(
      <ErrorBoundary>
        <p>conteúdo ok</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('conteúdo ok')).toBeInTheDocument();
  });

  it('mostra o fallback com os botões de saída quando um filho lança', () => {
    render(
      <ErrorBoundary>
        <ComponenteQueLanca />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resetar dados' })).toBeInTheDocument();
  });
});
