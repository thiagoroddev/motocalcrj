import { describe, it, expect } from 'vitest';
import { montarItensManutencao } from './itensManutencao';
import type {
  CustoPeca,
  CustoServicoRevisao,
  PendenciaMaoDeObraConcessionaria,
} from '../types/calculos';

function peca(over: Partial<CustoPeca> & { pecaId: string }): CustoPeca {
  return {
    label: over.pecaId,
    cpk: 0,
    custoAnual: 100,
    intervaloKm: 12000,
    preco: 50,
    fonte: 'preset',
    proximaTrocaKm: 0,
    modo: 'amortizado',
    kmUltimaTroca: 0,
    kmDasProximasTrocas: [],
    trocasNoAno: 1,
    ...over,
  };
}

function servico(over: Partial<CustoServicoRevisao> & { servicoId: string }): CustoServicoRevisao {
  return {
    label: over.servicoId,
    custoAnual: 50,
    intervalKm: 12000,
    precoMaoDeObra: 50,
    precoServico: 50,
    statusPrecoAutorizada: 'informado',
    eventosNoAno: 1,
    ehExcepcional: false,
    modo: 'amortizado',
    kmUltimaTroca: 0,
    kmDasProximasTrocas: [],
    ...over,
  };
}

describe('montarItensManutencao', () => {
  it('funde peça + M.O. associada em um único item, somando o custo (Yamaha)', () => {
    const itens = montarItensManutencao(
      [['kit_relacao', peca({ pecaId: 'kit_relacao', label: 'Kit relação', custoAnual: 100 })]],
      [['troca-kit-transmissao', servico({ servicoId: 'troca-kit-transmissao', custoAnual: 50 })]],
    );

    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({
      id: 'kit_relacao',
      label: 'Kit relação',
      custoAnual: 150,
      status: 'oficial',
      pecaId: 'kit_relacao',
      servicoId: 'troca-kit-transmissao',
    });
    expect(itens[0].servico).toBeDefined();
  });

  it('M.O. estimada → status estimado', () => {
    const itens = montarItensManutencao(
      [['kit_relacao', peca({ pecaId: 'kit_relacao' })]],
      [
        [
          'troca-kit-transmissao',
          servico({
            servicoId: 'troca-kit-transmissao',
            statusPrecoAutorizada: 'nao_informado',
            maoDeObraEstimada: true,
          }),
        ],
      ],
    );

    expect(itens[0].status).toBe('estimado');
  });

  it('M.O. editada pelo usuário → status editado', () => {
    const itens = montarItensManutencao(
      [['kit_relacao', peca({ pecaId: 'kit_relacao' })]],
      [
        [
          'troca-kit-transmissao',
          servico({
            servicoId: 'troca-kit-transmissao',
            statusPrecoAutorizada: 'informado_usuario',
          }),
        ],
      ],
    );

    expect(itens[0].status).toBe('editado');
  });

  it('peça sem M.O. mas com pendência → status faltando, custo só da peça', () => {
    const pendencias: PendenciaMaoDeObraConcessionaria[] = [
      {
        servicoId: 'troca-kit-transmissao',
        label: 'Troca kit transmissão',
        intervalKm: 12000,
        statusPrecoAutorizada: 'nao_informado',
      },
    ];
    const itens = montarItensManutencao(
      [['kit_relacao', peca({ pecaId: 'kit_relacao', custoAnual: 100 })]],
      [],
      pendencias,
    );

    expect(itens[0]).toMatchObject({
      status: 'faltando',
      custoAnual: 100,
      pecaId: 'kit_relacao',
    });
    expect(itens[0].servicoId).toBeUndefined();
  });

  it('peça sem M.O. nem pendência (ex.: bateria) → status semMaoDeObra', () => {
    const itens = montarItensManutencao(
      [['bateria', peca({ pecaId: 'bateria', custoAnual: 30 })]],
      [],
      [],
    );

    expect(itens[0].status).toBe('semMaoDeObra');
  });

  it('serviço sem peça correspondente (Honda, peça já no preço oficial) vira item só-serviço com o nome do componente', () => {
    const itens = montarItensManutencao(
      [],
      [
        [
          'troca-sapata-dianteira',
          servico({
            servicoId: 'troca-sapata-dianteira',
            label: 'Troca sapata de freio dianteira',
            custoAnual: 80,
          }),
        ],
      ],
      [],
      { sapata_freio_dianteiro: 'Sapata de freio dianteiro' },
    );

    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({
      id: 'troca-sapata-dianteira',
      label: 'Sapata de freio dianteiro',
      custoAnual: 80,
      status: 'oficial',
      servicoId: 'troca-sapata-dianteira',
    });
    expect(itens[0].pecaId).toBeUndefined();
  });

  it('item só-serviço cai no nome do serviço quando não há nome de componente', () => {
    const itens = montarItensManutencao(
      [],
      [
        [
          'troca-sapata-dianteira',
          servico({ servicoId: 'troca-sapata-dianteira', label: 'Troca sapata' }),
        ],
      ],
    );

    expect(itens[0].label).toBe('Troca sapata');
  });

  it('preço de peça editado pelo usuário marca pecaEditada (pill "real")', () => {
    const itens = montarItensManutencao(
      [['pneu_traseiro', peca({ pecaId: 'pneu_traseiro', fonte: 'registro' })]],
      [],
      [],
    );

    expect(itens[0].pecaEditada).toBe(true);
  });

  it('herda o modo do componente (ancorado da peça)', () => {
    const itens = montarItensManutencao(
      [['kit_relacao', peca({ pecaId: 'kit_relacao', modo: 'ancorado', trocasNoAno: 2 })]],
      [
        [
          'troca-kit-transmissao',
          servico({ servicoId: 'troca-kit-transmissao', modo: 'ancorado', eventosNoAno: 2 }),
        ],
      ],
    );

    expect(itens[0].modo).toBe('ancorado');
    expect(itens[0].freq).toBe(2);
  });
});
