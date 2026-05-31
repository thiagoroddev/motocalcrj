import { describe, it, expect } from 'vitest';
import {
  resolverKmDia,
  calcularKmAnual,
  calcularDiasAno,
  resolverConsumoEfetivo,
  calcularCpkCombustivel,
  resolverIntervaloPeca,
  resolverPrecoPeca,
  calcularCpkPorPeca,
  calcularCicloPeca,
  calcularKmDasProximasTrocas,
  calcularCpkPecasTotal,
  calcularIPVA,
  calcularLicenciamento,
  calcularCustoRevisaoAnual,
  calcularDetalhesRevisaoAnual,
  calcularCustoInternetAnual,
  calcularCustoSeguroAnual,
  calcularCustoAlimentacaoAnual,
  calcularTotalFiltrado,
  calcularGranularidades,
  calcularBreakdownPercentual,
  calcularBreakdownValores,
  converterAnualParaPeriodo,
  calcularCustoMotoAnual,
  calcularCustosPorCategoria,
  calcularCustoGastosCustomAnual,
  calcularCustoFinanciamentoAnual,
  calcularParcelasRestantesAtuais,
  categoriasParaFiltros,
  calcularResultado,
  MAPA_PECA_PARA_SERVICO,
} from './calculos';
import { SERVICOS_INDEPENDENTES_PADRAO, perfilPadrao } from '../context/PerfilContext';
import pop110i from '../presets/pop110i.json';
import type {
  CategoriaDisplay,
  PerfilUsuario,
  KmUltimaTrocas,
  PecaOverride,
  ServicoIndependente,
} from '../types/perfil';
import type { PresetMoto, CustosPorCategoria, FiltrosCategorias, DadosRJ } from '../types/calculos';

// O JSON infere `pneus[].posicao` como `string`; o preset real usa o union
// 'dianteiro' | 'traseiro'. Cast único aqui (mesmo padrão da produção, que
// tipa os presets carregados via import.meta.glob). Ver TASK-BG-016.
const presetPop110i = pop110i as PresetMoto;

// ─── Fixtures ────────────────────────────────────────────────────

const itensSubstituidosMock = ['Óleo Pro Honda 10w30'];
const servicosExecutadosMock = [{ categoria: 'Ajuste', servicos: ['Corrente de Transmissão'] }];

const presetMock: PresetMoto = {
  consumoKmL: 36,
  consumoKmLComBau: 33,
  pecas: [
    {
      id: 'oleo_motor',
      nome: 'Óleo do motor',
      intervaloKm: 6000,
      intervaloKmEntrega: 1250,
      precoOriginal: 40,
      precoParalela: 23,
      incluidoNaRevisaoAutorizada: true,
    },
    {
      id: 'vela_ignicao',
      nome: 'Vela de ignição',
      intervaloKm: 12000,
      intervaloKmEntrega: 12000,
      precoOriginal: 82,
      precoParalela: 29,
      incluidoNaRevisaoAutorizada: true,
    },
    {
      id: 'kit_relacao',
      nome: 'Kit relação',
      intervaloKm: 15000,
      intervaloKmEntrega: 18000,
      precoOriginal: 230,
      precoParalela: 82,
      incluidoNaRevisaoAutorizada: false,
    },
  ],
  pneus: [
    {
      id: 'pneu_traseiro',
      posicao: 'traseiro',
      vidaUtilKm: 16000,
      precoOriginal: 245,
      precoParalela: 137,
    },
  ],
  revisaoAutorizada: [
    {
      intervaloKm: 1000,
      intervaloMeses: 6,
      precoPecas: 105.94,
      precoMaoDeObra: 0,
      precoTotal: 105.94,
      itensSubstituidos: itensSubstituidosMock,
      servicosExecutados: servicosExecutadosMock,
    },
    {
      intervaloKm: 6000,
      intervaloMeses: 12,
      precoPecas: 248.06,
      precoMaoDeObra: 0,
      precoTotal: 248.06,
      itensSubstituidos: itensSubstituidosMock,
      servicosExecutados: servicosExecutadosMock,
    },
    {
      intervaloKm: 12000,
      intervaloMeses: 18,
      precoPecas: 352.29,
      precoMaoDeObra: 216.0,
      precoTotal: 568.29,
      itensSubstituidos: itensSubstituidosMock,
      servicosExecutados: servicosExecutadosMock,
    },
    {
      intervaloKm: 18000,
      intervaloMeses: 24,
      precoPecas: 402.7,
      precoMaoDeObra: 104.0,
      precoTotal: 506.7,
      itensSubstituidos: itensSubstituidosMock,
      servicosExecutados: servicosExecutadosMock,
    },
    {
      intervaloKm: 24000,
      intervaloMeses: 30,
      precoPecas: 449.76,
      precoMaoDeObra: 288.0,
      precoTotal: 737.76,
      itensSubstituidos: itensSubstituidosMock,
      servicosExecutados: servicosExecutadosMock,
    },
    {
      intervaloKm: 30000,
      intervaloMeses: 36,
      precoPecas: 247.67,
      precoMaoDeObra: 40.0,
      precoTotal: 287.67,
      itensSubstituidos: itensSubstituidosMock,
      servicosExecutados: servicosExecutadosMock,
    },
    {
      intervaloKm: 36000,
      intervaloMeses: 42,
      precoPecas: 600.2,
      precoMaoDeObra: 280.0,
      precoTotal: 880.2,
      itensSubstituidos: itensSubstituidosMock,
      servicosExecutados: servicosExecutadosMock,
    },
  ],
};

const kmUltimaTrocasVazio: KmUltimaTrocas = {
  oleo: 0,
  pneuDianteiro: 0,
  pneuTraseiro: 0,
  kitRelacao: 0,
  velaIgnicao: 0,
  filtroAr: 0,
  sapataFreioDianteiro: 0,
  sapataFreioTraseiro: 0,
  bateria: 0,
  kitEmbreagem: 0,
  kitCilindro: 0,
  retificaCabecote: 0,
  retificaCompleta: 0,
};

// ─── I. Rodagem ──────────────────────────────────────────────────

describe('resolverKmDia', () => {
  it('retorna sempre o kmPorDia do perfil (modo único após ADR-003)', () => {
    expect(resolverKmDia(80)).toBe(80);
  });
});

describe('calcularKmAnual', () => {
  it('usa multiplicação direta por 52 (canônico)', () => {
    expect(calcularKmAnual(80, 6)).toBe(80 * 6 * 52); // 24960
  });
});

describe('calcularDiasAno', () => {
  it('é diasSemana × 52 (dias trabalhados, não 365)', () => {
    expect(calcularDiasAno(6)).toBe(312);
    expect(calcularDiasAno(5)).toBe(260);
  });
});

// ─── II. Consumo ─────────────────────────────────────────────────

describe('resolverConsumoEfetivo', () => {
  it('retorna consumo com baú quando usaBau=true', () => {
    expect(resolverConsumoEfetivo(presetMock, true)).toBe(33);
  });

  it('retorna consumo sem baú quando usaBau=false', () => {
    expect(resolverConsumoEfetivo(presetMock, false)).toBe(36);
  });
});

describe('calcularCpkCombustivel', () => {
  it('divide preço pelo consumo (R$/km)', () => {
    expect(calcularCpkCombustivel(6.61, 33)).toBeCloseTo(0.2003, 3);
  });
});

// ─── III. CPK por Peça ───────────────────────────────────────────

describe('resolverIntervaloPeca', () => {
  it('usa intervaloKmEntrega para tipoUso entrega', () => {
    expect(resolverIntervaloPeca('oleo_motor', presetMock, 'entrega')).toBe(1250);
  });

  it('usa intervaloKm para tipoUso passageiro', () => {
    expect(resolverIntervaloPeca('oleo_motor', presetMock, 'passageiro')).toBe(6000);
  });

  it('usa vidaUtilKm para pneus (igual para entrega e passageiro)', () => {
    expect(resolverIntervaloPeca('pneu_traseiro', presetMock, 'entrega')).toBe(16000);
    expect(resolverIntervaloPeca('pneu_traseiro', presetMock, 'passageiro')).toBe(16000);
  });

  it('usa override.intervaloKmEditado quando presente', () => {
    const overrides: PecaOverride[] = [
      {
        id: 'oleo_motor',
        precoEditadoOriginal: null,
        precoEditadaParalela: null,
        intervaloKmEditado: 2500,
      },
    ];
    expect(resolverIntervaloPeca('oleo_motor', presetMock, 'entrega', overrides)).toBe(2500);
  });

  it('usa ServicoIndependente.intervalKm quando serviço ativo coincide com pecaId (ADR-004)', () => {
    const servicos: ServicoIndependente[] = [
      {
        id: 'pneu_traseiro',
        nome: 'Pneu traseiro',
        intervalKm: 9000,
        precoIndependente: 125,
        precoTotalAutorizada: 0,
        incluidoNaRevisaoAutorizada: false,
        ativo: true,
        ehExcepcional: false,
      },
    ];
    expect(resolverIntervaloPeca('pneu_traseiro', presetMock, 'entrega', [], servicos)).toBe(9000);
  });

  it('ignora ServicoIndependente inativo e cai no preset', () => {
    const servicos: ServicoIndependente[] = [
      {
        id: 'pneu_traseiro',
        nome: 'Pneu traseiro',
        intervalKm: 9000,
        precoIndependente: 125,
        precoTotalAutorizada: 0,
        incluidoNaRevisaoAutorizada: false,
        ativo: false,
        ehExcepcional: false,
      },
    ];
    expect(resolverIntervaloPeca('pneu_traseiro', presetMock, 'entrega', [], servicos)).toBe(16000);
  });
});

