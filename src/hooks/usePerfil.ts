import { usePerfilContext } from '../context/PerfilContext';
import type { PerfilUsuario, PresetEntry, PerfilAction } from '../types/perfil';
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
    temPresetAtivo: estado.presets.length > 0 && estado.perfil.onboardingConcluido,
    dispatch,
    ativarPreset,
  };
}
