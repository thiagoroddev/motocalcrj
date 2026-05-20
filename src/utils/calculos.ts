import type {
  PerfilUsuario,
  DiarioEntry,
  HistoricoManutencao,
  ModoExibicao,
  PerfilUso,
  PerfilPecas,
  ModoRevisao,
  PecaOverride,
  GastoCustom,
  ResponsabilidadeCusto,
  CategoriaDisplay,
  ServicoIndependente,
} from '../types/perfil';
import type {
  PresetMoto,
  DadosRJ,
  RegistroManutencao,
  GranularidadesCusto,
  CustoPeca,
  CustosPorCategoria,
  FiltrosCategorias,
  ResultadoCalculo,
} from '../types/calculos';

// ─── Helpers internos ────────────────────────────────────────────

function media(arr: number[]): number {
  if (arr.length === 0) {
    return 0;
  }
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Retorna a data da segunda-feira da semana ISO do registro (chave de agrupamento)
function semanaISODe(dataStr: string): string {
  const d = new Date(dataStr + 'T12:00:00Z');
  const diaSemana = d.getUTCDay() || 7; // 1=seg ... 7=dom
  const seg = new Date(d);
  seg.setUTCDate(d.getUTCDate() - diaSemana + 1);
  return seg.toISOString().slice(0, 10);
}

// ─── I. Rodagem ──────────────────────────────────────────────────

export function resolverKmDia(
  kmPorDia: number,
  diarioTrabalho: DiarioEntry[],
  modoExibicao: ModoExibicao,
): number {
  if (modoExibicao === 'personalizado' && diarioTrabalho.length >= 1) {
    return media(diarioTrabalho.map((r) => r.kmPercorridos));
  }
  return kmPorDia;
}

export function calcularKmMensal(kmDia: number, diasSemana: number): number {
  return kmDia * diasSemana * 4.33;
}

// Canônico: nunca derivar de kmMensal × 12
export function calcularKmAnual(kmDia: number, diasSemana: number): number {
  return kmDia * diasSemana * 52;
}

// Dias trabalhados no ano — não usar 365
export function calcularDiasAno(diasSemana: number): number {
  return diasSemana * 52;
}

/**
 * Calcula kmMensal a partir de semanas completas (≥ 2 dias registrados).
 * Retorna null se houver menos de 2 semanas representativas — fallback para média diária.
 */
export function calcularKmMensalPorSemanas(diario: DiarioEntry[]): number | null {
  const porSemana = new Map<string, { dias: number; totalKm: number }>();

  for (const entrada of diario) {
    const chave = semanaISODe(entrada.data);
    const atual = porSemana.get(chave) ?? { dias: 0, totalKm: 0 };
    porSemana.set(chave, { dias: atual.dias + 1, totalKm: atual.totalKm + entrada.kmPercorridos });
  }

  const semanasCompletas = Array.from(porSemana.values())
    .filter((s) => s.dias >= 2)
    .map((s) => s.totalKm);

  if (semanasCompletas.length < 2) {
    return null;
  }
  return media(semanasCompletas) * 4.33;
}

export function agruparRegistrosPorSemana(
  diario: DiarioEntry[],
): Array<{ semanaISO: string; diasRegistrados: number; totalKm: number }> {
  const porSemana = new Map<string, { diasRegistrados: number; totalKm: number }>();

  for (const entrada of diario) {
    const chave = semanaISODe(entrada.data);
    const atual = porSemana.get(chave) ?? { diasRegistrados: 0, totalKm: 0 };
    porSemana.set(chave, {
      diasRegistrados: atual.diasRegistrados + 1,
      totalKm: atual.totalKm + entrada.kmPercorridos,
    });
  }

  return Array.from(porSemana.entries())
    .filter(([, v]) => v.diasRegistrados >= 2)
    .map(([semanaISO, v]) => ({ semanaISO, ...v }));
}

// ─── II. Consumo de Combustível ──────────────────────────────────

export function resolverConsumoEfetivo(preset: PresetMoto, usaBau: boolean): number {
  return usaBau ? preset.consumoKmLComBau : preset.consumoKmL;
}

export function calcularCpkCombustivel(precoGasolina: number, consumoKmL: number): number {
  return precoGasolina / consumoKmL;
}

// ─── III. CPK por Peça ────────────────────────────────────────────

export function calcularCpkPeca(preco: number, intervaloKm: number): number {
  return preco / intervaloKm;
}

export function resolverIntervaloPeca(
  pecaId: string,
  preset: PresetMoto,
  tipoUso: PerfilUso,
  registros: RegistroManutencao[],
  modoExibicao: ModoExibicao,
  pecasOverrides: PecaOverride[] = [],
  servicosIndependentes: ServicoIndependente[] = [],
): number {
  if (modoExibicao === 'personalizado') {
    const override = pecasOverrides.find((o) => o.id === pecaId);
    if (override?.intervaloKmEditado != null) {
      return override.intervaloKmEditado;
    }
    const registrosPeca = registros.filter((r) => r.pecaId === pecaId);
    if (registrosPeca.length >= 1) {
      return media(registrosPeca.map((r) => r.kmDesdeAnterior));
    }
  }

  // ServicoIndependente ativo com mesmo id é a fonte canônica do intervalo (ADR-004)
  const servico = servicosIndependentes.find((s) => s.id === pecaId && s.ativo);
  if (servico) {
    return servico.intervalKm;
  }

  const peca = preset.pecas.find((p) => p.id === pecaId);
  if (peca) {
    return tipoUso === 'entrega' ? peca.intervaloKmEntrega : peca.intervaloKm;
  }

  const pneu = preset.pneus.find((p) => p.id === pecaId);
  if (pneu) {
    return pneu.vidaUtilKm;
  }

  return 1;
}

export function resolverPrecoPeca(
  pecaId: string,
  preset: PresetMoto,
  perfilPecas: PerfilPecas,
  registros: RegistroManutencao[],
  modoExibicao: ModoExibicao,
  pecasOverrides: PecaOverride[] = [],
): number {
  const override = pecasOverrides.find((o) => o.id === pecaId);

  if (modoExibicao === 'personalizado') {
    if (override?.precoEditado != null) {
      return override.precoEditado;
    }
    const registrosPeca = registros.filter((r) => r.pecaId === pecaId);
    if (registrosPeca.length >= 1) {
      return media(registrosPeca.map((r) => r.preco));
    }
  }

  // perfilPecasOverride por peça sobrescreve o global (ignorado em modo predefinidos per RN-04)
  const perfilEfetivo: PerfilPecas =
    modoExibicao === 'personalizado' ? (override?.perfilPecasOverride ?? perfilPecas) : perfilPecas;

  const peca = preset.pecas.find((p) => p.id === pecaId);
  if (peca) {
    return perfilEfetivo === 'original' ? peca.precoOriginal : peca.precoParalela;
  }

  const pneu = preset.pneus.find((p) => p.id === pecaId);
  if (pneu) {
    return perfilEfetivo === 'original' ? pneu.precoOriginal : pneu.precoParalela;
  }

  return 0;
}

export function calcularCpkPorPeca(
  preset: PresetMoto,
  tipoUso: PerfilUso,
  perfilPecas: PerfilPecas,
  registros: RegistroManutencao[],
  modoExibicao: ModoExibicao,
  kmAtual: number,
  kmAnual: number,
  pecasOverrides: PecaOverride[] = [],
  servicosIndependentes: ServicoIndependente[] = [],
): Map<string, CustoPeca> {
  const resultado = new Map<string, CustoPeca>();

  const todasPecas: Array<{ id: string; label: string }> = [
    ...preset.pecas.map((p) => ({ id: p.id, label: p.nome })),
    ...preset.pneus.map((p) => ({
      id: p.id,
      label: p.posicao === 'dianteiro' ? 'Pneu dianteiro' : 'Pneu traseiro',
    })),
  ];

  for (const { id, label } of todasPecas) {
    const intervalo = resolverIntervaloPeca(
      id,
      preset,
      tipoUso,
      registros,
      modoExibicao,
      pecasOverrides,
      servicosIndependentes,
    );
    const preco = resolverPrecoPeca(
      id,
      preset,
      perfilPecas,
      registros,
      modoExibicao,
      pecasOverrides,
    );
    const cpk = calcularCpkPeca(preco, intervalo);

    const override = pecasOverrides.find((o) => o.id === id);
    const registrosPeca = registros.filter((r) => r.pecaId === id);
    const usouOverride =
      modoExibicao === 'personalizado' &&
      (override?.intervaloKmEditado != null ||
        override?.precoEditado != null ||
        registrosPeca.length >= 1);
    const fonte: 'preset' | 'registro' = usouOverride ? 'registro' : 'preset';

    const proximaTrocaKm = kmAtual > 0 ? Math.ceil(kmAtual / intervalo) * intervalo : intervalo;

    resultado.set(id, {
      pecaId: id,
      label,
      cpk,
      custoAnual: cpk * kmAnual,
      intervaloKm: intervalo,
      preco,
      fonte,
      proximaTrocaKm,
    });
  }

  return resultado;
}

export function calcularCpkPecasTotal(cpkPorPeca: Map<string, CustoPeca>): number {
  let total = 0;
  cpkPorPeca.forEach((p) => (total += p.cpk));
  return total;
}

// ─── IV. Documentos (IPVA + Licenciamento) ───────────────────────

export function calcularIPVA(
  valorFipe: number,
  aliquota: number,
  anoMoto: number,
  anoAtual: number,
): number {
  if (anoAtual - anoMoto >= 15) {
    return 0;
  }
  return valorFipe * aliquota;
}

export function calcularLicenciamento(anoAtual: number, tabela: Record<string, number>): number {
  return tabela[String(anoAtual)] ?? 0;
}

export function calcularCustoDocumentosAnual(ipva: number, licenciamento: number): number {
  return ipva + licenciamento;
}

// ─── V. Revisão Periódica ─────────────────────────────────────────

export function calcularCustoRevisaoAnual(
  modoRevisao: ModoRevisao,
  kmAnual: number,
  opcoes: {
    custoCicloCompleto?: number;
    servicosIndependentes?: ServicoIndependente[];
  } = {},
): number {
  if (modoRevisao === 'autorizadas') {
    const ciclo = opcoes.custoCicloCompleto ?? 3334.62;
    // km-based: quanto do ciclo é consumido por ano (36000 km = ciclo completo Honda)
    return (ciclo / 36000) * kmAnual;
  }

  const servicos = opcoes.servicosIndependentes ?? [];
  return servicos
    .filter((s) => s.ativo)
    .reduce((sum, s) => sum + (s.precoMaoDeObra / s.intervalKm) * kmAnual, 0);
}

export function calcularKmParaProximaRevisao(
  kmAtual: number,
  kmUltimaRevisao: number,
  frequenciaRevisaoKm: number,
): number {
  return frequenciaRevisaoKm - (kmAtual - kmUltimaRevisao);
}

export function calcularDiasParaProximaRevisao(
  kmParaProxima: number,
  kmDia: number,
  diasSemana: number,
): number {
  const kmDiaMedio = (kmDia * diasSemana) / 7;
  if (kmDiaMedio <= 0) {
    return 0;
  }
  return Math.ceil(kmParaProxima / kmDiaMedio);
}

// ─── VI. Custos Operacionais ──────────────────────────────────────

export function calcularCustoCombustivelAnual(cpkCombustivel: number, kmAnual: number): number {
  return cpkCombustivel * kmAnual;
}

export function calcularCustoManutencaoAnual(cpkPecasTotal: number, kmAnual: number): number {
  return cpkPecasTotal * kmAnual;
}

export function calcularCustoInternetAnual(temInternet: boolean, precoInternet: number): number {
  return temInternet ? precoInternet * 12 : 0;
}

export function calcularCustoSeguroAnual(tem: boolean, valorAnual: number): number {
  return tem ? valorAnual : 0;
}

export function calcularCustoAlimentacaoAnual(precoAlimentacao: number, diasAno: number): number {
  return precoAlimentacao * diasAno;
}

export function fatorResponsabilidade(resp: ResponsabilidadeCusto): number {
  if (resp === 'locador') {
    return 0;
  }
  if (resp === 'dividido') {
    return 0.5;
  }
  return 1;
}

export function calcularCustoFinanciamentoAnual(
  situacaoMoto: string,
  parcelaMensal: number | null,
  aluguelMensal: number | null,
  aluguelPeriodicidade: string | null,
): number {
  if (situacaoMoto === 'financiada' && parcelaMensal != null) {
    return parcelaMensal * 12;
  }
  if (situacaoMoto === 'alugada' && aluguelMensal != null) {
    return aluguelPeriodicidade === 'semanal' ? aluguelMensal * 52 : aluguelMensal * 12;
  }
  return 0;
}

export function calcularCustoGastosCustomAnual(gastosCustom: GastoCustom[]): number {
  return gastosCustom.filter((g) => g.ativo).reduce((soma, g) => soma + g.valorMensal * 12, 0);
}

// ─── VII. Agregação e Granularidades ─────────────────────────────

export function calcularCustosPorCategoria(
  perfil: PerfilUsuario,
  preset: PresetMoto,
  dadosRJ: DadosRJ,
  registrosManutencao: RegistroManutencao[],
  modoExibicao: ModoExibicao,
): CustosPorCategoria {
  const anoAtual = new Date().getFullYear();

  const kmDia = resolverKmDia(perfil.trabalho.kmPorDia, perfil.diarioTrabalho, modoExibicao);
  const diasSemana = perfil.trabalho.diasPorSemana;
  const kmAnual = calcularKmAnual(kmDia, diasSemana);
  const diasAno = calcularDiasAno(diasSemana);

  // Documentos
  const valorFipe = perfil.fipeCache?.valor ?? 0;
  const ipva = calcularIPVA(valorFipe, dadosRJ.ipva.aliquotaMotos, perfil.moto.ano, anoAtual);
  const licenciamento = calcularLicenciamento(anoAtual, dadosRJ.licenciamento.tabela);

  // Revisão — aplica overrides individuais ao ciclo Honda antes de calcular
  const custoCicloCompleto = preset.revisaoAutorizada.reduce((s, r, idx) => {
    const override = perfil.revisaoAutorizadaOverrides.find((o) => o.index === idx);
    return s + (override?.precoTotal ?? r.precoTotal);
  }, 0);
  const revisaoAnual = calcularCustoRevisaoAnual(perfil.perfilManutencao.modoRevisao, kmAnual, {
    custoCicloCompleto,
    servicosIndependentes: perfil.servicosIndependentes,
  });

  // Manutenção por peça
  const detalhePecas = calcularCpkPorPeca(
    preset,
    perfil.moto.perfilUso,
    perfil.perfilManutencao.perfilPecasGlobal,
    registrosManutencao,
    modoExibicao,
    perfil.moto.kmAtual,
    kmAnual,
    perfil.pecasOverrides,
    perfil.servicosIndependentes,
  );
  const cpkPecasTotal = calcularCpkPecasTotal(detalhePecas);

  // Combustível — usa autonomia já gravada no perfil (commitada no onboarding)
  const tipoComb = perfil.financeiro.tipoGasolinaPreferida;
  const configComb = perfil.financeiro.combustiveis[tipoComb];
  const consumoEfetivo = configComb.autonomia;
  const cpkComb = calcularCpkCombustivel(configComb.preco, consumoEfetivo);

  const internet = perfil.financeiro.internet;
  const seguro = perfil.financeiro.seguro;
  const alimentacaoDia = perfil.financeiro.alimentacaoDia;
  const { situacaoMoto, responsabilidadeAluguel, gastosCustom } = perfil.financeiro;

  // Fatores de responsabilidade para moto alugada (locador pode cobrir parte dos custos)
  const fatorDoc =
    situacaoMoto === 'alugada' ? fatorResponsabilidade(responsabilidadeAluguel.documentos) : 1;
  const fatorMan =
    situacaoMoto === 'alugada' ? fatorResponsabilidade(responsabilidadeAluguel.manutencao) : 1;
  const fatorSeg =
    situacaoMoto === 'alugada' ? fatorResponsabilidade(responsabilidadeAluguel.seguro) : 1;

  const totalFinanciamento = calcularCustoFinanciamentoAnual(
    situacaoMoto,
    perfil.financeiro.parcelaMensal,
    perfil.financeiro.aluguelMensal,
    perfil.financeiro.aluguelPeriodicidade,
  );
  const totalGastosCustom = calcularCustoGastosCustomAnual(gastosCustom);

  return {
    documentos: {
      total: calcularCustoDocumentosAnual(ipva, licenciamento) * fatorDoc,
      detalhes: { ipva: ipva * fatorDoc, licenciamento: licenciamento * fatorDoc },
    },
    revisao: {
      total: revisaoAnual * fatorMan,
      detalhes: { modo: perfil.perfilManutencao.modoRevisao },
    },
    manutencao: {
      total: calcularCustoManutencaoAnual(cpkPecasTotal, kmAnual) * fatorMan,
      detalhes: detalhePecas,
    },
    combustivel: {
      total: calcularCustoCombustivelAnual(cpkComb, kmAnual),
      detalhes: { cpk: cpkComb, kmAnual, consumoEfetivo },
    },
    internet: {
      total: calcularCustoInternetAnual(internet > 0, internet),
      ativo: internet > 0,
    },
    seguro: {
      total: calcularCustoSeguroAnual(seguro.tem, seguro.valorAnual) * fatorSeg,
      ativo: seguro.tem,
    },
    alimentacao: {
      total: calcularCustoAlimentacaoAnual(alimentacaoDia, diasAno),
      ativo: alimentacaoDia > 0,
    },
    financiamento: {
      total: totalFinanciamento,
      ativo: totalFinanciamento > 0,
    },
    gastosCustom: {
      total: totalGastosCustom,
      ativo: totalGastosCustom > 0,
    },
  };
}

export function calcularTotalFiltrado(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias,
): number {
  let total = 0;

  if (filtros.documentos) {
    total += custos.documentos.total;
  }
  if (filtros.revisao) {
    total += custos.revisao.total;
  }
  if (filtros.combustivel) {
    total += custos.combustivel.total;
  }
  if (filtros.internet) {
    total += custos.internet.total;
  }
  if (filtros.seguro) {
    total += custos.seguro.total;
  }
  if (filtros.alimentacao) {
    total += custos.alimentacao.total;
  }
  if (filtros.financiamento) {
    total += custos.financiamento.total;
  }
  if (filtros.gastosCustom) {
    total += custos.gastosCustom.total;
  }

  if (filtros.manutencao) {
    // undefined em manutencaoPorPeca = peça ativa (só false explícito desativa)
    custos.manutencao.detalhes.forEach((detalhe, pecaId) => {
      if (filtros.manutencaoPorPeca[pecaId] !== false) {
        total += detalhe.custoAnual;
      }
    });
  }

  return total;
}

export function calcularGranularidades(
  custoTotalAnual: number,
  diasAno: number,
  kmAnual: number,
): GranularidadesCusto {
  return {
    anual: custoTotalAnual,
    mensal: custoTotalAnual / 12,
    semanal: custoTotalAnual / 52, // nunca mensal/4
    diario: diasAno > 0 ? custoTotalAnual / diasAno : 0, // dias trabalhados, não 365
    porKm: kmAnual > 0 ? custoTotalAnual / kmAnual : 0,
  };
}

export function calcularBreakdownPercentual(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias,
): Record<string, number> {
  const total = calcularTotalFiltrado(custos, filtros);
  if (total === 0) {
    return {
      documentos: 0,
      revisao: 0,
      manutencao: 0,
      combustivel: 0,
      internet: 0,
      seguro: 0,
      alimentacao: 0,
      financiamento: 0,
      gastosCustom: 0,
    };
  }
  const pct = (valor: number) => (valor / total) * 100;
  return {
    documentos: filtros.documentos ? pct(custos.documentos.total) : 0,
    revisao: filtros.revisao ? pct(custos.revisao.total) : 0,
    manutencao: filtros.manutencao ? pct(custos.manutencao.total) : 0,
    combustivel: filtros.combustivel ? pct(custos.combustivel.total) : 0,
    internet: filtros.internet ? pct(custos.internet.total) : 0,
    seguro: filtros.seguro ? pct(custos.seguro.total) : 0,
    alimentacao: filtros.alimentacao ? pct(custos.alimentacao.total) : 0,
    financiamento: filtros.financiamento ? pct(custos.financiamento.total) : 0,
    gastosCustom: filtros.gastosCustom ? pct(custos.gastosCustom.total) : 0,
  };
}

export function calcularCustoMotoAnual(
  custoTotalAnual: number,
  custoAlimentacaoAnual: number,
): number {
  return custoTotalAnual - custoAlimentacaoAnual;
}

// ─── VIII. Modo Personalizado ────────────────────────────────────

export function calcularMediaRegistros<T extends object>(registros: T[], campo: keyof T): number {
  if (registros.length === 0) {
    return 0;
  }
  return media(registros.map((r) => Number(r[campo])));
}

export function calcularIntervalMedioReal(
  registros: RegistroManutencao[],
  pecaId: string,
): number | null {
  const filtrados = registros.filter((r) => r.pecaId === pecaId);
  if (filtrados.length === 0) {
    return null;
  }
  return media(filtrados.map((r) => r.kmDesdeAnterior));
}

export function temDadoSuficiente(
  tipo: 'rodagem' | 'manutencao',
  diarioTrabalho: DiarioEntry[],
  registrosManutencao: RegistroManutencao[],
  pecaId?: string,
): boolean {
  if (tipo === 'rodagem') {
    return diarioTrabalho.length >= 1;
  }
  return registrosManutencao.filter((r) => r.pecaId === pecaId).length >= 1;
}

// ─── Adapter: HistoricoManutencao → RegistroManutencao[] ─────────

export function adaptarHistoricoParaRegistros(
  historico: HistoricoManutencao,
): RegistroManutencao[] {
  const registros: RegistroManutencao[] = [];

  // Trocas de óleo → oleo_motor
  const oleos = [...historico.trocasOleo].sort((a, b) => a.km - b.km);
  oleos.forEach((r, i) => {
    registros.push({
      pecaId: 'oleo_motor',
      kmNaTroca: r.km,
      kmDesdeAnterior: i === 0 ? r.km : r.km - oleos[i - 1].km,
      preco: r.valorTotal,
    });
  });

  // Trocas de pneu → pneu_dianteiro / pneu_traseiro (por posição separado)
  const pneus = [...historico.trocasPneu].sort((a, b) => a.km - b.km);
  const ultimoKmPneu: Record<string, number> = {};
  pneus.forEach((r) => {
    const pecaId = r.posicao === 'dianteiro' ? 'pneu_dianteiro' : 'pneu_traseiro';
    const anterior = ultimoKmPneu[pecaId] ?? 0;
    registros.push({
      pecaId,
      kmNaTroca: r.km,
      kmDesdeAnterior: anterior === 0 ? r.km : r.km - anterior,
      preco: r.valorTotal,
    });
    ultimoKmPneu[pecaId] = r.km;
  });

  // Trocas de kit relação → kit_relacao
  const kits = [...historico.trocasKitRelacao].sort((a, b) => a.km - b.km);
  kits.forEach((r, i) => {
    registros.push({
      pecaId: 'kit_relacao',
      kmNaTroca: r.km,
      kmDesdeAnterior: i === 0 ? r.km : r.km - kits[i - 1].km,
      preco: r.valorTotal,
    });
  });

  return registros;
}

// ─── Mapeamento categoriasAtivas → FiltrosCategorias ────────────

export function categoriasParaFiltros(cat: CategoriaDisplay): FiltrosCategorias {
  return {
    documentos: cat.documentacao,
    revisao: cat.manutencao, // revisao é sub-item de manutencao
    manutencao: cat.manutencao,
    manutencaoPorPeca: {},
    combustivel: cat.combustivel,
    internet: cat.internet,
    seguro: cat.seguro,
    alimentacao: cat.alimentacao,
    financiamento: cat.financiamento,
    gastosCustom: cat.financiamento, // gastosCustom não tem toggle separado
  };
}

// ─── Orquestrador principal ──────────────────────────────────────

export function calcularResultado(
  perfil: PerfilUsuario,
  preset: PresetMoto,
  dadosRJ: DadosRJ,
  modoExibicao: ModoExibicao,
): ResultadoCalculo {
  const registrosManutencao = adaptarHistoricoParaRegistros(perfil.historicoManutencao);

  const kmDia = resolverKmDia(perfil.trabalho.kmPorDia, perfil.diarioTrabalho, modoExibicao);
  const diasSemana = perfil.trabalho.diasPorSemana;
  const kmAnual = calcularKmAnual(kmDia, diasSemana);
  const diasAno = calcularDiasAno(diasSemana);

  const custos = calcularCustosPorCategoria(
    perfil,
    preset,
    dadosRJ,
    registrosManutencao,
    modoExibicao,
  );

  const filtrosAtivos = categoriasParaFiltros(perfil.configuracaoDisplay.categoriasAtivas);

  const total = calcularTotalFiltrado(custos, filtrosAtivos);
  const totalMoto = calcularCustoMotoAnual(total, custos.alimentacao.total);

  return {
    custos,
    granularidades: calcularGranularidades(total, diasAno, kmAnual),
    granularidadesMoto: calcularGranularidades(totalMoto, diasAno, kmAnual),
    kmAnual,
    diasAno,
    modoAtivo: modoExibicao,
  };
}
