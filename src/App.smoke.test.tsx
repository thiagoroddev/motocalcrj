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
    nome: 'pop110i_v1',
    sufixo: 'v1',
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
    Element.prototype.scrollIntoView = vi.fn();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('conclui onboarding e renderiza estimativa sem modelo não encontrado', async () => {
    renderizarAppEm('/onboarding/modelo');

    // Passo 1: Modelo (marca + modelo unificados). Selecionar Honda auto-seleciona Pop 110i.
    fireEvent.click(await screen.findByRole('button', { name: 'Honda' }));
    fireEvent.click(await screen.findByRole('button', { name: /Pop 110i/i }));
    clicarProximo();

    // Passo 2: Ano (consumo vive só no Passo 3 de Km/consumo).
    await screen.findByText('Valor FIPE', {}, { timeout: 2000 });
    clicarProximo();

    // Passo 3: Km + consumo (consumo já vem pré-preenchido com o do modelo; não editamos).
    fireEvent.change(await screen.findByLabelText(/KM atual do hodômetro/i), {
      target: { value: '12500' },
    });
    clicarProximo();

    // Passo 4: Situação (default quitada → pula sub-rotas).
    await screen.findByText('Qual a situação da sua moto?');
    clicarProximo();

    // Passo 5: Seguro.
    await screen.findByText('Você tem seguro?');
    fireEvent.click(screen.getByRole('button', { name: 'Não' }));
    clicarProximo();

    // Passo 6: Alimentação.
    await screen.findByText('Alimentação no trabalho');
    clicarProximo();

    // Passo 7: Internet.
    await screen.findByText('Plano de Internet');
    clicarProximo();

    // Passo 8: Vida útil das peças.
    await screen.findByText('Vida útil das peças');
    clicarProximo();

    // Passo 9: Mão de obra.
    await screen.findByText('Valor de mão de obra');
    clicarProximo();

    // Passo 10: Últimas manutenções.
    await screen.findByText('Últimas manutenções do veículo');
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
    expect(presets[0].perfil.financeiro.combustiveis.comum.autonomia).toBe(54);
    expect(presets[0].perfil.financeiro.internet).toBe(0);
    expect(presets[0].perfil.financeiro.seguro.valorAnual).toBe(0);
    expect(presets[0].perfil.financeiro.alimentacaoDia).toBe(0);
    expect(presets[0].perfil.configuracaoDisplay.categoriasAtivas.internet).toBe(false);
    expect(presets[0].perfil.configuracaoDisplay.categoriasAtivas.seguro).toBe(false);
    expect(presets[0].perfil.configuracaoDisplay.categoriasAtivas.alimentacao).toBe(false);
    expect(presets[0].perfil.fipeCache).toMatchObject({ anoModelo: 2024, valor: 12126 });
    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo)).toBe(presets[0].presetId);
  });

  it('cria e alterna predefinições sem perder a configuração anterior', async () => {
    const perfilAnterior = criarPerfilValido({
      kmAtual: 98765,
      kmUltimaRevisao: 96000,
    });
    perfilAnterior.trabalho = {
      ...perfilAnterior.trabalho,
      kmPorDia: 140,
      diasPorSemana: 6,
    };
    perfilAnterior.financeiro = {
      ...perfilAnterior.financeiro,
      internet: 99,
      alimentacaoDia: 42,
      combustiveis: {
        ...perfilAnterior.financeiro.combustiveis,
        comum: { ...perfilAnterior.financeiro.combustiveis.comum, autonomia: 45 },
        aditivada: { ...perfilAnterior.financeiro.combustiveis.aditivada, autonomia: 45 },
      },
    };
    const presetAnterior = salvarPresetNoStorage(criarPreset(perfilAnterior));

    renderizarAppEm('/perfil');

    await screen.findByText('Predefinição Atual');
    fireEvent.click(screen.getByRole('button', { name: 'Criar nova predefinição' }));

    const seletorModelo = await screen.findByLabelText('Modelo');
    fireEvent.click(seletorModelo);
    fireEvent.click(await screen.findByRole('option', { name: 'Yamaha: Factor 125i' }));
    expect(screen.getByLabelText('Sufixo da predefinição')).toHaveValue('v1');
    fireEvent.click(screen.getByRole('button', { name: 'Criar predefinição' }));

    await screen.findByText('Valor FIPE', {}, { timeout: 2000 });
    clicarProximo();

    const campoKm = await screen.findByLabelText(/KM atual do hodômetro/i);
    const campoConsumo = screen.getByLabelText(/Consumo médio - Yamaha Factor 125i/i);
    expect(campoKm).toHaveValue(null);
    expect(campoConsumo).toHaveValue(38);
    fireEvent.change(campoKm, { target: { value: '22000' } });
    clicarProximo();

    await screen.findByText('Qual a situação da sua moto?');
    clicarProximo();

    await screen.findByText('Você tem seguro?');
    fireEvent.click(screen.getByRole('button', { name: 'Não' }));
    clicarProximo();

    await screen.findByText('Alimentação no trabalho');
    clicarProximo();

    await screen.findByText('Plano de Internet');
    clicarProximo();

    await screen.findByText('Vida útil das peças');
    clicarProximo();

    await screen.findByText('Valor de mão de obra');
    clicarProximo();

    await screen.findByText('Últimas manutenções do veículo');
    clicarProximo();

    fireEvent.click(await screen.findByRole('button', { name: 'Concluir configuração' }));
    await screen.findByText('Custo de operação por km');

    await waitFor(() => {
      const presetsRaw = localStorage.getItem(CHAVES_PERFIL_STORAGE.presets);
      expect(presetsRaw).not.toBeNull();
      expect(JSON.parse(presetsRaw!)).toHaveLength(2);
    });

    const presets = JSON.parse(
      localStorage.getItem(CHAVES_PERFIL_STORAGE.presets)!,
    ) as PresetEntry[];
    expect(presets[0]).toEqual(presetAnterior);
    expect(presets[1].perfil.moto).toMatchObject({
      marca: 'Yamaha',
      modelo: 'factor125i',
      kmAtual: 22000,
    });
    expect(presets[1].perfil.financeiro.combustiveis.comum.autonomia).toBe(38);
    expect(presets[1].perfil.financeiro.internet).toBe(0);
    expect(presets[1].perfil.financeiro.alimentacaoDia).toBe(0);
    expect(presets[1].perfil.trabalho).toMatchObject({
      kmPorDia: perfilPadrao.trabalho.kmPorDia,
      diasPorSemana: perfilPadrao.trabalho.diasPorSemana,
    });
    expect(presets[1]).toMatchObject({ nome: 'factor125i_v1', sufixo: 'v1' });
    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo)).toBe(presets[1].presetId);

    fireEvent.click(screen.getByRole('link', { name: 'Abrir perfil' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Alternar predefinição' }));
    fireEvent.click(await screen.findByRole('button', { name: /Honda: Pop 110i/ }));

    await waitFor(() => {
      expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo)).toBe(presetAnterior.presetId);
    });
    expect(await screen.findByText('Autonomia: 45 km/l')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar predefinição' }));
    const campoSufixo = await screen.findByLabelText('Sufixo da predefinição');
    expect(campoSufixo).toHaveValue('v1');
    fireEvent.change(campoSufixo, { target: { value: 'trabalho' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar sufixo' }));

    await waitFor(() => {
      const atualizados = JSON.parse(
        localStorage.getItem(CHAVES_PERFIL_STORAGE.presets)!,
      ) as PresetEntry[];
      expect(atualizados[0]).toMatchObject({
        nome: 'pop110i_trabalho',
        sufixo: 'trabalho',
      });
    });
    expect(screen.getByText('trabalho')).toBeInTheDocument();
  });

  it('deleta uma predefinição não ativa pela tela Perfil', async () => {
    const presetAtivo = criarPreset(criarPerfilValido());
    const presetOutro: PresetEntry = {
      ...criarPreset(criarPerfilValido()),
      presetId: 'preset-pop110i-2',
      nome: 'pop110i_v2',
      sufixo: 'v2',
    };
    localStorage.setItem(CHAVES_PERFIL_STORAGE.presets, JSON.stringify([presetAtivo, presetOutro]));
    localStorage.setItem(CHAVES_PERFIL_STORAGE.presetAtivo, presetAtivo.presetId);

    renderizarAppEm('/perfil');

    await screen.findByText('Predefinição Atual');
    fireEvent.click(screen.getByRole('button', { name: 'Deletar predefinição' }));

    // A ativa fica desabilitada; seleciona a não ativa (sufixo v2) e confirma.
    fireEvent.click(await screen.findByRole('button', { name: /v2/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Deletar' }));

    // O diálogo permanece aberto e confirma a exclusão; a v2 some da lista.
    expect(await screen.findByRole('status')).toHaveTextContent(/deletada/i);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /v2/ })).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const presets = JSON.parse(
        localStorage.getItem(CHAVES_PERFIL_STORAGE.presets)!,
      ) as PresetEntry[];
      expect(presets).toHaveLength(1);
      expect(presets[0].presetId).toBe(presetAtivo.presetId);
    });
    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo)).toBe(presetAtivo.presetId);
  });

  it('reseta a predefinição ativa e re-onboarda sobre o mesmo preset (sem duplicar)', async () => {
    const preset = salvarPresetNoStorage(); // Pop 110i, internet 50, presetId 'preset-pop110i'

    renderizarAppEm('/perfil');

    await screen.findByText('Predefinição Atual');
    fireEvent.click(screen.getByRole('button', { name: 'Resetar predefinição' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Resetar' }));

    // Re-onboarding começa no Ano (modelo preservado) e percorre os passos.
    await screen.findByText('Valor FIPE', {}, { timeout: 2000 });
    // O passo de modelo fica bloqueado no reset: não há "Voltar" no Ano, e o
    // cancelamento é rotulado como reset (não criação).
    expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar reset' })).toBeInTheDocument();
    clicarProximo();

    fireEvent.change(await screen.findByLabelText(/KM atual do hodômetro/i), {
      target: { value: '33000' },
    });
    clicarProximo();

    await screen.findByText('Qual a situação da sua moto?');
    clicarProximo();

    await screen.findByText('Você tem seguro?');
    fireEvent.click(screen.getByRole('button', { name: 'Não' }));
    clicarProximo();

    await screen.findByText('Alimentação no trabalho');
    clicarProximo();

    await screen.findByText('Plano de Internet');
    clicarProximo();

    await screen.findByText('Vida útil das peças');
    clicarProximo();

    await screen.findByText('Valor de mão de obra');
    clicarProximo();

    await screen.findByText('Últimas manutenções do veículo');
    clicarProximo();

    fireEvent.click(await screen.findByRole('button', { name: 'Concluir configuração' }));
    await screen.findByText('Custo de operação por km');

    await waitFor(() => {
      const presets = JSON.parse(
        localStorage.getItem(CHAVES_PERFIL_STORAGE.presets)!,
      ) as PresetEntry[];
      expect(presets).toHaveLength(1);
      expect(presets[0].perfil.moto.kmAtual).toBe(33000);
    });

    const presets = JSON.parse(
      localStorage.getItem(CHAVES_PERFIL_STORAGE.presets)!,
    ) as PresetEntry[];
    // Mesma entrada (id/sufixo/criadoEm preservados), sem duplicata.
    expect(presets[0].presetId).toBe(preset.presetId);
    expect(presets[0].sufixo).toBe('v1');
    expect(presets[0].criadoEm).toBe(preset.criadoEm);
    // Os dados editados foram zerados pelo re-onboarding (internet 50 → 0).
    expect(presets[0].perfil.financeiro.internet).toBe(0);
    expect(presets[0].perfil.onboardingConcluido).toBe(true);
    expect(localStorage.getItem(CHAVES_PERFIL_STORAGE.presetAtivo)).toBe(preset.presetId);
  });

  it('renderiza estimativa a partir de preset salvo', async () => {
    salvarPresetNoStorage();

    renderizarAppEm('/estimativa');

    await screen.findByText('Custo de operação por km');
    expect(screen.getByText('Custo estimado por ano')).toBeInTheDocument();
    expect(screen.queryByText(/Modelo não encontrado/i)).not.toBeInTheDocument();
  });

  it('não reabre onboarding parcial para um preset já concluído', async () => {
    salvarPresetNoStorage();

    renderizarAppEm('/onboarding/ano');

    expect(await screen.findByText('Predefinição Atual')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/perfil');
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
    expect(screen.getByText('Kit transmissão (corrente + coroa + pinhão)')).toBeInTheDocument();
    expect(screen.getByText('Pneu dianteiro')).toBeInTheDocument();
    expect(screen.getByText('Pneu traseiro')).toBeInTheDocument();
    expect(
      within(obterCardPorTexto('Kit transmissão (corrente + coroa + pinhão)')).getByText(
        'Vida útil: 18.000 km · Alterar na aba M. Obra',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('lista-insumos-pecas')).toHaveClass('sm:grid-cols-2');
  });

  it('mostra apenas a Concessionária para Honda na tela de Mão de Obra', async () => {
    salvarPresetNoStorage();

    renderizarAppEm('/mao-de-obra');

    expect(await screen.findByText('Mão de Obra - Concessionária')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Concessionária' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Independente' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Retífica/i)).not.toBeInTheDocument();
  });

  it('mantém a aba Independente para os pneus Yamaha', async () => {
    const perfil = criarPerfilValido();
    perfil.moto = {
      ...perfil.moto,
      marca: 'Yamaha',
      modelo: 'factor125i',
    };
    salvarPresetNoStorage(criarPreset(perfil));

    renderizarAppEm('/mao-de-obra');

    const abaIndependente = await screen.findByRole('tab', { name: 'Independente' });
    expect(screen.getByRole('tab', { name: 'Concessionária' })).toBeInTheDocument();
    fireEvent.mouseDown(abaIndependente, { button: 0, ctrlKey: false });

    expect(await screen.findByText('Serviços Independentes (oficina)')).toBeInTheDocument();
    expect(
      screen.getByText('Troca de pneu dianteiro (fora da concessionária)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Troca de pneu traseiro (fora da concessionária)')).toBeInTheDocument();
    expect(screen.queryByText(/Retífica/i)).not.toBeInTheDocument();
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
      within(obterCardPorTexto('Kit transmissão (corrente + coroa + pinhão)')).getByText(
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

    const linhaKitRelacao = (await screen.findByText('Kit transmissão (corrente + coroa + pinhão)'))
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

  it('o chip de M.O. abre o popup de estimativa (Segmentado Padrão / Estimado)', async () => {
    salvarPresetNoStorage();
    renderizarAppEm('/estimativa/detalhamento');
    await screen.findByText('Total estimado no ano');

    fireEvent.click(
      screen.getByRole('button', { name: 'Editar modo de estimativa de mão de obra' }),
    );

    expect(await screen.findByText('Padrão')).toBeInTheDocument();
    expect(screen.getByText('Estimado')).toBeInTheDocument();
  });
});
