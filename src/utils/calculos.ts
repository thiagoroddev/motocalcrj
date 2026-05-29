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
  Periodo,
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
    // Peças com driver temporal (ex.: bateria) podem omitir intervalo em km.
    // Caller (calcularCpkPorPeca) trata 0 como sinal para usar intervaloMeses.
    const intervaloPorTipo = tipoUso === 'entrega' ? peca.intervaloKmEntrega : peca.intervaloKm;
    return intervaloPorTipo ?? 0;
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
const MAPA_PECA_PARA_KM_ULTIMA_TROCA: Record<string, keyof KmUltimaTrocas> = {
  oleo_motor: 'oleo',
  vela_ignicao: 'velaIgnicao',
  filtro_ar: 'filtroAr',
  pneu_dianteiro: 'pneuDianteiro',
  pneu_traseiro: 'pneuTraseiro',
  kit_relacao: 'kitRelacao',
  sapata_freio_dianteiro: 'sapataFreioDianteiro',
  sapata_freio_traseiro: 'sapataFreioTraseiro',
  bateria: 'bateria',
  kit_embreagem: 'kitEmbreagem',
  kit_cilindro: 'kitCilindro',
};

const MAPA_SERVICO_PARA_KM_ULTIMA_TROCA: Record<string, keyof KmUltimaTrocas> = {
  'retifica-cabecote': 'retificaCabecote',
  'retifica-completa': 'retificaCompleta',
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
  bateria: 'troca-bateria',
  kit_embreagem: 'troca-kit-embreagem',
  kit_cilindro: 'troca-kit-cilindro',
};

function resolverChaveKmUltimaTrocaServico(servicoId: string): keyof KmUltimaTrocas | undefined {
  const chaveServico = MAPA_SERVICO_PARA_KM_ULTIMA_TROCA[servicoId];
  if (chaveServico) return chaveServico;

  const pecaAssociada = Object.entries(MAPA_PECA_PARA_SERVICO).find(
    ([, idServico]) => idServico === servicoId,
  )?.[0];
  return pecaAssociada ? MAPA_PECA_PARA_KM_ULTIMA_TROCA[pecaAssociada] : undefined;
}