describe('resolverPrecoPeca', () => {
  it('usa precoOriginal quando perfilPecas = original', () => {
    expect(resolverPrecoPeca('oleo_motor', presetMock, 'original')).toBe(40);
  });

  it('usa precoParalela quando perfilPecas = paralela', () => {
    expect(resolverPrecoPeca('oleo_motor', presetMock, 'paralela')).toBe(23);
  });

  it('usa override.precoEditadaParalela quando presente (perfilPecas = paralela)', () => {
    const overrides: PecaOverride[] = [
      {
        id: 'oleo_motor',
        precoEditadoOriginal: null,
        precoEditadaParalela: 30,
        intervaloKmEditado: null,
      },
    ];
    expect(resolverPrecoPeca('oleo_motor', presetMock, 'paralela', overrides)).toBe(30);
  });

  it('funciona para pneus (precoOriginal / precoParalela)', () => {
    expect(resolverPrecoPeca('pneu_traseiro', presetMock, 'original')).toBe(245);
    expect(resolverPrecoPeca('pneu_traseiro', presetMock, 'paralela')).toBe(137);
  });
});

describe('calcularCpkPorPeca', () => {
  it('inclui peças e pneus no mapa de saída', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 7280,
    });
    expect(resultado.has('oleo_motor')).toBe(true);
    expect(resultado.has('vela_ignicao')).toBe(true);
    expect(resultado.has('pneu_traseiro')).toBe(true);
  });

  it('cpk do óleo para entrega com peça paralela: 23/1250', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 7280,
    });
    expect(resultado.get('oleo_motor')!.cpk).toBeCloseTo(23 / 1250, 5);
  });

  it('custoAnual = cpk × kmAnual', () => {
    const kmAnual = 7280;
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual,
    });
    const oleo = resultado.get('oleo_motor')!;
    expect(oleo.custoAnual).toBeCloseTo(oleo.cpk * kmAnual, 2);
  });

  it('fonte = preset quando predefinidos', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 7280,
    });
    expect(resultado.get('oleo_motor')!.fonte).toBe('preset');
  });

  it('fonte = registro quando há override de preço; demais = preset', () => {
    const overrides: PecaOverride[] = [
      {
        id: 'oleo_motor',
        precoEditadoOriginal: null,
        precoEditadaParalela: 25,
        intervaloKmEditado: null,
      },
    ];
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 7280,
      pecasOverrides: overrides,
    });
    expect(resultado.get('oleo_motor')!.fonte).toBe('registro');
    expect(resultado.get('vela_ignicao')!.fonte).toBe('preset');
  });
});

describe('calcularCpkPecasTotal', () => {
  it('soma todos os cpks do mapa', () => {
    const mapa = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'original',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 7280,
    });
    let soma = 0;
    mapa.forEach((p) => (soma += p.cpk));
    expect(calcularCpkPecasTotal(mapa)).toBeCloseTo(soma, 5);
  });
});

// ─── IV. Documentos ──────────────────────────────────────────────

describe('calcularIPVA', () => {
  it('aplica alíquota normalmente para moto jovem', () => {
    expect(calcularIPVA(20000, 0.02, 2020, 2026)).toBeCloseTo(400, 2);
  });

  it('retorna 0 para moto com exatamente 15 anos (isento RJ)', () => {
    expect(calcularIPVA(20000, 0.02, 2011, 2026)).toBe(0);
  });

  it('retorna 0 para moto com mais de 15 anos', () => {
    expect(calcularIPVA(20000, 0.02, 2000, 2026)).toBe(0);
  });

  it('não isenta com 14 anos', () => {
    expect(calcularIPVA(20000, 0.02, 2012, 2026)).toBe(400);
  });

  it('retorna 0 quando fipe não disponível (valor = 0)', () => {
    expect(calcularIPVA(0, 0.02, 2023, 2026)).toBe(0);
  });
});

describe('calcularLicenciamento', () => {
  const tabela = { '2024': 206, '2025': 206, '2026': 206 };

  it('retorna valor do ano correto', () => {
    expect(calcularLicenciamento(2026, tabela)).toBe(206);
  });

  it('retorna 0 quando ano não está na tabela', () => {
    expect(calcularLicenciamento(2030, tabela)).toBe(0);
  });
});

// ─── V. Revisão ──────────────────────────────────────────────────

