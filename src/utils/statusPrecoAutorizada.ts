import type { ServicoIndependente, StatusPrecoAutorizada } from '../types/perfil';

export function resolverStatusPrecoAutorizada(servico: ServicoIndependente): StatusPrecoAutorizada {
  if (servico.statusPrecoAutorizada) {
    return servico.statusPrecoAutorizada;
  }

  if (servico.incluidoNaRevisaoAutorizada || servico.precoTotalAutorizada > 0) {
    return 'informado';
  }

  return 'nao_informado';
}

export function temPrecoAutorizadaInformado(servico: ServicoIndependente): boolean {
  return (
    resolverStatusPrecoAutorizada(servico) !== 'nao_informado' && servico.precoTotalAutorizada > 0
  );
}
