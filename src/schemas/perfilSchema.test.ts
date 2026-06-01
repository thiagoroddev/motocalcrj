import { describe, it, expect, expectTypeOf } from 'vitest';
import { z } from 'zod';
import { perfilSchema, presetEntrySchema } from './perfilSchema';
import { perfilPadrao } from '../context/PerfilContext';
import type { PerfilUsuario, PresetEntry } from '../types/perfil';

describe('perfilSchema - compatibilidade schema ↔ tipo (ADR-010)', () => {
  it('z.infer<perfilSchema> é idêntico a PerfilUsuario', () => {
    // Trava de tipo: se o schema divergir de types/perfil.ts, o tsc quebra aqui.
    expectTypeOf<z.infer<typeof perfilSchema>>().toEqualTypeOf<PerfilUsuario>();
  });

  it('z.infer<presetEntrySchema> é idêntico a PresetEntry', () => {
    expectTypeOf<z.infer<typeof presetEntrySchema>>().toEqualTypeOf<PresetEntry>();
  });
});

describe('perfilSchema - validação de runtime', () => {
  it('aceita o perfil padrão (dado válido passa intacto)', () => {
    const resultado = perfilSchema.parse(perfilPadrao);
    expect(resultado).toEqual(perfilPadrao);
  });

  it('rejeita schemaVersion diferente da versão atual', () => {
    const antigo = { ...perfilPadrao, schemaVersion: 23 };
    const futuro = { ...perfilPadrao, schemaVersion: 999 };

    expect(() => perfilSchema.parse(antigo)).toThrow();
    expect(() => perfilSchema.parse(futuro)).toThrow();
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

  it('rejeita valores financeiros negativos', () => {
    const invalido = {
      ...perfilPadrao,
      financeiro: { ...perfilPadrao.financeiro, internet: -1 },
    };

    expect(() => perfilSchema.parse(invalido)).toThrow();
  });

  it('rejeita autonomia zero em combustível (denominador)', () => {
    const invalido = {
      ...perfilPadrao,
      financeiro: {
        ...perfilPadrao.financeiro,
        combustiveis: {
          ...perfilPadrao.financeiro.combustiveis,
          comum: { ...perfilPadrao.financeiro.combustiveis.comum, autonomia: 0 },
        },
      },
    };

    expect(() => perfilSchema.parse(invalido)).toThrow();
  });

  it('aceita serviço temporal conhecido com intervalKm 0 e rejeita serviço km-driven com 0', () => {
    expect(() => perfilSchema.parse(perfilPadrao)).not.toThrow();

    const invalido = {
      ...perfilPadrao,
      servicosIndependentes: perfilPadrao.servicosIndependentes.map((servico) =>
        servico.id === 'troca-oleo' ? { ...servico, intervalKm: 0 } : servico,
      ),
    };

    expect(() => perfilSchema.parse(invalido)).toThrow();
  });

  it('rejeita km negativo em histórico de manutenção', () => {
    const invalido = {
      ...perfilPadrao,
      moto: {
        ...perfilPadrao.moto,
        kmUltimaTrocas: { ...perfilPadrao.moto.kmUltimaTrocas, oleo: -100 },
      },
    };

    expect(() => perfilSchema.parse(invalido)).toThrow();
  });
});
