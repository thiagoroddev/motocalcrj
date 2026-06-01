import { describe, expect, it } from 'vitest';
import { CATALOGO } from './catalogoModelos';
import type { PresetMoto } from '../types/calculos';

type PresetComIdOpcional = PresetMoto & { id?: unknown };

const modulosPresets = import.meta.glob('../presets/*.json', {
  eager: true,
}) as Record<string, { default: PresetComIdOpcional }>;

function obterIdDoArquivoPreset(caminho: string): string {
  const nomeArquivo = caminho.split('/').pop();
  return nomeArquivo?.replace(/\.json$/, '') ?? caminho;
}

const presetsPorId = Object.fromEntries(
  Object.entries(modulosPresets).map(([caminho, modulo]) => [
    obterIdDoArquivoPreset(caminho),
    modulo.default,
  ]),
);

describe('catalogoModelos - presets', () => {
  it('todo id do catalogo tem um preset JSON correspondente', () => {
    const idsCatalogo = Object.keys(CATALOGO).sort();
    const idsPresets = Object.keys(presetsPorId).sort();

    expect(idsPresets, 'Todo id de CATALOGO precisa ter src/presets/<id>.json').toEqual(
      expect.arrayContaining(idsCatalogo),
    );

    for (const [idArquivo, preset] of Object.entries(presetsPorId)) {
      if (preset.id === undefined) continue;
      expect(preset.id).toBe(idArquivo);
    }
  });
});
