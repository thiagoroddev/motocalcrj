// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { perfilPadrao } from './context/PerfilContext';
import { CHAVES_PERFIL_STORAGE } from './services/perfilStorage';
import { criarLocalStorageFalso } from './test/localStorageFalso';
import type { PerfilUsuario, PresetEntry } from './types/perfil';

type MotoRevisaoOverrides = Partial<Pick<PerfilUsuario['moto'], 'kmAtual' | 'kmUltimaRevisao'>>;

function criarPerfilValido(motoRevisaoOverrides: MotoRevisaoOverrides = {}): PerfilUsuario {
  return {
    ...perfilPadrao,
    onboardingConcluido: true,
    moto: {
      ...perfilPadrao.moto,
      marca: 'Honda',
      modelo: 'pop110i',
      ano: 2024,
      kmAtual: 12500,
      kmUltimaRevisao: 12000,
      kmUltimaTrocas: { ...perfilPadrao.moto.kmUltimaTrocas },
      ...motoRevisaoOverrides,
    },
    trabalho: {
      ...perfilPadrao.trabalho,
      kmPorDia: 70,
      diasPorSemana: 5,
      horasPorDia: 8,
    },
    financeiro: {
      ...perfilPadrao.financeiro,
      internet: 50,
      seguro: {
        valorAnual: 1200,
        empresa: 'Seguradora Teste',
        periodicidade: 'anual',
      },
      alimentacaoDia: 20,
      combustiveis: {
        comum: { ...perfilPadrao.financeiro.combustiveis.comum },
        aditivada: { ...perfilPadrao.financeiro.combustiveis.aditivada },
        etanol: { ...perfilPadrao.financeiro.combustiveis.etanol },
      },
      gastosCustom: perfilPadrao.financeiro.gastosCustom.map((gasto) => ({ ...gasto })),
      responsabilidadeAluguel: { ...perfilPadrao.financeiro.responsabilidadeAluguel },
    },
    configuracaoDisplay: {
      ...perfilPadrao.configuracaoDisplay,
      categoriasAtivas: {
        ...perfilPadrao.configuracaoDisplay.categoriasAtivas,
        internet: true,
        seguro: true,
        alimentacao: true,
      },
      imprevistosSugeridosAtivos: {
        ...perfilPadrao.configuracaoDisplay.imprevistosSugeridosAtivos,
      },
      filtrosManutencao: { ...perfilPadrao.configuracaoDisplay.filtrosManutencao },
    },
    pecasOverrides: perfilPadrao.pecasOverrides.map((override) => ({ ...override })),
    servicosIndependentes: perfilPadrao.servicosIndependentes.map((servico) => ({
      ...servico,
    })),
    revisaoAutorizadaOverrides: perfilPadrao.revisaoAutorizadaOverrides.map((override) => ({
      ...override,
    })),
    fipeCache: {
      valor: 13200,
      codigoFipe: '',
      dataConsulta: '2026-06-01',
      anoModelo: 2024,
      marca: 'Honda',
      modelo: 'pop110i',
    },
  };
}

function criarPreset(perfil = criarPerfilValido()): PresetEntry {
  return {
    presetId: 'preset-pop110i',
    nome: 'Honda Pop 110i',
    criadoEm: '2026-06-01T12:00:00.000Z',
    atualizadoEm: '2026-06-01T12:00:00.000Z',
    perfil,
  };
}

function salvarPresetNoStorage(preset = criarPreset()): PresetEntry {
  localStorage.setItem(CHAVES_PERFIL_STORAGE.presets, JSON.stringify([preset]));
  localStorage.setItem(CHAVES_PERFIL_STORAGE.presetAtivo, preset.presetId);
  return preset;
}

function renderizarAppEm(rota: string) {
  window.history.pushState({}, '', rota);
  return render(<App />);
}

function clicarProximo() {
  fireEvent.click(screen.getByRole('button', { name: /^Próximo/ }));
}

function obterCardPorTexto(texto: string): HTMLElement {
  const elemento = screen.getByText(texto);
  const card = elemento.closest('[class*="bg-card"]');
  if (!(card instanceof HTMLElement)) {
    throw new Error(`Card nao encontrado para: ${texto}`);
  }
  return card;
}

function obterCardTotalDetalhamento(): HTMLElement {
  const titulo = screen.getByText('Total estimado no ano');
  const card = titulo.closest('div');
  if (!(card instanceof HTMLElement)) {
    throw new Error('Card de total nao encontrado');
  }
  return card;
}

function obterValorTotalDetalhamento(): string | null {
  const cardTotal = obterCardTotalDetalhamento();
  const valor = within(cardTotal)
    .getAllByText(/^R\$/)
    .find((elemento) => !elemento.textContent?.includes('/km'));

  return valor?.textContent ?? null;
}

