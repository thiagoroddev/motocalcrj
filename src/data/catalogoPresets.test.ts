import { describe, expect, it } from 'vitest';
import { dadosLocaisSchema } from '../schemas/dadosLocaisSchema';
import { presetMotoCatalogoSchema } from '../schemas/presetSchema';
import { CATALOGO } from './catalogoModelos';
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
        consumoKmLComBau: preset.consumoKmLComBau,
        aceitaEtanol: preset.aceitaEtanol,
      });
    }
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
