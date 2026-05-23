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
  calcularCpkPecasTotal,
  calcularIPVA,
  calcularLicenciamento,
  calcularCustoRevisaoAnual,
  calcularCustoInternetAnual,
  calcularCustoSeguroAnual,
  calcularCustoAlimentacaoAnual,
  calcularTotalFiltrado,
  calcularGranularidades,
  calcularBreakdownPercentual,
  calcularCustoMotoAnual,
  calcularCustosPorCategoria,
} from './calculos';
import type { PresetMoto, CustosPorCategoria, FiltrosCategorias, DadosRJ } from '../types/calculos';
import type { PecaOverride, ServicoIndependente } from '../types/perfil';
import { perfilPadrao } from '../context/PerfilContext';
import pop110i from '../presets/pop110i.json';

// ─── Fixtures ────────────────────────────────────────────────────

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
    },
    {
      intervaloKm: 6000,
      intervaloMeses: 12,
      precoPecas: 248.06,
      precoMaoDeObra: 0,
      precoTotal: 248.06,
    },
    {
      intervaloKm: 12000,
      intervaloMeses: 18,
      precoPecas: 352.29,
      precoMaoDeObra: 216.0,
      precoTotal: 568.29,
    },
    {
      intervaloKm: 18000,
      intervaloMeses: 24,
      precoPecas: 402.7,
      precoMaoDeObra: 104.0,
      precoTotal: 506.7,
    },
    {
      intervaloKm: 24000,
      intervaloMeses: 30,
      precoPecas: 449.76,
      precoMaoDeObra: 288.0,
      precoTotal: 737.76,
    },
    {
      intervaloKm: 30000,
      intervaloMeses: 36,
      precoPecas: 247.67,
      precoMaoDeObra: 40.0,
      precoTotal: 287.67,
    },
    {
      intervaloKm: 36000,
      intervaloMeses: 42,
      precoPecas: 600.2,
      precoMaoDeObra: 280.0,
      precoTotal: 880.2,
    },
  ],
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
        precoMaoDeObra: 125,
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
        precoMaoDeObra: 125,
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
      precoMaoDeObra: 25,
      ativo: true,
      ehExcepcional: false,
    },
    {
      id: 'revisao-geral',
      nome: 'Revisão geral',
      intervalKm: 6000,
      precoMaoDeObra: 80,
      ativo: true,
      ehExcepcional: false,
    },
    {
      id: 'fazer-motor',
      nome: 'Fazer motor',
      intervalKm: 70000,
      precoMaoDeObra: 1500,
      ativo: false,
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

  it('modo independentes: soma CPK × kmAnual de serviços ativos', () => {
    const kmAnual = 12000;
    const esperado = (25 / 3000) * kmAnual + (80 / 6000) * kmAnual;
    expect(
      calcularCustoRevisaoAnual('independentes', kmAnual, { servicosIndependentes: servicosMock }),
    ).toBeCloseTo(esperado, 2);
  });

  it('modo independentes: serviço inativo é excluído do cálculo', () => {
    const kmAnual = 12000;
    const comFazerMotorAtivo = servicosMock.map((s) =>
      s.id === 'fazer-motor' ? { ...s, ativo: true } : s,
    );
    const semAtivo = calcularCustoRevisaoAnual('independentes', kmAnual, {
      servicosIndependentes: servicosMock,
    });
    const comAtivo = calcularCustoRevisaoAnual('independentes', kmAnual, {
      servicosIndependentes: comFazerMotorAtivo,
    });
    expect(comAtivo).toBeGreaterThan(semAtivo);
    expect(comAtivo - semAtivo).toBeCloseTo((1500 / 70000) * kmAnual, 2);
  });

  it('modo independentes: sem serviços retorna 0', () => {
    expect(calcularCustoRevisaoAnual('independentes', 10000, { servicosIndependentes: [] })).toBe(
      0,
    );
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
  revisao: { total: 953, detalhes: { modo: 'autorizadas' } },
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
  gastosCustom: { total: 0, ativo: false },
};

const filtrosTudo: FiltrosCategorias = {
  documentos: true,
  revisao: true,
  manutencao: true,
  manutencaoPorPeca: {},
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
    const esperado = 600 + 953 + 1460 + 600 + 800 + 2496;
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

describe('calcularBreakdownPercentual', () => {
  it('todos os valores são 0 quando total filtrado é 0', () => {
    const custoVazio: CustosPorCategoria = {
      documentos: { total: 0, detalhes: { ipva: 0, licenciamento: 0 } },
      revisao: { total: 0, detalhes: { modo: 'independentes' } },
      manutencao: { total: 0, detalhes: new Map() },
      combustivel: { total: 0, detalhes: { cpk: 0, kmAnual: 0, consumoEfetivo: 0 } },
      internet: { total: 0, ativo: false },
      seguro: { total: 0, ativo: false },
      alimentacao: { total: 0, ativo: false },
      financiamento: { total: 0, ativo: false },
      gastosCustom: { total: 0, ativo: false },
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
      combustivel: false,
      internet: false,
      seguro: false,
      alimentacao: false,
    };
    const resultado = calcularBreakdownPercentual(custosMock, filtroSoManu);
    expect(resultado.manutencao).toBeCloseTo(100, 1);
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

describe('calcularCustoMotoAnual', () => {
  it('subtrai custo de alimentação do total', () => {
    expect(calcularCustoMotoAnual(10000, 2500)).toBe(7500);
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

  it('sem overrides usa precoTotal original do preset', () => {
    const resultado = calcularCustosPorCategoria(perfilAutorizadas, presetMock, dadosRJMock);
    const cicloEsperado = presetMock.revisaoAutorizada.reduce((s, r) => s + r.precoTotal, 0);
    const kmAnual = calcularKmAnual(
      perfilPadrao.trabalho.kmPorDia,
      perfilPadrao.trabalho.diasPorSemana,
    );
    expect(resultado.revisao.total).toBeCloseTo((cicloEsperado / 36000) * kmAnual, 2);
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

  it('modo autorizado: manutenção exclui óleo e vela (cobertos pela revisão)', () => {
    const resultado = calcularCustosPorCategoria(
      perfilComModo('autorizadas'),
      presetMock,
      dadosRJBG003,
    );
    expect(resultado.manutencao.detalhes.has('oleo_motor')).toBe(false);
    expect(resultado.manutencao.detalhes.has('vela_ignicao')).toBe(false);
    expect(resultado.manutencao.detalhes.has('kit_relacao')).toBe(true);
    expect(resultado.manutencao.detalhes.has('pneu_traseiro')).toBe(true);
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
      kmUltimaTrocas: { oleo: 0, pneuDianteiro: 0, pneuTraseiro: 10000, kitRelacao: 0 },
    });
    const pneu = resultado.get('pneu_traseiro')!;
    expect(pneu.trocasNoAno).toBe(1);
    expect(pneu.custoAnual).toBeCloseTo(137, 2);
    expect(pneu.proximaTrocaKm).toBe(26000);
  });

  it('peça sem km informado mantém custo amortizado', () => {
    const resultado = calcularCpkPorPeca({
      preset: presetMock,
      tipoUso: 'entrega',
      perfilPecas: 'paralela',
      modoRevisao: 'independentes',
      kmAtual: 13000,
      kmAnual: 18200,
      kmUltimaTrocas: { oleo: 0, pneuDianteiro: 0, pneuTraseiro: 0, kitRelacao: 0 },
    });
    const pneu = resultado.get('pneu_traseiro')!;
    expect(pneu.custoAnual).toBeCloseTo((137 / 16000) * 18200, 2);
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
        kmUltimaTrocas: { oleo: 0, pneuDianteiro: 0, pneuTraseiro: 10000, kitRelacao: 0 },
      },
    };
    // perfilPadrao: 70 km/dia × 5 dias × 52 = 18.200 km/ano
    const resultado = calcularCustosPorCategoria(perfil, presetMock, dadosRJ);
    expect(resultado.manutencao.detalhes.get('pneu_traseiro')!.proximaTrocaKm).toBe(26000);
  });
});
