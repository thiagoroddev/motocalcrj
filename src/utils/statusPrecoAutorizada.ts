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

// "Valor completo" = a concessionária publica o preço cheio (peça + M.O.) — só a
// convenção Honda (`concessionariaIncluiPeca: true`). Na Yamaha o preço é sempre
// só M.O. (peça à parte), então é "incompleto" mesmo com a M.O. informada. Usado
// na divisão Completo/Incompleto de "Serviços Extras" e no onboarding. (BG-033)
export function concessionariaInformaPrecoCompleto(servico: ServicoIndependente): boolean {
  return (
    resolverStatusPrecoAutorizada(servico) === 'informado' &&
    servico.concessionariaIncluiPeca === true
  );
}
