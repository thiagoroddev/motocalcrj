import type {
  PerfilUsuario,
  PerfilPecas,
  ModoRevisao,
  PecaOverride,
  GastoCustom,
  ResponsabilidadeCusto,
  CategoriaDisplay,
  ServicoIndependente,
  KmUltimaTrocas,
  FiltrosManutencaoDisplay,
  BateriaConfig,
} from '../types/perfil';
import type {
  PresetMoto,
  DadosRJ,
  GranularidadesCusto,
  CustoPeca,
  CustoServicoRevisao,
  PendenciaMaoDeObraConcessionaria,
  CustosPorCategoria,
  FiltrosCategorias,
  ResultadoCalculo,
  Periodo,
} from '../types/calculos';
import {
  resolverStatusPrecoAutorizada,
  temPrecoAutorizadaInformado,
} from './statusPrecoAutorizada';
import { estimarMaoDeObra } from './maoDeObraEstimada';
import { resolverServicosManutencaoPerfil } from './servicosManutencaoPreset';

function valorNaoNegativo(valor: number): number {
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

// ─── I. Rodagem ──────────────────────────────────────────────────

export function resolverKmDia(kmPorDia: number): number {
  return valorNaoNegativo(kmPorDia);
}

// Canônico: nunca derivar de kmMensal × 12
export function calcularKmAnual(kmDia: number, diasSemana: number): number {
  return valorNaoNegativo(kmDia) * valorNaoNegativo(diasSemana) * 52;
}

// Dias trabalhados no ano - não usar 365
export function calcularDiasAno(diasSemana: number): number {
  return valorNaoNegativo(diasSemana) * 52;
}

export function calcularCpkCombustivel(precoGasolina: number, consumoKmL: number): number {
  const preco = valorNaoNegativo(precoGasolina);
  const consumo = valorNaoNegativo(consumoKmL);
  return consumo > 0 ? preco / consumo : 0;
}

// ─── III. CPK por Peça ────────────────────────────────────────────

export function resolverIntervaloPeca(
  pecaId: string,
  preset: PresetMoto,
  pecasOverrides: PecaOverride[] = [],
  servicosIndependentes: ServicoIndependente[] = [],
): number {
  const override = pecasOverrides.find((o) => o.id === pecaId);
  if (override?.intervaloKmEditado != null) {
    return valorNaoNegativo(override.intervaloKmEditado);
  }

  // A lista recebida já representa a mesclagem efetiva entre preset e perfil.
  // O serviço vinculado é a fonte canônica da vida útil, esteja ele ativo ou não:
  // `ativo` controla o custo do serviço, não o desgaste da peça.
  const servico = resolverServicoPorPeca(pecaId, servicosIndependentes);
  if (servico) {
    return valorNaoNegativo(servico.intervalKm);
  }

  const peca = preset.pecas.find((p) => p.id === pecaId);
  if (peca) {
    // Peças com driver temporal (ex.: bateria) podem omitir intervalo em km.
    // Caller (calcularCpkPorPeca) trata 0 como sinal para usar intervaloMeses.
    return peca.intervaloKm ?? 0;
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
    return valorNaoNegativo(precoEditadoEfetivo);
  }

  const peca = preset.pecas.find((p) => p.id === pecaId);
  if (peca) {
    return valorNaoNegativo(perfilPecas === 'original' ? peca.precoOriginal : peca.precoParalela);
  }

  const pneu = preset.pneus.find((p) => p.id === pecaId);
  if (pneu) {
    return valorNaoNegativo(perfilPecas === 'original' ? pneu.precoOriginal : pneu.precoParalela);
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
  disco_freio_dianteiro: 'discoFreioDianteiro',
  pastilha_freio_dianteiro: 'pastilhaFreioDianteiro',
  disco_freio_traseiro: 'discoFreioTraseiro',
  pastilha_freio_traseiro: 'pastilhaFreioTraseiro',
  // bateria saiu do card "KM - últimas trocas" (TASK-RF-8.2): tem card próprio por
  // data + vida útil em anos (RF-8.3). Driver temporal, sem âncora em km.
  kit_embreagem: 'kitEmbreagem',
  kit_cilindro: 'kitCilindro',
  caixa_direcao: 'caixaDirecao',
};

// Liga o id de Peça/Pneu do Preset ao id do ServicoIndependente que cobre
// a mão de obra de troca. Usado também por calcularCpkPorPeca para evitar
// dupla contagem no modo autorizado (ADR-007): se o serviço associado tem
// preço completo de concessionária informado e está ativo, a peça é pulada - o
// serviço cobre peça + M.O. juntos. Se o preço está `nao_informado`, a peça
// original permanece no cálculo e a pendência aparece no Detalhamento.
export const MAPA_PECA_PARA_SERVICO: Record<string, string> = {
  oleo_motor: 'troca-oleo',
  vela_ignicao: 'troca-vela',
  filtro_ar: 'troca-filtro-ar',
  kit_relacao: 'troca-kit-transmissao',
  pneu_dianteiro: 'troca-pneu-dianteiro',
  pneu_traseiro: 'troca-pneu-traseiro',
  sapata_freio_dianteiro: 'troca-sapata-dianteira',
  sapata_freio_traseiro: 'troca-sapata-traseira',
  disco_freio_dianteiro: 'troca-disco-dianteiro',
  pastilha_freio_dianteiro: 'troca-pastilha-dianteira',
  disco_freio_traseiro: 'troca-disco-traseiro',
  pastilha_freio_traseiro: 'troca-pastilha-traseira',
  bateria: 'troca-bateria',
  kit_embreagem: 'troca-kit-embreagem',
  kit_cilindro: 'troca-kit-cilindro',
  caixa_direcao: 'troca-caixa-direcao',
};

// Serviços de pneu: na Yamaha são `ehExcepcional` (a concessionária não troca pneu),
// mas TÊM peça (Insumos). Por isso são tratados como **avulso incompleto** (M.O. de
// oficina independente + peça, igual ao pneu Honda). São exibidos na aba
// "Independente". (BG-036)
export const SERVICOS_DE_PNEU = new Set(
  Object.entries(MAPA_PECA_PARA_SERVICO)
    .filter(([pecaId]) => pecaId.startsWith('pneu_'))
    .map(([, servicoId]) => servicoId),
);

export function resolverServicoPorPeca(
  pecaId: string,
  servicosIndependentes: ServicoIndependente[] = [],
): ServicoIndependente | undefined {
  const servicoId = MAPA_PECA_PARA_SERVICO[pecaId] ?? pecaId;
  return servicosIndependentes.find((servico) => servico.id === servicoId);
}

function resolverChaveKmUltimaTrocaServico(servicoId: string): keyof KmUltimaTrocas | undefined {
  const pecaAssociada = Object.entries(MAPA_PECA_PARA_SERVICO).find(
    ([, idServico]) => idServico === servicoId,
  )?.[0];
  return pecaAssociada ? MAPA_PECA_PARA_KM_ULTIMA_TROCA[pecaAssociada] : undefined;
}

/**
 * Chaves de KmUltimaTrocas que o preset realmente usa (peças + serviços do
 * modelo). Base da tela "Últimas manutenções" model-aware (RF-6.39): só aparece
 * o que o modelo possui — ex.: disco/pastilha num modelo a disco; sapata num a
 * tambor; o freio traseiro segue o tipo do modelo.
 */
export function chavesKmUltimaTrocaDoPreset(preset: {
  pecas: { id: string }[];
  pneus?: { id: string }[];
  servicosManutencao?: { id: string }[];
}): Set<keyof KmUltimaTrocas> {
  const chaves = new Set<keyof KmUltimaTrocas>();
  // Pneus moram em `preset.pneus` (não em `pecas`); sem iterá-los, pneuDianteiro/
  // pneuTraseiro nunca entram → some de "Últimas manutenções" (BG-036).
  for (const item of [...preset.pecas, ...(preset.pneus ?? [])]) {
    const chave = MAPA_PECA_PARA_KM_ULTIMA_TROCA[item.id];
    if (chave) chaves.add(chave);
  }
  return chaves;
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
  discoFreioDianteiro: 0,
  pastilhaFreioDianteiro: 0,
  discoFreioTraseiro: 0,
  pastilhaFreioTraseiro: 0,
  bateria: 0,
  kitEmbreagem: 0,
  kitCilindro: 0,
  caixaDirecao: 0,
  // Compatibilidade com perfis anteriores à ADR-022.
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
  const intervaloSeguro = valorNaoNegativo(intervalo);
  const kmAtualSeguro = valorNaoNegativo(kmAtual);
  const kmAnualSeguro = valorNaoNegativo(kmAnual);
  const kmUltimaTrocaSeguro = valorNaoNegativo(kmUltimaTroca);

  if (intervaloSeguro <= 0 || kmAnualSeguro <= 0) {
    return { proximaTrocaKm: 0, trocasNoAno: 0 };
  }

  if (kmUltimaTrocaSeguro <= 0) {
    // Sem dado de última troca: ciclo amortizado, próxima troca ancorada no km atual.
    const proximaTrocaKm =
      kmAtualSeguro > 0
        ? Math.ceil(kmAtualSeguro / intervaloSeguro) * intervaloSeguro
        : intervaloSeguro;
    return { proximaTrocaKm, trocasNoAno: kmAnualSeguro / intervaloSeguro };
  }

  // Eventos de troca ocorrem em kmUltimaTroca + n × intervalo (n = 1, 2, ...).
  const eventosPassados = Math.max(
    0,
    Math.floor((kmAtualSeguro - kmUltimaTrocaSeguro) / intervaloSeguro),
  );
  const proximaTrocaKm = kmUltimaTrocaSeguro + (eventosPassados + 1) * intervaloSeguro;

  const fimDaJanela = kmAtualSeguro + kmAnualSeguro;
  const trocasNoAno =
    proximaTrocaKm > fimDaJanela
      ? 0
      : Math.floor((fimDaJanela - proximaTrocaKm) / intervaloSeguro) + 1;

  return { proximaTrocaKm, trocasNoAno };
}

export function calcularKmDasProximasTrocas(
  kmUltimaTroca: number,
  intervalo: number,
  kmAtual: number,
  kmAnual: number,
): number[] {
  if (kmUltimaTroca <= 0 || intervalo <= 0 || kmAnual <= 0) {
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
  perfilPecas: PerfilPecas;
  modoRevisao: ModoRevisao;
  kmAtual: number;
  kmAnual: number;
  kmUltimaTrocas?: KmUltimaTrocas;
  pecasOverrides?: PecaOverride[];
  servicosIndependentes?: ServicoIndependente[];
  // Vida útil da bateria em anos (TASK-RF-8). A peça da bateria amortiza por este
  // valor (config do usuário), não pelo `intervaloMeses` do preset. Default 3.
  vidaUtilBateriaAnos?: number;
}

/**
 * Peça coberta por um serviço avulso COMPLETO (Honda): no modo autorizado, se o
 * serviço associado (`MAPA_PECA_PARA_SERVICO`) está ativo, com preço oficial
 * `informado` e inclui a peça (`concessionariaIncluiPeca !== false`), a peça já
 * está no preço completo → não conta/aparece separada (ADR-007/014). Usada pelo
 * cálculo e pela tela Insumos para manter exibição == custo. (BG-034)
 */
export function ehPecaCobertaPorServicoCompleto(
  pecaId: string,
  modoRevisao: ModoRevisao,
  servicosIndependentes: ServicoIndependente[],
): boolean {
  if (modoRevisao !== 'autorizadas') return false;
  const servicoId = MAPA_PECA_PARA_SERVICO[pecaId];
  if (!servicoId) return false;
  const servico = servicosIndependentes.find((s) => s.id === servicoId);
  return (
    !!servico &&
    servico.ativo &&
    resolverStatusPrecoAutorizada(servico) === 'informado' &&
    servico.concessionariaIncluiPeca !== false
  );
}

/**
 * Próxima troca da bateria e atraso (meses), a partir da data da última troca
 * ("AAAA-MM") e da vida útil em anos (TASK-RF-8). Sem data → janeiro do ano da
 * moto (idade estimada). Apenas para exibição no Detalhamento — NÃO altera o
 * custo, que é amortizado (valor ÷ vida útil em anos).
 */
export function proximaTrocaBateria(
  ultimaTrocaAnoMes: string | null,
  vidaUtilAnos: number,
  anoMoto: number,
  agora: Date = new Date(),
): { proximaAnoMes: string; atrasoMeses: number } {
  const [anoStr, mesStr] = (ultimaTrocaAnoMes ?? `${anoMoto}-01`).split('-');
  const ano = Number.parseInt(anoStr, 10);
  const mes = Number.parseInt(mesStr ?? '', 10);
  const anoBase = Number.isFinite(ano) ? ano : anoMoto;
  const mesBase = Number.isFinite(mes) && mes >= 1 && mes <= 12 ? mes : 1;
  const vida = Math.max(1, Math.round(vidaUtilAnos));
  const idxProxima = (anoBase + vida) * 12 + (mesBase - 1); // índice de mês (mês 0-based)
  const proximaAno = Math.floor(idxProxima / 12);
  const proximaMes = (idxProxima % 12) + 1;
  const proximaAnoMes = `${proximaAno}-${String(proximaMes).padStart(2, '0')}`;
  const idxAgora = agora.getFullYear() * 12 + agora.getMonth();
  return { proximaAnoMes, atrasoMeses: Math.max(0, idxAgora - idxProxima) };
}

export function calcularCpkPorPeca(opcoes: OpcoesCpkPorPeca): Map<string, CustoPeca> {
  const {
    preset,
    perfilPecas,
    modoRevisao,
    kmAtual,
    kmAnual,
    kmUltimaTrocas = KM_ULTIMA_TROCAS_VAZIO,
    pecasOverrides = [],
    servicosIndependentes = [],
    vidaUtilBateriaAnos = 3,
  } = opcoes;

  const resultado = new Map<string, CustoPeca>();
  const kmAtualSeguro = valorNaoNegativo(kmAtual);
  const kmAnualSeguro = valorNaoNegativo(kmAnual);

  // No modo autorizado, pula peças por dois critérios (ADR-006 + ADR-007):
  //  (a) `incluidoNaRevisaoAutorizada` do Preset = peça já vem no pacote da revisão;
  //  (b) peça coberta por um serviço avulso COMPLETO (Honda) — regra em
  //      `ehPecaCobertaPorServicoCompleto`, reusada pela tela Insumos (BG-034).
  const ehPecaCobertaPorServicoAutorizada = (pecaId: string): boolean =>
    ehPecaCobertaPorServicoCompleto(pecaId, modoRevisao, servicosIndependentes);
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
    const intervalo = resolverIntervaloPeca(id, preset, pecasOverrides, servicosIndependentes);
    const preco = resolverPrecoPeca(id, preset, perfilPecas, pecasOverrides);

    const pecaPreset = preset.pecas.find((p) => p.id === id);
    const intervaloMeses = valorNaoNegativo(pecaPreset?.intervaloMeses ?? 0);

    let proximaTrocaKm: number;
    let trocasNoAno: number;
    let modo: CustoPeca['modo'];
    let kmUltimaTroca = 0;
    let kmDasProximasTrocas: number[] = [];

    if (intervalo <= 0 && intervaloMeses > 0) {
      // Peça com driver temporal (ex.: bateria): trocas/ano derivam do tempo,
      // não do km. Sem `proximaTrocaKm` previsível em km.
      proximaTrocaKm = 0;
      // Bateria (TASK-RF-8): amortiza pela vida útil em ANOS da config do usuário,
      // não pelo `intervaloMeses` do preset (que deixou de governar a bateria).
      const vidaBateriaAnos = vidaUtilBateriaAnos > 0 ? vidaUtilBateriaAnos : 3;
      trocasNoAno = id === 'bateria' ? 1 / vidaBateriaAnos : 12 / intervaloMeses;
      modo = 'amortizado';
    } else {
      // km da última troca informado pelo usuário (0 = não informado → ciclo amortizado)
      const chaveKmUltimaTroca = MAPA_PECA_PARA_KM_ULTIMA_TROCA[id];
      kmUltimaTroca = chaveKmUltimaTroca ? valorNaoNegativo(kmUltimaTrocas[chaveKmUltimaTroca]) : 0;

      const ciclo = calcularCicloPeca(kmUltimaTroca, intervalo, kmAtualSeguro, kmAnualSeguro);
      proximaTrocaKm = ciclo.proximaTrocaKm;
      trocasNoAno = ciclo.trocasNoAno;
      modo = kmUltimaTroca > 0 && !!chaveKmUltimaTroca ? 'ancorado' : 'amortizado';
      kmDasProximasTrocas =
        modo === 'ancorado'
          ? calcularKmDasProximasTrocas(kmUltimaTroca, intervalo, kmAtualSeguro, kmAnualSeguro)
          : [];
    }

    const custoAnual = trocasNoAno * preco;
    const cpk = kmAnualSeguro > 0 ? custoAnual / kmAnualSeguro : 0;

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
  cpkPorPeca.forEach((p) => (total += valorNaoNegativo(p.cpk)));
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
  return valorNaoNegativo(valorFipe) * valorNaoNegativo(aliquota);
}

export function calcularLicenciamento(anoAtual: number, tabela: Record<string, number>): number {
  return valorNaoNegativo(tabela[String(anoAtual)] ?? 0);
}

export function calcularCustoDocumentosAnual(ipva: number, licenciamento: number): number {
  return valorNaoNegativo(ipva) + valorNaoNegativo(licenciamento);
}

// ─── V. Revisão Periódica ─────────────────────────────────────────

const KM_CICLO_REVISAO_PADRAO = 36000;
const INTERVALO_REVISAO_INDEPENDENTE_KM = 6000;

function calcularEventosRevisaoNoAno(
  modoRevisao: ModoRevisao,
  kmAnual: number,
  quantidadeRevisoesCiclo: number,
  kmCiclo: number = KM_CICLO_REVISAO_PADRAO,
): number {
  const kmAnualSeguro = valorNaoNegativo(kmAnual);
  if (kmAnualSeguro <= 0) return 0;
  const kmCicloSeguro = kmCiclo > 0 ? kmCiclo : KM_CICLO_REVISAO_PADRAO;
  const eventos =
    modoRevisao === 'autorizadas'
      ? (valorNaoNegativo(quantidadeRevisoesCiclo) / kmCicloSeguro) * kmAnualSeguro
      : kmAnualSeguro / INTERVALO_REVISAO_INDEPENDENTE_KM;
  return eventos;
}

export function calcularDetalhesRevisaoAnual(
  modoRevisao: ModoRevisao,
  kmAnual: number,
  opcoes: {
    custoCicloCompleto?: number;
    quantidadeRevisoesCiclo?: number;
    // Km do ciclo completo de revisões (maior marco do preset). ADR-016.
    // Default: KM_CICLO_REVISAO_PADRAO (fallback).
    kmCicloRevisao?: number;
    servicosIndependentes?: ServicoIndependente[];
    kmAtual?: number;
    kmUltimaTrocas?: KmUltimaTrocas;
    marca?: string;
    fatorMaoDeObra?: number;
    incluirEstimativaMaoDeObra?: boolean;
    estimativaMaoDeObraPorServico?: Record<string, boolean>;
    // Bateria por tempo (TASK-RF-8): M.O./valor completo amortizado por vida útil
    // em anos (config do usuário). Sem isto, a M.O. da bateria fica de fora.
    bateria?: BateriaConfig;
  } = {},
): CustosPorCategoria['revisao'] {
  const servicos = opcoes.servicosIndependentes ?? [];
  // Pneu excepcional entra no fluxo avulso: M.O. de oficina + peça em Insumos.
  const servicosNormaisAtivos = servicos.filter(
    (s) => s.ativo && (!s.ehExcepcional || SERVICOS_DE_PNEU.has(s.id)),
  );
  const kmAtual = valorNaoNegativo(opcoes.kmAtual ?? 0);
  const kmAnualSeguro = valorNaoNegativo(kmAnual);
  const kmUltimaTrocas = opcoes.kmUltimaTrocas ?? KM_ULTIMA_TROCAS_VAZIO;

  if (modoRevisao === 'autorizadas') {
    const ciclo = valorNaoNegativo(opcoes.custoCicloCompleto ?? 3334.62);
    const quantidadeRevisoesCiclo = opcoes.quantidadeRevisoesCiclo ?? 7;
    // Ciclo por preset (ADR-016). Fallback neutro de 36.000 km.
    const kmCiclo =
      opcoes.kmCicloRevisao && opcoes.kmCicloRevisao > 0
        ? opcoes.kmCicloRevisao
        : KM_CICLO_REVISAO_PADRAO;
    const basePacoteConcessionaria = (ciclo / kmCiclo) * kmAnualSeguro;
    // ADR-007/012: soma serviços fora do pacote fixo apenas quando o preço
    // completo da concessionária foi informado. Se falta M.O., a peça original
    // continua no cálculo por peça e a pendência é exposta ao Detalhamento.
    // Serviços excepcionais que não são pneus ficam fora do fluxo do MVP.
    const marca = opcoes.marca;
    const fatorMaoDeObra = opcoes.fatorMaoDeObra ?? 1;
    const incluirEstimativa = opcoes.incluirEstimativaMaoDeObra ?? false;
    const estimativaPorServico = opcoes.estimativaMaoDeObraPorServico ?? {};

    const servicosAvulsosKm = servicosNormaisAtivos.filter(
      (s) => !s.incluidoNaRevisaoAutorizada && s.intervalKm > 0,
    );
    // informado / informado_usuario: soma peça + M.O. real; a peça é pulada do CPK.
    const servicosInformados = servicosAvulsosKm.filter(temPrecoAutorizadaInformado);
    // nao_informado: a peça continua no CPK. Com estimativa ligada (global OU
    // por-serviço, ADR-013/014), soma só a M.O. estimada (~); sem estimativa,
    // vira pendência no Detalhamento.
    const naoInformados = servicosAvulsosKm.filter(
      (s) => resolverStatusPrecoAutorizada(s) === 'nao_informado',
    );
    const moEstimada = (s: ServicoIndependente): number =>
      incluirEstimativa || estimativaPorServico[s.id] === true
        ? estimarMaoDeObra(s.id, marca, fatorMaoDeObra)
        : 0;
    const servicosEstimados = naoInformados.filter((s) => moEstimada(s) > 0);
    const pendenciasMaoDeObra: PendenciaMaoDeObraConcessionaria[] = naoInformados
      .filter((s) => moEstimada(s) <= 0)
      .map((s) => ({
        servicoId: s.id,
        label: s.nome,
        intervalKm: s.intervalKm,
        statusPrecoAutorizada: 'nao_informado',
      }));

    const montarCustoServico = (
      s: ServicoIndependente,
      precoBruto: number,
      maoDeObraEstimadaFlag: boolean,
    ): [string, CustoServicoRevisao] => {
      const chaveKmUltimaTroca = resolverChaveKmUltimaTrocaServico(s.id);
      const kmUltimaTroca = chaveKmUltimaTroca
        ? valorNaoNegativo(kmUltimaTrocas[chaveKmUltimaTroca])
        : 0;
      const cicloServico = calcularCicloPeca(kmUltimaTroca, s.intervalKm, kmAtual, kmAnualSeguro);
      const modo =
        kmUltimaTroca > 0 && chaveKmUltimaTroca !== undefined ? 'ancorado' : 'amortizado';
      const kmDasProximasTrocas =
        modo === 'ancorado'
          ? calcularKmDasProximasTrocas(kmUltimaTroca, s.intervalKm, kmAtual, kmAnualSeguro)
          : [];
      const precoServico = valorNaoNegativo(precoBruto);
      return [
        s.id,
        {
          servicoId: s.id,
          label: s.nome,
          custoAnual: precoServico * cicloServico.trocasNoAno,
          intervalKm: s.intervalKm,
          precoMaoDeObra: precoServico,
          precoServico,
          statusPrecoAutorizada: resolverStatusPrecoAutorizada(s),
          maoDeObraEstimada: maoDeObraEstimadaFlag,
          eventosNoAno: cicloServico.trocasNoAno,
          ehExcepcional: s.ehExcepcional,
          modo,
          kmUltimaTroca,
          kmDasProximasTrocas,
        },
      ];
    };

    const detalhesServicos = new Map<string, CustoServicoRevisao>([
      ...servicosInformados.map((s) => montarCustoServico(s, s.precoTotalAutorizada, false)),
      ...servicosEstimados.map((s) => montarCustoServico(s, moEstimada(s), true)),
    ]);

    // Bateria (TASK-RF-8): driver temporal, fora do fluxo km. Custo = valor ÷ vida
    // útil em anos. Completo (Honda) usa o valor completo — a peça já é pulada do CPK
    // por `ehPecaCobertaPorServicoCompleto`; incompleto usa só a M.O. (real/estimada) e
    // a peça soma à parte via `calcularCpkPorPeca`. Vira item fundido no Detalhamento.
    const servicoBateria = servicosNormaisAtivos.find((s) => s.id === 'troca-bateria');
    if (opcoes.bateria && servicoBateria) {
      const vidaAnos = opcoes.bateria.vidaUtilAnos > 0 ? opcoes.bateria.vidaUtilAnos : 3;
      const estimado = !temPrecoAutorizadaInformado(servicoBateria);
      const valorBateria = estimado
        ? moEstimada(servicoBateria)
        : valorNaoNegativo(servicoBateria.precoTotalAutorizada);
      if (valorBateria > 0) {
        detalhesServicos.set('troca-bateria', {
          servicoId: 'troca-bateria',
          label: servicoBateria.nome,
          custoAnual: valorBateria / vidaAnos,
          intervalKm: 0,
          precoMaoDeObra: valorBateria,
          precoServico: valorBateria,
          statusPrecoAutorizada: resolverStatusPrecoAutorizada(servicoBateria),
          maoDeObraEstimada: estimado,
          eventosNoAno: 1 / vidaAnos,
          ehExcepcional: false,
          modo: 'amortizado',
          kmUltimaTroca: 0,
          kmDasProximasTrocas: [],
        });
      } else if (resolverStatusPrecoAutorizada(servicoBateria) === 'nao_informado') {
        pendenciasMaoDeObra.push({
          servicoId: 'troca-bateria',
          label: servicoBateria.nome,
          intervalKm: 0,
          statusPrecoAutorizada: 'nao_informado',
        });
      }
    }

    const totalServicosForaDoPacote = [...detalhesServicos.values()].reduce(
      (sum, s) => sum + s.custoAnual,
      0,
    );
    const base = basePacoteConcessionaria;
    return {
      total: base + totalServicosForaDoPacote,
      detalhes: {
        modo: modoRevisao,
        base,
        eventosNoAno: calcularEventosRevisaoNoAno(
          modoRevisao,
          kmAnualSeguro,
          quantidadeRevisoesCiclo,
          kmCiclo,
        ),
        servicos: detalhesServicos,
        custoIncompleto: pendenciasMaoDeObra.length > 0,
        pendenciasMaoDeObra,
      },
    };
  }

  // Serviços com intervalKm <= 0 (ex.: troca-bateria, driver temporal puro)
  // ficam fora do cálculo de revisão - o custo da peça já entra via
  // `calcularCpkPorPeca` no caminho de manutenção. M.O. dessas trocas
  // (~R$ 25/ano para bateria) é débito técnico assumido pela TASK-RF-6.14.
  let base = servicosNormaisAtivos
    .filter((s) => s.intervalKm > 0)
    .reduce(
      (sum, s) => sum + (valorNaoNegativo(s.precoIndependente) / s.intervalKm) * kmAnualSeguro,
      0,
    );
  // Bateria (TASK-RF-8): temporal, fora do fluxo km. M.O. independente ÷ vida útil (anos).
  const servicoBateriaIndep = servicosNormaisAtivos.find((s) => s.id === 'troca-bateria');
  if (opcoes.bateria && servicoBateriaIndep) {
    const vidaAnos = opcoes.bateria.vidaUtilAnos > 0 ? opcoes.bateria.vidaUtilAnos : 3;
    base += valorNaoNegativo(servicoBateriaIndep.precoIndependente) / vidaAnos;
  }
  return {
    total: base,
    detalhes: {
      modo: modoRevisao,
      base,
      eventosNoAno: calcularEventosRevisaoNoAno(modoRevisao, kmAnualSeguro, 0),
      servicos: new Map(),
      custoIncompleto: false,
      pendenciasMaoDeObra: [],
    },
  };
}

// ─── VI. Custos Operacionais ──────────────────────────────────────

export function calcularCustoCombustivelAnual(cpkCombustivel: number, kmAnual: number): number {
  return valorNaoNegativo(cpkCombustivel) * valorNaoNegativo(kmAnual);
}

export function calcularCustoManutencaoAnual(cpkPecasTotal: number, kmAnual: number): number {
  return valorNaoNegativo(cpkPecasTotal) * valorNaoNegativo(kmAnual);
}

export function calcularCustoInternetAnual(temInternet: boolean, precoInternet: number): number {
  return temInternet ? valorNaoNegativo(precoInternet) * 12 : 0;
}

export function calcularCustoSeguroAnual(valorAnual: number): number {
  return valorAnual > 0 ? valorAnual : 0;
}

export function calcularCustoAlimentacaoAnual(precoAlimentacao: number, diasAno: number): number {
  return valorNaoNegativo(precoAlimentacao) * valorNaoNegativo(diasAno);
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

// Deriva quantas parcelas faltam HOJE a partir do valor informado e do mês de
// referência, sem mutar o perfil (modelagem Snapshot - TASK-RF-6.18 / ADR-009).
// Granularidade de mês (ano*12+mês) evita ruído de fuso. Edge cases: meses
// decorridos > restantes → 0; dataReferencia no futuro → não infla (clamp ao
// informado). `agora` é injetável para testes determinísticos.
export function calcularParcelasRestantesAtuais(
  parcelasRestantes: number | null,
  dataReferenciaParcelas: string | null,
  agora: Date = new Date(),
): number {
  if (parcelasRestantes == null || !Number.isFinite(parcelasRestantes) || parcelasRestantes <= 0) {
    return 0;
  }
  if (!dataReferenciaParcelas) {
    return parcelasRestantes;
  }
  const ref = new Date(dataReferenciaParcelas);
  if (isNaN(ref.getTime())) {
    return parcelasRestantes;
  }
  const mesesDecorridos =
    (agora.getFullYear() - ref.getFullYear()) * 12 + (agora.getMonth() - ref.getMonth());
  return Math.max(0, parcelasRestantes - Math.max(0, mesesDecorridos));
}

export interface ParamsCustoFinanciamentoAnual {
  situacaoMoto: string;
  parcelaMensal: number | null;
  parcelasRestantesAtuais: number;
  aluguelValor: number | null;
  aluguelPeriodicidade: string | null;
}

export function calcularCustoFinanciamentoAnual({
  situacaoMoto,
  parcelaMensal,
  parcelasRestantesAtuais,
  aluguelValor,
  aluguelPeriodicidade,
}: ParamsCustoFinanciamentoAnual): number {
  if (situacaoMoto === 'financiada' && parcelaMensal != null) {
    // Afunila no último ano: projeta só as parcelas que ainda faltam (máx. 12);
    // quando zera, o financiamento sai do total automaticamente (RF-6.18).
    return (
      valorNaoNegativo(parcelaMensal) * Math.min(12, valorNaoNegativo(parcelasRestantesAtuais))
    );
  }
  if (situacaoMoto === 'alugada' && aluguelValor != null) {
    const aluguel = valorNaoNegativo(aluguelValor);
    return aluguelPeriodicidade === 'semanal' ? aluguel * 52 : aluguel * 12;
  }
  return 0;
}

export function calcularCustoGastosCustomAnual(gastosCustom: GastoCustom[]): number {
  return gastosCustom
    .filter((g) => g.ativo)
    .reduce((soma, g) => soma + valorNaoNegativo(g.valorAnual), 0);
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
      filtros.imprevistosSugeridos[id] === true
        ? soma + valorNaoNegativo(imprevisto.custoAnual)
        : soma,
    0,
  );
  return valorNaoNegativo(custos.gastosCustom.total) + totalSugeridos;
}

// ─── VII. Agregação e Granularidades ─────────────────────────────

export function calcularCustosPorCategoria(
  perfil: PerfilUsuario,
  preset: PresetMoto,
  dadosRJ: DadosRJ,
): CustosPorCategoria {
  const anoAtual = new Date().getFullYear();
  const servicosManutencao = resolverServicosManutencaoPerfil(perfil, preset);

  const kmDia = resolverKmDia(perfil.trabalho.kmPorDia);
  const diasSemana = perfil.trabalho.diasPorSemana;
  const kmAnual = calcularKmAnual(kmDia, diasSemana);
  const diasAno = calcularDiasAno(diasSemana);

  // Documentos
  const cacheFipeAtual =
    perfil.fipeCache?.anoModelo === perfil.moto.ano &&
    perfil.fipeCache.marca === perfil.moto.marca &&
    perfil.fipeCache.modelo === perfil.moto.modelo;
  const valorFipe = cacheFipeAtual && perfil.fipeCache ? perfil.fipeCache.valor : 0;
  const ipva = calcularIPVA(valorFipe, dadosRJ.ipva.aliquotaMotos, perfil.moto.ano, anoAtual);
  const licenciamento = calcularLicenciamento(anoAtual, dadosRJ.licenciamento.tabela);

  // Revisão - aplica overrides individuais ao ciclo da concessionária antes de calcular
  const custoCicloCompleto = preset.revisaoAutorizada.reduce((s, r, idx) => {
    const override = perfil.revisaoAutorizadaOverrides.find((o) => o.index === idx);
    return s + valorNaoNegativo(override?.precoTotal ?? r.precoTotal);
  }, 0);
  // ADR-016: o ciclo amortizado é o maior marco do preset (ex.: 36.000 numa marca,
  // 5.000×n noutra), não o fallback fixo — corrige a amortização de presets com ciclo menor.
  const kmCicloRevisao = preset.revisaoAutorizada.reduce(
    (maior, r) => Math.max(maior, r.intervaloKm),
    0,
  );
  const revisao = calcularDetalhesRevisaoAnual(perfil.perfilManutencao.modoRevisao, kmAnual, {
    custoCicloCompleto,
    quantidadeRevisoesCiclo: preset.revisaoAutorizada.length,
    kmCicloRevisao,
    servicosIndependentes: servicosManutencao,
    kmAtual: perfil.moto.kmAtual,
    kmUltimaTrocas: perfil.moto.kmUltimaTrocas,
    marca: preset.marca,
    fatorMaoDeObra: preset.fatorMaoDeObra,
    incluirEstimativaMaoDeObra: perfil.perfilManutencao.incluirEstimativaMaoDeObra,
    estimativaMaoDeObraPorServico: perfil.perfilManutencao.estimativaMaoDeObraPorServico,
    bateria: perfil.perfilManutencao.bateria,
  });

  // Manutenção por peça
  const detalhePecas = calcularCpkPorPeca({
    preset,
    perfilPecas: perfil.perfilManutencao.perfilPecasGlobal,
    modoRevisao: perfil.perfilManutencao.modoRevisao,
    kmAtual: perfil.moto.kmAtual,
    kmAnual,
    kmUltimaTrocas: perfil.moto.kmUltimaTrocas,
    vidaUtilBateriaAnos: perfil.perfilManutencao.bateria.vidaUtilAnos,
    pecasOverrides: perfil.pecasOverrides,
    servicosIndependentes: servicosManutencao,
  });
  const cpkPecasTotal = calcularCpkPecasTotal(detalhePecas);

  // Combustível - usa autonomia já gravada no perfil (commitada no onboarding)
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

  const parcelasRestantesAtuais = calcularParcelasRestantesAtuais(
    perfil.financeiro.parcelasRestantes,
    perfil.financeiro.dataReferenciaParcelas,
  );
  const totalFinanciamento = calcularCustoFinanciamentoAnual({
    situacaoMoto,
    parcelaMensal: perfil.financeiro.parcelaMensal,
    parcelasRestantesAtuais,
    aluguelValor: perfil.financeiro.aluguelValor,
    aluguelPeriodicidade: perfil.financeiro.aluguelPeriodicidade,
  });
  const totalGastosCustom = calcularCustoGastosCustomAnual(gastosCustom);
  return {
    documentos: {
      total: calcularCustoDocumentosAnual(ipva, licenciamento) * fatorDoc,
      detalhes: {
        ipva: valorNaoNegativo(ipva) * fatorDoc,
        licenciamento: valorNaoNegativo(licenciamento) * fatorDoc,
      },
    },
    revisao: {
      total: valorNaoNegativo(revisao.total) * fatorMan,
      detalhes: {
        ...revisao.detalhes,
        base: valorNaoNegativo(revisao.detalhes.base) * fatorMan,
        servicos: new Map(
          [...revisao.detalhes.servicos.entries()].map(([id, servico]) => [
            id,
            { ...servico, custoAnual: valorNaoNegativo(servico.custoAnual) * fatorMan },
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
      // Campo mantido no contrato de saída por compatibilidade. A ADR-022 removeu
      // do MVP os serviços que o preenchiam.
      detalhes: { sugeridos: new Map() },
    },
  };
}

export function calcularTotalFiltrado(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias,
): number {
  let total = 0;

  if (filtros.documentos) {
    total += valorNaoNegativo(custos.documentos.total);
  }
  if (filtros.combustivel) {
    total += valorNaoNegativo(custos.combustivel.total);
  }
  if (filtros.internet) {
    total += valorNaoNegativo(custos.internet.total);
  }
  if (filtros.seguro) {
    total += valorNaoNegativo(custos.seguro.total);
  }
  if (filtros.alimentacao) {
    total += valorNaoNegativo(custos.alimentacao.total);
  }
  if (filtros.financiamento) {
    total += valorNaoNegativo(custos.financiamento.total);
  }
  total += calcularTotalImprevistosFiltrado(custos, filtros);

  if (filtros.manutencao) {
    if (filtros.revisao) {
      total += valorNaoNegativo(custos.revisao.detalhes.base);
    }
    custos.revisao.detalhes.servicos.forEach((detalhe, servicoId) => {
      if (filtros.revisaoPorServico[servicoId] !== false) {
        total += valorNaoNegativo(detalhe.custoAnual);
      }
    });
    // undefined em manutencaoPorPeca = peça ativa (só false explícito desativa)
    custos.manutencao.detalhes.forEach((detalhe, pecaId) => {
      if (filtros.manutencaoPorPeca[pecaId] !== false) {
        total += valorNaoNegativo(detalhe.custoAnual);
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
  const custo = valorNaoNegativo(custoTotalAnual);
  const dias = valorNaoNegativo(diasAno);
  const km = valorNaoNegativo(kmAnual);
  return {
    anual: custo,
    mensal: custo / 12,
    semanal: custo / 52, // nunca mensal/4
    diario: dias > 0 ? custo / dias : 0, // dias trabalhados, não 365
    porKm: km > 0 ? custo / km : 0,
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
          filtros.revisaoPorServico[id] !== false
            ? soma + valorNaoNegativo(servico.custoAnual)
            : soma,
        0,
      )
    : 0;
  const totalManutencaoFiltrado = filtros.manutencao
    ? [...custos.manutencao.detalhes.entries()].reduce(
        (soma, [id, peca]) =>
          filtros.manutencaoPorPeca[id] !== false ? soma + valorNaoNegativo(peca.custoAnual) : soma,
        0,
      )
    : 0;
  return {
    documentos: filtros.documentos ? valorNaoNegativo(custos.documentos.total) : 0,
    revisao: totalRevisaoFiltrado,
    manutencao: totalManutencaoFiltrado,
    combustivel: filtros.combustivel ? valorNaoNegativo(custos.combustivel.total) : 0,
    internet: filtros.internet ? valorNaoNegativo(custos.internet.total) : 0,
    seguro: filtros.seguro ? valorNaoNegativo(custos.seguro.total) : 0,
    alimentacao: filtros.alimentacao ? valorNaoNegativo(custos.alimentacao.total) : 0,
    financiamento: filtros.financiamento ? valorNaoNegativo(custos.financiamento.total) : 0,
    gastosCustom: calcularTotalImprevistosFiltrado(custos, filtros),
  };
}

export function calcularBreakdownPercentual(
  custos: CustosPorCategoria,
  filtros: FiltrosCategorias,
): Record<string, number> {
  const valores = calcularBreakdownValores(custos, filtros);
  const total = calcularTotalFiltrado(custos, filtros);
  if (total <= 0) {
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
  const d = valorNaoNegativo(divisor[periodo]);
  return d > 0 ? valorNaoNegativo(anual) / d : 0;
}

export function calcularCustoMotoAnual(
  custoTotalAnual: number,
  custoAlimentacaoAnual: number,
): number {
  return Math.max(0, valorNaoNegativo(custoTotalAnual) - valorNaoNegativo(custoAlimentacaoAnual));
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
    // Campo legado preservado no filtro interno. Sem serviços sugeridos no MVP,
    // permanece vazio e a categoria controla apenas Multa/Sinistros/Outros.
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
  // Só desconta alimentação se ela entrou no total (filtro ativo) - senão subtrairia 2x (BG-018).
  const alimentacaoNoTotal = filtrosAtivos.alimentacao ? custos.alimentacao.total : 0;
  const totalMoto = calcularCustoMotoAnual(total, alimentacaoNoTotal);

  return {
    custos,
    granularidades: calcularGranularidades(total, diasAno, kmAnual),
    granularidadesMoto: calcularGranularidades(totalMoto, diasAno, kmAnual),
    kmAnual,
    diasAno,
  };
}
