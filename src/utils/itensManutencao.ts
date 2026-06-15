import type {
  CustoPeca,
  CustoServicoRevisao,
  PendenciaMaoDeObraConcessionaria,
} from '../types/calculos';
import { MAPA_PECA_PARA_SERVICO } from './calculos';

// ──────────────────────────────────────────────────────────────────────────
// Composição do item de manutenção (ADR-014, adendo / TASK-REF-32.6 — D).
//
// O cálculo (`calculos.ts`) mantém peça (Insumos) e M.O. (serviço) em mapas
// separados — é onde mora a verdade dos totais e a regra Honda/Yamaha de não
// duplicar. Aqui montamos a VISÃO: um único item por componente físico,
// fundindo as duas fontes, para a UI mostrar uma linha só (acaba a duplicação
// peça+serviço que aparecia no modo estimado) com o status decidido de forma
// centralizada.
// ──────────────────────────────────────────────────────────────────────────

export type StatusItemManutencao =
  | 'oficial' // M.O. com preço oficial da concessionária (informado)
  | 'editado' // M.O. editada conscientemente pelo usuário (informado_usuario)
  | 'estimado' // M.O. estimada (~), opt-in (ADR-013)
  | 'faltando' // falta o valor de M.O. da concessionária (!) — custo parcial
  | 'semMaoDeObra'; // componente sem serviço de M.O. associado (ex.: bateria)

export interface ItemManutencaoComposto {
  // id do componente: o da peça quando ela existe; senão o do serviço.
  id: string;
  // Nome exibido: o da peça quando há peça (resolve o vocabulário duplicado, F);
  // senão o do serviço (caso Honda, peça já embutida no total).
  label: string;
  // Custo anual composto = parte da peça (Insumos) + parte da M.O. (serviço).
  custoAnual: number;
  modo: 'amortizado' | 'ancorado';
  // Km da próxima troca prevista (da peça). Calculado mesmo quando não há troca
  // na janela de 12 meses (custoAnual 0), por isso serve para listar os itens
  // ancorados ocultos e dizer onde a troca cairá. Indefinido em itens só-serviço
  // (Honda), que não carregam `proximaTrocaKm`.
  proximaTrocaKm?: number;
  // Eventos/trocas no ano para exibição da frequência (da peça quando existe).
  freq: number;
  status: StatusItemManutencao;
  // true quando o preço da peça veio de edição do usuário (pill "real").
  pecaEditada: boolean;
  // Chaves de filtro: a linha controla os dois toggles juntos quando existem.
  pecaId?: string;
  servicoId?: string;
  // Partes cruas, para o popover de detalhes e o roteamento da edição.
  peca?: CustoPeca;
  servico?: CustoServicoRevisao;
}

function statusDoServico(servico: CustoServicoRevisao): StatusItemManutencao {
  if (servico.maoDeObraEstimada) return 'estimado';
  if (servico.statusPrecoAutorizada === 'informado_usuario') return 'editado';
  return 'oficial';
}

// Reverso de MAPA_PECA_PARA_SERVICO: dado o id do serviço, qual peça ele troca.
// Usado para nomear itens só-serviço (Honda, peça embutida no preço oficial)
// com o nome do componente, não com "Troca de…" (F).
const PECA_POR_SERVICO: Record<string, string> = Object.fromEntries(
  Object.entries(MAPA_PECA_PARA_SERVICO).map(([pecaId, servicoId]) => [servicoId, pecaId]),
);

/**
 * Funde as peças (Insumos) e os serviços de M.O. da revisão em uma lista de
 * itens-componente para exibição. Cada peça absorve o serviço de troca
 * associado (via `MAPA_PECA_PARA_SERVICO`); serviços sem peça correspondente
 * na lista (caso Honda, em que a peça já está embutida no preço oficial) viram
 * itens só-serviço.
 */
export function montarItensManutencao(
  pecas: [string, CustoPeca][],
  servicos: [string, CustoServicoRevisao][],
  pendencias: PendenciaMaoDeObraConcessionaria[] = [],
  // Nome de exibição por peça (do preset). Usado para nomear itens só-serviço
  // (Honda) com o nome do componente em vez do nome do serviço (F).
  nomePorPeca: Record<string, string> = {},
): ItemManutencaoComposto[] {
  const servicoPorId = new Map(servicos);
  const pendenciaPorServico = new Set(pendencias.map((p) => p.servicoId));
  const servicosConsumidos = new Set<string>();
  const itens: ItemManutencaoComposto[] = [];

  // 1) Um item por peça, fundindo a M.O. do serviço associado (quando houver).
  for (const [pecaId, peca] of pecas) {
    const servicoId: string | undefined = MAPA_PECA_PARA_SERVICO[pecaId];
    const servico = servicoId ? servicoPorId.get(servicoId) : undefined;
    if (servico && servicoId) servicosConsumidos.add(servicoId);

    let status: StatusItemManutencao;
    if (servico) {
      status = statusDoServico(servico);
    } else if (servicoId && pendenciaPorServico.has(servicoId)) {
      status = 'faltando';
    } else {
      status = 'semMaoDeObra';
    }

    itens.push({
      id: pecaId,
      label: peca.label,
      custoAnual: peca.custoAnual + (servico?.custoAnual ?? 0),
      modo: peca.modo,
      proximaTrocaKm: peca.proximaTrocaKm,
      freq: peca.trocasNoAno,
      status,
      pecaEditada: peca.fonte === 'registro',
      pecaId,
      servicoId: servico ? servicoId : undefined,
      peca,
      servico,
    });
  }

  // 2) Serviços não absorvidos por nenhuma peça: a peça já está no preço oficial
  //    (Honda) e foi pulada do CPK, então o serviço carrega o total sozinho.
  //    O nome exibido é o do componente (peça), não o do serviço (F).
  for (const [servicoId, servico] of servicos) {
    if (servicosConsumidos.has(servicoId)) continue;
    const pecaIdReverso = PECA_POR_SERVICO[servicoId];
    const label = (pecaIdReverso && nomePorPeca[pecaIdReverso]) || servico.label;
    itens.push({
      id: servicoId,
      label,
      custoAnual: servico.custoAnual,
      modo: servico.modo,
      freq: servico.eventosNoAno,
      status: statusDoServico(servico),
      pecaEditada: false,
      servicoId,
      servico,
    });
  }

  return itens;
}
