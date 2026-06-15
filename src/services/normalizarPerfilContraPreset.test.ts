import { describe, expect, it } from 'vitest';
import { PRESETS } from '../data/repositorioPresets';
import { perfilPadrao, SERVICOS_INDEPENDENTES_PADRAO } from '../context/perfilDefaults';
import type { PerfilUsuario, ServicoIndependente } from '../types/perfil';
import { normalizarPerfilContraPreset } from './normalizarPerfilContraPreset';

const preset = PRESETS.pop110i;
const idPeca = preset.pecas[0].id;
const idPneu = preset.pneus[0].id;
const servicoSemCustoEncontrado = preset.servicosManutencao?.find(
  (servico) => !servico.ehExcepcional && servico.precoTotalAutorizada === 0,
);

if (!servicoSemCustoEncontrado) {
  throw new Error('Preset de teste sem serviços canônicos suficientes');
}

// Consts já estreitadas: o guard acima não propaga a narrowing para dentro dos
// closures abaixo, então fixamos o tipo não-undefined explicitamente.
const servicoSemCusto: ServicoIndependente = servicoSemCustoEncontrado;
const servicoRetificaLegado: ServicoIndependente = {
  id: 'retifica-completa',
  nome: 'Retífica completa',
  intervalKm: 120000,
  precoIndependente: 1500,
  precoTotalAutorizada: 0,
  incluidoNaRevisaoAutorizada: false,
  ativo: true,
  ehExcepcional: true,
};

function criarPerfilComReferencias(): PerfilUsuario {
  return {
    ...perfilPadrao,
    moto: { ...perfilPadrao.moto, marca: 'Honda', modelo: 'pop110i' },
    perfilManutencao: {
      ...perfilPadrao.perfilManutencao,
      estimativaMaoDeObraPorServico: {
        [servicoSemCusto.id]: false,
        [servicoRetificaLegado.id]: true,
        'servico-orfao': false,
      },
    },
    configuracaoDisplay: {
      ...perfilPadrao.configuracaoDisplay,
      imprevistosSugeridosAtivos: {
        [servicoRetificaLegado.id]: false,
        [servicoSemCusto.id]: true,
        'servico-orfao': true,
      },
      filtrosManutencao: {
        ...perfilPadrao.configuracaoDisplay.filtrosManutencao,
        manutencaoPorPeca: {
          [idPeca]: false,
          [idPneu]: true,
          'peca-orfa': false,
        },
        revisaoPorServico: {
          [servicoSemCusto.id]: false,
          [servicoRetificaLegado.id]: true,
          'servico-orfao': false,
        },
      },
    },
    pecasOverrides: [
      {
        id: idPeca,
        precoEditadoOriginal: 10,
        precoEditadaParalela: null,
        intervaloKmEditado: null,
      },
      {
        id: idPneu,
        precoEditadoOriginal: 20,
        precoEditadaParalela: null,
        intervaloKmEditado: null,
      },
      {
        id: 'peca-orfa',
        precoEditadoOriginal: 30,
        precoEditadaParalela: null,
        intervaloKmEditado: null,
      },
    ],
    servicosIndependentes: [
      servicoSemCusto,
      { ...servicoRetificaLegado, id: 'servico-orfao' },
      servicoRetificaLegado,
    ],
    revisaoAutorizadaOverrides: [
      { index: 0, precoPecas: 10, precoMaoDeObra: 20, precoTotal: 30 },
      {
        index: preset.revisaoAutorizada.length - 1,
        precoPecas: 40,
        precoMaoDeObra: 50,
        precoTotal: 90,
      },
      {
        index: preset.revisaoAutorizada.length,
        precoPecas: 60,
        precoMaoDeObra: 70,
        precoTotal: 130,
      },
    ],
  };
}

describe('normalizarPerfilContraPreset', () => {
  it('remove órfãos das sete coleções e preserva valores, ordem e capacidades canônicas', () => {
    const perfil = criarPerfilComReferencias();

    const normalizado = normalizarPerfilContraPreset(perfil, preset);

    expect(normalizado.pecasOverrides.map((override) => override.id)).toEqual([idPeca, idPneu]);
    expect(normalizado.servicosIndependentes.map((servico) => servico.id)).toEqual([
      servicoSemCusto.id,
    ]);
    expect(normalizado.revisaoAutorizadaOverrides.map((override) => override.index)).toEqual([
      0,
      preset.revisaoAutorizada.length - 1,
    ]);
    expect(normalizado.configuracaoDisplay.imprevistosSugeridosAtivos).toEqual({});
    expect(normalizado.configuracaoDisplay.filtrosManutencao.manutencaoPorPeca).toEqual({
      [idPeca]: false,
      [idPneu]: true,
    });
    expect(normalizado.configuracaoDisplay.filtrosManutencao.revisaoPorServico).toEqual({
      [servicoSemCusto.id]: false,
    });
    expect(normalizado.perfilManutencao.estimativaMaoDeObraPorServico).toEqual({
      [servicoSemCusto.id]: false,
    });
  });

  it('preserva a identidade do perfil quando todas as referências são válidas', () => {
    const perfilComOrfaos = criarPerfilComReferencias();
    const perfilLimpo = normalizarPerfilContraPreset(perfilComOrfaos, preset);

    expect(normalizarPerfilContraPreset(perfilLimpo, preset)).toBe(perfilLimpo);
  });

  it('usa os serviços padrão quando o preset não declara servicosManutencao', () => {
    const servicoPadrao = SERVICOS_INDEPENDENTES_PADRAO[0];
    const perfil: PerfilUsuario = {
      ...perfilPadrao,
      servicosIndependentes: [
        servicoPadrao,
        servicoRetificaLegado,
        { ...servicoPadrao, id: 'servico-orfao' },
      ],
      configuracaoDisplay: {
        ...perfilPadrao.configuracaoDisplay,
        imprevistosSugeridosAtivos: {
          [servicoRetificaLegado.id]: true,
          'servico-orfao': true,
        },
      },
    };

    const normalizado = normalizarPerfilContraPreset(perfil, {
      ...preset,
      servicosManutencao: undefined,
    });

    expect(normalizado.servicosIndependentes).toEqual([servicoPadrao]);
    expect(normalizado.configuracaoDisplay.imprevistosSugeridosAtivos).toEqual({});
  });
});
