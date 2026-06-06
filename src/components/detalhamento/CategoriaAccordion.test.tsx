// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CategoriaAccordion } from './CategoriaAccordion';

type Props = Parameters<typeof CategoriaAccordion>[0];

function criarProps(overrides: Partial<Props> = {}): Props {
  return {
    label: 'Documentos',
    categoriaId: 'documentos',
    corClasse: 'bg-blue-400',
    valorExibido: 'R$ 100,00',
    porcentagem: '10%',
    ativo: true,
    expandido: false,
    onToggleAtivo: vi.fn(),
    onToggleExpandido: vi.fn(),
    ...overrides,
  };
}

afterEach(cleanup);

describe('CategoriaAccordion', () => {
  it('expõe botão nativo nomeado e o estado recolhido', () => {
    render(<CategoriaAccordion {...criarProps()} />);

    const cabecalho = screen.getByRole('heading', { level: 2, name: 'Documentos' });
    const acionador = screen.getByRole('button', { name: 'Documentos' });
    expect(within(cabecalho).getByRole('button', { name: 'Documentos' })).toBe(acionador);
    expect(acionador).toHaveAttribute('type', 'button');
    expect(acionador).toHaveAttribute('aria-expanded', 'false');

    acionador.focus();
    expect(acionador).toHaveFocus();
  });

  it('expõe o estado expandido e renderiza o conteúdo', () => {
    render(
      <CategoriaAccordion {...criarProps({ expandido: true })}>
        <span>Detalhes da categoria</span>
      </CategoriaAccordion>,
    );

    expect(screen.getByRole('button', { name: 'Documentos' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Detalhes da categoria')).toBeInTheDocument();
  });

  it('expande pelo acionador sem aninhar outros controles', () => {
    const onToggleExpandido = vi.fn();
    render(<CategoriaAccordion {...criarProps({ onToggleExpandido })} />);

    const acionador = screen.getByRole('button', { name: 'Documentos' });
    fireEvent.click(acionador);

    expect(onToggleExpandido).toHaveBeenCalledTimes(1);
    expect(within(acionador).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(acionador.querySelector('button, input, [tabindex]')).toBeNull();
  });

  it('mantém toggle e lápis independentes da expansão', () => {
    const onToggleAtivo = vi.fn();
    const onToggleExpandido = vi.fn();
    const onEditar = vi.fn();
    render(<CategoriaAccordion {...criarProps({ onToggleAtivo, onToggleExpandido, onEditar })} />);

    const toggle = screen.getByRole('checkbox', { name: 'Desativar' });
    expect(toggle.closest('label')).toHaveClass('inline-flex', 'h-5', 'w-9');

    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: 'Editar Documentos' }));

    expect(onToggleAtivo).toHaveBeenCalledTimes(1);
    expect(onEditar).toHaveBeenCalledTimes(1);
    expect(onToggleExpandido).not.toHaveBeenCalled();
  });

  it('não cria acionador de expansão quando semExpansao está ativo', () => {
    const onToggleExpandido = vi.fn();
    render(<CategoriaAccordion {...criarProps({ semExpansao: true, onToggleExpandido })} />);

    expect(screen.queryByRole('heading', { name: 'Documentos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Documentos' })).not.toBeInTheDocument();
    expect(screen.getByText('Documentos')).not.toHaveAttribute('aria-expanded');
    expect(onToggleExpandido).not.toHaveBeenCalled();
  });
});
