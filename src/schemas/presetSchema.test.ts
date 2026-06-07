import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import dadosRJJson from '../data/dados_rj.json';
import pop110iJson from '../presets/pop110i.json';
import type { DadosRJ, PresetMoto, PresetMotoCatalogo } from '../types/calculos';
import { dadosLocaisSchema } from './dadosLocaisSchema';
import { presetMotoCatalogoSchema, presetMotoSchema } from './presetSchema';

describe('presetSchema - compatibilidade schema ↔ tipo', () => {
  it('z.infer<presetMotoSchema> é idêntico a PresetMoto', () => {
    expectTypeOf<z.infer<typeof presetMotoSchema>>().toEqualTypeOf<PresetMoto>();
  });

  it('z.infer<presetMotoCatalogoSchema> é idêntico a PresetMotoCatalogo', () => {
    expectTypeOf<z.infer<typeof presetMotoCatalogoSchema>>().toEqualTypeOf<PresetMotoCatalogo>();
  });

  it('z.infer<dadosLocaisSchema> é idêntico a DadosRJ', () => {
    expectTypeOf<z.infer<typeof dadosLocaisSchema>>().toEqualTypeOf<DadosRJ>();
  });
});

describe('presetSchema - validação de runtime', () => {
  it('remove campos de documentação dos presets no parse', () => {
    const resultado = presetMotoCatalogoSchema.parse(pop110iJson);

    expect(resultado).not.toHaveProperty('_fonte');
    expect(resultado.pecas[0]).not.toHaveProperty('_fonte');
  });

  it('remove campos regionais fora do contrato DadosRJ no parse', () => {
    const resultado = dadosLocaisSchema.parse(dadosRJJson);

    expect(resultado).not.toHaveProperty('_meta');
    expect(resultado).not.toHaveProperty('estado');
    expect(resultado).not.toHaveProperty('combustivel');
    expect(resultado.ipva).not.toHaveProperty('aliquotaCarros');
  });

  it('rejeita preset sem campo obrigatório do contrato', () => {
    const semConsumo: Record<string, unknown> = { ...pop110iJson };
    delete semConsumo.consumoKmL;

    expect(() => presetMotoCatalogoSchema.parse(semConsumo)).toThrow();
  });

  it('rejeita consumo não positivo (é do modelo, um número > 0)', () => {
    expect(() => presetMotoCatalogoSchema.parse({ ...pop110iJson, consumoKmL: 0 })).toThrow();
    expect(() => presetMotoCatalogoSchema.parse({ ...pop110iJson, consumoKmL: -1 })).toThrow();
  });

  it('rejeita dado regional com tipo inválido em campo usado pelo cálculo', () => {
    const invalido = {
      ...dadosRJJson,
      ipva: {
        ...dadosRJJson.ipva,
        aliquotaMotos: '0.02',
      },
    };

    expect(() => dadosLocaisSchema.parse(invalido)).toThrow();
  });
});
