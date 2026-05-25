import type {
  PerfilUsuario,
  PerfilUso,
  PerfilPecas,
  ModoRevisao,
  PecaOverride,
  GastoCustom,
  ResponsabilidadeCusto,
  CategoriaDisplay,
  ServicoIndependente,
  KmUltimaTrocas,
  FiltrosManutencaoDisplay,
} from '../types/perfil';
import type {
  PresetMoto,
  DadosRJ,
  GranularidadesCusto,
  CustoPeca,
  CustoServicoRevisao,
  CustoImprevistoSugerido,
  CustosPorCategoria,
  FiltrosCategorias,
  ResultadoCalculo,
} from '../types/calculos';

// ─── I. Rodagem ──────────────────────────────────────────────────

export function resolverKmDia(kmPorDia: number): number {
  return kmPorDia;
}

// Canônico: nunca derivar de kmMensal × 12
export function calcularKmAnual(kmDia: number, diasSemana: number): number {
  return kmDia * diasSemana * 52;
}

// Dias trabalhados no ano — não usar 365
export function calcularDiasAno(diasSemana: number): number {
  return diasSemana * 52;
}

// ─── II. Consumo de Combustível ──────────────────────────────────

export function resolverConsumoEfetivo(preset: PresetMoto, usaBau: boolean): number {
  return usaBau ? preset.consumoKmLComBau : preset.consumoKmL;
}

export function calcularCpkCombustivel(precoGasolina: number, consumoKmL: number): number {
  return precoGasolina / consumoKmL;
}

// ─── III. CPK por Peça ────────────────────────────────────────────

