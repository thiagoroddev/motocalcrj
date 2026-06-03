import { SERVICOS_INDEPENDENTES_PADRAO } from '../context/perfilDefaults';
import type { PresetMoto } from '../types/calculos';
import type { PerfilUsuario, ServicoIndependente } from '../types/perfil';
import { resolverStatusPrecoAutorizada } from './statusPrecoAutorizada';

export function obterServicosManutencaoBase(preset?: PresetMoto): ServicoIndependente[] {
  return preset?.servicosManutencao ?? SERVICOS_INDEPENDENTES_PADRAO;
}

function mesclarComOverrideDoPerfil(
  servicoBase: ServicoIndependente,
  servicoPerfil?: ServicoIndependente,
): ServicoIndependente {
  if (!servicoPerfil) {
    return servicoBase;
  }

  const padraoGlobal = obterServicoPadraoGlobal(servicoPerfil.id);

  if (!padraoGlobal) {
    return {
      ...servicoBase,
      intervalKm: servicoPerfil.intervalKm,
      precoIndependente: servicoPerfil.precoIndependente,
      precoTotalAutorizada: servicoPerfil.precoTotalAutorizada,
      statusPrecoAutorizada:
        servicoPerfil.statusPrecoAutorizada ?? servicoBase.statusPrecoAutorizada,
      ativo: servicoPerfil.ativo,
    };
  }

  if (!servicoTemOverrideDoPerfil(servicoPerfil, padraoGlobal)) {
    return servicoBase;
  }

  const temOverridePrecoAutorizada =
    servicoPerfil.precoTotalAutorizada !== padraoGlobal.precoTotalAutorizada ||
    resolverStatusPrecoAutorizada(servicoPerfil) !== resolverStatusPrecoAutorizada(padraoGlobal);

  return {
    ...servicoBase,
    intervalKm:
      servicoPerfil.intervalKm !== padraoGlobal.intervalKm
        ? servicoPerfil.intervalKm
        : servicoBase.intervalKm,
    precoIndependente:
      servicoPerfil.precoIndependente !== padraoGlobal.precoIndependente
        ? servicoPerfil.precoIndependente
        : servicoBase.precoIndependente,
    precoTotalAutorizada: temOverridePrecoAutorizada
      ? servicoPerfil.precoTotalAutorizada
      : servicoBase.precoTotalAutorizada,
    statusPrecoAutorizada: temOverridePrecoAutorizada
      ? (servicoPerfil.statusPrecoAutorizada ?? resolverStatusPrecoAutorizada(servicoPerfil))
      : servicoBase.statusPrecoAutorizada,
    ativo: servicoPerfil.ativo !== padraoGlobal.ativo ? servicoPerfil.ativo : servicoBase.ativo,
  };
}

function obterServicoPadraoGlobal(id: string): ServicoIndependente | undefined {
  return SERVICOS_INDEPENDENTES_PADRAO.find((servico) => servico.id === id);
}

function servicoTemOverrideDoPerfil(
  servicoPerfil: ServicoIndependente,
  padraoGlobal: ServicoIndependente,
): boolean {
  return (
    servicoPerfil.intervalKm !== padraoGlobal.intervalKm ||
    servicoPerfil.precoIndependente !== padraoGlobal.precoIndependente ||
    servicoPerfil.precoTotalAutorizada !== padraoGlobal.precoTotalAutorizada ||
    resolverStatusPrecoAutorizada(servicoPerfil) !== resolverStatusPrecoAutorizada(padraoGlobal) ||
    servicoPerfil.ativo !== padraoGlobal.ativo
  );
}

export function resolverServicosManutencaoPerfil(
  perfil: PerfilUsuario,
  preset?: PresetMoto,
): ServicoIndependente[] {
  if (!preset?.servicosManutencao) {
    return perfil.servicosIndependentes;
  }

  const servicosPerfilPorId = new Map(
    perfil.servicosIndependentes.map((servico) => [servico.id, servico]),
  );

  return preset.servicosManutencao.map((servicoBase) =>
    mesclarComOverrideDoPerfil(servicoBase, servicosPerfilPorId.get(servicoBase.id)),
  );
}