describe('calcularCustoRevisaoAnual', () => {
  const servicosMock: ServicoIndependente[] = [
    {
      id: 'troca-oleo',
      nome: 'Troca de óleo',
      intervalKm: 3000,
      precoIndependente: 25,
      precoTotalAutorizada: 0,
      incluidoNaRevisaoAutorizada: true,
      ativo: true,
      ehExcepcional: false,
    },
    {
      id: 'revisao-geral',
      nome: 'Revisão geral',
      intervalKm: 6000,
      precoIndependente: 80,
      precoTotalAutorizada: 0,
      incluidoNaRevisaoAutorizada: true,
      ativo: true,
      ehExcepcional: false,
    },
    {
      id: 'retifica-cabecote',
      nome: 'Retífica de cabeçote',
      intervalKm: 80000,
      precoIndependente: 800,
      precoTotalAutorizada: 0,
      incluidoNaRevisaoAutorizada: false,
      ativo: true,
      ehExcepcional: true,
    },
    {
      id: 'retifica-completa',
      nome: 'Retífica completa',
      intervalKm: 120000,
      precoIndependente: 1500,
      precoTotalAutorizada: 0,
      incluidoNaRevisaoAutorizada: false,
      ativo: true,
      ehExcepcional: true,
    },
  ];

  it('modo autorizadas: km-based — (ciclo / 36000) × kmAnual', () => {
    const ciclo = 3334.62;
    expect(
      calcularCustoRevisaoAnual('autorizadas', 36000, { custoCicloCompleto: ciclo }),
    ).toBeCloseTo(ciclo, 2);
    expect(
      calcularCustoRevisaoAnual('autorizadas', 18000, { custoCicloCompleto: ciclo }),
    ).toBeCloseTo(ciclo / 2, 2);
  });

  it('modo autorizadas: escala proporcionalmente com kmAnual (rider leve vs pesado)', () => {
    const leve = calcularCustoRevisaoAnual('autorizadas', 15000, { custoCicloCompleto: 3334.62 });
    const pesado = calcularCustoRevisaoAnual('autorizadas', 40000, { custoCicloCompleto: 3334.62 });
    expect(pesado / leve).toBeCloseTo(40000 / 15000, 2);
  });

  it('modo autorizadas: ignora serviços excepcionais no ciclo Honda', () => {
    const kmAnual = 12000;
    const cicloHonda = 3334.62;
    const esperado = (cicloHonda / 36000) * kmAnual;

    expect(
      calcularCustoRevisaoAnual('autorizadas', kmAnual, {
        custoCicloCompleto: cicloHonda,
        servicosIndependentes: servicosMock,
      }),
    ).toBeCloseTo(esperado, 2);
  });

  it('modo independentes: soma CPK × kmAnual de serviços ativos', () => {
    const kmAnual = 12000;
    const esperado = (25 / 3000) * kmAnual + (80 / 6000) * kmAnual;
    expect(
      calcularCustoRevisaoAnual('independentes', kmAnual, { servicosIndependentes: servicosMock }),
    ).toBeCloseTo(esperado, 2);
  });

  it('modo independentes: serviço inativo é excluído do cálculo', () => {
    const kmAnual = 12000;
    const semRevisaoGeral = servicosMock.map((s) =>
      s.id === 'revisao-geral' ? { ...s, ativo: false } : s,
    );
    const semAtivo = calcularCustoRevisaoAnual('independentes', kmAnual, {
      servicosIndependentes: semRevisaoGeral,
    });
    const comAtivo = calcularCustoRevisaoAnual('independentes', kmAnual, {
      servicosIndependentes: servicosMock,
    });
    expect(comAtivo).toBeGreaterThan(semAtivo);
    expect(comAtivo - semAtivo).toBeCloseTo((80 / 6000) * kmAnual, 2);
  });

  it('modo independentes: sem serviços retorna 0', () => {
    expect(calcularCustoRevisaoAnual('independentes', 10000, { servicosIndependentes: [] })).toBe(
      0,
    );
  });

  // ── TASK-RF-6.22 / ADR-007: M.O. por modo + precoTotalAutorizada ─────

  it('modo autorizadas: soma precoTotalAutorizada de serviços fora do pacote Honda acima do ciclo', () => {
    const kmAnual = 12000;
    const cicloHonda = 3334.62;
    const servicosComKit: ServicoIndependente[] = [
      {
        id: 'troca-kit-transmissao',
        nome: 'Troca kit transmissão',
        intervalKm: 12000,
        precoIndependente: 60,
        precoTotalAutorizada: 313.56,
        incluidoNaRevisaoAutorizada: false,
        ativo: true,
        ehExcepcional: false,
      },
    ];
    const total = calcularCustoRevisaoAnual('autorizadas', kmAnual, {
      custoCicloCompleto: cicloHonda,
      servicosIndependentes: servicosComKit,
    });
    // Pacote Honda escalado + kit transmissão (1 troca/ano × 313.56)
    const esperado = (cicloHonda / 36000) * kmAnual + 313.56;
    expect(total).toBeCloseTo(esperado, 2);
  });

  it('modo autorizadas: detalha serviços avulsos fora do pacote sem alterar o total', () => {
    const kmAnual = 12000;
    const cicloHonda = 3334.62;
    const servicos: ServicoIndependente[] = [
      {
        id: 'troca-kit-transmissao',
        nome: 'Troca kit transmissão',
        intervalKm: 12000,
        precoIndependente: 60,
        precoTotalAutorizada: 313.56,
        incluidoNaRevisaoAutorizada: false,
        ativo: true,
        ehExcepcional: false,
      },
      {
        id: 'troca-oleo',
        nome: 'Troca de óleo',
        intervalKm: 3000,
        precoIndependente: 25,
        precoTotalAutorizada: 999,
        incluidoNaRevisaoAutorizada: true,
        ativo: true,
        ehExcepcional: false,
      },
      {
        id: 'retifica-completa',
        nome: 'Retífica completa',
        intervalKm: 120000,
        precoIndependente: 1500,
        precoTotalAutorizada: 0,
        incluidoNaRevisaoAutorizada: false,
        ativo: true,
        ehExcepcional: true,
      },
    ];

    const resultado = calcularDetalhesRevisaoAnual('autorizadas', kmAnual, {
      custoCicloCompleto: cicloHonda,
      servicosIndependentes: servicos,
    });
    const baseEsperada = (cicloHonda / 36000) * kmAnual;
    const kit = resultado.detalhes.servicos.get('troca-kit-transmissao');

    expect(resultado.detalhes.base).toBeCloseTo(baseEsperada, 2);
    expect(resultado.total).toBeCloseTo(baseEsperada + 313.56, 2);
    expect(kit?.label).toBe('Troca kit transmissão');
    expect(kit?.custoAnual).toBeCloseTo(313.56, 2);
    expect(kit?.eventosNoAno).toBe(1);
    expect(kit?.modo).toBe('amortizado');
    expect(kit?.kmUltimaTroca).toBe(0);
    expect(kit?.kmDasProximasTrocas).toEqual([]);
    expect(resultado.detalhes.servicos.has('troca-oleo')).toBe(false);
    expect(resultado.detalhes.servicos.has('retifica-completa')).toBe(false);
  });

  it('modo autorizadas: serviço avulso usa km da última troca para projetar eventos reais', () => {
    const kmAtual = 18000;
    const kmAnual = 18200;
    const cicloHonda = 3334.62;
    const servicos: ServicoIndependente[] = [
      {
        id: 'troca-kit-transmissao',
        nome: 'Troca kit transmissão',
        intervalKm: 12000,
        precoIndependente: 60,
        precoTotalAutorizada: 313.56,
        incluidoNaRevisaoAutorizada: false,
        ativo: true,
        ehExcepcional: false,
      },
    ];

    const resultado = calcularDetalhesRevisaoAnual('autorizadas', kmAnual, {
      custoCicloCompleto: cicloHonda,
      servicosIndependentes: servicos,
      kmAtual,
      kmUltimaTrocas: { ...kmUltimaTrocasVazio, kitRelacao: 12000 },
    });
    const kit = resultado.detalhes.servicos.get('troca-kit-transmissao');
    const baseEsperada = (cicloHonda / 36000) * kmAnual;

    expect(kit?.modo).toBe('ancorado');
    expect(kit?.eventosNoAno).toBe(2);
    expect(kit?.kmUltimaTroca).toBe(12000);
    expect(kit?.kmDasProximasTrocas).toEqual([24000, 36000]);
    expect(kit?.custoAnual).toBeCloseTo(313.56 * 2, 2);
    expect(resultado.total).toBeCloseTo(baseEsperada + 313.56 * 2, 2);
  });

  it('modo independentes: mantém serviços agregados em Revisão Geral', () => {
    const kmAnual = 12000;
    const resultado = calcularDetalhesRevisaoAnual('independentes', kmAnual, {
      servicosIndependentes: servicosMock,
    });

    expect(resultado.detalhes.servicos.size).toBe(0);
    expect(resultado.detalhes.base).toBeCloseTo((25 / 3000) * kmAnual + (80 / 6000) * kmAnual, 2);
    expect(resultado.total).toBeCloseTo(resultado.detalhes.base, 2);
  });

  it('modo autorizadas: NÃO soma serviço com incluidoNaRevisaoAutorizada=true (já no pacote)', () => {
    const kmAnual = 12000;
    const cicloHonda = 3334.62;
    const servicosComOleo: ServicoIndependente[] = [
      {
        id: 'troca-oleo',
        nome: 'Troca de óleo',
        intervalKm: 3000,
        precoIndependente: 25,
        // Mesmo com precoTotalAutorizada > 0, a flag impede dupla contagem.
        precoTotalAutorizada: 999,
        incluidoNaRevisaoAutorizada: true,
        ativo: true,
        ehExcepcional: false,
      },
    ];
    const total = calcularCustoRevisaoAnual('autorizadas', kmAnual, {
      custoCicloCompleto: cicloHonda,
      servicosIndependentes: servicosComOleo,
    });
    const esperado = (cicloHonda / 36000) * kmAnual;
    expect(total).toBeCloseTo(esperado, 2);
  });

  it('modo autorizadas: serviço com precoTotalAutorizada=0 não soma (Honda não executa)', () => {
    const kmAnual = 12000;
    const cicloHonda = 3334.62;
    const servicosComRetifica: ServicoIndependente[] = [
      {
        id: 'retifica-completa',
        nome: 'Retífica completa',
        intervalKm: 120000,
        precoIndependente: 1500,
        precoTotalAutorizada: 0,
        incluidoNaRevisaoAutorizada: false,
        ativo: true,
        ehExcepcional: false, // mesmo como não-excepcional, valor 0 zera a soma
      },
    ];
    const total = calcularCustoRevisaoAnual('autorizadas', kmAnual, {
      custoCicloCompleto: cicloHonda,
      servicosIndependentes: servicosComRetifica,
    });
    const esperado = (cicloHonda / 36000) * kmAnual;
    expect(total).toBeCloseTo(esperado, 2);
  });
});

// ─── VI. Operacionais ────────────────────────────────────────────

describe('calcularCustoInternetAnual', () => {
  it('multiplica por 12 quando ativo', () => {
    expect(calcularCustoInternetAnual(true, 50)).toBe(600);
  });

  it('retorna 0 quando inativo', () => {
    expect(calcularCustoInternetAnual(false, 50)).toBe(0);
  });
});

describe('calcularCustoSeguroAnual', () => {
  it('retorna valorAnual quando > 0', () => {
    expect(calcularCustoSeguroAnual(800)).toBe(800);
  });

  it('retorna 0 quando valorAnual === 0', () => {
    expect(calcularCustoSeguroAnual(0)).toBe(0);
  });

  it('retorna 0 defensivamente quando valorAnual < 0', () => {
    expect(calcularCustoSeguroAnual(-100)).toBe(0);
  });
});

describe('calcularCustoAlimentacaoAnual', () => {
  it('precoAlimentacao × diasAno (dias trabalhados)', () => {
    expect(calcularCustoAlimentacaoAnual(30, 312)).toBe(9360);
  });
});

// ─── VII. Agregação ──────────────────────────────────────────────

const custosMock: CustosPorCategoria = {
  documentos: { total: 600, detalhes: { ipva: 400, licenciamento: 200 } },
  revisao: {
    total: 953,
    detalhes: {
      modo: 'autorizadas',
      base: 900,
      eventosNoAno: 2.2,
      servicos: new Map([
        [
          'servico-revisao-extra',
          {
            servicoId: 'servico-revisao-extra',
            label: 'Serviço extra de revisão',
            custoAnual: 53,
            intervalKm: 12000,
            precoMaoDeObra: 53,
            precoServico: 53,
            eventosNoAno: 0.2,
            ehExcepcional: false,
            modo: 'amortizado',
            kmUltimaTroca: 0,
            kmDasProximasTrocas: [],
          },
        ],
      ]),
    },
  },
  manutencao: {
    total: 1500,
    detalhes: new Map([
      [
        'oleo_motor',
        {
          pecaId: 'oleo_motor',
          label: 'Óleo',
          cpk: 0.032,
          custoAnual: 500,
          intervaloKm: 1250,
          preco: 40,
          fonte: 'preset',
          proximaTrocaKm: 2500,
          modo: 'amortizado',
          kmUltimaTroca: 0,
          kmDasProximasTrocas: [],
          trocasNoAno: 12,
        },
      ],
      [
        'pneu_traseiro',
        {
          pecaId: 'pneu_traseiro',
          label: 'Pneu traseiro',
          cpk: 0.0153,
          custoAnual: 1000,
          intervaloKm: 16000,
          preco: 245,
          fonte: 'preset',
          proximaTrocaKm: 16000,
          modo: 'amortizado',
          kmUltimaTroca: 0,
          kmDasProximasTrocas: [],
          trocasNoAno: 4,
        },
      ],
    ]),
  },
  combustivel: { total: 1460, detalhes: { cpk: 0.2, kmAnual: 7280, consumoEfetivo: 33 } },
  internet: { total: 600, ativo: true },
  seguro: { total: 800, ativo: true },
  alimentacao: { total: 2496, ativo: true },
  financiamento: { total: 0, ativo: false },
  gastosCustom: {
    total: 0,
    ativo: false,
    detalhes: {
      sugeridos: new Map([
        [
          'retifica-cabecote',
          {
            id: 'retifica-cabecote',
            label: 'Retífica de cabeçote',
            custoAnual: 53,
            intervalKm: 80000,
            precoServico: 800,
            eventosNoAno: 0.2,
          },
        ],
      ]),
    },
  },
};

const filtrosTudo: FiltrosCategorias = {
  documentos: true,
  revisao: true,
  manutencao: true,
  manutencaoPorPeca: {},
  revisaoPorServico: {},
  imprevistosSugeridos: {},
  combustivel: true,
  internet: true,
  seguro: true,
  alimentacao: true,
  financiamento: true,
  gastosCustom: true,
};

