// Estimativa de mão de obra (ADR-013). Fonte do método e calibração:
// docs/arquitetura/estimativa-mao-de-obra.md. Esta é a estimativa "chutada"
// opt-in: só entra no cálculo quando o usuário liga, sempre rotulada como ~.

import type { PerfilUsuario, ServicoIndependente } from '../types/perfil';
import type { PresetMoto } from '../types/calculos';
import { resolverStatusPrecoAutorizada } from './statusPrecoAutorizada';

// Tempário: horas de mão de obra por serviço (baseline ~125cc).
const HORAS_POR_SERVICO: Record<string, number> = {
  'troca-oleo': 0.5,
  'troca-vela': 0.12,
  'troca-filtro-ar': 0.2,
  'troca-filtro-combustivel': 0.25,
  'troca-bateria': 0.2,
  'troca-pastilha-dianteira': 0.5,
  'troca-disco-dianteiro': 0.7,
  'troca-sapata-dianteira': 0.65,
  'troca-sapata-traseira': 0.65,
  'troca-pneu-dianteiro': 0.4,
  'troca-pneu-traseiro': 0.4,
  'troca-kit-transmissao': 2.0,
  'troca-kit-embreagem': 2.5,
  'troca-kit-cilindro': 5.0,
  'troca-caixa-direcao': 1.5,
};

// Taxa horária de mão de obra por marca (R$/h), calibrada por dados reais.
// Hoje ambas em 110 (vela Honda R$13 a ~0,12h; óleo/sapata/transmissão Yamaha).
const TAXA_HORA_POR_MARCA: Record<string, number> = {
  Honda: 110,
  Yamaha: 110,
};
const TAXA_HORA_PADRAO = 110;

export function taxaHoraDaMarca(marca?: string): number {
  return (marca && TAXA_HORA_POR_MARCA[marca]) || TAXA_HORA_PADRAO;
}

// MO estimada = horas[serviço] × taxa[marca] × fator[modelo].
// Retorna 0 quando não há tempário para o serviço (não há base para estimar).
export function estimarMaoDeObra(
  servicoId: string,
  marca: string | undefined,
  fatorMaoDeObra = 1,
): number {
  const horas = HORAS_POR_SERVICO[servicoId];
  if (!horas) return 0;
  const fator = Number.isFinite(fatorMaoDeObra) && fatorMaoDeObra > 0 ? fatorMaoDeObra : 1;
  return Math.round(horas * taxaHoraDaMarca(marca) * fator * 100) / 100;
}

// Bundle de estimativa por-item consumido pelo CardServico (ADR-014, A).
// `globalLigado` = toggle de Preferências; `porServicoLigado` = flag específico;
// `valorEstimado` = M.O. estimada (~) para o serviço. Fonte única para o popup
// de edição (Detalhamento) e a aba Mão de Obra, mantendo os dois sincronizados.
export interface EstimativaMaoDeObraItem {
  globalLigado: boolean;
  porServicoLigado: boolean;
  valorEstimado: number;
}

export function montarEstimativaMaoDeObra(
  perfil: PerfilUsuario,
  preset: PresetMoto | undefined,
  servicoId: string,
): EstimativaMaoDeObraItem {
  return {
    globalLigado: perfil.perfilManutencao.incluirEstimativaMaoDeObra ?? false,
    porServicoLigado: perfil.perfilManutencao.estimativaMaoDeObraPorServico?.[servicoId] ?? false,
    valorEstimado: estimarMaoDeObra(servicoId, preset?.marca, preset?.fatorMaoDeObra ?? 1),
  };
}

// Soma a M.O. **efetiva** de uma lista de serviços, segundo o estado atual do
// perfil (RF-6.32.1): valor real quando informado (oficial ou digitado pelo
// usuário); estimativa (~) quando a estimativa está ligada (global OU por-item) e
// o serviço está sem valor; 0 caso contrário. Usado no onboarding para mostrar,
// de forma dinâmica, o quanto esses avulsos impactam.
export function somarMaoDeObraEfetiva(
  servicos: ServicoIndependente[],
  perfil: PerfilUsuario,
  preset: PresetMoto | undefined,
): { total: number; temEstimado: boolean } {
  const global = perfil.perfilManutencao.incluirEstimativaMaoDeObra ?? false;
  const porServico = perfil.perfilManutencao.estimativaMaoDeObraPorServico ?? {};
  let total = 0;
  let temEstimado = false;
  for (const servico of servicos) {
    if (resolverStatusPrecoAutorizada(servico) !== 'nao_informado') {
      total += servico.precoTotalAutorizada; // valor real (oficial ou do usuário)
    } else if (global || porServico[servico.id]) {
      total += estimarMaoDeObra(servico.id, preset?.marca, preset?.fatorMaoDeObra ?? 1);
      temEstimado = true;
    }
  }
  return { total: Math.round(total * 100) / 100, temEstimado };
}
