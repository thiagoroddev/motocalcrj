// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SecaoManutencao } from './SecaoManutencao';
import type { CustoPeca, CustoServicoRevisao } from '../../types/calculos';
import type { CicloRevisao, ProximaRevisao } from '../../utils/cicloRevisao';

const peca: CustoPeca = {
  pecaId: 'pneu_traseiro',
  label: 'Pneu traseiro',
  cpk: 0.016,
  custoAnual: 289,
  intervaloKm: 16000,
  preco: 289,
  fonte: 'preset',
  proximaTrocaKm: 0,
  modo: 'amortizado',
  kmUltimaTroca: 0,
  kmDasProximasTrocas: [],
  trocasNoAno: 1,
};

const cicloRevisao: CicloRevisao = {
  revisoes: [
    { ordem: 1, intervaloKm: 6000, precoTotal: 152, editado: false },
    { ordem: 2, intervaloKm: 12000, precoTotal: 548, editado: false },
  ],
  custoCicloCompleto: 700,
  kmCiclo: 12000,
};

const proximasRevisoes: ProximaRevisao[] = [{ km: 12000, precoTotal: 548 }];

type Props = Parameters<typeof SecaoManutencao>[0];

function criarProps(overrides: Partial<Props> = {}): Props {
  const noop = () => {};
  return {
    totalManutencaoComRevisao: 1300,
    totalRevisao: 600,
    eventosRevisaoNoAno: 1.5,
    cicloRevisao,
    proximasRevisoes,
    modoRevisao: 'autorizadas',
    kmAtual: 12500,
    kmAnual: 18200,
    servicosRevisao: [] as [string, CustoServicoRevisao][],
    custoIncompleto: false,
    pendenciasMaoDeObra: [],
    pecas: [['pneu_traseiro', peca]] as [string, CustoPeca][],
    nomePorPeca: { pneu_traseiro: 'Pneu traseiro' },
    filtroAtivo: true,
    filtroRevisao: true,
    filtrosServicosRevisao: {},
    filtrosPecas: {},
    expandido: true,
    onToggleAtivo: noop,
    onToggleExpandido: noop,
    onToggleRevisao: noop,
    onToggleServicoRevisao: noop,
    onTogglePeca: noop,
    onEditarPeca: noop,
    onEditarRevisaoGeral: noop,
    onEditarServicoRevisao: noop,
    pp: (anual: number) => `R$ ${anual.toFixed(2)}`,
    pct: () => '10%',
    ...overrides,
  };
}

afterEach(cleanup);

describe('SecaoManutencao', () => {
  it('renderiza a linha da Revisão Geral e o item de peça quando expandido', () => {
    render(<SecaoManutencao {...criarProps()} />);

    expect(
      screen.getByRole('button', { name: 'Ver detalhes da Revisão Geral' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pneu traseiro')).toBeInTheDocument();
    expect(screen.getByText('Amortizados')).toBeInTheDocument();
  });

  it('abre o popover da Revisão Geral pelo botão olho', async () => {
    render(<SecaoManutencao {...criarProps()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes da Revisão Geral' }));

    expect(await screen.findByText('Revisões do ciclo')).toBeInTheDocument();
    expect(screen.getByText(/Próximas revisões/)).toBeInTheDocument();
  });

  it('mostra o aviso de custo parcial quando há pendência de mão de obra', () => {
    render(
      <SecaoManutencao
        {...criarProps({
          custoIncompleto: true,
          pendenciasMaoDeObra: [
            {
              servicoId: 'troca-kit-relacao',
              label: 'Kit relação',
              intervalKm: 18000,
              statusPrecoAutorizada: 'nao_informado',
            },
          ],
        })}
      />,
    );

    expect(screen.getByText(/Custo parcial de manutenção/)).toBeInTheDocument();
    expect(screen.getByText(/Kit relação/)).toBeInTheDocument();
  });

  it('mantém subtoggles posicionados, desbotados e bloqueados quando o pai está desligado', () => {
    const onToggleRevisao = vi.fn();
    const onTogglePeca = vi.fn();
    render(
      <SecaoManutencao
        {...criarProps({
          filtroAtivo: false,
          filtroRevisao: true,
          filtrosPecas: {},
          onToggleRevisao,
          onTogglePeca,
        })}
      />,
    );

    const revisao = screen.getByRole('checkbox', { name: 'Desativar Revisão Geral' });
    const pneu = screen.getByRole('checkbox', { name: 'Desativar Pneu traseiro' });

    expect(revisao).toBeChecked();
    expect(pneu).toBeChecked();
    expect(revisao).toBeDisabled();
    expect(pneu).toBeDisabled();
    expect(revisao.closest('label')).toHaveClass('bg-muted/40');
    expect(pneu.closest('label')).toHaveClass('bg-muted/40');

    fireEvent.click(revisao);
    fireEvent.click(pneu);
    expect(onToggleRevisao).not.toHaveBeenCalled();
    expect(onTogglePeca).not.toHaveBeenCalled();
  });

  it('restaura cor e interação dos subtoggles quando o pai está ligado', () => {
    const onToggleRevisao = vi.fn();
    render(
      <SecaoManutencao
        {...criarProps({
          filtroAtivo: true,
          filtroRevisao: true,
          onToggleRevisao,
        })}
      />,
    );

    const revisao = screen.getByRole('checkbox', { name: 'Desativar Revisão Geral' });
    expect(revisao).toBeChecked();
    expect(revisao).not.toBeDisabled();
    expect(revisao.closest('label')).toHaveClass('bg-primary');

    fireEvent.click(revisao);
    expect(onToggleRevisao).toHaveBeenCalledOnce();
  });
});