describe('calcularTotalFiltrado', () => {
  it('soma todas as categorias com filtros totalmente ativos', () => {
    const esperado = 600 + 953 + 1500 + 1460 + 600 + 800 + 2496;
    expect(calcularTotalFiltrado(custosMock, filtrosTudo)).toBe(esperado);
  });

  it('exclui categoria quando filtro é false', () => {
    const esperado = 600 + 953 + 1500 + 1460 + 600 + 800;
    expect(calcularTotalFiltrado(custosMock, { ...filtrosTudo, alimentacao: false })).toBe(
      esperado,
    );
  });

  it('exclui toda manutenção quando filtro manutencao = false', () => {
    const esperado = 600 + 1460 + 600 + 800 + 2496;
    expect(calcularTotalFiltrado(custosMock, { ...filtrosTudo, manutencao: false })).toBe(esperado);
  });

  it('exclui peça individual via manutencaoPorPeca[id] = false', () => {
    // apenas pneu_traseiro(1000) permanece
    const esperado = 600 + 953 + 1000 + 1460 + 600 + 800 + 2496;
    expect(
      calcularTotalFiltrado(custosMock, {
        ...filtrosTudo,
        manutencaoPorPeca: { oleo_motor: false },
      }),
    ).toBe(esperado);
  });

  it('exclui serviço de revisão individual via revisaoPorServico[id] = false', () => {
    const esperado = 600 + 900 + 1500 + 1460 + 600 + 800 + 2496;
    expect(
      calcularTotalFiltrado(custosMock, {
        ...filtrosTudo,
        revisaoPorServico: { 'servico-revisao-extra': false },
      }),
    ).toBe(esperado);
  });

  it('inclui imprevisto sugerido somente quando filtro explícito é true', () => {
    const esperadoSemRetifica = 600 + 953 + 1500 + 1460 + 600 + 800 + 2496;
    const esperadoComRetifica = esperadoSemRetifica + 53;

    expect(calcularTotalFiltrado(custosMock, filtrosTudo)).toBe(esperadoSemRetifica);
    expect(
      calcularTotalFiltrado(custosMock, {
        ...filtrosTudo,
        imprevistosSugeridos: { 'retifica-cabecote': true },
      }),
    ).toBe(esperadoComRetifica);
  });

  it('undefined em manutencaoPorPeca = peça ativa (convenção padrão)', () => {
    const comVazio = calcularTotalFiltrado(custosMock, { ...filtrosTudo, manutencaoPorPeca: {} });
    const comTrue = calcularTotalFiltrado(custosMock, {
      ...filtrosTudo,
      manutencaoPorPeca: { oleo_motor: true, pneu_traseiro: true },
    });
    expect(comVazio).toBe(comTrue);
  });
});

describe('calcularGranularidades', () => {
  const total = 8400;
  const diasAno = 312; // 6 dias/semana × 52
  const kmAnual = 24960;

  it('anual = total passado', () => {
    expect(calcularGranularidades(total, diasAno, kmAnual).anual).toBe(total);
  });

  it('mensal = anual / 12', () => {
    expect(calcularGranularidades(total, diasAno, kmAnual).mensal).toBeCloseTo(700, 1);
  });

  it('semanal = anual / 52 (não mensal/4)', () => {
    const g = calcularGranularidades(total, diasAno, kmAnual);
    expect(g.semanal).toBeCloseTo(total / 52, 2);
    // valida diferença: 52 ≠ 48 (4 semanas × 12 meses)
    expect(g.semanal).not.toBeCloseTo(g.mensal / 4, 2);
  });

  it('diario divide por dias trabalhados (não 365)', () => {
    const g = calcularGranularidades(total, diasAno, kmAnual);
    expect(g.diario).toBeCloseTo(total / diasAno, 2);
    expect(g.diario).not.toBeCloseTo(total / 365, 2);
  });

  it('porKm = anual / kmAnual', () => {
    expect(calcularGranularidades(total, diasAno, kmAnual).porKm).toBeCloseTo(total / kmAnual, 4);
  });
});

describe('calcularCustoGastosCustomAnual', () => {
  // TASK-RF-6.9: valorAnual é o total acumulado no ano (não recorrência mensal).
  it('soma valorAnual dos gastos ativos', () => {
    const resultado = calcularCustoGastosCustomAnual([
      { id: 'preset-multa', nome: 'Multa', valorAnual: 900, ativo: true, ehPreset: true },
      { id: 'preset-sinistro', nome: 'Sinistros', valorAnual: 300, ativo: true, ehPreset: true },
    ]);
    expect(resultado).toBe(1200);
  });

  it('ignora gastos desativados', () => {
    const resultado = calcularCustoGastosCustomAnual([
      { id: 'preset-multa', nome: 'Multa', valorAnual: 900, ativo: true, ehPreset: true },
      { id: 'preset-sinistro', nome: 'Sinistros', valorAnual: 500, ativo: false, ehPreset: true },
    ]);
    expect(resultado).toBe(900);
  });

  it('retorna 0 para lista vazia', () => {
    expect(calcularCustoGastosCustomAnual([])).toBe(0);
  });
});

describe('categoriasParaFiltros', () => {
  const baseCategorias: CategoriaDisplay = {
    combustivel: false,
    alimentacao: false,
    manutencao: false,
    documentacao: false,
    internet: false,
    seguro: false,
    financiamento: false,
    imprevistos: false,
  };

  // TASK-RF-6.11 cleanup: Imprevistos ganhou toggle de categoria persistido.
  // gastosCustom agora reflete cat.imprevistos (não mais hard-coded true).
  it('gastosCustom segue cat.imprevistos', () => {
    const semImprevistos = categoriasParaFiltros({ ...baseCategorias, imprevistos: false });
    const comImprevistos = categoriasParaFiltros({ ...baseCategorias, imprevistos: true });
    expect(semImprevistos.gastosCustom).toBe(false);
    expect(comImprevistos.gastosCustom).toBe(true);
  });

  it('imprevistosSugeridos vem do mapa quando categoria Imprevistos ativa', () => {
    const filtros = categoriasParaFiltros(
      { ...baseCategorias, imprevistos: true },
      { 'retifica-cabecote': true, 'retifica-completa': false },
    );
    expect(filtros.imprevistosSugeridos).toEqual({
      'retifica-cabecote': true,
      'retifica-completa': false,
    });
  });

  it('imprevistosSugeridos zerado quando categoria Imprevistos inativa', () => {
    const filtros = categoriasParaFiltros(
      { ...baseCategorias, imprevistos: false },
      { 'retifica-cabecote': true },
    );
    expect(filtros.imprevistosSugeridos).toEqual({});
  });

  it('filtros finos de Manutenção vêm do perfil persistido', () => {
    const filtros = categoriasParaFiltros(
      { ...baseCategorias, manutencao: true },
      {},
      {
        revisao: false,
        manutencaoPorPeca: { oleo_motor: false },
        revisaoPorServico: { 'troca-kit-transmissao': false },
      },
    );

    expect(filtros.manutencao).toBe(true);
    expect(filtros.revisao).toBe(false);
    expect(filtros.manutencaoPorPeca).toEqual({ oleo_motor: false });
    expect(filtros.revisaoPorServico).toEqual({ 'troca-kit-transmissao': false });
  });

  it('categoria Manutenção desligada não apaga filtros finos persistidos', () => {
    const filtros = categoriasParaFiltros(
      { ...baseCategorias, manutencao: false },
      {},
      {
        revisao: false,
        manutencaoPorPeca: { oleo_motor: false },
        revisaoPorServico: { 'troca-kit-transmissao': false },
      },
    );

    expect(filtros.manutencao).toBe(false);
    expect(filtros.revisao).toBe(false);
    expect(filtros.manutencaoPorPeca).toEqual({ oleo_motor: false });
    expect(filtros.revisaoPorServico).toEqual({ 'troca-kit-transmissao': false });
  });
});

describe('calcularBreakdownPercentual', () => {
  it('todos os valores são 0 quando total filtrado é 0', () => {
    const custoVazio: CustosPorCategoria = {
      documentos: { total: 0, detalhes: { ipva: 0, licenciamento: 0 } },
      revisao: {
        total: 0,
        detalhes: { modo: 'independentes', base: 0, eventosNoAno: 0, servicos: new Map() },
      },
      manutencao: { total: 0, detalhes: new Map() },
      combustivel: { total: 0, detalhes: { cpk: 0, kmAnual: 0, consumoEfetivo: 0 } },
      internet: { total: 0, ativo: false },
      seguro: { total: 0, ativo: false },
      alimentacao: { total: 0, ativo: false },
      financiamento: { total: 0, ativo: false },
      gastosCustom: { total: 0, ativo: false, detalhes: { sugeridos: new Map() } },
    };
    const resultado = calcularBreakdownPercentual(custoVazio, filtrosTudo);
    Object.values(resultado).forEach((v) => expect(v).toBe(0));
  });

  it('categorias ativas somam ~100% do total filtrado', () => {
    const resultado = calcularBreakdownPercentual(custosMock, filtrosTudo);
    const soma = Object.values(resultado).reduce((a, b) => a + b, 0);
    expect(soma).toBeCloseTo(100, 1);
  });

  it('categoria desativada retorna 0% mesmo com custo > 0', () => {
    // Regressão: bug anterior dividia pelo total filtrado sem checar o filtro
    // resultado: categorias desativadas apareciam com > 100%
    const resultado = calcularBreakdownPercentual(custosMock, {
      ...filtrosTudo,
      combustivel: false,
      alimentacao: false,
    });
    expect(resultado.combustivel).toBe(0);
    expect(resultado.alimentacao).toBe(0);
    expect(resultado.documentos).toBeGreaterThan(0);
  });

  it('única categoria ativa aparece com ~100%', () => {
    const filtroSoManu: FiltrosCategorias = {
      ...filtrosTudo,
      documentos: false,
      revisao: false,
      revisaoPorServico: { 'servico-revisao-extra': false },
      combustivel: false,
      internet: false,
      seguro: false,
      alimentacao: false,
    };
    const resultado = calcularBreakdownPercentual(custosMock, filtroSoManu);
    expect(resultado.manutencao).toBeCloseTo(100, 1);
    expect(resultado.revisao).toBe(0);
    expect(resultado.documentos).toBe(0);
    expect(resultado.combustivel).toBe(0);
    expect(resultado.alimentacao).toBe(0);
  });

  it('percentuais são relativos ao total filtrado, não ao total geral', () => {
    // Com só documentos ativo, deve retornar 100% não 600/8409*100 ≈ 7%
    const filtroSoDoc: FiltrosCategorias = {
      ...filtrosTudo,
      revisao: false,
      manutencao: false,
      combustivel: false,
      internet: false,
      seguro: false,
      alimentacao: false,
    };
    const resultado = calcularBreakdownPercentual(custosMock, filtroSoDoc);
    expect(resultado.documentos).toBeCloseTo(100, 1);
    expect(resultado.manutencao).toBe(0);
  });
});

