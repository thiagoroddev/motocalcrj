import type { PresetEntry } from '../types/perfil';

export interface IPerfilStorage {
  carregarPresets(): PresetEntry[];
  salvarPresets(presets: PresetEntry[]): void;
  getPresetAtivo(): string | null;
  setPresetAtivo(presetId: string | null): void;
  limpar(): void;
  // Preserva o blob atual sob uma chave `.corrupted` quando ele falha na
  // validação/migração - sem perda silenciosa, permite diagnóstico/export
  // futuro (ADR-010, decisão 2). É best-effort: nunca lança.
  preservarCorrompido(): void;
}

export class LocalStoragePerfilStorage implements IPerfilStorage {
  private readonly CHAVE_PRESETS = 'estimamoto:v1:presets';
  private readonly CHAVE_ATIVO = 'estimamoto:v1:presetAtivo';
  private readonly CHAVE_CORROMPIDO = 'estimamoto:v1:presets.corrupted';

  carregarPresets(): PresetEntry[] {
    try {
      const raw = localStorage.getItem(this.CHAVE_PRESETS);
      return raw ? (JSON.parse(raw) as PresetEntry[]) : [];
    } catch {
      return [];
    }
  }

  salvarPresets(presets: PresetEntry[]): void {
    try {
      localStorage.setItem(this.CHAVE_PRESETS, JSON.stringify(presets));
    } catch {
      // Persistência local é best-effort. Falha de quota/modo privado não deve quebrar o app.
    }
  }

  getPresetAtivo(): string | null {
    try {
      return localStorage.getItem(this.CHAVE_ATIVO);
    } catch {
      return null;
    }
  }

  setPresetAtivo(presetId: string | null): void {
    try {
      if (presetId) {
        localStorage.setItem(this.CHAVE_ATIVO, presetId);
      } else {
        localStorage.removeItem(this.CHAVE_ATIVO);
      }
    } catch {
      // Persistência local é best-effort. Falha de quota/modo privado não deve quebrar o app.
    }
  }

  limpar(): void {
    try {
      localStorage.removeItem(this.CHAVE_PRESETS);
      localStorage.removeItem(this.CHAVE_ATIVO);
    } catch {
      // Limpeza é best-effort: se o storage falhar, a UI ainda deve seguir utilizável.
    }
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
