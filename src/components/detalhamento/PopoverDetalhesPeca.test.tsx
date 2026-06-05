// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PopoverDetalhesPeca } from './PopoverDetalhesPeca';
import type { ItemManutencaoComposto } from '../../utils/itensManutencao';
import type { CustoPeca, CustoServicoRevisao } from '../../types/calculos';

const peca: CustoPeca = {
  pecaId: 'kit_relacao',
  label: 'Kit relação',
  cpk: 0.025,
  custoAnual: 455,
  intervaloKm: 18000,
  preco: 300,
  fonte: 'preset',
  proximaTrocaKm: 0,
  modo: 'amortizado',
  kmUltimaTroca: 0,
  kmDasProximasTrocas: [],
  trocasNoAno: 1.01,
};

const servico: CustoServicoRevisao = {
  servicoId: 'troca-kit-relacao',
  label: 'Troca kit relação',
  custoAnual: 200,
  intervalKm: 18000,
  precoMaoDeObra: 155,
  precoServico: 155,
  statusPrecoAutorizada: 'informado',
  eventosNoAno: 1.01,
  ehExcepcional: false,
  modo: 'amortizado',
  kmUltimaTroca: 0,
  kmDasProximasTrocas: [],
};

function itemComposto(overrides: Partial<ItemManutencaoComposto> = {}): ItemManutencaoComposto {
  return {
    id: 'kit_relacao',
    label: 'Kit relação',
    custoAnual: 455,
    modo: 'amortizado',
    freq: 1.01,
    status: 'oficial',
    pecaEditada: false,
    pecaId: 'kit_relacao',
    servicoId: 'troca-kit-relacao',
    peca,
    servico,
    ...overrides,
  };
}

afterEach(cleanup);

describe('PopoverDetalhesPeca', () => {
  it('com M.O.: composição soma peça + mão de obra', () => {
    render(
      <PopoverDetalhesPeca
        item={itemComposto()}
        aberto
        kmAtual={50000}
        kmAnual={18000}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByText('Composição por troca')).toBeInTheDocument();
    expect(screen.getByText('Peça')).toBeInTheDocument();
    expect(screen.getByText('Mão de obra (concessionária)')).toBeInTheDocument();
    expect(screen.getByText('Total por troca')).toBeInTheDocument();
  });

  it('sem M.O.: composição mostra só a peça', () => {
    render(
      <PopoverDetalhesPeca
        item={itemComposto({ servico: undefined, servicoId: undefined, status: 'semMaoDeObra' })}
        aberto
        kmAtual={50000}
        kmAnual={18000}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByText('Peça')).toBeInTheDocument();
    expect(screen.queryByText(/Mão de obra/)).not.toBeInTheDocument();
  });

  it('amortizado mostra "Provisão no período"; ancorado mostra "Manutenções previstas"', () => {
    const { unmount } = render(
      <PopoverDetalhesPeca
        item={itemComposto()}
        aberto
        kmAtual={50000}
        kmAnual={18000}
        onOpenChange={() => {}}
      />,
    );
    expect(screen.getByText('Provisão no período')).toBeInTheDocument();
    unmount();

    render(
      <PopoverDetalhesPeca
        item={itemComposto({
          modo: 'ancorado',
          peca: { ...peca, modo: 'ancorado', kmUltimaTroca: 48000, kmDasProximasTrocas: [54000] },
        })}
        aberto
        kmAtual={50000}
        kmAnual={18000}
        onOpenChange={() => {}}
      />,
    );
    expect(screen.getByText('Manutenções previstas')).toBeInTheDocument();
  });
});
