import { describe, expect, it } from 'vitest';
import { dadosLocaisSchema } from '../schemas/dadosLocaisSchema';
import { presetMotoCatalogoSchema } from '../schemas/presetSchema';
import { CATALOGO, obterConsumoKmL, obterAnosModelo } from './catalogoModelos';
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
        consumoKmL: preset.consumoKmL,
        aceitaEtanol: preset.aceitaEtanol,
      });
    }
  });

  it('publica o consumo profissional por modelo (não por ano)', () => {
    expect(obterConsumoKmL('pop110i')).toBe(54);
    expect(obterConsumoKmL('factor125i')).toBe(38);
    expect(obterConsumoKmL('inexistente')).toBeUndefined();
  });

  it('publica os anos do modelo a partir da tabela FIPE (Pop sem 2025 - ES é outro modelo)', () => {
    expect(obterAnosModelo('pop110i')).toEqual([
      2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016,
    ]);
    expect(obterAnosModelo('pop110i')).not.toContain(2025);
    expect(obterAnosModelo('factor125i')[0]).toBeGreaterThanOrEqual(2024);
    expect(obterAnosModelo('inexistente')).toEqual([]);
  });

  it('mantém os intervalos canônicos dos serviços avulsos por modelo', () => {
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
    // Yamaha não troca pneu na concessionária → `ehExcepcional` (aba Independente),
    // mas ATIVO como avulso incompleto: M.O. de oficina independente + peça (Insumos),
    // igual ao pneu Honda, só mudando a aba. (BG-036)
    expect(servicosFactor.find((servico) => servico.id === 'troca-pneu-dianteiro')).toMatchObject({
      ehExcepcional: true,
      ativo: true,
    });
    expect(servicosFactor.find((servico) => servico.id === 'troca-pneu-traseiro')).toMatchObject({
      ehExcepcional: true,
      ativo: true,
    });
  });

  it('não publica retíficas e reserva serviços excepcionais aos pneus independentes', () => {
    const idsPneus = new Set(['troca-pneu-dianteiro', 'troca-pneu-traseiro']);

    for (const preset of Object.values(PRESETS)) {
      const servicos = preset.servicosManutencao ?? [];
      const ids = servicos.map((servico) => servico.id);

      expect(ids).not.toContain('retifica-cabecote');
      expect(ids).not.toContain('retifica-completa');
      expect(
        servicos
          .filter((servico) => servico.ehExcepcional)
          .every((servico) => idsPneus.has(servico.id)),
      ).toBe(true);
    }
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
