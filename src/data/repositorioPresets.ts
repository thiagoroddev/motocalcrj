import type { PresetMotoCatalogo } from '../types/calculos';

type ModuloPreset = {
  default: PresetMotoCatalogo;
};

const modulosPresets = import.meta.glob('../presets/*.json', {
  eager: true,
}) as Record<string, ModuloPreset>;

function obterIdDoCaminhoPreset(caminho: string): string {
  const nomeArquivo = caminho.split('/').pop();
  return nomeArquivo?.replace(/\.json$/, '') ?? caminho;
}

export const PRESETS: Record<string, PresetMotoCatalogo> = Object.fromEntries(
  Object.entries(modulosPresets).map(([caminho, modulo]) => [
    obterIdDoCaminhoPreset(caminho),
    modulo.default,
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
