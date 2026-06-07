// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardServico } from './CardServico';
import type { ServicoIndependente } from '../../types/perfil';
import type { EstimativaMaoDeObraItem } from '../../utils/maoDeObraEstimada';

const servico: ServicoIndependente = {
  id: 'troca-kit-transmissao',
  nome: 'Kit transmissão',
  intervalKm: 18000,
  precoIndependente: 200,
  precoTotalAutorizada: 0,
  statusPrecoAutorizada: 'nao_informado',
  incluidoNaRevisaoAutorizada: false,
  ativo: true,
  ehExcepcional: false,
};

function estimativa(over: Partial<EstimativaMaoDeObraItem> = {}): EstimativaMaoDeObraItem {
  return { globalLigado: false, porServicoLigado: false, valorEstimado: 198, ...over };
}

afterEach(cleanup);

describe('CardServico (modo autorizada, sem valor informado)', () => {
  it('com estimativa por-serviço ligada: preço read-only exibindo o valor estimado', () => {
    render(
      <CardServico
        servico={servico}
        dispatch={vi.fn()}
        modo="autorizada"
        estimativaMaoDeObra={estimativa({ porServicoLigado: true })}
      />,
    );

    expect(screen.getByText('Usando estimativa (~) - tocar para desligar')).toBeInTheDocument();
    const input = screen.getByDisplayValue('198.00');
    expect(input).toHaveAttribute('readonly');
  });

  it('com estimativa global ligada: nota "ligada em Preferências" e sem toggle', () => {
    render(
      <CardServico
        servico={servico}
        dispatch={vi.fn()}
        modo="autorizada"
        estimativaMaoDeObra={estimativa({ globalLigado: true })}
      />,
    );

    expect(screen.getByText(/ligada em Preferências/)).toBeInTheDocument();
    expect(screen.queryByText(/Estimar mão de obra/)).not.toBeInTheDocument();
  });

  it('sem estimativa ligada: botão "Estimar mão de obra (~)" despacha o toggle do serviço', () => {
    const dispatch = vi.fn();
    render(
      <CardServico
        servico={servico}
        dispatch={dispatch}
        modo="autorizada"
        estimativaMaoDeObra={estimativa()}
      />,
    );

    fireEvent.click(screen.getByText('Estimar mão de obra (~)'));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_ESTIMATIVA_MAO_DE_OBRA_SERVICO',
      id: 'troca-kit-transmissao',
    });
  });

  it('sem objeto de estimativa: aviso de valor de concessionária não informado', () => {
    render(<CardServico servico={servico} dispatch={vi.fn()} modo="autorizada" />);
    expect(screen.getByText(/ainda não informado/)).toBeInTheDocument();
  });
});

describe('CardServico - procedência da vida útil', () => {
  it('marca o intervalo como informado pelo usuário ao editar', () => {
    const dispatch = vi.fn();
    render(<CardServico servico={servico} servicoPadrao={servico} dispatch={dispatch} />);

    const inputIntervalo = screen.getByDisplayValue('18000');
    fireEvent.change(inputIntervalo, { target: { value: '21000' } });
    fireEvent.blur(inputIntervalo);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SERVICO_INDEPENDENTE',
      payload: {
        ...servico,
        intervalKm: 21000,
        intervaloKmInformadoUsuario: true,
      },
    });
  });

  it('reset envia o serviço-base sem a marca de edição', () => {
    const dispatch = vi.fn();
    const servicoEditado: ServicoIndependente = {
      ...servico,
      intervalKm: 21000,
      intervaloKmInformadoUsuario: true,
    };
    render(<CardServico servico={servicoEditado} servicoPadrao={servico} dispatch={dispatch} />);

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar valor padrão' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar' }));

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SERVICO_INDEPENDENTE',
      payload: servico,
    });
  });
});
