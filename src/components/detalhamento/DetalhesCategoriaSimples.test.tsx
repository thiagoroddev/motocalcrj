// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { perfilPadrao } from '../../context/PerfilContext';
import type { PerfilUsuario } from '../../types/perfil';
import { moeda } from '../../utils/formatters';
import {
  DetalhesCategoriaSimples,
  obterLabelCategoriaSimples,
  type ChaveCategoriaSimples,
} from './DetalhesCategoriaSimples';

afterEach(cleanup);

function criarPerfil(financeiro: Partial<PerfilUsuario['financeiro']> = {}): PerfilUsuario {
  return {
    ...perfilPadrao,
    trabalho: { ...perfilPadrao.trabalho, diasPorSemana: 5 },
    financeiro: {
      ...perfilPadrao.financeiro,
      seguro: { ...perfilPadrao.financeiro.seguro },
      combustiveis: {
        comum: { ...perfilPadrao.financeiro.combustiveis.comum },
        aditivada: { ...perfilPadrao.financeiro.combustiveis.aditivada },
        etanol: { ...perfilPadrao.financeiro.combustiveis.etanol },
      },
      gastosCustom: perfilPadrao.financeiro.gastosCustom.map((gasto) => ({ ...gasto })),
      responsabilidadeAluguel: { ...perfilPadrao.financeiro.responsabilidadeAluguel },
      ...financeiro,
    },
  };
}

function renderizarDetalhes(
  chave: ChaveCategoriaSimples,
  perfil: PerfilUsuario,
  custoAnual: number,
) {
  const onEditar = vi.fn();
  render(
    <DetalhesCategoriaSimples
      chave={chave}
      perfil={perfil}
      custoAnual={custoAnual}
      periodo="mes"
      diasTrabalhadosNoPeriodo={20}
      formatarValorPeriodo={(valorAnual) => moeda(valorAnual / 12)}
      onEditar={onEditar}
      ariaLabel={`Editar ${chave}`}
    />,
  );
  return onEditar;
}

describe('DetalhesCategoriaSimples', () => {
  it('mostra a origem do custo de internet e aciona a edição', () => {
    const onEditar = renderizarDetalhes('internet', criarPerfil({ internet: 50 }), 600);

    expect(screen.getByText('Mensalidade').parentElement).toHaveTextContent('50,00');
    expect(screen.getByText('Cálculo anual').parentElement).toHaveTextContent('x 12');
    fireEvent.click(screen.getByRole('button', { name: 'Editar internet' }));
    expect(onEditar).toHaveBeenCalledOnce();
  });

  it('mostra dados e eventual custo considerado do seguro', () => {
    const perfil = criarPerfil({
      seguro: { valorAnual: 1200, empresa: 'Seguradora Teste', periodicidade: 'mensal' },
    });
    renderizarDetalhes('seguro', perfil, 1000);

    expect(screen.getByText('Periodicidade').parentElement).toHaveTextContent('Mensal');
    expect(screen.getByText('Seguradora').parentElement).toHaveTextContent('Seguradora Teste');
    expect(screen.getByText('Custo considerado').parentElement).toHaveTextContent('1.000,00');
  });

  it('explica a origem dos dias usados na alimentação', () => {
    renderizarDetalhes('alimentacao', criarPerfil({ alimentacaoDia: 25 }), 6000);

    expect(screen.getByText('Dias no período').parentElement).toHaveTextContent('20 dias/mês');
    expect(screen.getByText(/Os dias vêm da configuração de trabalho/)).toHaveTextContent(
      '5 dias/semana x 52 semanas',
    );
  });

  it('renderiza aluguel quando a situação da moto é alugada', () => {
    const perfil = criarPerfil({
      situacaoMoto: 'alugada',
      aluguelMensal: 300,
      aluguelPeriodicidade: 'semanal',
    });
    renderizarDetalhes('financiamento', perfil, 15600);

    expect(screen.getByText('Aluguel').parentElement).toHaveTextContent('300,00/semana');
    expect(screen.getByText('Cálculo anual').parentElement).toHaveTextContent('x 52');
    expect(obterLabelCategoriaSimples('Financiamento', 'financiamento', 'alugada')).toBe('Aluguel');
  });

  it('renderiza as parcelas restantes quando a moto é financiada', () => {
    const perfil = criarPerfil({
      situacaoMoto: 'financiada',
      parcelaMensal: 300,
      parcelasRestantes: 24,
      dataReferenciaParcelas: new Date().toISOString(),
    });
    renderizarDetalhes('financiamento', perfil, 3600);

    expect(screen.getByText('Parcelas restantes').parentElement).toHaveTextContent('24');
    expect(screen.getByText('Cálculo anual').parentElement).toHaveTextContent('x 12');
    expect(screen.getByText(/Projeta apenas as parcelas/)).toBeInTheDocument();
  });
});
