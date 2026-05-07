import type { PresetEntry } from '../types/perfil';

export interface IPerfilStorage {
  carregarPresets(): PresetEntry[];
  salvarPresets(presets: PresetEntry[]): void;
  getPresetAtivo(): string | null;
  setPresetAtivo(presetId: string | null): void;
  limpar(): void;
}

export class LocalStoragePerfilStorage implements IPerfilStorage {
  private readonly CHAVE_PRESETS = 'motocalc:v5:presets';
  private readonly CHAVE_ATIVO = 'motocalc:v5:presetAtivo';

  carregarPresets(): PresetEntry[] {
    try {
      const raw = localStorage.getItem(this.CHAVE_PRESETS);
      return raw ? (JSON.parse(raw) as PresetEntry[]) : [];
    } catch {
      return [];
    }
  }

  salvarPresets(presets: PresetEntry[]): void {
    localStorage.setItem(this.CHAVE_PRESETS, JSON.stringify(presets));
  }

  getPresetAtivo(): string | null {
    return localStorage.getItem(this.CHAVE_ATIVO);
  }

  setPresetAtivo(presetId: string | null): void {
    if (presetId) {
      localStorage.setItem(this.CHAVE_ATIVO, presetId);
    } else {
      localStorage.removeItem(this.CHAVE_ATIVO);
    }
  }

  limpar(): void {
    localStorage.removeItem(this.CHAVE_PRESETS);
    localStorage.removeItem(this.CHAVE_ATIVO);
  }
}
