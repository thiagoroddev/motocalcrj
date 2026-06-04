import { presetMotoCatalogoSchema } from '../schemas/presetSchema';
import type { PresetMotoCatalogo } from '../types/calculos';

type ModuloPreset = {
  default: unknown;
};

const modulosPresets = import.meta.glob('../presets/*.json', {
  eager: true,
}) as Record<string, ModuloPreset>;

function obterIdDoCaminhoPreset(caminho: string): string {
  const nomeArquivo = caminho.split('/').pop();
  return nomeArquivo?.replace(/\.json$/, '') ?? caminho;
}

function validarPreset(caminho: string, preset: unknown): PresetMotoCatalogo {
  const resultado = presetMotoCatalogoSchema.safeParse(preset);

  if (!resultado.success) {
    throw new Error(`Preset invalido em ${caminho}: ${resultado.error.message}`);
  }

  return resultado.data;
}

export const PRESETS: Record<string, PresetMotoCatalogo> = Object.fromEntries(
  Object.entries(modulosPresets).map(([caminho, modulo]) => [
    obterIdDoCaminhoPreset(caminho),
    validarPreset(caminho, modulo.default),
  ]),
);

export const IDS_PRESETS = Object.keys(PRESETS).sort();

export const LISTA_PRESETS = IDS_PRESETS.map((id) => ({
  id,
  preset: PRESETS[id],
}));

export function obterPreset(modeloId: string): PresetMotoCatalogo | undefined {
  return PRESETS[modeloId];
}
