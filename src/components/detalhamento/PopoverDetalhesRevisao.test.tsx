// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PopoverDetalhesRevisao } from './PopoverDetalhesRevisao';
import type { CicloRevisao, ProximaRevisao } from '../../utils/cicloRevisao';

const ciclo: CicloRevisao = {
  revisoes: [
    { ordem: 1, intervaloKm: 1000, precoTotal: 100, editado: false },
    { ordem: 2, intervaloKm: 6000, precoTotal: 200, editado: true },
  ],
  custoCicloCompleto: 300,
  kmCiclo: 6000,
};

const proximas: ProximaRevisao[] = [
  { km: 18000, precoTotal: 282.33 },
  { km: 24000, precoTotal: 638.15 },
];

afterEach(cleanup);

describe('PopoverDetalhesRevisao', () => {
  it('lista as revisões do ciclo e as próximas revisões quando aberto', () => {
    render(
      <PopoverDetalhesRevisao
        aberto
        ciclo={ciclo}
        kmAnual={12000}
        totalRevisao={150}
        proximasRevisoes={proximas}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByText('Revisões do ciclo')).toBeInTheDocument();
    expect(screen.getByText(/Ciclo completo/)).toBeInTheDocument();
    expect(screen.getByText('editado')).toBeInTheDocument();

    // Seção ancorada (informativa) com as próximas previstas.
    expect(screen.getByText(/Próximas revisões/)).toBeInTheDocument();
    expect(screen.getByText('Total previsto na janela')).toBeInTheDocument();
    expect(screen.getByText('18.000 km')).toBeInTheDocument();
  });

  it('mostra fallback quando não há cronograma', () => {
    render(
      <PopoverDetalhesRevisao
        aberto
        ciclo={null}
        kmAnual={12000}
        totalRevisao={0}
        proximasRevisoes={[]}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByText(/Sem cronograma/)).toBeInTheDocument();
  });

  it('avisa quando não há revisão prevista na janela', () => {
    render(
      <PopoverDetalhesRevisao
        aberto
        ciclo={ciclo}
        kmAnual={12000}
        totalRevisao={150}
        proximasRevisoes={[]}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByText(/Nenhuma revisão prevista/)).toBeInTheDocument();
  });
});
