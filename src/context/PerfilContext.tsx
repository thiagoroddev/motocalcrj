import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import type { PerfilAction } from '../types/perfil';
import { LocalStoragePerfilStorage } from '../services/perfilStorage';
import type { IPerfilStorage } from '../services/perfilStorage';
import { presetEntrySchema } from '../schemas/perfilSchema';
import { migrarPerfil } from '../services/migracoes';
import { estadoPadrao, perfilReducer, type EstadoApp } from './perfilReducer';

// Re-exports preservam a API pública usada pelos consumidores existentes.
export {
  perfilPadrao,
  SERVICOS_INDEPENDENTES_PADRAO,
  PRESETS_GASTOS_PADRAO,
} from './perfilDefaults';
export { perfilReducer } from './perfilReducer';
export type { EstadoApp } from './perfilReducer';

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

interface PerfilContextValue {
  estado: EstadoApp;
  dispatch: React.Dispatch<PerfilAction>;
}

export const PerfilContext = createContext<PerfilContextValue | null>(null);

export function usePerfilContext(): PerfilContextValue {
  const ctx = useContext(PerfilContext);
  if (!ctx) {
    throw new Error('usePerfilContext deve ser usado dentro de PerfilProvider');
  }
  return ctx;
}

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

interface PerfilProviderProps {
  children: React.ReactNode;
  // Injecao do storage - facilita testes
  storage?: IPerfilStorage;
}

export function criarEstadoInicial(storage: IPerfilStorage): EstadoApp {
  try {
    const presetsRaw = storage.carregarPresets();
    const ativoId = storage.getPresetAtivo();

    if (presetsRaw.length === 0) {
      return estadoPadrao;
    }

    // Carrega → migra → valida (ADR-010). Só o contrato público v1 tem migração;
    // qualquer versão desconhecida ou dado inválido cai no fallback abaixo.
    const presets = presetsRaw.map((p) =>
      presetEntrySchema.parse({ ...p, perfil: migrarPerfil(p.perfil) }),
    );
    const preset = presets.find((p) => p.presetId === ativoId) ?? presets[0];
    return { perfil: preset.perfil, presets, presetAtivoId: preset.presetId };
  } catch {
    // Dado persistido inválido/corrompido: preserva o blob para diagnóstico e
    // cai para o estado padrão - o app nunca trava (ADR-010, decisão 2).
    storage.preservarCorrompido();
    return estadoPadrao;
  }
}

export function PerfilProvider({ children, storage }: PerfilProviderProps) {
  const storageRef = useRef<IPerfilStorage>(storage ?? new LocalStoragePerfilStorage());

  const [estado, dispatch] = useReducer(perfilReducer, null, () =>
    criarEstadoInicial(storageRef.current),
  );

  // Persiste apenas após COMMIT_ONBOARDING (presetAtivoId só existe depois do commit)
  const primeiraMontagem = useRef(true);
  useEffect(() => {
    if (primeiraMontagem.current) {
      primeiraMontagem.current = false;
      return;
    }
    if (!estado.presetAtivoId) {
      return;
    }
    try {
      storageRef.current.salvarPresets(estado.presets);
    } catch {
      // Storage injetado também é tratado como best-effort.
    }
    try {
      storageRef.current.setPresetAtivo(estado.presetAtivoId);
    } catch {
      // Tenta persistir o preset ativo mesmo se a lista de presets falhar.
    }
  }, [estado]);

  return <PerfilContext.Provider value={{ estado, dispatch }}>{children}</PerfilContext.Provider>;
}
