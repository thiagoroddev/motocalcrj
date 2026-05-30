import type { PresetEntry } from '../types/perfil';

export interface IPerfilStorage {
  carregarPresets(): PresetEntry[];
  salvarPresets(presets: PresetEntry[]): void;
  getPresetAtivo(): string | null;
  setPresetAtivo(presetId: string | null): void;
  limpar(): void;
  // Preserva o blob atual sob uma chave `.corrupted` quando ele falha na
  // validação/migração — sem perda silenciosa, permite diagnóstico/export
  // futuro (ADR-010, decisão 2). É best-effort: nunca lança.
  preservarCorrompido(): void;
}

export class LocalStoragePerfilStorage implements IPerfilStorage {
  private readonly CHAVE_PRESETS = 'motocalc:v5:presets';
  private readonly CHAVE_ATIVO = 'motocalc:v5:presetAtivo';
  private readonly CHAVE_CORROMPIDO = 'motocalc:v5:presets.corrupted';

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

  preservarCorrompido(): void {
    try {
      const raw = localStorage.getItem(this.CHAVE_PRESETS);
      if (raw == null) return;
      const carimbo = new Date().toISOString();
      localStorage.setItem(this.CHAVE_CORROMPIDO, JSON.stringify({ carimbo, raw }));
    } catch {
      // Preservar é best-effort: se o próprio localStorage falhar (quota,
      // modo privado), não pode lançar e re-brickar a inicialização.
    }
  }
}
