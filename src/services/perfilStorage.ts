import type { PresetEntry } from '../types/perfil';

export const CHAVES_PERFIL_STORAGE = {
  presets: 'estimamoto:v0:presets',
  presetAtivo: 'estimamoto:v0:presetAtivo',
  presetsCorrompidos: 'estimamoto:v0:presets.corrupted',
} as const;

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
  carregarPresets(): PresetEntry[] {
    try {
      const raw = localStorage.getItem(CHAVES_PERFIL_STORAGE.presets);
      return raw ? (JSON.parse(raw) as PresetEntry[]) : [];
    } catch {
      return [];
    }
  }

  salvarPresets(presets: PresetEntry[]): void {
    try {
      localStorage.setItem(CHAVES_PERFIL_STORAGE.presets, JSON.stringify(presets));
    } catch {
      // Persistência local é best-effort. Falha de quota/modo privado não deve quebrar o app.
    }
  }

  getPresetAtivo(): string | null {
    try {
      return localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo);
    } catch {
      return null;
    }
  }

  setPresetAtivo(presetId: string | null): void {
    try {
      if (presetId) {
        localStorage.setItem(CHAVES_PERFIL_STORAGE.presetAtivo, presetId);
      } else {
        localStorage.removeItem(CHAVES_PERFIL_STORAGE.presetAtivo);
      }
    } catch {
      // Persistência local é best-effort. Falha de quota/modo privado não deve quebrar o app.
    }
  }

  limpar(): void {
    try {
      localStorage.removeItem(CHAVES_PERFIL_STORAGE.presets);
      localStorage.removeItem(CHAVES_PERFIL_STORAGE.presetAtivo);
    } catch {
      // Limpeza é best-effort: se o storage falhar, a UI ainda deve seguir utilizável.
    }
  }

  preservarCorrompido(): void {
    try {
      const raw = localStorage.getItem(CHAVES_PERFIL_STORAGE.presets);
      if (raw == null) return;
      const carimbo = new Date().toISOString();
      localStorage.setItem(
        CHAVES_PERFIL_STORAGE.presetsCorrompidos,
        JSON.stringify({ carimbo, raw }),
      );
    } catch {
      // Preservar é best-effort: se o próprio localStorage falhar (quota,
      // modo privado), não pode lançar e re-brickar a inicialização.
    }
  }
}
