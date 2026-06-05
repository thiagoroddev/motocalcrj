import type { RevisaoAutorizadaPreset } from '../types/calculos';
import type { RevisaoAutorizadaOverride } from '../types/perfil';

export interface RevisaoCicloItem {
  ordem: number; // 1-based, posição no ciclo
  intervaloKm: number; // marco em km da revisão (ex.: 6.000)
  precoTotal: number; // custo da revisão, com override do usuário aplicado
  editado: boolean; // true se há override informado pelo usuário
}

export interface CicloRevisao {
  revisoes: RevisaoCicloItem[];
  custoCicloCompleto: number; // soma dos custos de todas as revisões do ciclo
  kmCiclo: number; // km do ciclo completo (maior marco)
}

/**
 * Monta o detalhamento do ciclo de revisões da concessionária para exibição:
 * cada revisão prevista (marco em km + custo individual, com overrides do
 * usuário) e a soma do ciclo. Espelha a derivação de `custoCicloCompleto` em
 * `calcularCustosPorCategoria` (override.precoTotal ?? preset.precoTotal por
 * índice) — é só visão, não recalcula custo.
 */
export function montarCicloRevisao(
  revisaoAutorizada: RevisaoAutorizadaPreset[],
  overrides: RevisaoAutorizadaOverride[],
): CicloRevisao {
  const revisoes: RevisaoCicloItem[] = revisaoAutorizada.map((r, index) => {
    const override = overrides.find((o) => o.index === index);
    const precoTotal = Math.max(0, override?.precoTotal ?? r.precoTotal);
    return {
      ordem: index + 1,
      intervaloKm: r.intervaloKm,
      precoTotal,
      editado: override !== undefined,
    };
  });

  const custoCicloCompleto = revisoes.reduce((soma, r) => soma + r.precoTotal, 0);
  const kmCiclo = revisoes.reduce((maior, r) => Math.max(maior, r.intervaloKm), 0);

  return { revisoes, custoCicloCompleto, kmCiclo };
}

export interface ProximaRevisao {
  km: number; // quilometragem prevista da revisão
  precoTotal: number; // custo daquela revisão (com override)
}

/**
 * Projeção **ancorada** (informativa) das revisões da concessionária previstas
 * até `kmAtual + kmAnual`. Não muda o custo anual (que segue amortizado — ADR-016);
 * é só o detalhe "o que vem por aí".
 *
 * **Âncora (a verdade que o usuário informou):** conta a partir da **última revisão
 * informada** (`kmUltimaRevisao`); sem ela, a partir do **km atual**. Ex.: última em
 * 12.000 e moto com 18.010 → a próxima é a de **18.000** (não se assume que foi feita).
 *
 * Recorrência (decidida com o humano): a **1ª revisão** (menor marco, amaciamento)
 * é **única**; as demais ("regulares") repetem a cada intervalo fixo (Honda 6.000,
 * Yamaha 5.000), ciclando os custos das revisões regulares.
 */
export function projetarProximasRevisoes(
  revisaoAutorizada: RevisaoAutorizadaPreset[],
  overrides: RevisaoAutorizadaOverride[],
  opcoes: { kmAtual: number; kmAnual: number; kmUltimaRevisao?: number | null },
): ProximaRevisao[] {
  const kmAtual = Math.max(0, opcoes.kmAtual);
  const kmAnual = Math.max(0, opcoes.kmAnual);
  if (kmAnual <= 0 || revisaoAutorizada.length === 0) return [];
  const janelaFim = kmAtual + kmAnual;
  // Conta a partir da última revisão informada; sem ela, do km atual.
  const ancora =
    opcoes.kmUltimaRevisao != null && opcoes.kmUltimaRevisao > 0 ? opcoes.kmUltimaRevisao : kmAtual;

  const custo = (index: number): number =>
    Math.max(
      0,
      overrides.find((o) => o.index === index)?.precoTotal ?? revisaoAutorizada[index].precoTotal,
    );

  const ordenadas = revisaoAutorizada
    .map((r, index) => ({ index, km: r.intervaloKm }))
    .sort((a, b) => a.km - b.km);

  const proximas: ProximaRevisao[] = [];

  // 1ª revisão (amaciamento): única, só se ainda não passou da âncora e cabe na janela.
  const amaciamento = ordenadas[0];
  if (amaciamento.km > ancora && amaciamento.km <= janelaFim) {
    proximas.push({ km: amaciamento.km, precoTotal: custo(amaciamento.index) });
  }

  // Revisões regulares: a cada `intervalo`, ciclando os custos, a partir da âncora.
  const regulares = ordenadas.slice(1);
  if (regulares.length > 0) {
    const base = regulares[0].km;
    const intervalo = regulares.length > 1 ? regulares[1].km - regulares[0].km : base;
    if (intervalo > 0) {
      const kInicial = Math.max(0, Math.floor((ancora - base) / intervalo) + 1);
      for (let k = kInicial; base + k * intervalo <= janelaFim && proximas.length < 60; k++) {
        const km = base + k * intervalo;
        proximas.push({ km, precoTotal: custo(regulares[k % regulares.length].index) });
      }
    }
  }

  return proximas.sort((a, b) => a.km - b.km);
}

/**
 * Primeiro marco de revisão do cronograma **estritamente após** `kmReferencia`
 * (por-marca: usa os marcos reais do preset). Acima do último marco, segue a
 * recorrência das regulares (a cada intervalo). `null` se não houver cronograma.
 *
 * Usado pela TASK-RF-6.27: a "próxima revisão prevista" após a última informada.
 */
export function proximaRevisaoApos(
  revisaoAutorizada: RevisaoAutorizadaPreset[],
  kmReferencia: number,
): number | null {
  if (revisaoAutorizada.length === 0) return null;
  const ref = Math.max(0, kmReferencia);
  const marcos = revisaoAutorizada.map((r) => r.intervaloKm).sort((a, b) => a - b);

  // Caso comum: 1º marco listado após a referência.
  const direto = marcos.find((km) => km > ref);
  if (direto !== undefined) return direto;

  // Referência acima do último marco: recorrência das regulares (exclui o amaciamento).
  const regulares = marcos.slice(1);
  if (regulares.length === 0) return null;
  const base = regulares[0];
  const intervalo = regulares.length > 1 ? regulares[1] - regulares[0] : base;
  if (intervalo <= 0) return null;
  const k = Math.floor((ref - base) / intervalo) + 1;
  return base + k * intervalo;
}
