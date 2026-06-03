import { describe, expect, it } from 'vitest';
import { CATALOGO } from './catalogoModelos';
import { PRESETS } from './repositorioPresets';

describe('catalogoModelos - presets', () => {
  it('deriva o catalogo de todos os presets JSON', () => {
    const idsCatalogo = Object.keys(CATALOGO).sort();
    const idsPresets = Object.keys(PRESETS).sort();

    expect(idsCatalogo).toEqual(idsPresets);

    for (const [id, preset] of Object.entries(PRESETS)) {
      expect(preset.marca).toBeTruthy();
      expect(preset.modelo).toBeTruthy();
      expect(preset.nomeCurto).toBeTruthy();
      expect(preset.nomeFipe).toBeTruthy();
      expect(preset.tabelaFipe).toEqual(expect.any(Object));
      expect(typeof preset.aceitaEtanol).toBe('boolean');

      expect(CATALOGO[id]).toEqual({
        id,
        marca: preset.marca,
        nome: preset.nomeCurto,
        nomeFipe: preset.nomeFipe,
        codigoFipe: preset.codigoFipe,
        tabelaFipe: preset.tabelaFipe,
        consumoKmL: preset.consumoKmL,
        consumoKmLComBau: preset.consumoKmLComBau,
        aceitaEtanol: preset.aceitaEtanol,
      });
    }
  });
});
