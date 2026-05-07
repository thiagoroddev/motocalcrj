import { describe, it, expect } from 'vitest';
import {
  resolverKmDia,
  calcularKmMensal,
  calcularKmAnual,
  calcularDiasAno,
  calcularKmMensalPorSemanas,
  agruparRegistrosPorSemana,
  resolverConsumoEfetivo,
  calcularCpkCombustivel,
  calcularCpkPeca,
  resolverIntervaloPeca,
  resolverPrecoPeca,
  calcularCpkPorPeca,
  calcularCpkPecasTotal,
  calcularIPVA,
  calcularLicenciamento,
  calcularCustoRevisaoAnual,
  calcularKmParaProximaRevisao,
  calcularDiasParaProximaRevisao,
  calcularCustoInternetAnual,
  calcularCustoSeguroAnual,
  calcularCustoAlimentacaoAnual,
  calcularTotalFiltrado,
  calcularGranularidades,
  calcularBreakdownPercentual,
  calcularCustoMotoAnual,
  calcularMediaRegistros,
  calcularIntervalMedioReal,
  temDadoSuficiente,
  adaptarHistoricoParaRegistros,
} from './calculos';
import type {
  PresetMoto,
  RegistroManutencao,
  CustosPorCategoria,
  FiltrosCategorias,
} from '../types/calculos';
import type { DiarioEntry, HistoricoManutencao } from '../types/perfil';

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
    },
    {
      id: 'vela_ignicao',
      nome: 'Vela de ignição',
      intervaloKm: 12000,
      intervaloKmEntrega: 12000,
      precoOriginal: 82,
      precoParalela: 29,
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
    { intervaloKm: 1000, intervaloMeses: 6, precoTotal: 105.94 },
    { intervaloKm: 6000, intervaloMeses: 12, precoTotal: 248.06 },
    { intervaloKm: 12000, intervaloMeses: 18, precoTotal: 568.29 },
    { intervaloKm: 18000, intervaloMeses: 24, precoTotal: 506.7 },
    { intervaloKm: 24000, intervaloMeses: 30, precoTotal: 737.76 },
    { intervaloKm: 30000, intervaloMeses: 36, precoTotal: 287.67 },
    { intervaloKm: 36000, intervaloMeses: 42, precoTotal: 880.2 },
  ],
};

function makeDiario(kms: number[], dataBase = '2026-01-06'): DiarioEntry[] {
  return kms.map((km, i) => ({
    id: String(i),
    data: new Date(new Date(dataBase + 'T12:00:00Z').getTime() + i * 86_400_000)
      .toISOString()
      .slice(0, 10),
    kmInicial: 0,
    kmFinal: km,
    kmPercorridos: km,
    comeu: false,
    abasteceu: false,
    litros: null,
    precoLitro: null,
  }));
}

// ─── I. Rodagem ──────────────────────────────────────────────────

describe('resolverKmDia', () => {
  it('usa perfil no modo predefinidos (sem registros)', () => {
    expect(resolverKmDia(80, [], 'predefinidos')).toBe(80);
  });

  it('usa perfil no modo predefinidos mesmo com registros', () => {
    expect(resolverKmDia(80, makeDiario([100, 120]), 'predefinidos')).toBe(80);
  });

  it('usa média do diário no modo personalizado com registros', () => {
    expect(resolverKmDia(80, makeDiario([100, 120]), 'personalizado')).toBe(110);
  });

  it('cai no perfil quando personalizado mas diário vazio', () => {
    expect(resolverKmDia(80, [], 'personalizado')).toBe(80);
  });
});

describe('calcularKmAnual', () => {
  it('usa multiplicação direta por 52 (canônico)', () => {
    expect(calcularKmAnual(80, 6)).toBe(80 * 6 * 52); // 24960
  });

  it('resultado difere de kmMensal × 12 (validação anti-bug)', () => {
    const kmAnual = calcularKmAnual(80, 6);
    const viaMensal = calcularKmMensal(80, 6) * 12;
    // 4.33 não é exato, então os dois caminhos divergem
    expect(kmAnual).not.toBeCloseTo(viaMensal, 0);
  });
});