describe('calcularBreakdownValores', () => {
  it('retorna o valor anual em R$ por categoria respeitando os filtros', () => {
    const resultado = calcularBreakdownValores(custosMock, filtrosTudo);
    expect(resultado.documentos).toBe(600);
    expect(resultado.combustivel).toBe(1460);
    expect(resultado.seguro).toBe(800);
    // manutencao = soma das peças filtradas (500 + 1000)
    expect(resultado.manutencao).toBe(1500);
    // revisao = base (900) + serviços filtrados (53)
    expect(resultado.revisao).toBe(953);
  });

  it('zera a categoria desativada mesmo com custo > 0', () => {
    const resultado = calcularBreakdownValores(custosMock, {
      ...filtrosTudo,
      combustivel: false,
      seguro: false,
    });
    expect(resultado.combustivel).toBe(0);
    expect(resultado.seguro).toBe(0);
    expect(resultado.documentos).toBe(600);
  });

  it('é a base coerente do percentual: valor/total*100 == percentual', () => {
    const valores = calcularBreakdownValores(custosMock, filtrosTudo);
    const percentual = calcularBreakdownPercentual(custosMock, filtrosTudo);
    const total = calcularTotalFiltrado(custosMock, filtrosTudo);
    Object.keys(valores).forEach((cat) => {
      expect(percentual[cat]).toBeCloseTo((valores[cat] / total) * 100, 5);
    });
  });
});

describe('converterAnualParaPeriodo', () => {
  it('divide pelo divisor de cada período', () => {
    expect(converterAnualParaPeriodo(1200, 'ano', 312, 8)).toBe(1200);
    expect(converterAnualParaPeriodo(1200, 'mes', 312, 8)).toBe(100);
    expect(converterAnualParaPeriodo(5200, 'sem', 312, 8)).toBe(100);
    expect(converterAnualParaPeriodo(3120, 'dia', 312, 8)).toBe(10);
    expect(converterAnualParaPeriodo(2496, 'hora', 312, 8)).toBe(1);
  });

  it('retorna 0 quando o divisor é 0 (evita Infinity com diasAno=0)', () => {
    expect(converterAnualParaPeriodo(1200, 'dia', 0, 8)).toBe(0);
    expect(converterAnualParaPeriodo(1200, 'hora', 0, 8)).toBe(0);
  });
});

describe('calcularCustoMotoAnual', () => {
  it('subtrai custo de alimentação do total', () => {
    expect(calcularCustoMotoAnual(10000, 2500)).toBe(7500);
  });
});

describe('calcularResultado — CPK sem alimentação', () => {
  const dadosRJMock: DadosRJ = {
    ipva: { aliquotaMotos: 0, isencaoIdadeMinimaMeses: 0 },
    licenciamento: { tabela: {} },
  };

  function criarPerfilComFiltroAlimentacao(alimentacaoAtiva: boolean): PerfilUsuario {
    return {
      ...perfilPadrao,
      trabalho: {
        ...perfilPadrao.trabalho,
        kmPorDia: 100,
        diasPorSemana: 5,
      },
      financeiro: {
        ...perfilPadrao.financeiro,
        alimentacaoDia: 20,
      },
      configuracaoDisplay: {
        ...perfilPadrao.configuracaoDisplay,
        categoriasAtivas: {
          ...perfilPadrao.configuracaoDisplay.categoriasAtivas,
          alimentacao: alimentacaoAtiva,
        },
      },
    };
  }

  it('mantém CPK sem alimentação abaixo do CPK total quando alimentação está ligada', () => {
    const resultado = calcularResultado(
      criarPerfilComFiltroAlimentacao(true),
      presetMock,
      dadosRJMock,
    );

    expect(resultado.custos.alimentacao.total).toBeGreaterThan(0);
    expect(resultado.granularidadesMoto.porKm).toBeLessThan(resultado.granularidades.porKm);
  });

  it('não subtrai alimentação de novo quando alimentação está desligada no filtro', () => {
    const resultado = calcularResultado(
      criarPerfilComFiltroAlimentacao(false),
      presetMock,
      dadosRJMock,
    );

    expect(resultado.custos.alimentacao.total).toBeGreaterThan(0);
    expect(resultado.granularidadesMoto.porKm).toBeCloseTo(resultado.granularidades.porKm, 8);
  });
});

describe('calcularCustosPorCategoria — revisaoAutorizadaOverrides', () => {
  const dadosRJMock: DadosRJ = {
    ipva: { aliquotaMotos: 0.015, isencaoIdadeMinimaMeses: 0 },
    licenciamento: { tabela: {} },
  };
  const perfilAutorizadas = {
    ...perfilPadrao,
    perfilManutencao: { ...perfilPadrao.perfilManutencao, modoRevisao: 'autorizadas' as const },
    revisaoAutorizadaOverrides: [],
  };

  it('aplica override de precoTotal ao ciclo Honda antes de calcular revisaoAnual', () => {
    const semOverride = calcularCustosPorCategoria(perfilAutorizadas, presetMock, dadosRJMock);

    // Índice 0 tem precoTotal = 105.94 → substituir por 500 (diferença: +394.06)
    const comOverride = calcularCustosPorCategoria(
      {
        ...perfilAutorizadas,
        revisaoAutorizadaOverrides: [
          { index: 0, precoPecas: 300, precoMaoDeObra: 200, precoTotal: 500 },
        ],
      },
      presetMock,
      dadosRJMock,
    );

    expect(comOverride.revisao.total).toBeGreaterThan(semOverride.revisao.total);
    const kmAnual = calcularKmAnual(
      perfilPadrao.trabalho.kmPorDia,
      perfilPadrao.trabalho.diasPorSemana,
    );
    expect(comOverride.revisao.total - semOverride.revisao.total).toBeCloseTo(
      (394.06 / 36000) * kmAnual,
      2,
    );
  });

  it('sem overrides usa precoTotal original do preset + serviços avulsos autorizada (ADR-007)', () => {
    const resultado = calcularCustosPorCategoria(perfilAutorizadas, presetMock, dadosRJMock);
    const cicloEsperado = presetMock.revisaoAutorizada.reduce((s, r) => s + r.precoTotal, 0);
    const kmAnual = calcularKmAnual(
      perfilPadrao.trabalho.kmPorDia,
      perfilPadrao.trabalho.diasPorSemana,
    );
    // Pacote Honda escalado + extras dos serviços avulsos do perfilPadrao com
    // precoTotalAutorizada > 0 (ADR-007). Serviços excepcionais e os incluídos
    // no pacote (incluidoNaRevisaoAutorizada=true) não somam.
    const extraServicosAvulsos = perfilAutorizadas.servicosIndependentes
      .filter(
        (s) =>
          !s.ehExcepcional &&
          !s.incluidoNaRevisaoAutorizada &&
          s.precoTotalAutorizada > 0 &&
          s.intervalKm > 0 &&
          s.ativo,
      )
      .reduce((sum, s) => sum + (s.precoTotalAutorizada / s.intervalKm) * kmAnual, 0);
    expect(resultado.revisao.total).toBeCloseTo(
      (cicloEsperado / 36000) * kmAnual + extraServicosAvulsos,
      2,
    );
  });

  it('retíficas no modo independente: ficam em imprevistos sugeridos e sincronizam com Mão de Obra', () => {
    // Cenário convertido para modo independente (ADR-007): no autorizado,
    // retífica tem precoTotalAutorizada=0 e some do mapa de imprevistos
    // (Honda não executa retífica — substitui por kit cilindro). Coberto por
    // teste dedicado abaixo.
    const perfilIndependente = {
      ...perfilAutorizadas,
      perfilManutencao: {
        ...perfilAutorizadas.perfilManutencao,
        modoRevisao: 'independentes' as const,
      },
      servicosIndependentes: perfilAutorizadas.servicosIndependentes.map((servico) =>
        servico.id === 'retifica-cabecote' ? { ...servico, precoIndependente: 900 } : servico,
      ),
    };
    const resultado = calcularCustosPorCategoria(perfilIndependente, presetMock, dadosRJMock);
    const kmAnual = calcularKmAnual(
      perfilPadrao.trabalho.kmPorDia,
      perfilPadrao.trabalho.diasPorSemana,
    );
    const retifica = resultado.gastosCustom.detalhes.sugeridos.get('retifica-cabecote');

    expect(resultado.revisao.detalhes.servicos.has('retifica-cabecote')).toBe(false);
    expect(retifica?.precoServico).toBe(900);
    expect(retifica?.custoAnual).toBeCloseTo((900 / 80000) * kmAnual, 2);
  });

  it('retífica no modo autorizado some dos imprevistos (precoTotalAutorizada=0 — Honda não executa)', () => {
    const resultado = calcularCustosPorCategoria(perfilAutorizadas, presetMock, dadosRJMock);
    expect(resultado.gastosCustom.detalhes.sugeridos.has('retifica-cabecote')).toBe(false);
    expect(resultado.gastosCustom.detalhes.sugeridos.has('retifica-completa')).toBe(false);
  });
});

