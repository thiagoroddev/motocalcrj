import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { perfilSchema, presetEntrySchema } from './perfilSchema';
import { perfilPadrao } from '../context/PerfilContext';
import type { PerfilUsuario, PresetEntry } from '../types/perfil';

describe('perfilSchema — compatibilidade schema ↔ tipo (ADR-010)', () => {
  it('z.infer<perfilSchema> é idêntico a PerfilUsuario', () => {
    // Trava de tipo: se o schema divergir de types/perfil.ts, o tsc quebra aqui.
    expectTypeOf<z.infer<typeof perfilSchema>>().toEqualTypeOf<PerfilUsuario>();
  });

  it('z.infer<presetEntrySchema> é idêntico a PresetEntry', () => {
    expectTypeOf<z.infer<typeof presetEntrySchema>>().toEqualTypeOf<PresetEntry>();
  });
});

describe('perfilSchema — validação de runtime', () => {
  it('aceita o perfil padrão (dado válido passa intacto)', () => {
    const resultado = perfilSchema.parse(perfilPadrao);
    expect(resultado).toEqual(perfilPadrao);
  });

  it('rejeita perfil sem o bloco `moto`', () => {
    const semMoto: Record<string, unknown> = { ...perfilPadrao };
    delete semMoto.moto;
    expect(() => perfilSchema.parse(semMoto)).toThrow();
  });

  it('rejeita tipo errado em campo profundo (kmAtual como string)', () => {
    const invalido = { ...perfilPadrao, moto: { ...perfilPadrao.moto, kmAtual: '20000' } };
    expect(() => perfilSchema.parse(invalido)).toThrow();
  });

  it('rejeita enum fora do domínio (situacaoMoto desconhecida)', () => {
    const invalido = {
      ...perfilPadrao,
      financeiro: { ...perfilPadrao.financeiro, situacaoMoto: 'roubada' },
    };
    expect(() => perfilSchema.parse(invalido)).toThrow();
  });

  it('aceita nuláveis legítimos (parcelaMensal e fipeCache null)', () => {
    expect(() => perfilSchema.parse(perfilPadrao)).not.toThrow();
    expect(perfilPadrao.financeiro.parcelaMensal).toBeNull();
    expect(perfilPadrao.fipeCache).toBeNull();
  });
});
