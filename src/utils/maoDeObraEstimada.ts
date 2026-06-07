// Estimativa de mão de obra (ADR-013). Fonte do método e calibração:
// docs/arquitetura/estimativa-mao-de-obra.md. Esta é a estimativa "chutada"
// opt-in: só entra no cálculo quando o usuário liga, sempre rotulada como ~.

import type { PerfilUsuario, ServicoIndependente } from '../types/perfil';
import type { PresetMoto } from '../types/calculos';

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

// Soma a M.O. estimável de uma lista de serviços (os sem tempário somam 0 e não
// contam). Usado no onboarding para o exemplo "com × sem estimativa" — quanto a
// estimativa adicionaria nos avulsos sem valor oficial.
export function somarMaoDeObraEstimavel(
  servicos: ServicoIndependente[],
  marca: string | undefined,
  fatorMaoDeObra = 1,
): { total: number; quantidade: number } {
  let total = 0;
  let quantidade = 0;
  for (const servico of servicos) {
    const estimado = estimarMaoDeObra(servico.id, marca, fatorMaoDeObra);
    if (estimado > 0) {
      total += estimado;
      quantidade += 1;
    }
  }
  return { total: Math.round(total * 100) / 100, quantidade };
}