// ─── BG-003: modo autorizado não duplica peças da revisão ────────

describe('calcularCpkPorPeca — exclusão de peças no modo autorizado', () => {
  it('modo autorizado: exclui peças cobertas pela revisão Honda (óleo, vela)', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'autorizadas',
      kmAtual: 0,
      kmAnual: 7280,
    });
    expect(resultado.has('oleo_motor')).toBe(false);
    expect(resultado.has('vela_ignicao')).toBe(false);
  });

  it('modo autorizado: mantém peças fora da revisão (kit relação) e pneus', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'autorizadas',
      kmAtual: 0,
      kmAnual: 7280,
    });
    expect(resultado.has('kit_relacao')).toBe(true);
    expect(resultado.has('pneu_traseiro')).toBe(true);
  });

  it('modo independente: mantém todas as peças, inclusive as cobertas pela revisão', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 7280,
    });
    expect(resultado.has('oleo_motor')).toBe(true);
    expect(resultado.has('vela_ignicao')).toBe(true);
    expect(resultado.has('kit_relacao')).toBe(true);
    expect(resultado.has('pneu_traseiro')).toBe(true);
  });

  // ── TASK-RF-6.22 / ADR-007: exclusão por serviço com precoTotalAutorizada ─────

  it('modo autorizado: exclui peça associada a serviço com precoTotalAutorizada > 0 (evita dupla contagem)', () => {
    // troca-kit-transmissao cobre peça kit_relacao no modo autorizado: o
    // valor total Honda já contém a peça, então não pode ser contada de novo
    // pelo CPK.
    const servicos: ServicoIndependente[] = [
      {
        id: 'troca-kit-transmissao',
        nome: 'Troca kit transmissão',
        intervalKm: 12000,
        precoIndependente: 60,
        precoTotalAutorizada: 313.56,
        incluidoNaRevisaoAutorizada: false,
        ativo: true,
        ehExcepcional: false,
      },
    ];
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'autorizadas',
      kmAtual: 0,
      kmAnual: 7280,
      servicosIndependentes: servicos,
    });
    expect(resultado.has('kit_relacao')).toBe(false);
    // Pneu segue presente: nenhum serviço o cobre no autorizado neste cenário.
    expect(resultado.has('pneu_traseiro')).toBe(true);
  });

  it('modo autorizado: mantém peça quando serviço associado está inativo', () => {
    const servicos: ServicoIndependente[] = [
      {
        id: 'troca-kit-transmissao',
        nome: 'Troca kit transmissão',
        intervalKm: 12000,
        precoIndependente: 60,
        precoTotalAutorizada: 313.56,
        incluidoNaRevisaoAutorizada: false,
        ativo: false,
        ehExcepcional: false,
      },
    ];
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'autorizadas',
      kmAtual: 0,
      kmAnual: 7280,
      servicosIndependentes: servicos,
    });
    expect(resultado.has('kit_relacao')).toBe(true);
  });
});

describe('calcularCustosPorCategoria — modo autorizado não duplica peças da revisão', () => {
  const dadosRJBG003: DadosRJ = {
    ipva: { aliquotaMotos: 0.015, isencaoIdadeMinimaMeses: 0 },
    licenciamento: { tabela: {} },
  };

  function perfilComModo(modo: 'autorizadas' | 'independentes') {
    return {
      ...perfilPadrao,
      perfilManutencao: { ...perfilPadrao.perfilManutencao, modoRevisao: modo },
    };
  }

  it('modo autorizado: manutenção exclui óleo e vela (cobertos pela revisão) e exclui kit_relacao/pneus quando serviço associado tem precoTotalAutorizada > 0 (ADR-007)', () => {
    const resultado = calcularCustosPorCategoria(
      perfilComModo('autorizadas'),
      presetMock,
      dadosRJBG003,
    );
    // ADR-006: óleo e vela são pacote Honda.
    expect(resultado.manutencao.detalhes.has('oleo_motor')).toBe(false);
    expect(resultado.manutencao.detalhes.has('vela_ignicao')).toBe(false);
    // ADR-007: kit_relacao e pneus saem do CPK quando o serviço associado
    // tem precoTotalAutorizada > 0 e está ativo (perfilPadrao v15 satisfaz).
    expect(resultado.manutencao.detalhes.has('kit_relacao')).toBe(false);
    expect(resultado.manutencao.detalhes.has('pneu_traseiro')).toBe(false);
  });

  it('modo independente: manutenção inclui óleo e vela', () => {
    const resultado = calcularCustosPorCategoria(
      perfilComModo('independentes'),
      presetMock,
      dadosRJBG003,
    );
    expect(resultado.manutencao.detalhes.has('oleo_motor')).toBe(true);
    expect(resultado.manutencao.detalhes.has('vela_ignicao')).toBe(true);
  });

  it('total de manutenção no modo autorizado é menor que no independente', () => {
    const aut = calcularCustosPorCategoria(perfilComModo('autorizadas'), presetMock, dadosRJBG003);
    const ind = calcularCustosPorCategoria(
      perfilComModo('independentes'),
      presetMock,
      dadosRJBG003,
    );
    expect(aut.manutencao.total).toBeLessThan(ind.manutencao.total);
  });
});

describe('preset pop110i — campo incluidoNaRevisaoAutorizada', () => {
  it('toda peça do preset declara incluidoNaRevisaoAutorizada', () => {
    for (const peca of pop110i.pecas) {
      expect(typeof peca.incluidoNaRevisaoAutorizada).toBe('boolean');
    }
  });
});

describe('preset pop110i — detalhamento das revisões Honda', () => {
  it('toda revisão declara itens substituídos e serviços executados', () => {
    for (const revisao of pop110i.revisaoAutorizada) {
      expect(revisao.itensSubstituidos.length).toBeGreaterThan(0);
      expect(revisao.servicosExecutados.length).toBeGreaterThan(0);

      for (const grupo of revisao.servicosExecutados) {
        expect(grupo.categoria.trim().length).toBeGreaterThan(0);
        expect(grupo.servicos.length).toBeGreaterThan(0);
      }
    }
  });

  it('preserva serviços e itens específicos do documento oficial', () => {
    const revisao24k = pop110i.revisaoAutorizada.find((revisao) => revisao.intervaloKm === 24000);
    const revisao36k = pop110i.revisaoAutorizada.find((revisao) => revisao.intervaloKm === 36000);

    expect(revisao24k?.itensSubstituidos).toContain('Vela de Ignição');
    expect(revisao36k?.itensSubstituidos).toContain('Eixo e buchas do garfo traseiro');
    expect(revisao36k?.servicosExecutados.some((grupo) => grupo.categoria === 'Limpeza')).toBe(
      true,
    );
  });
});

// ─── RF-6.7: ciclo ancorado no km da última troca ────────────────

describe('calcularCicloPeca', () => {
  it('sem km de última troca: trocasNoAno amortizado (kmAnual / intervalo)', () => {
    const { trocasNoAno } = calcularCicloPeca(0, 16000, 13000, 18200);
    expect(trocasNoAno).toBeCloseTo(18200 / 16000, 5);
  });

  it('com km de última troca: ancora a próxima troca no km informado', () => {
    // última troca 10.000, intervalo 16.000 → próxima em 26.000
    const { proximaTrocaKm } = calcularCicloPeca(10000, 16000, 13000, 18200);
    expect(proximaTrocaKm).toBe(26000);
  });

  it('conta as trocas que caem na janela do ano', () => {
    // janela 13.000 → 31.200; próxima troca 26.000 → 1 troca
    const { trocasNoAno } = calcularCicloPeca(10000, 16000, 13000, 18200);
    expect(trocasNoAno).toBe(1);
  });

  it('retorna 0 trocas quando a peça foi trocada recentemente', () => {
    // última troca 12.500, intervalo 16.000 → próxima 28.500; janela 13.000 → 25.000
    const { trocasNoAno } = calcularCicloPeca(12500, 16000, 13000, 12000);
    expect(trocasNoAno).toBe(0);
  });

  it('avança o ciclo quando já houve eventos desde a última troca informada', () => {
    // última troca 1.000, intervalo 3.000, kmAtual 8.500 → eventos em 4.000 e 7.000 → próxima 10.000
    const { proximaTrocaKm } = calcularCicloPeca(1000, 3000, 8500, 12000);
    expect(proximaTrocaKm).toBe(10000);
  });

  it('conta múltiplas trocas no ano para intervalo curto', () => {
    // última troca 1.000, intervalo 3.000, kmAtual 1.000, kmAnual 18.000
    // próxima 4.000; janela até 19.000 → 4k,7k,10k,13k,16k,19k = 6 trocas
    const { trocasNoAno } = calcularCicloPeca(1000, 3000, 1000, 18000);
    expect(trocasNoAno).toBe(6);
  });

  it('lista todas as próximas trocas dentro da janela', () => {
    expect(calcularKmDasProximasTrocas(60000, 16000, 90000, 18200)).toEqual([92000, 108000]);
  });
});

