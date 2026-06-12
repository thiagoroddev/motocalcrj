import { usePerfilContext } from '../context/PerfilContext';
import type {
  PerfilUsuario,
  PresetEntry,
  PerfilAction,
  RascunhoPredefinicao,
} from '../types/perfil';
import type React from 'react';

export type { IPerfilStorage } from '../services/perfilStorage';
export { LocalStoragePerfilStorage } from '../services/perfilStorage';

// ──────────────────────────────────────────────
// Hook principal usado pelos componentes
// ──────────────────────────────────────────────

interface UsePerfil {
  perfil: PerfilUsuario;
  presets: PresetEntry[];
  presetAtivoId: string | null;
  presetAtivo: PresetEntry | null;
  rascunhoPredefinicao: RascunhoPredefinicao | null;
  temPresetAtivo: boolean;
  dispatch: React.Dispatch<PerfilAction>;
  ativarPreset: (presetId: string) => void;
}

export function usePerfil(): UsePerfil {
  const { estado, dispatch } = usePerfilContext();

  const ativarPreset = (presetId: string) => {
    dispatch({ type: 'CARREGAR_PERFIL', presetId });
  };

  return {
    perfil: estado.perfil,
    presets: estado.presets,
    presetAtivoId: estado.presetAtivoId,
    presetAtivo: estado.presets.find((preset) => preset.presetId === estado.presetAtivoId) ?? null,
    rascunhoPredefinicao: estado.rascunhoPredefinicao,
    temPresetAtivo:
      !estado.rascunhoPredefinicao &&
      estado.presets.length > 0 &&
      estado.perfil.onboardingConcluido,
    dispatch,
    ativarPreset,
  };
}