export function resolverIntervaloPeca(
  pecaId: string,
  preset: PresetMoto,
  tipoUso: PerfilUso,
  pecasOverrides: PecaOverride[] = [],
  servicosIndependentes: ServicoIndependente[] = [],
): number {
  const override = pecasOverrides.find((o) => o.id === pecaId);
  if (override?.intervaloKmEditado != null) {
    return override.intervaloKmEditado;
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
  pecasOverrides: PecaOverride[] = [],
): number {
  const override = pecasOverrides.find((o) => o.id === pecaId);
  const precoEditadoEfetivo =
    perfilPecas === 'original' ? override?.precoEditadoOriginal : override?.precoEditadaParalela;
  if (precoEditadoEfetivo != null) {
    return precoEditadoEfetivo;
  }

  const peca = preset.pecas.find((p) => p.id === pecaId);
  if (peca) {
    return perfilPecas === 'original' ? peca.precoOriginal : peca.precoParalela;
  }

  const pneu = preset.pneus.find((p) => p.id === pecaId);
  if (pneu) {
    return perfilPecas === 'original' ? pneu.precoOriginal : pneu.precoParalela;
  }

  return 0;
}

// Liga o id de Peça/Pneu do Preset à chave correspondente em KmUltimaTrocas.
// Peças sem entrada (vela, filtro, sapata) não têm km de última troca registrável.
const MAPA_PECA_PARA_KM_ULTIMA_TROCA: Record<string, keyof KmUltimaTrocas> = {
  oleo_motor: 'oleo',
  pneu_dianteiro: 'pneuDianteiro',
  pneu_traseiro: 'pneuTraseiro',
  kit_relacao: 'kitRelacao',
};

// Liga o id de Peça/Pneu do Preset ao id do ServicoIndependente que cobre
// a mão de obra de troca. Usado também por calcularCpkPorPeca para evitar
// dupla contagem no modo autorizado (ADR-007): se o serviço associado tem
// precoTotalAutorizada > 0 e está ativo, a peça é pulada — o serviço cobre
// peça + M.O. juntos no orçamento Honda.
export const MAPA_PECA_PARA_SERVICO: Record<string, string> = {
  oleo_motor: 'troca-oleo',
  vela_ignicao: 'troca-vela',
  filtro_ar: 'troca-filtro-ar',
  kit_relacao: 'troca-kit-transmissao',
  pneu_dianteiro: 'troca-pneu-dianteiro',
  pneu_traseiro: 'troca-pneu-traseiro',
  sapata_freio_dianteiro: 'troca-sapata-dianteira',
  sapata_freio_traseiro: 'troca-sapata-traseira',
};

const KM_ULTIMA_TROCAS_VAZIO: KmUltimaTrocas = {
  oleo: 0,
  pneuDianteiro: 0,
  pneuTraseiro: 0,
  kitRelacao: 0,
};

/**
 * Calcula o ciclo de troca de uma peça para os próximos 12 meses.
 * Com `kmUltimaTroca > 0`, ancora o ciclo no km informado pelo usuário:
 * `proximaTrocaKm` é o primeiro evento após `kmAtual` e `trocasNoAno` conta
 * os eventos na janela `(kmAtual, kmAtual + kmAnual]`.
 * Com `kmUltimaTroca <= 0` (não informado), usa o fallback amortizado.
 */
export function calcularCicloPeca(
  kmUltimaTroca: number,
  intervalo: number,
  kmAtual: number,
  kmAnual: number,
): { proximaTrocaKm: number; trocasNoAno: number } {
  if (intervalo <= 0) {
    return { proximaTrocaKm: 0, trocasNoAno: 0 };
  }

  if (kmUltimaTroca <= 0) {
    // Sem dado de última troca: ciclo amortizado, próxima troca ancorada no km atual.
    const proximaTrocaKm = kmAtual > 0 ? Math.ceil(kmAtual / intervalo) * intervalo : intervalo;
    return { proximaTrocaKm, trocasNoAno: kmAnual / intervalo };
  }

  // Eventos de troca ocorrem em kmUltimaTroca + n × intervalo (n = 1, 2, ...).
  const eventosPassados = Math.max(0, Math.floor((kmAtual - kmUltimaTroca) / intervalo));
  const proximaTrocaKm = kmUltimaTroca + (eventosPassados + 1) * intervalo;

  const fimDaJanela = kmAtual + kmAnual;
  const trocasNoAno =
    proximaTrocaKm > fimDaJanela ? 0 : Math.floor((fimDaJanela - proximaTrocaKm) / intervalo) + 1;

  return { proximaTrocaKm, trocasNoAno };
}

export interface OpcoesCpkPorPeca {
  preset: PresetMoto;
  tipoUso: PerfilUso;
  perfilPecas: PerfilPecas;
  modoRevisao: ModoRevisao;
  kmAtual: number;
  kmAnual: number;
  kmUltimaTrocas?: KmUltimaTrocas;
  pecasOverrides?: PecaOverride[];
  servicosIndependentes?: ServicoIndependente[];
}

export function calcularCpkPorPeca(opcoes: OpcoesCpkPorPeca): Map<string, CustoPeca> {
  const {
    preset,
    tipoUso,
    perfilPecas,
    modoRevisao,
    kmAtual,
    kmAnual,
    kmUltimaTrocas = KM_ULTIMA_TROCAS_VAZIO,
    pecasOverrides = [],
    servicosIndependentes = [],
  } = opcoes;

  const resultado = new Map<string, CustoPeca>();

  // No modo autorizado, pula peças por dois critérios (ADR-006 + ADR-007):
  //  (a) `incluidoNaRevisaoAutorizada` do Preset = peça já vem no pacote Honda;
  //  (b) peça associada a um ServicoIndependente com `precoTotalAutorizada > 0`
  //      e ativo — o serviço cobre peça + M.O. juntos (modelo Honda) e somar a
  //      peça aqui duplica o custo.
  const ehPecaCobertaPorServicoAutorizada = (pecaId: string): boolean => {
    if (modoRevisao !== 'autorizadas') return false;
    const servicoId = MAPA_PECA_PARA_SERVICO[pecaId];
    if (!servicoId) return false;
    const servico = servicosIndependentes.find((s) => s.id === servicoId);
    return !!servico && servico.ativo && servico.precoTotalAutorizada > 0;
  };
  const pecasConsideradas =
    modoRevisao === 'autorizadas'
      ? preset.pecas.filter(
          (p) => !p.incluidoNaRevisaoAutorizada && !ehPecaCobertaPorServicoAutorizada(p.id),
        )
      : preset.pecas;
  const pneusConsiderados =
    modoRevisao === 'autorizadas'
      ? preset.pneus.filter((p) => !ehPecaCobertaPorServicoAutorizada(p.id))
      : preset.pneus;

  const todasPecas: Array<{ id: string; label: string }> = [
    ...pecasConsideradas.map((p) => ({ id: p.id, label: p.nome })),
    ...pneusConsiderados.map((p) => ({
      id: p.id,
      label: p.posicao === 'dianteiro' ? 'Pneu dianteiro' : 'Pneu traseiro',
    })),
  ];

  for (const { id, label } of todasPecas) {
    const intervalo = resolverIntervaloPeca(
      id,
      preset,
      tipoUso,
      pecasOverrides,
      servicosIndependentes,
    );
    const preco = resolverPrecoPeca(id, preset, perfilPecas, pecasOverrides);

    // km da última troca informado pelo usuário (0 = não informado → ciclo amortizado)
    const chaveKmUltimaTroca = MAPA_PECA_PARA_KM_ULTIMA_TROCA[id];
    const kmUltimaTroca = chaveKmUltimaTroca ? kmUltimaTrocas[chaveKmUltimaTroca] : 0;

    const { proximaTrocaKm, trocasNoAno } = calcularCicloPeca(
      kmUltimaTroca,
      intervalo,
      kmAtual,
      kmAnual,
    );
    const custoAnual = trocasNoAno * preco;
    const cpk = kmAnual > 0 ? custoAnual / kmAnual : 0;

    const override = pecasOverrides.find((o) => o.id === id);
    const usouOverride =
      override?.intervaloKmEditado != null ||
      override?.precoEditadoOriginal != null ||
      override?.precoEditadaParalela != null;
    const fonte: 'preset' | 'registro' = usouOverride ? 'registro' : 'preset';

    resultado.set(id, {
      pecaId: id,
      label,
      cpk,
      custoAnual,
      intervaloKm: intervalo,
      preco,
      fonte,
      proximaTrocaKm,
      trocasNoAno,
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

const KM_CICLO_REVISAO_HONDA = 36000;
const INTERVALO_REVISAO_INDEPENDENTE_KM = 6000;

function calcularEventosRevisaoNoAno(
  modoRevisao: ModoRevisao,
  kmAnual: number,
  quantidadeRevisoesCicloHonda: number,
): number {
  if (kmAnual <= 0) return 0;
  const eventos =
    modoRevisao === 'autorizadas'
      ? (quantidadeRevisoesCicloHonda / KM_CICLO_REVISAO_HONDA) * kmAnual
      : kmAnual / INTERVALO_REVISAO_INDEPENDENTE_KM;
  return eventos;
}

export function calcularDetalhesRevisaoAnual(
  modoRevisao: ModoRevisao,
  kmAnual: number,
  opcoes: {
    custoCicloCompleto?: number;
    quantidadeRevisoesCicloHonda?: number;
    servicosIndependentes?: ServicoIndependente[];
  } = {},
): CustosPorCategoria['revisao'] {
  const servicos = opcoes.servicosIndependentes ?? [];
  const servicosNormaisAtivos = servicos.filter((s) => s.ativo && !s.ehExcepcional);

  if (modoRevisao === 'autorizadas') {
    const ciclo = opcoes.custoCicloCompleto ?? 3334.62;
    const quantidadeRevisoesCicloHonda = opcoes.quantidadeRevisoesCicloHonda ?? 7;
    const basePacoteHonda = (ciclo / KM_CICLO_REVISAO_HONDA) * kmAnual;
    // ADR-007: soma serviços fora do pacote Honda (kit transmissão, pneus, etc.)
    // usando precoTotalAutorizada (peça + M.O. cobradas em conjunto pela Honda).
    // Excepcionais (retíficas) ficam fora aqui — saem por imprevistos sugeridos.
    const servicosForaDoPacote = servicosNormaisAtivos.filter(
      (s) => !s.incluidoNaRevisaoAutorizada && s.precoTotalAutorizada > 0 && s.intervalKm > 0,
    );
    const detalhesServicos = new Map<string, CustoServicoRevisao>(
      servicosForaDoPacote.map((s): [string, CustoServicoRevisao] => {
        const custoAnual = (s.precoTotalAutorizada / s.intervalKm) * kmAnual;
        return [
          s.id,
          {
            servicoId: s.id,
            label: s.nome,
            custoAnual,
            intervalKm: s.intervalKm,
            precoMaoDeObra: s.precoTotalAutorizada,
            eventosNoAno: kmAnual > 0 ? kmAnual / s.intervalKm : 0,
            ehExcepcional: s.ehExcepcional,
          },
        ];
      }),
    );
    const totalServicosForaDoPacote = [...detalhesServicos.values()].reduce(
      (sum, s) => sum + s.custoAnual,
      0,
    );
    const base = basePacoteHonda;
    return {
      total: base + totalServicosForaDoPacote,
      detalhes: {
        modo: modoRevisao,
        base,
        eventosNoAno: calcularEventosRevisaoNoAno(
          modoRevisao,
          kmAnual,
          quantidadeRevisoesCicloHonda,
        ),
        servicos: detalhesServicos,
      },
    };
  }

  const base = servicosNormaisAtivos.reduce(
    (sum, s) => sum + (s.precoMaoDeObraIndependente / s.intervalKm) * kmAnual,
    0,
  );
  return {
    total: base,
    detalhes: {
      modo: modoRevisao,
      base,
      eventosNoAno: calcularEventosRevisaoNoAno(modoRevisao, kmAnual, 0),
      servicos: new Map(),
    },
  };
}

export function calcularCustoRevisaoAnual(
  modoRevisao: ModoRevisao,
  kmAnual: number,
  opcoes: {
    custoCicloCompleto?: number;
    servicosIndependentes?: ServicoIndependente[];
  } = {},
): number {
  return calcularDetalhesRevisaoAnual(modoRevisao, kmAnual, opcoes).total;
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

export function calcularCustoSeguroAnual(valorAnual: number): number {
  return valorAnual > 0 ? valorAnual : 0;
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
  return gastosCustom.filter((g) => g.ativo).reduce((soma, g) => soma + g.valorAnual, 0);
}

function calcularImprevistosSugeridosAnual(
  servicosIndependentes: ServicoIndependente[],
  kmAnual: number,
  modoRevisao: ModoRevisao,
): Map<string, CustoImprevistoSugerido> {
  // ADR-007: imprevistos sugeridos respeitam o modo. No autorizado, o preço é
  // o total Honda (peça + M.O.); valor 0 indica que a Honda não executa o
  // serviço (caso das retíficas, substituídas por troca de kit cilindro) — o
  // imprevisto some do mapa nesse modo.
  return new Map<string, CustoImprevistoSugerido>(
    servicosIndependentes
      .filter((servico) => servico.ehExcepcional && servico.intervalKm > 0)
      .map((servico): [string, CustoImprevistoSugerido] | null => {
        const preco =
          modoRevisao === 'autorizadas'
            ? servico.precoTotalAutorizada
            : servico.precoMaoDeObraIndependente;
        if (modoRevisao === 'autorizadas' && preco <= 0) return null;
        return [
          servico.id,
          {
            id: servico.id,
            label: servico.nome,
            custoAnual: (preco / servico.intervalKm) * kmAnual,
            intervalKm: servico.intervalKm,
            precoServico: preco,
            eventosNoAno: kmAnual / servico.intervalKm,
          },
        ];
      })
      .filter((entry): entry is [string, CustoImprevistoSugerido] => entry !== null),
  );
}

function calcularTotalImprevistosFiltrado(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias,
): number {
  // Categoria Imprevistos (filtros.gastosCustom) é o gate único: se off, ambos
  // gastos custom e sugeridos zeram independente dos toggles individuais.
  if (!filtros.gastosCustom) return 0;
  const totalSugeridos = [...custos.gastosCustom.detalhes.sugeridos.entries()].reduce(
    (soma, [id, imprevisto]) =>
      filtros.imprevistosSugeridos[id] === true ? soma + imprevisto.custoAnual : soma,
    0,
  );
  return custos.gastosCustom.total + totalSugeridos;
}

// ─── VII. Agregação e Granularidades ─────────────────────────────

export function calcularCustosPorCategoria(
  perfil: PerfilUsuario,
  preset: PresetMoto,
  dadosRJ: DadosRJ,
): CustosPorCategoria {
  const anoAtual = new Date().getFullYear();

  const kmDia = resolverKmDia(perfil.trabalho.kmPorDia);
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
  const revisao = calcularDetalhesRevisaoAnual(perfil.perfilManutencao.modoRevisao, kmAnual, {
    custoCicloCompleto,
    quantidadeRevisoesCicloHonda: preset.revisaoAutorizada.length,
    servicosIndependentes: perfil.servicosIndependentes,
  });

  // Manutenção por peça
  const detalhePecas = calcularCpkPorPeca({
    preset,
    tipoUso: perfil.moto.perfilUso,
    perfilPecas: perfil.perfilManutencao.perfilPecasGlobal,
    modoRevisao: perfil.perfilManutencao.modoRevisao,
    kmAtual: perfil.moto.kmAtual,
    kmAnual,
    kmUltimaTrocas: perfil.moto.kmUltimaTrocas,
    pecasOverrides: perfil.pecasOverrides,
    servicosIndependentes: perfil.servicosIndependentes,
  });
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
  const imprevistosSugeridos = new Map<string, CustoImprevistoSugerido>(
    [
      ...calcularImprevistosSugeridosAnual(
        perfil.servicosIndependentes,
        kmAnual,
        perfil.perfilManutencao.modoRevisao,
      ).entries(),
    ].map(([id, imprevisto]): [string, CustoImprevistoSugerido] => [
      id,
      { ...imprevisto, custoAnual: imprevisto.custoAnual * fatorMan },
    ]),
  );

  return {
    documentos: {
      total: calcularCustoDocumentosAnual(ipva, licenciamento) * fatorDoc,
      detalhes: { ipva: ipva * fatorDoc, licenciamento: licenciamento * fatorDoc },
    },
    revisao: {
      total: revisao.total * fatorMan,
      detalhes: {
        ...revisao.detalhes,
        base: revisao.detalhes.base * fatorMan,
        servicos: new Map(
          [...revisao.detalhes.servicos.entries()].map(([id, servico]) => [
            id,
            { ...servico, custoAnual: servico.custoAnual * fatorMan },
          ]),
        ),
      },
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
      total: calcularCustoSeguroAnual(seguro.valorAnual) * fatorSeg,
      ativo: seguro.valorAnual > 0,
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
      detalhes: { sugeridos: imprevistosSugeridos },
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
  total += calcularTotalImprevistosFiltrado(custos, filtros);

  if (filtros.manutencao) {
    if (filtros.revisao) {
      total += custos.revisao.detalhes.base;
    }
    custos.revisao.detalhes.servicos.forEach((detalhe, servicoId) => {
      if (filtros.revisaoPorServico[servicoId] !== false) {
        total += detalhe.custoAnual;
      }
    });
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
  const totalRevisaoFiltrado = filtros.manutencao
    ? (filtros.revisao ? custos.revisao.detalhes.base : 0) +
      [...custos.revisao.detalhes.servicos.entries()].reduce(
        (soma, [id, servico]) =>
          filtros.revisaoPorServico[id] !== false ? soma + servico.custoAnual : soma,
        0,
      )
    : 0;
  const totalManutencaoFiltrado = filtros.manutencao
    ? [...custos.manutencao.detalhes.entries()].reduce(
        (soma, [id, peca]) =>
          filtros.manutencaoPorPeca[id] !== false ? soma + peca.custoAnual : soma,
        0,
      )
    : 0;
  return {
    documentos: filtros.documentos ? pct(custos.documentos.total) : 0,
    revisao: pct(totalRevisaoFiltrado),
    manutencao: pct(totalManutencaoFiltrado),
    combustivel: filtros.combustivel ? pct(custos.combustivel.total) : 0,
    internet: filtros.internet ? pct(custos.internet.total) : 0,
    seguro: filtros.seguro ? pct(custos.seguro.total) : 0,
    alimentacao: filtros.alimentacao ? pct(custos.alimentacao.total) : 0,
    financiamento: filtros.financiamento ? pct(custos.financiamento.total) : 0,
    gastosCustom: pct(calcularTotalImprevistosFiltrado(custos, filtros)),
  };
}

export function calcularCustoMotoAnual(
  custoTotalAnual: number,
  custoAlimentacaoAnual: number,
): number {
  return custoTotalAnual - custoAlimentacaoAnual;
}

// ─── Mapeamento categoriasAtivas → FiltrosCategorias ────────────

export function categoriasParaFiltros(
  cat: CategoriaDisplay,
  imprevistosSugeridosAtivos: Record<string, boolean> = {},
  filtrosManutencao: FiltrosManutencaoDisplay = {
    revisao: true,
    manutencaoPorPeca: {},
    revisaoPorServico: {},
  },
): FiltrosCategorias {
  return {
    documentos: cat.documentacao,
    revisao: filtrosManutencao.revisao,
    manutencao: cat.manutencao,
    manutencaoPorPeca: filtrosManutencao.manutencaoPorPeca,
    revisaoPorServico: filtrosManutencao.revisaoPorServico,
    // Categoria Imprevistos respeita o toggle persistido. Dentro dela, cada
    // sugerido (retífica) e cada gasto custom (Multa/Sinistros/Outros) ainda
    // precisa estar ativo individualmente — categoria off zera tudo.
    imprevistosSugeridos: cat.imprevistos ? imprevistosSugeridosAtivos : {},
    combustivel: cat.combustivel,
    internet: cat.internet,
    seguro: cat.seguro,
    alimentacao: cat.alimentacao,
    financiamento: cat.financiamento,
    gastosCustom: cat.imprevistos,
  };
}

// ─── Orquestrador principal ──────────────────────────────────────

export function calcularResultado(
  perfil: PerfilUsuario,
  preset: PresetMoto,
  dadosRJ: DadosRJ,
): ResultadoCalculo {
  const kmDia = resolverKmDia(perfil.trabalho.kmPorDia);
  const diasSemana = perfil.trabalho.diasPorSemana;
  const kmAnual = calcularKmAnual(kmDia, diasSemana);
  const diasAno = calcularDiasAno(diasSemana);

  const custos = calcularCustosPorCategoria(perfil, preset, dadosRJ);

  const filtrosAtivos = categoriasParaFiltros(
    perfil.configuracaoDisplay.categoriasAtivas,
    perfil.configuracaoDisplay.imprevistosSugeridosAtivos,
    perfil.configuracaoDisplay.filtrosManutencao,
  );

  const total = calcularTotalFiltrado(custos, filtrosAtivos);
  const totalMoto = calcularCustoMotoAnual(total, custos.alimentacao.total);

  return {
    custos,
    granularidades: calcularGranularidades(total, diasAno, kmAnual),
    granularidadesMoto: calcularGranularidades(totalMoto, diasAno, kmAnual),
    kmAnual,
    diasAno,
  };
}