describe('calcularCpkPorPeca — kmUltimaTrocas alimenta o ciclo (RF-6.7)', () => {
  it('peça com km de última troca informado usa custo cíclico', () => {
    // pneu_traseiro: intervalo 16.000, preço paralela 137; última troca 10.000 → 1 troca no ano
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 13000,
      kmAnual: 18200,
      kmUltimaTrocas: { ...kmUltimaTrocasVazio, pneuTraseiro: 10000 },
    });
    const pneu = resultado.get('pneu_traseiro')!;
    expect(pneu.trocasNoAno).toBe(1);
    expect(pneu.custoAnual).toBeCloseTo(137, 2);
    expect(pneu.proximaTrocaKm).toBe(26000);
    expect(pneu.modo).toBe('ancorado');
    expect(pneu.kmUltimaTroca).toBe(10000);
    expect(pneu.kmDasProximasTrocas).toEqual([26000]);
  });

  it('peça sem km informado mantém custo amortizado', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 13000,
      kmAnual: 18200,
      kmUltimaTrocas: kmUltimaTrocasVazio,
    });
    const pneu = resultado.get('pneu_traseiro')!;
    expect(pneu.custoAnual).toBeCloseTo((137 / 16000) * 18200, 2);
    expect(pneu.modo).toBe('amortizado');
    expect(pneu.kmUltimaTroca).toBe(0);
    expect(pneu.kmDasProximasTrocas).toEqual([]);
  });

  it('kmUltimaTrocas omitido equivale a tudo zero (fallback amortizado)', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 13000,
      kmAnual: 18200,
    });
    expect(resultado.get('pneu_traseiro')!.custoAnual).toBeCloseTo((137 / 16000) * 18200, 2);
  });

  it('calcularCustosPorCategoria propaga kmUltimaTrocas ao detalhe das peças', () => {
    const dadosRJ: DadosRJ = {
      ipva: { aliquotaMotos: 0.015, isencaoIdadeMinimaMeses: 0 },
      licenciamento: { tabela: {} },
    };
    const perfil = {
      ...perfilPadrao,
      moto: {
        ...perfilPadrao.moto,
        kmAtual: 13000,
        kmUltimaTrocas: { ...kmUltimaTrocasVazio, pneuTraseiro: 10000 },
      },
    };
    // perfilPadrao: 70 km/dia × 5 dias × 52 = 18.200 km/ano
    const resultado = calcularCustosPorCategoria(perfil, presetMock, dadosRJ);
    expect(resultado.manutencao.detalhes.get('pneu_traseiro')!.proximaTrocaKm).toBe(26000);
  });
});

// ─── TASK-RF-6.14: peças temporais + kit embreagem/revisão/cilindro ──

describe('TASK-RF-6.14 — bateria com driver temporal', () => {
  const presetComBateria: PresetMoto = {
    ...presetMock,
    pecas: [
      ...presetMock.pecas,
      {
        id: 'bateria',
        nome: 'Bateria',
        intervaloMeses: 24,
        precoOriginal: 329.8,
        precoParalela: 163.2,
        incluidoNaRevisaoAutorizada: false,
      },
    ],
  };

  it('bateria com intervaloMeses=24 deriva trocasNoAno do tempo (0,5/ano)', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetComBateria,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 30000,
    });
    const bateria = resultado.get('bateria')!;
    expect(bateria.trocasNoAno).toBeCloseTo(0.5, 5);
    expect(bateria.custoAnual).toBeCloseTo(163.2 * 0.5, 2);
    expect(bateria.cpk).toBeCloseTo((163.2 * 0.5) / 30000, 6);
    expect(bateria.modo).toBe('amortizado');
    expect(bateria.intervaloMeses).toBe(24);
  });

  it('bateria com kmAnual=0 ainda gera custoAnual e cpk=0 (sem divisão por zero)', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetComBateria,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 0,
    });
    const bateria = resultado.get('bateria')!;
    expect(bateria.custoAnual).toBeCloseTo(163.2 * 0.5, 2);
    expect(bateria.cpk).toBe(0);
  });
});

describe('TASK-RF-6.14 — kit revisão (incluido na revisão autorizada)', () => {
  const presetComKitRevisao: PresetMoto = {
    ...presetMock,
    pecas: [
      ...presetMock.pecas,
      {
        id: 'kit_revisao',
        nome: 'Kit revisão',
        intervaloKm: 6000,
        intervaloKmEntrega: 6000,
        precoOriginal: 152.83,
        precoParalela: 102.93,
        incluidoNaRevisaoAutorizada: true,
      },
    ],
  };

  it('modo autorizado: kit_revisao não aparece (já no pacote Honda)', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetComKitRevisao,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'autorizadas',
      kmAtual: 0,
      kmAnual: 18000,
    });
    expect(resultado.has('kit_revisao')).toBe(false);
  });

  it('modo independente: kit_revisao entra no CPK como peça cíclica regular', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetComKitRevisao,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 18000,
    });
    expect(resultado.has('kit_revisao')).toBe(true);
    const kit = resultado.get('kit_revisao')!;
    expect(kit.cpk).toBeCloseTo(102.93 / 6000, 5);
    expect(kit.modo).toBe('amortizado');
  });
});

describe('TASK-RF-6.14 — kit cilindro como peça cíclica regular', () => {
  const presetComKitCilindro: PresetMoto = {
    ...presetMock,
    pecas: [
      ...presetMock.pecas,
      {
        id: 'kit_cilindro',
        nome: 'Kit cilindro',
        intervaloKm: 100000,
        intervaloKmEntrega: 100000,
        precoOriginal: 360.83,
        precoParalela: 163.31,
        incluidoNaRevisaoAutorizada: false,
      },
    ],
  };

  it('kit_cilindro entra no CPK com intervaloKm=100000', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetComKitCilindro,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 0,
      kmAnual: 18000,
    });
    const kit = resultado.get('kit_cilindro')!;
    expect(kit.intervaloKm).toBe(100000);
    expect(kit.cpk).toBeCloseTo(163.31 / 100000, 6);
  });
});

describe('TASK-RF-6.14 — modo autorizado soma precoTotalAutorizada de troca-kit-embreagem', () => {
  it('modo autorizado: serviço troca-kit-embreagem com precoTotalAutorizada exclui peça kit_embreagem', () => {
    const presetComKitEmbreagem: PresetMoto = {
      ...presetMock,
      pecas: [
        ...presetMock.pecas,
        {
          id: 'kit_embreagem',
          nome: 'Kit embreagem',
          intervaloKm: 40000,
          intervaloKmEntrega: 40000,
          precoOriginal: 300.33,
          precoParalela: 68,
          incluidoNaRevisaoAutorizada: false,
        },
      ],
    };
    const servicos: ServicoIndependente[] = [
      {
        id: 'troca-kit-embreagem',
        nome: 'Troca kit embreagem',
        intervalKm: 40000,
        precoIndependente: 50,
        precoTotalAutorizada: 450.33,
        incluidoNaRevisaoAutorizada: false,
        ativo: true,
        ehExcepcional: false,
      },
    ];
    const resultado = calcularCpkPorPeca({
      preset: presetComKitEmbreagem,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'autorizadas',
      kmAtual: 0,
      kmAnual: 18000,
      servicosIndependentes: servicos,
    });
    // ADR-007: peça é coberta pelo serviço autorizado (peça + M.O. juntos).
    expect(resultado.has('kit_embreagem')).toBe(false);
  });
});

