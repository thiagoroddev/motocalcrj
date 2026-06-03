// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { perfilPadrao } from './context/PerfilContext';
import { buscarPrecoFipe } from './services/fipeService';
import type { PerfilUsuario, PresetEntry } from './types/perfil';

vi.mock('./services/fipeService', () => ({
  buscarPrecoFipe: vi.fn(),
}));

const CHAVE_PRESETS = 'estimamoto:v1:presets';
const CHAVE_ATIVO = 'estimamoto:v1:presetAtivo';

function criarPerfilValido(): PerfilUsuario {
  return {
    ...perfilPadrao,
    onboardingConcluido: true,
    moto: {
      ...perfilPadrao.moto,
      marca: 'Honda',
      modelo: 'pop110i',
      ano: 2024,
      perfilUso: 'entrega',
      kmAtual: 12500,
      kmUltimaRevisao: 12000,
      kmUltimaTrocas: { ...perfilPadrao.moto.kmUltimaTrocas },
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

function criarLocalStorageFalso(): Storage {
  const dados = new Map<string, string>();

  return {
    get length() {
      return dados.size;
    },
    clear: vi.fn(() => dados.clear()),
    getItem: vi.fn((chave: string) => dados.get(chave) ?? null),
    key: vi.fn((indice: number) => [...dados.keys()][indice] ?? null),
    removeItem: vi.fn((chave: string) => {
      dados.delete(chave);
    }),
    setItem: vi.fn((chave: string, valor: string) => {
      dados.set(chave, String(valor));
    }),
  };
}

function salvarPresetNoStorage(preset = criarPreset()): PresetEntry {
  localStorage.setItem(CHAVE_PRESETS, JSON.stringify([preset]));
  localStorage.setItem(CHAVE_ATIVO, preset.presetId);
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

describe('App - smoke UI', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', criarLocalStorageFalso());
    window.history.pushState({}, '', '/');
    vi.mocked(buscarPrecoFipe).mockResolvedValue({
      valor: 13200,
      codigoFipe: '',
      mesReferencia: 'junho de 2026',
      anoModelo: 2024,
    });
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

    await screen.findByText('Como você usa a moto?');
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

    const presetsRaw = localStorage.getItem(CHAVE_PRESETS);
    expect(presetsRaw).not.toBeNull();
    const presets = JSON.parse(presetsRaw!) as PresetEntry[];
    expect(presets).toHaveLength(1);
    expect(presets[0].perfil.onboardingConcluido).toBe(true);
    expect(localStorage.getItem(CHAVE_ATIVO)).toBe(presets[0].presetId);
    expect(buscarPrecoFipe).toHaveBeenCalled();
  });

  it('renderiza estimativa a partir de preset salvo', async () => {
    salvarPresetNoStorage();

    renderizarAppEm('/estimativa');

    await screen.findByText('Custo de operação por km');
    expect(screen.getByText('Estimado por ano')).toBeInTheDocument();
    expect(screen.queryByText(/Modelo não encontrado/i)).not.toBeInTheDocument();
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
    expect(screen.getByTestId('lista-insumos-pecas')).toHaveClass('sm:grid-cols-2');
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
});