const KM_ULTIMA_TROCAS_VAZIO: KmUltimaTrocas = {
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

export function calcularKmDasProximasTrocas(
  kmUltimaTroca: number,
  intervalo: number,
  kmAtual: number,
  kmAnual: number,
): number[] {
  if (kmUltimaTroca <= 0 || intervalo <= 0) {
    return [];
  }

  const { proximaTrocaKm, trocasNoAno } = calcularCicloPeca(
    kmUltimaTroca,
    intervalo,
    kmAtual,
    kmAnual,
  );
  const quantidadeTrocas = Math.max(0, Math.floor(trocasNoAno));

  return Array.from({ length: quantidadeTrocas }, (_, index) => proximaTrocaKm + index * intervalo);
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

    const pecaPreset = preset.pecas.find((p) => p.id === id);
    const intervaloMeses = pecaPreset?.intervaloMeses ?? 0;

    let proximaTrocaKm: number;
    let trocasNoAno: number;
    let modo: CustoPeca['modo'];
    let kmUltimaTroca = 0;
    let kmDasProximasTrocas: number[] = [];

    if (intervalo <= 0 && intervaloMeses > 0) {
      // Peça com driver temporal (ex.: bateria): trocas/ano derivam do tempo,
      // não do km. Sem `proximaTrocaKm` previsível em km.
      proximaTrocaKm = 0;
      trocasNoAno = 12 / intervaloMeses;
      modo = 'amortizado';
    } else {
      // km da última troca informado pelo usuário (0 = não informado → ciclo amortizado)
      const chaveKmUltimaTroca = MAPA_PECA_PARA_KM_ULTIMA_TROCA[id];
      kmUltimaTroca = chaveKmUltimaTroca ? kmUltimaTrocas[chaveKmUltimaTroca] : 0;

      const ciclo = calcularCicloPeca(kmUltimaTroca, intervalo, kmAtual, kmAnual);
      proximaTrocaKm = ciclo.proximaTrocaKm;
      trocasNoAno = ciclo.trocasNoAno;
      modo = kmUltimaTroca > 0 && !!chaveKmUltimaTroca ? 'ancorado' : 'amortizado';
      kmDasProximasTrocas =
        modo === 'ancorado'
          ? calcularKmDasProximasTrocas(kmUltimaTroca, intervalo, kmAtual, kmAnual)
          : [];
    }

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
      intervaloMeses: intervaloMeses > 0 ? intervaloMeses : undefined,
      preco,
      fonte,
      proximaTrocaKm,
      modo,
      kmUltimaTroca,
      kmDasProximasTrocas,
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
    kmAtual?: number;
    kmUltimaTrocas?: KmUltimaTrocas;
  } = {},
): CustosPorCategoria['revisao'] {
  const servicos = opcoes.servicosIndependentes ?? [];
  const servicosNormaisAtivos = servicos.filter((s) => s.ativo && !s.ehExcepcional);
  const kmAtual = opcoes.kmAtual ?? 0;
  const kmUltimaTrocas = opcoes.kmUltimaTrocas ?? KM_ULTIMA_TROCAS_VAZIO;

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
        const chaveKmUltimaTroca = resolverChaveKmUltimaTrocaServico(s.id);
        const kmUltimaTroca = chaveKmUltimaTroca ? kmUltimaTrocas[chaveKmUltimaTroca] : 0;
        const ciclo = calcularCicloPeca(kmUltimaTroca, s.intervalKm, kmAtual, kmAnual);
        const modo =
          kmUltimaTroca > 0 && chaveKmUltimaTroca !== undefined ? 'ancorado' : 'amortizado';
        const kmDasProximasTrocas =
          modo === 'ancorado'
            ? calcularKmDasProximasTrocas(kmUltimaTroca, s.intervalKm, kmAtual, kmAnual)
            : [];
        const custoAnual = s.precoTotalAutorizada * ciclo.trocasNoAno;
        return [
          s.id,
          {
            servicoId: s.id,
            label: s.nome,
            custoAnual,
            intervalKm: s.intervalKm,
            precoMaoDeObra: s.precoTotalAutorizada,
            precoServico: s.precoTotalAutorizada,
            eventosNoAno: ciclo.trocasNoAno,
            ehExcepcional: s.ehExcepcional,
            modo,
            kmUltimaTroca,
            kmDasProximasTrocas,
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

  // Serviços com intervalKm <= 0 (ex.: troca-bateria, driver temporal puro)
  // ficam fora do cálculo de revisão — o custo da peça já entra via
  // `calcularCpkPorPeca` no caminho de manutenção. M.O. dessas trocas
  // (~R$ 25/ano para bateria) é débito técnico assumido pela TASK-RF-6.14.
  const base = servicosNormaisAtivos
    .filter((s) => s.intervalKm > 0)
    .reduce((sum, s) => sum + (s.precoMaoDeObraIndependente / s.intervalKm) * kmAnual, 0);
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
  kmAtual: number,
  kmUltimaTrocas: KmUltimaTrocas,
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

        const chaveKmUltimaTroca = MAPA_SERVICO_PARA_KM_ULTIMA_TROCA[servico.id];
        const kmUltimaTroca = chaveKmUltimaTroca ? kmUltimaTrocas[chaveKmUltimaTroca] : 0;
        const ciclo = calcularCicloPeca(kmUltimaTroca, servico.intervalKm, kmAtual, kmAnual);

        return [
          servico.id,
          {
            id: servico.id,
            label: servico.nome,
            custoAnual: preco * ciclo.trocasNoAno,
            intervalKm: servico.intervalKm,
            precoServico: preco,
            eventosNoAno: ciclo.trocasNoAno,
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
    kmAtual: perfil.moto.kmAtual,
    kmUltimaTrocas: perfil.moto.kmUltimaTrocas,
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
        perfil.moto.kmAtual,
        perfil.moto.kmUltimaTrocas,
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

// Valor anual em R$ por categoria, respeitando os filtros ativos. É a fonte
// única dos numeradores: a versão percentual (abaixo) deriva daqui.
export function calcularBreakdownValores(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias,
): Record<string, number> {
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
    documentos: filtros.documentos ? custos.documentos.total : 0,
    revisao: totalRevisaoFiltrado,
    manutencao: totalManutencaoFiltrado,
    combustivel: filtros.combustivel ? custos.combustivel.total : 0,
    internet: filtros.internet ? custos.internet.total : 0,
    seguro: filtros.seguro ? custos.seguro.total : 0,
    alimentacao: filtros.alimentacao ? custos.alimentacao.total : 0,
    financiamento: filtros.financiamento ? custos.financiamento.total : 0,
    gastosCustom: calcularTotalImprevistosFiltrado(custos, filtros),
  };
}

export function calcularBreakdownPercentual(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias,
): Record<string, number> {
  const valores = calcularBreakdownValores(custos, filtros);
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
  return Object.fromEntries(
    Object.entries(valores).map(([categoria, valor]) => [categoria, (valor / total) * 100]),
  );
}

// Rateia um custo anual para a janela de tempo escolhida no seletor de período.
export function converterAnualParaPeriodo(
  anual: number,
  periodo: Periodo,
  diasAno: number,
  horasDia: number,
): number {
  const divisor: Record<Periodo, number> = {
    ano: 1,
    mes: 12,
    sem: 52,
    dia: diasAno,
    hora: diasAno * horasDia,
  };
  const d = divisor[periodo];
  return d > 0 ? anual / d : 0;
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