describe('TASK-RF-6.13 — peças novas usam kmUltimaTrocas como âncora', () => {
  const kmAtual = 90000;
  const kmAnual = 18200;

  it('campos zerados mantêm custo amortizado para peças de vida útil longa', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetPop110i,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual,
      kmAnual,
      kmUltimaTrocas: kmUltimaTrocasVazio,
    });

    expect(resultado.get('kit_embreagem')?.custoAnual).toBeCloseTo((68 / 40000) * kmAnual, 2);
    expect(resultado.get('kit_cilindro')?.custoAnual).toBeCloseTo((163.31 / 100000) * kmAnual, 2);
    expect(resultado.get('kit_revisao')?.custoAnual).toBeCloseTo((102.93 / 6000) * kmAnual, 2);
    expect(resultado.get('vela_ignicao')?.custoAnual).toBeCloseTo((29 / 12000) * kmAnual, 2);
    expect(resultado.get('filtro_ar')?.custoAnual).toBeCloseTo((19 / 12000) * kmAnual, 2);
    expect(resultado.get('sapata_freio_dianteiro')?.custoAnual).toBeCloseTo(
      (17 / 12000) * kmAnual,
      2,
    );
    expect(resultado.get('sapata_freio_traseiro')?.custoAnual).toBeCloseTo(
      (47 / 12000) * kmAnual,
      2,
    );
  });

  it('campos preenchidos usam eventos inteiros na janela de 12 meses', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetPop110i,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual,
      kmAnual,
      kmUltimaTrocas: {
        ...kmUltimaTrocasVazio,
        kitEmbreagem: 60000,
        kitCilindro: 1000,
        velaIgnicao: 84000,
        filtroAr: 84000,
        sapataFreioDianteiro: 84000,
        sapataFreioTraseiro: 84000,
      },
    });

    expect(resultado.get('kit_embreagem')?.trocasNoAno).toBe(1);
    expect(resultado.get('kit_embreagem')?.custoAnual).toBeCloseTo(68, 2);
    expect(resultado.get('kit_cilindro')?.trocasNoAno).toBe(1);
    expect(resultado.get('kit_cilindro')?.custoAnual).toBeCloseTo(163.31, 2);
    expect(resultado.get('vela_ignicao')?.trocasNoAno).toBe(2);
    expect(resultado.get('vela_ignicao')?.custoAnual).toBeCloseTo(29 * 2, 2);
    expect(resultado.get('vela_ignicao')?.modo).toBe('ancorado');
    expect(resultado.get('vela_ignicao')?.kmDasProximasTrocas).toEqual([96000, 108000]);
    expect(resultado.get('filtro_ar')?.trocasNoAno).toBe(2);
    expect(resultado.get('filtro_ar')?.custoAnual).toBeCloseTo(19 * 2, 2);
    expect(resultado.get('sapata_freio_dianteiro')?.trocasNoAno).toBe(2);
    expect(resultado.get('sapata_freio_dianteiro')?.custoAnual).toBeCloseTo(17 * 2, 2);
    expect(resultado.get('sapata_freio_traseiro')?.trocasNoAno).toBe(2);
    expect(resultado.get('sapata_freio_traseiro')?.custoAnual).toBeCloseTo(47 * 2, 2);
  });

  it('kit_revisao ignora kmUltimaTrocas legado e segue automático no ciclo independente', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetPop110i,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual,
      kmAnual,
      kmUltimaTrocas: {
        ...kmUltimaTrocasVazio,
        kitRevisao: 84000,
      } as unknown as KmUltimaTrocas,
    });

    const kitRevisao = resultado.get('kit_revisao');
    expect(kitRevisao?.trocasNoAno).toBeCloseTo(kmAnual / 6000, 5);
    expect(kitRevisao?.custoAnual).toBeCloseTo((102.93 / 6000) * kmAnual, 2);
  });

  it('bateria com km informado continua usando driver temporal', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetPop110i,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual,
      kmAnual,
      kmUltimaTrocas: { ...kmUltimaTrocasVazio, bateria: 50000 },
    });

    const bateria = resultado.get('bateria');
    expect(bateria?.trocasNoAno).toBeCloseTo(0.5, 5);
    expect(bateria?.custoAnual).toBeCloseTo(163.2 * 0.5, 2);
    expect(bateria?.proximaTrocaKm).toBe(0);
  });
});

describe('TASK-RF-6.13 — retíficas usam kmUltimaTrocas em Imprevistos', () => {
  const dadosRJ: DadosRJ = {
    ipva: { aliquotaMotos: 0.015, isencaoIdadeMinimaMeses: 0 },
    licenciamento: { tabela: {} },
  };

  it('retífica sem km informado mantém custo amortizado', () => {
    const perfil = {
      ...perfilPadrao,
      moto: { ...perfilPadrao.moto, kmAtual: 110000, kmUltimaTrocas: kmUltimaTrocasVazio },
      trabalho: { ...perfilPadrao.trabalho, kmPorDia: 70, diasPorSemana: 5 },
      perfilManutencao: { ...perfilPadrao.perfilManutencao, modoRevisao: 'independentes' as const },
    };

    const resultado = calcularCustosPorCategoria(perfil, presetPop110i, dadosRJ);
    const retifica = resultado.gastosCustom.detalhes.sugeridos.get('retifica-completa');

    expect(retifica?.eventosNoAno).toBeCloseTo(18200 / 120000, 5);
    expect(retifica?.custoAnual).toBeCloseTo((1500 / 120000) * 18200, 2);
  });

  it('retífica com km informado usa custo cheio quando a troca cai na janela', () => {
    const perfil = {
      ...perfilPadrao,
      moto: {
        ...perfilPadrao.moto,
        kmAtual: 110000,
        kmUltimaTrocas: { ...kmUltimaTrocasVazio, retificaCompleta: 1 },
      },
      trabalho: { ...perfilPadrao.trabalho, kmPorDia: 70, diasPorSemana: 5 },
      perfilManutencao: { ...perfilPadrao.perfilManutencao, modoRevisao: 'independentes' as const },
    };

    const resultado = calcularCustosPorCategoria(perfil, presetPop110i, dadosRJ);
    const retifica = resultado.gastosCustom.detalhes.sugeridos.get('retifica-completa');

    expect(retifica?.eventosNoAno).toBe(1);
    expect(retifica?.custoAnual).toBeCloseTo(1500, 2);
  });
});

describe('MAPA_PECA_PARA_SERVICO', () => {
  it('cada serviço apontado existe em SERVICOS_INDEPENDENTES_PADRAO', () => {
    const idsServicos = new Set(SERVICOS_INDEPENDENTES_PADRAO.map((s) => s.id));
    for (const servicoId of Object.values(MAPA_PECA_PARA_SERVICO)) {
      expect(idsServicos.has(servicoId)).toBe(true);
    }
  });

  it('cada peça/pneu apontado existe no preset Pop 110i', () => {
    const idsPecasEPneus = new Set<string>([
      ...pop110i.pecas.map((p) => p.id),
      ...pop110i.pneus.map((p) => p.id),
    ]);
    for (const pecaId of Object.keys(MAPA_PECA_PARA_SERVICO)) {
      expect(idsPecasEPneus.has(pecaId)).toBe(true);
    }
  });

  it('mapeia sapatas dianteira e traseira para os serviços de troca correspondentes (ADR-007)', () => {
    expect(MAPA_PECA_PARA_SERVICO['sapata_freio_dianteiro']).toBe('troca-sapata-dianteira');
    expect(MAPA_PECA_PARA_SERVICO['sapata_freio_traseiro']).toBe('troca-sapata-traseira');
  });

  it('mapeia oleo_motor para troca-oleo (caminho feliz)', () => {
    expect(MAPA_PECA_PARA_SERVICO['oleo_motor']).toBe('troca-oleo');
  });
});

describe('calcularCustoFinanciamentoAnual (RF-6.18 — afunila no último ano)', () => {
  it('retorna parcela * 12 quando restam >= 12 parcelas', () => {
    expect(
      calcularCustoFinanciamentoAnual({
        situacaoMoto: 'financiada',
        parcelaMensal: 500,
        parcelasRestantesAtuais: 24,
        aluguelMensal: null,
        aluguelPeriodicidade: null,
      }),
    ).toBe(6000);
  });

  it('projeta só as parcelas que faltam no último ano', () => {
    // faltam 5 parcelas de R$350 → R$1.750 no ano (não R$4.200)
    expect(
      calcularCustoFinanciamentoAnual({
        situacaoMoto: 'financiada',
        parcelaMensal: 350,
        parcelasRestantesAtuais: 5,
        aluguelMensal: null,
        aluguelPeriodicidade: null,
      }),
    ).toBe(1750);
  });

  it('zera o custo quando não restam parcelas', () => {
    expect(
      calcularCustoFinanciamentoAnual({
        situacaoMoto: 'financiada',
        parcelaMensal: 500,
        parcelasRestantesAtuais: 0,
        aluguelMensal: null,
        aluguelPeriodicidade: null,
      }),
    ).toBe(0);
  });

  it('limita a 12 parcelas no ano mesmo com muitas restantes', () => {
    expect(
      calcularCustoFinanciamentoAnual({
        situacaoMoto: 'financiada',
        parcelaMensal: 500,
        parcelasRestantesAtuais: 36,
        aluguelMensal: null,
        aluguelPeriodicidade: null,
      }),
    ).toBe(6000);
  });

  it('retorna aluguel * 12 quando alugada mensal', () => {
    expect(
      calcularCustoFinanciamentoAnual({
        situacaoMoto: 'alugada',
        parcelaMensal: null,
        parcelasRestantesAtuais: 0,
        aluguelMensal: 800,
        aluguelPeriodicidade: 'mensal',
      }),
    ).toBe(9600);
  });

  it('retorna aluguel * 52 quando alugada semanal', () => {
    expect(
      calcularCustoFinanciamentoAnual({
        situacaoMoto: 'alugada',
        parcelaMensal: null,
        parcelasRestantesAtuais: 0,
        aluguelMensal: 200,
        aluguelPeriodicidade: 'semanal',
      }),
    ).toBe(10400);
  });

  it('retorna 0 quando quitada', () => {
    expect(
      calcularCustoFinanciamentoAnual({
        situacaoMoto: 'quitada',
        parcelaMensal: null,
        parcelasRestantesAtuais: 0,
        aluguelMensal: null,
        aluguelPeriodicidade: null,
      }),
    ).toBe(0);
  });
});

describe('calcularParcelasRestantesAtuais (RF-6.18 — derivação por snapshot)', () => {
  it('retorna 0 quando parcelasRestantes é null', () => {
    expect(calcularParcelasRestantesAtuais(null, '2026-01-01', new Date('2026-05-01'))).toBe(0);
  });

  it('retorna o valor informado quando não há dataReferencia', () => {
    expect(calcularParcelasRestantesAtuais(24, null, new Date('2026-05-01'))).toBe(24);
  });

  it('decrementa pelos meses decorridos desde a referência', () => {
    // jan/2026 → abr/2026 = 3 meses → 24 - 3 = 21
    expect(calcularParcelasRestantesAtuais(24, '2026-01-15', new Date('2026-04-10'))).toBe(21);
  });

  it('clampa em 0 quando os meses decorridos passam das parcelas', () => {
    expect(calcularParcelasRestantesAtuais(3, '2026-01-01', new Date('2026-08-01'))).toBe(0);
  });

  it('não infla quando a dataReferencia está no futuro', () => {
    expect(calcularParcelasRestantesAtuais(10, '2026-09-01', new Date('2026-05-01'))).toBe(10);
  });
});
