import type { PresetEntryPersistido } from '../types/perfil';
import type { EstadoApp } from './perfilReducer';
import { obterPreset } from '../data/repositorioPresets';
import { normalizarPerfilContraPreset } from '../services/normalizarPerfilContraPreset';
import { normalizarPredefinicoesPersistidas } from '../utils/predefinicoes';

// Reconstrói o EstadoApp a partir de predefinições JÁ validadas (Zod): normaliza
// nomes/sufixos e reconcilia cada perfil contra o preset canônico (read repair),
// resolvendo o preset ativo. Caminho único compartilhado pela carga inicial
// (criarEstadoInicial) e pela restauração de backup (RESTAURAR_BACKUP), o que
// garante import determinístico e normalizado.
//
// O import de `EstadoApp` é só de tipo (apagado em runtime), então não há ciclo
// real com o reducer que consome esta função.

export interface ResultadoReconstrucao {
  estado: EstadoApp;
  houveLimpeza: boolean;
}

export function reconstruirEstadoDePresets(
  presetsValidados: PresetEntryPersistido[],
  ativoId: string | null,
): ResultadoReconstrucao {
  const resultadoNomes = normalizarPredefinicoesPersistidas(presetsValidados);
  let houveLimpeza = resultadoNomes.houveAlteracao;

  const presets = resultadoNomes.presets.map((validado) => {
    const presetCanonico = obterPreset(validado.perfil.moto.modelo);
    if (!presetCanonico) {
      return validado;
    }
    const perfilNormalizado = normalizarPerfilContraPreset(validado.perfil, presetCanonico);
    if (perfilNormalizado === validado.perfil) {
      return validado;
    }
    houveLimpeza = true;
    return { ...validado, perfil: perfilNormalizado };
  });

  const preset = presets.find((p) => p.presetId === ativoId) ?? presets[0];

  return {
    estado: {
      perfil: preset.perfil,
      presets,
      presetAtivoId: preset.presetId,
      rascunhoPredefinicao: null,
    },
    houveLimpeza,
  };
}
