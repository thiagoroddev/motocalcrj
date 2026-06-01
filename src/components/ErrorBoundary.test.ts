import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary, resetarPerfilStorage } from './ErrorBoundary';
import type { IPerfilStorage } from '../services/perfilStorage';

describe('ErrorBoundary - lógica testável em ambiente node', () => {
  it('getDerivedStateFromError marca temErro=true', () => {
    expect(ErrorBoundary.getDerivedStateFromError()).toEqual({ temErro: true });
  });

  it('resetarPerfilStorage chama storage.limpar()', () => {
    const storage: IPerfilStorage = {
      carregarPresets: vi.fn(),
      salvarPresets: vi.fn(),
      getPresetAtivo: vi.fn(),
      setPresetAtivo: vi.fn(),
      limpar: vi.fn(),
      preservarCorrompido: vi.fn(),
    };

    resetarPerfilStorage(storage);

    expect(storage.limpar).toHaveBeenCalledTimes(1);
  });
});