describe('calcularDiasAno', () => {
  it('é diasSemana × 52 (dias trabalhados, não 365)', () => {
    expect(calcularDiasAno(6)).toBe(312);
    expect(calcularDiasAno(5)).toBe(260);
  });
});

describe('calcularKmMensalPorSemanas', () => {
  it('retorna null com menos de 2 semanas completas', () => {
    expect(calcularKmMensalPorSemanas(makeDiario([100, 120]))).toBeNull();
  });

  it('retorna média semanal × 4.33 com 2 semanas', () => {
    // Semana 1: 06/01 + 07/01 (terça + quarta) = 140 km
    // Semana 2: 13/01 + 14/01 (terça + quarta) = 146 km
    const diario: DiarioEntry[] = [
      ...makeDiario([72, 68], '2026-01-06'),
      ...makeDiario([75, 71], '2026-01-13'),
    ];
    const resultado = calcularKmMensalPorSemanas(diario);
    expect(resultado).not.toBeNull();
    expect(resultado!).toBeCloseTo(((140 + 146) / 2) * 4.33, 1);
  });
});

describe('agruparRegistrosPorSemana', () => {
  it('exclui semanas com apenas 1 dia registrado', () => {
    expect(agruparRegistrosPorSemana(makeDiario([100]))).toHaveLength(0);
  });

  it('agrupa corretamente 2 semanas', () => {
    const diario: DiarioEntry[] = [
      ...makeDiario([100, 80], '2026-01-06'),
      ...makeDiario([90, 70], '2026-01-13'),
    ];
    const resultado = agruparRegistrosPorSemana(diario);
    expect(resultado).toHaveLength(2);
    expect(resultado[0].totalKm).toBe(180);
    expect(resultado[1].totalKm).toBe(160);
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

describe('calcularCpkPeca', () => {
  it('divide preço pelo intervalo', () => {
    expect(calcularCpkPeca(40, 1250)).toBeCloseTo(0.032, 3);
    expect(calcularCpkPeca(245, 16000)).toBeCloseTo(0.0153, 3);
  });
});

describe('resolverIntervaloPeca', () => {
  it('usa intervaloKmEntrega para entrega (predefinidos)', () => {
    expect(resolverIntervaloPeca('oleo_motor', presetMock, 'entrega', [], 'predefinidos')).toBe(
      1250,
    );
  });

  it('usa intervaloKm para passageiro (predefinidos)', () => {
    expect(resolverIntervaloPeca('oleo_motor', presetMock, 'passageiro', [], 'predefinidos')).toBe(
      6000,
    );
  });

  it('usa média dos kmDesdeAnterior no modo personalizado', () => {
    const registros: RegistroManutencao[] = [
      { pecaId: 'oleo_motor', kmNaTroca: 1100, kmDesdeAnterior: 1100, preco: 42 },
      { pecaId: 'oleo_motor', kmNaTroca: 2300, kmDesdeAnterior: 1200, preco: 38 },
    ];
    expect(
      resolverIntervaloPeca('oleo_motor', presetMock, 'entrega', registros, 'personalizado'),
    ).toBeCloseTo(1150, 1);
  });

  it('usa vidaUtilKm para pneus (igual para entrega e passageiro)', () => {
    expect(resolverIntervaloPeca('pneu_traseiro', presetMock, 'entrega', [], 'predefinidos')).toBe(
      16000,
    );
    expect(
      resolverIntervaloPeca('pneu_traseiro', presetMock, 'passageiro', [], 'predefinidos'),
    ).toBe(16000);
  });
});

describe('resolverPrecoPeca', () => {
  it('usa precoOriginal quando perfilPecas = original', () => {
    expect(resolverPrecoPeca('oleo_motor', presetMock, 'original', [], 'predefinidos')).toBe(40);
  });

  it('usa precoParalela quando perfilPecas = paralela', () => {
    expect(resolverPrecoPeca('oleo_motor', presetMock, 'paralela', [], 'predefinidos')).toBe(23);
  });

  it('usa média dos preços dos registros no modo personalizado', () => {
    const registros: RegistroManutencao[] = [
      { pecaId: 'oleo_motor', kmNaTroca: 1100, kmDesdeAnterior: 1100, preco: 42 },
      { pecaId: 'oleo_motor', kmNaTroca: 2300, kmDesdeAnterior: 1200, preco: 38 },
    ];
    expect(
      resolverPrecoPeca('oleo_motor', presetMock, 'original', registros, 'personalizado'),
    ).toBe(40);
  });

  it('funciona para pneus (precoOriginal / precoParalela)', () => {
    expect(resolverPrecoPeca('pneu_traseiro', presetMock, 'original', [], 'predefinidos')).toBe(
      245,
    );
    expect(resolverPrecoPeca('pneu_traseiro', presetMock, 'paralela', [], 'predefinidos')).toBe(
      137,
    );
  });
});

describe('calcularCpkPorPeca', () => {
  it('inclui peças e pneus no mapa de saída', () => {
    const resultado = calcularCpkPorPeca(
      presetMock,
      'entrega',
      'paralela',
      [],
      'predefinidos',
      0,
      7280,
    );
    expect(resultado.has('oleo_motor')).toBe(true);
    expect(resultado.has('vela_ignicao')).toBe(true);
    expect(resultado.has('pneu_traseiro')).toBe(true);
  });

  it('cpk do óleo para entrega com peça paralela: 23/1250', () => {
    const resultado = calcularCpkPorPeca(
      presetMock,
      'entrega',
      'paralela',
      [],
      'predefinidos',
      0,
      7280,
    );
    expect(resultado.get('oleo_motor')!.cpk).toBeCloseTo(23 / 1250, 5);
  });

  it('custoAnual = cpk × kmAnual', () => {
    const kmAnual = 7280;
    const resultado = calcularCpkPorPeca(
      presetMock,
      'entrega',
      'paralela',
      [],
      'predefinidos',
      0,
      kmAnual,
    );
    const oleo = resultado.get('oleo_motor')!;
    expect(oleo.custoAnual).toBeCloseTo(oleo.cpk * kmAnual, 2);
  });

  it('fonte = preset quando predefinidos', () => {
    const resultado = calcularCpkPorPeca(
      presetMock,
      'entrega',
      'paralela',
      [],
      'predefinidos',
      0,
      7280,
    );
    expect(resultado.get('oleo_motor')!.fonte).toBe('preset');
  });

  it('fonte = registro quando personalizado e há registro; demais = preset', () => {
    const registros: RegistroManutencao[] = [
      { pecaId: 'oleo_motor', kmNaTroca: 1100, kmDesdeAnterior: 1100, preco: 42 },
    ];
    const resultado = calcularCpkPorPeca(
      presetMock,
      'entrega',
      'paralela',
      registros,
      'personalizado',
      0,
      7280,
    );
    expect(resultado.get('oleo_motor')!.fonte).toBe('registro');
    expect(resultado.get('vela_ignicao')!.fonte).toBe('preset');
  });
});

describe('calcularCpkPecasTotal', () => {
  it('soma todos os cpks do mapa', () => {
    const mapa = calcularCpkPorPeca(presetMock, 'entrega', 'original', [], 'predefinidos', 0, 7280);
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
  it('modo autorizadas: (ciclo / meses) × 12', () => {
    const resultado = calcularCustoRevisaoAnual('autorizadas', 7280, {
      custoCicloCompleto: 3334.62,
      duracaoCicloMeses: 42,
    });
    expect(resultado).toBeCloseTo((3334.62 / 42) * 12, 2); // ≈ 952.75
  });

  it('modo independentes: (kmAnual / frequencia) × preco', () => {
    const resultado = calcularCustoRevisaoAnual('independentes', 7280, {
      precoRevisaoGeral: 150,
      frequenciaRevisaoKm: 6000,
    });
    expect(resultado).toBeCloseTo((7280 / 6000) * 150, 2); // ≈ 182
  });

  it('autorizada é bem mais cara que independente para valores típicos', () => {
    expect(calcularCustoRevisaoAnual('autorizadas', 7280)).toBeGreaterThan(
      calcularCustoRevisaoAnual('independentes', 7280),
    );
  });
});

describe('calcularKmParaProximaRevisao', () => {
  it('calcula km restantes corretamente', () => {
    expect(calcularKmParaProximaRevisao(7500, 3000, 6000)).toBe(1500);
  });

  it('retorna negativo quando passou do intervalo', () => {
    expect(calcularKmParaProximaRevisao(10000, 3000, 6000)).toBe(-1000);
  });
});

describe('calcularDiasParaProximaRevisao', () => {
  it('usa km médio por dia incluindo dias de folga (kmDia × diasSemana / 7)', () => {
    // kmDia=80, diasSemana=5 → kmDiaMedio = 80×5/7 ≈ 57.14
    // 1500 / 57.14 ≈ 27 dias
    const esperado = Math.ceil(1500 / ((80 * 5) / 7));
    expect(calcularDiasParaProximaRevisao(1500, 80, 5)).toBe(esperado);
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
  it('retorna valorAnual quando ativo', () => {
    expect(calcularCustoSeguroAnual(true, 800)).toBe(800);
  });

  it('retorna 0 quando inativo', () => {
    expect(calcularCustoSeguroAnual(false, 800)).toBe(0);
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
        },
      ],
    ]),
  },
  combustivel: { total: 1460, detalhes: { cpk: 0.2, kmAnual: 7280, consumoEfetivo: 33 } },
  internet: { total: 600, ativo: true },
  seguro: { total: 800, ativo: true },
  alimentacao: { total: 2496, ativo: true },
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
    };
    const resultado = calcularBreakdownPercentual(custoVazio, filtrosTudo);
    Object.values(resultado).forEach((v) => expect(v).toBe(0));
  });
});

describe('calcularCustoMotoAnual', () => {
  it('subtrai custo de alimentação do total', () => {
    expect(calcularCustoMotoAnual(10000, 2500)).toBe(7500);
  });
});

// ─── VIII. Modo Personalizado ─────────────────────────────────────

describe('calcularMediaRegistros', () => {
  it('calcula média do campo especificado', () => {
    const registros: RegistroManutencao[] = [
      { pecaId: 'x', kmNaTroca: 1000, kmDesdeAnterior: 900, preco: 40 },
      { pecaId: 'x', kmNaTroca: 2000, kmDesdeAnterior: 1100, preco: 60 },
    ];
    expect(calcularMediaRegistros(registros, 'preco')).toBe(50);
    expect(calcularMediaRegistros(registros, 'kmDesdeAnterior')).toBe(1000);
  });

  it('retorna 0 para array vazio', () => {
    expect(calcularMediaRegistros([], 'preco')).toBe(0);
  });
});

describe('calcularIntervalMedioReal', () => {
  it('retorna null quando não há registros para a peça', () => {
    expect(calcularIntervalMedioReal([], 'oleo_motor')).toBeNull();
  });

  it('calcula média dos kmDesdeAnterior para a peça', () => {
    const registros: RegistroManutencao[] = [
      { pecaId: 'oleo_motor', kmNaTroca: 1100, kmDesdeAnterior: 1100, preco: 42 },
      { pecaId: 'oleo_motor', kmNaTroca: 2300, kmDesdeAnterior: 1200, preco: 38 },
    ];
    expect(calcularIntervalMedioReal(registros, 'oleo_motor')).toBeCloseTo(1150, 1);
  });

  it('ignora registros de outras peças', () => {
    const registros: RegistroManutencao[] = [
      { pecaId: 'oleo_motor', kmNaTroca: 1100, kmDesdeAnterior: 1100, preco: 42 },
      { pecaId: 'pneu_traseiro', kmNaTroca: 10000, kmDesdeAnterior: 10000, preco: 245 },
    ];
    expect(calcularIntervalMedioReal(registros, 'oleo_motor')).toBe(1100);
  });
});

describe('temDadoSuficiente', () => {
  it('rodagem: true com ≥ 1 entrada no diário', () => {
    expect(temDadoSuficiente('rodagem', makeDiario([80]), [], undefined)).toBe(true);
  });

  it('rodagem: false com diário vazio', () => {
    expect(temDadoSuficiente('rodagem', [], [], undefined)).toBe(false);
  });

  it('manutencao: true quando há registro da peça específica', () => {
    const registros: RegistroManutencao[] = [
      { pecaId: 'oleo_motor', kmNaTroca: 1100, kmDesdeAnterior: 1100, preco: 42 },
    ];
    expect(temDadoSuficiente('manutencao', [], registros, 'oleo_motor')).toBe(true);
  });

  it('manutencao: false quando não há registro da peça', () => {
    const registros: RegistroManutencao[] = [
      { pecaId: 'oleo_motor', kmNaTroca: 1100, kmDesdeAnterior: 1100, preco: 42 },
    ];
    expect(temDadoSuficiente('manutencao', [], registros, 'pneu_traseiro')).toBe(false);
  });
});

// ─── Adapter ─────────────────────────────────────────────────────

describe('adaptarHistoricoParaRegistros', () => {
  const historicoParcial: HistoricoManutencao = {
    trocasOleo: [
      {
        id: '1',
        data: '2026-01-01',
        km: 5000,
        valorTotal: 40,
        tipoOleo: 'pro honda',
        marca: 'honda',
      },
      {
        id: '2',
        data: '2026-02-01',
        km: 6250,
        valorTotal: 38,
        tipoOleo: 'pro honda',
        marca: 'honda',
      },
    ],
    revisoes: [],
    trocasPneu: [
      {
        id: '3',
        data: '2025-06-01',
        km: 14000,
        posicao: 'traseiro',
        marca: 'levorin',
        valorTotal: 245,
      },
      {
        id: '4',
        data: '2026-04-01',
        km: 30000,
        posicao: 'traseiro',
        marca: 'levorin',
        valorTotal: 245,
      },
    ],
    trocasKitRelacao: [],
    abastecimentos: [],
  };

  it('gera registros oleo_motor com kmDesdeAnterior correto', () => {
    const resultado = adaptarHistoricoParaRegistros(historicoParcial);
    const oleos = resultado.filter((r) => r.pecaId === 'oleo_motor');
    expect(oleos).toHaveLength(2);
    expect(oleos[0].kmDesdeAnterior).toBe(5000); // primeiro: usa o próprio km
    expect(oleos[1].kmDesdeAnterior).toBe(1250); // 6250 - 5000
  });

  it('gera registros pneu_traseiro com kmDesdeAnterior correto', () => {
    const resultado = adaptarHistoricoParaRegistros(historicoParcial);
    const pneus = resultado.filter((r) => r.pecaId === 'pneu_traseiro');
    expect(pneus).toHaveLength(2);
    expect(pneus[0].kmDesdeAnterior).toBe(14000);
    expect(pneus[1].kmDesdeAnterior).toBe(16000); // 30000 - 14000
  });

  it('não gera registros para categorias sem histórico', () => {
    const resultado = adaptarHistoricoParaRegistros(historicoParcial);
    expect(resultado.filter((r) => r.pecaId === 'kit_relacao')).toHaveLength(0);
  });

  it('pneu dianteiro e traseiro têm kmDesdeAnterior calculados independentemente', () => {
    const historico: HistoricoManutencao = {
      ...historicoParcial,
      trocasPneu: [
        {
          id: 'a',
          data: '2026-01-01',
          km: 10000,
          posicao: 'dianteiro',
          marca: 'x',
          valorTotal: 209,
        },
        {
          id: 'b',
          data: '2026-01-01',
          km: 14000,
          posicao: 'traseiro',
          marca: 'x',
          valorTotal: 245,
        },
        {
          id: 'c',
          data: '2026-06-01',
          km: 35000,
          posicao: 'dianteiro',
          marca: 'x',
          valorTotal: 209,
        },
      ],
    };
    const resultado = adaptarHistoricoParaRegistros(historico);
    const dianteiros = resultado.filter((r) => r.pecaId === 'pneu_dianteiro');
    const traseiros = resultado.filter((r) => r.pecaId === 'pneu_traseiro');
    expect(dianteiros[1].kmDesdeAnterior).toBe(25000); // 35000 - 10000
    expect(traseiros[0].kmDesdeAnterior).toBe(14000);
  });
});
