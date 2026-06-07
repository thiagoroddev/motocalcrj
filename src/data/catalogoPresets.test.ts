import { describe, expect, it } from 'vitest';
import { dadosLocaisSchema } from '../schemas/dadosLocaisSchema';
import { presetMotoCatalogoSchema } from '../schemas/presetSchema';
import { CATALOGO, obterConsumoKmLPorAno } from './catalogoModelos';
import dadosRJJson from './dados_rj.json';
import { PRESETS } from './repositorioPresets';

describe('catalogoModelos - presets', () => {
  it('valida todos os presets JSON pelo contrato Zod', () => {
    for (const [id, preset] of Object.entries(PRESETS)) {
      const resultado = presetMotoCatalogoSchema.safeParse(preset);

      expect(resultado.success, `Preset ${id} deve respeitar presetMotoCatalogoSchema`).toBe(true);
    }
  });

  it('valida os dados regionais usados pelo calculo', () => {
    const dadosRJ = dadosLocaisSchema.parse(dadosRJJson);

    expect(dadosRJ).toEqual({
      ipva: {
        aliquotaMotos: dadosRJJson.ipva.aliquotaMotos,
        isencaoIdadeMinimaMeses: dadosRJJson.ipva.isencaoIdadeMinimaMeses,
      },
      licenciamento: {
        tabela: dadosRJJson.licenciamento.tabela,
      },
      autonomiaEtanolFatorReducao: dadosRJJson.autonomiaEtanolFatorReducao,
    });
  });

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
      expect(preset.servicosManutencao?.length).toBeGreaterThan(0);

      expect(CATALOGO[id]).toEqual({
        id,
        marca: preset.marca,
        nome: preset.nomeCurto,
        nomeFipe: preset.nomeFipe,
        codigoFipe: preset.codigoFipe,
        tabelaFipe: preset.tabelaFipe,
        consumoKmLPorAno: preset.consumoKmLPorAno,
        aceitaEtanol: preset.aceitaEtanol,
      });
    }
  });

  it('publica a referência profissional explícita por modelo e ano', () => {
    expect(obterConsumoKmLPorAno('pop110i', 2016)).toBe(54);
    expect(obterConsumoKmLPorAno('pop110i', 2024)).toBe(54);
    expect(obterConsumoKmLPorAno('pop110i', 2025)).toBe(49.1);
    expect(obterConsumoKmLPorAno('pop110i', 2026)).toBeUndefined();
    expect(obterConsumoKmLPorAno('factor125i', 2017)).toBe(38);
    expect(obterConsumoKmLPorAno('factor125i', 2025)).toBe(38);

    const intervalos = (modelo: keyof typeof PRESETS) =>
      Object.fromEntries(
        (PRESETS[modelo].servicosManutencao ?? []).map((servico) => [
          servico.id,
          servico.intervalKm,
        ]),
      );

    expect(intervalos('pop110i')).toMatchObject({
      'troca-oleo': 3000,
      'troca-kit-transmissao': 18000,
      'troca-pneu-dianteiro': 24000,
      'troca-pneu-traseiro': 18000,
      'troca-sapata-dianteira': 12000,
      'troca-sapata-traseira': 12000,
      'troca-kit-embreagem': 42000,
      'troca-kit-cilindro': 102000,
    });
    expect(intervalos('factor125i')).toMatchObject({
      'troca-oleo': 5000,
      'troca-kit-transmissao': 25000,
      'troca-pneu-dianteiro': 22500,
      'troca-pneu-traseiro': 15000,
      'troca-pastilha-dianteira': 10000,
      'troca-disco-dianteiro': 50000,
      'troca-sapata-traseira': 20000,
      'troca-kit-embreagem': 40000,
      'troca-kit-cilindro': 115000,
    });
  });

  it('mantém a política de pneus avulsos por marca no MVP', () => {
    const servicosPop = PRESETS.pop110i.servicosManutencao ?? [];
    const servicosFactor = PRESETS.factor125i.servicosManutencao ?? [];

    expect(servicosPop.find((servico) => servico.id === 'troca-pneu-dianteiro')).toMatchObject({
      statusPrecoAutorizada: 'nao_informado',
    });
    expect(servicosPop.find((servico) => servico.id === 'troca-pneu-traseiro')).toMatchObject({
      statusPrecoAutorizada: 'nao_informado',
    });
    // Yamaha não troca pneu: entra como excepcional desligado (ADR-013), não como
    // avulso ativo de concessionária.
    expect(servicosFactor.find((servico) => servico.id === 'troca-pneu-dianteiro')).toMatchObject({
      ehExcepcional: true,
      ativo: false,
    });
    expect(servicosFactor.find((servico) => servico.id === 'troca-pneu-traseiro')).toMatchObject({
      ehExcepcional: true,
      ativo: false,
    });
  });

  it('registra serviços avulsos Honda publicados no site sem duplicar itens de revisão', () => {
    const servicosPop = PRESETS.pop110i.servicosManutencao ?? [];
    const servico = (id: string) => servicosPop.find((item) => item.id === id);

    expect(servico('troca-sapata-dianteira')).toMatchObject({
      precoTotalAutorizada: 289.45,
      statusPrecoAutorizada: 'informado',
      incluidoNaRevisaoAutorizada: false,
    });
    expect(servico('troca-sapata-traseira')).toMatchObject({
      precoTotalAutorizada: 212.45,
      statusPrecoAutorizada: 'informado',
      incluidoNaRevisaoAutorizada: false,
    });
    expect(servico('troca-oleo')).toMatchObject({
      precoTotalAutorizada: 50.68,
      statusPrecoAutorizada: 'informado',
      incluidoNaRevisaoAutorizada: true,
    });
    expect(servico('troca-vela')).toMatchObject({
      precoTotalAutorizada: 73.57,
      statusPrecoAutorizada: 'informado',
      incluidoNaRevisaoAutorizada: true,
    });
    expect(servico('troca-filtro-ar')).toMatchObject({
      precoTotalAutorizada: 55.55,
      statusPrecoAutorizada: 'informado',
      incluidoNaRevisaoAutorizada: true,
    });
  });
});