function obterCpkDetalhamento(): string | null {
  return within(obterCardTotalDetalhamento()).getByText(/\/km$/).textContent;
}

function obterValorCategoria(card: HTMLElement): string | null {
  return within(card).getAllByText(/^R\$/)[0]?.textContent ?? null;
}

describe('App - smoke UI', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', criarLocalStorageFalso());
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('conclui onboarding e renderiza estimativa sem modelo não encontrado', async () => {
    renderizarAppEm('/onboarding/1');

    fireEvent.click(screen.getByRole('button', { name: 'Honda' }));
    clicarProximo();

    fireEvent.click(await screen.findByRole('button', { name: /Pop 110i/i }));
    clicarProximo();

    const inputAno = await screen.findByRole('spinbutton');
    fireEvent.change(inputAno, { target: { value: '2024' } });
    await screen.findByText('Valor FIPE', {}, { timeout: 2000 });
    clicarProximo();

    await screen.findByText('Vida útil das peças');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    const inputAnoRetorno = await screen.findByRole('spinbutton');
    fireEvent.change(inputAnoRetorno, { target: { value: '2025' } });
    await screen.findByText('49,1 km/L', {}, { timeout: 2000 });
    await screen.findByText(/Valor FIPE indisponível para 2025/i);
    clicarProximo();

    await screen.findByText('Vida útil das peças');
    clicarProximo();

    fireEvent.change(await screen.findByLabelText(/KM atual do hodômetro/i), {
      target: { value: '12500' },
    });
    fireEvent.change(screen.getByLabelText(/KM na última revisão/i), {
      target: { value: '12000' },
    });
    clicarProximo();

    await screen.findByText('O que foi trocado?');
    clicarProximo();

    await screen.findByText('Qual a situação da sua moto?');
    clicarProximo();

    await screen.findByText('Você tem seguro?');
    fireEvent.click(screen.getByRole('button', { name: 'Não' }));
    clicarProximo();

    fireEvent.change(await screen.findByLabelText('Valor mensal (R$)'), {
      target: { value: '50' },
    });
    clicarProximo();

    await screen.findByText('Alimentação no trabalho');
    clicarProximo();

    fireEvent.click(await screen.findByRole('button', { name: 'Concluir configuração' }));

    await screen.findByText('Custo de operação por km');
    expect(screen.queryByText(/Modelo não encontrado/i)).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/estimativa');

    const presetsRaw = localStorage.getItem(CHAVES_PERFIL_STORAGE.presets);
    expect(presetsRaw).not.toBeNull();
    const presets = JSON.parse(presetsRaw!) as PresetEntry[];
    expect(presets).toHaveLength(1);
    expect(presets[0].perfil.onboardingConcluido).toBe(true);
    expect(presets[0].perfil.financeiro.combustiveis.comum.autonomia).toBe(49.1);
    expect(presets[0].perfil.fipeCache).toBeNull();
    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo)).toBe(presets[0].presetId);
  });

  it('renderiza estimativa a partir de preset salvo', async () => {
    salvarPresetNoStorage();

    renderizarAppEm('/estimativa');

    await screen.findByText('Custo de operação por km');
    expect(screen.getByText('Estimado por ano')).toBeInTheDocument();
    expect(screen.queryByText(/Modelo não encontrado/i)).not.toBeInTheDocument();
  });

  it('mostra revisão pendente ao atingir exatamente a próxima revisão prevista', async () => {
    const perfil = criarPerfilValido({
      kmUltimaRevisao: 12000,
      kmAtual: 18000,
    });
    salvarPresetNoStorage(criarPreset(perfil));

    renderizarAppEm('/estimativa');

    await screen.findByText('Custo de operação por km');
    expect(screen.getByText('Revisão pendente')).toBeInTheDocument();
    const descricaoAviso = screen.getByText(/A sua próxima revisão periódica, prevista para/);
    expect(within(descricaoAviso).getByText('18.000 km')).toBeInTheDocument();
  });

  it('não mostra revisão pendente sem km da última revisão informado', async () => {
    const perfil = criarPerfilValido({
      kmUltimaRevisao: null,
      kmAtual: 18000,
    });
    salvarPresetNoStorage(criarPreset(perfil));

    renderizarAppEm('/estimativa');

    await screen.findByText('Custo de operação por km');
    expect(screen.queryByText('Revisão pendente')).not.toBeInTheDocument();
  });

  it('não mostra revisão pendente antes da próxima revisão prevista', async () => {
    const perfil = criarPerfilValido({
      kmUltimaRevisao: 12000,
      kmAtual: 17999,
    });
    salvarPresetNoStorage(criarPreset(perfil));

    renderizarAppEm('/estimativa');

    await screen.findByText('Custo de operação por km');
    expect(screen.queryByText('Revisão pendente')).not.toBeInTheDocument();
  });

  it('renderiza Insumos do MVP sem paralelas e sem peças cobertas pela revisão', async () => {
    salvarPresetNoStorage();

    renderizarAppEm('/insumos');

    await screen.findByText('Peças e Pneus');
    expect(screen.queryByText('Paralela (R$)')).not.toBeInTheDocument();
    expect(screen.getAllByText('Original (R$)').length).toBeGreaterThan(0);
    expect(screen.queryByText('Óleo do motor')).not.toBeInTheDocument();
    expect(screen.queryByText('Vela de ignição')).not.toBeInTheDocument();
    expect(screen.queryByText('Filtro de ar (tipo viscoso)')).not.toBeInTheDocument();
    expect(screen.getByText('Kit relação (corrente + coroa + pinhão)')).toBeInTheDocument();
    expect(screen.getByText('Pneu dianteiro')).toBeInTheDocument();
    expect(screen.getByText('Pneu traseiro')).toBeInTheDocument();
    expect(
      within(obterCardPorTexto('Kit relação (corrente + coroa + pinhão)')).getByText(
        'Vida útil: 18.000 km · Alterar na aba M. Obra',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('lista-insumos-pecas')).toHaveClass('sm:grid-cols-2');
  });

  it('preserva em Insumos a vida útil conscientemente editada no serviço', async () => {
    const perfil = criarPerfilValido();
    perfil.servicosIndependentes = perfil.servicosIndependentes.map((servico) =>
      servico.id === 'troca-kit-transmissao'
        ? {
            ...servico,
            intervalKm: 21000,
            intervaloKmInformadoUsuario: true,
          }
        : servico,
    );
    salvarPresetNoStorage(criarPreset(perfil));

    renderizarAppEm('/insumos');

    await screen.findByText('Peças e Pneus');
    expect(
      within(obterCardPorTexto('Kit relação (corrente + coroa + pinhão)')).getByText(
        'Vida útil: 21.000 km · Alterar na aba M. Obra',
      ),
    ).toBeInTheDocument();
  });

  it('renderiza detalhamento e alternar Alimentação muda total sem quebrar CPK', async () => {
    salvarPresetNoStorage();

    renderizarAppEm('/estimativa/detalhamento');

    await screen.findByText('Total estimado no ano');
    expect(screen.queryByText(/Modelo não encontrado/i)).not.toBeInTheDocument();

    const totalAntes = obterValorTotalDetalhamento();
    const cpkAntes = obterCpkDetalhamento();
    const cardAlimentacao = obterCardPorTexto('Alimentação');
    const toggleAlimentacao = within(cardAlimentacao).getByRole('checkbox');

    fireEvent.click(toggleAlimentacao);

    await waitFor(() => {
      expect(obterValorTotalDetalhamento()).not.toBe(totalAntes);
    });
    expect(obterCpkDetalhamento()).toBeTruthy();
    expect(obterCpkDetalhamento()).not.toBe(cpkAntes);
  });

  it('atualiza o valor do header de Manutenção ao desativar uma peça', async () => {
    salvarPresetNoStorage();
    renderizarAppEm('/estimativa/detalhamento');
    await screen.findByText('Total estimado no ano');

    const acionadorManutencao = screen.getByRole('button', { name: /^Manutenção/ });
    const cardManutencao = acionadorManutencao.closest('[class*="bg-card"]');
    if (!(cardManutencao instanceof HTMLElement)) {
      throw new Error('Card de Manutenção não encontrado');
    }
    const totalGeralAntes = obterValorTotalDetalhamento();
    const totalManutencaoAntes = obterValorCategoria(cardManutencao);

    fireEvent.click(acionadorManutencao);

    const linhaKitRelacao = (await screen.findByText('Kit relação (corrente + coroa + pinhão)'))
      .parentElement;
    if (!(linhaKitRelacao instanceof HTMLElement)) {
      throw new Error('Linha do Kit relação não encontrada');
    }
    fireEvent.click(within(linhaKitRelacao).getByRole('checkbox'));

    await waitFor(() => {
      expect(obterValorTotalDetalhamento()).not.toBe(totalGeralAntes);
      expect(obterValorCategoria(cardManutencao)).not.toBe(totalManutencaoAntes);
    });
  });

  it('o chip de M.O. abre o popup de estimativa (Segmentado Só valor real / Incluir ~estimativa)', async () => {
    salvarPresetNoStorage();
    renderizarAppEm('/estimativa/detalhamento');
    await screen.findByText('Total estimado no ano');

    fireEvent.click(
      screen.getByRole('button', { name: 'Editar modo de estimativa de mão de obra' }),
    );

    expect(await screen.findByText('Só valor real')).toBeInTheDocument();
    expect(screen.getByText('Incluir ~estimativa')).toBeInTheDocument();
  });
});
