import { z } from 'zod';
import { presetEntrySchema } from '../schemas/perfilSchema';
import { CHAVES_PERFIL_STORAGE } from './perfilStorage';
import type { IPerfilStorage } from './perfilStorage';

const fixtureDesenvolvimentoSchema = z
  .object({
    [CHAVES_PERFIL_STORAGE.presets]: z.array(presetEntrySchema).min(1),
    [CHAVES_PERFIL_STORAGE.presetAtivo]: z.string().min(1),
  })
  .superRefine((fixture, contexto) => {
    const presetAtivoExiste = fixture[CHAVES_PERFIL_STORAGE.presets].some(
      (preset) => preset.presetId === fixture[CHAVES_PERFIL_STORAGE.presetAtivo],
    );

    if (!presetAtivoExiste) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: [CHAVES_PERFIL_STORAGE.presetAtivo],
        message: 'Preset ativo precisa existir na lista da fixture',
      });
    }
  });

type CarregarFixture = () => Promise<unknown>;

export type ResultadoFixtureDesenvolvimento = 'carregada' | 'ignorada' | 'falhou';

export async function carregarFixtureDesenvolvimento(
  storage: IPerfilStorage,
  carregarFixture: CarregarFixture,
): Promise<ResultadoFixtureDesenvolvimento> {
  try {
    if (storage.carregarPresets().length > 0) {
      return 'ignorada';
    }

    const fixture = fixtureDesenvolvimentoSchema.parse(await carregarFixture());
    storage.salvarPresets(fixture[CHAVES_PERFIL_STORAGE.presets]);
    storage.setPresetAtivo(fixture[CHAVES_PERFIL_STORAGE.presetAtivo]);
    console.info(
      `[DEV] Fixture carregada: ${fixture[CHAVES_PERFIL_STORAGE.presets].length} presets disponíveis`,
    );
    return 'carregada';
  } catch (erro) {
    console.error('[DEV] Não foi possível carregar a fixture de desenvolvimento', erro);
    return 'falhou';
  }
}
