import { useMemo } from 'react';
import { usePerfil } from './usePerfil';
import dadosRJJson from '../data/dados_rj.json';
import { obterPreset } from '../data/repositorioPresets';
import { calcularResultado } from '../utils/calculos';
import { resolverServicosManutencaoPerfil } from '../utils/servicosManutencaoPreset';
import type { DadosRJ, PresetMoto, ResultadoCalculo } from '../types/calculos';
import type { PerfilUsuario } from '../types/perfil';

const dadosRJ = dadosRJJson as unknown as DadosRJ;

export function normalizarPerfilMvp(perfil: PerfilUsuario, preset?: PresetMoto): PerfilUsuario {
  const servicosManutencao = resolverServicosManutencaoPerfil(perfil, preset);

  if (
    perfil.perfilManutencao.modoRevisao === 'autorizadas' &&
    perfil.perfilManutencao.perfilPecasGlobal === 'original' &&
    servicosManutencao === perfil.servicosIndependentes
  ) {
    return perfil;
  }

  return {
    ...perfil,
    perfilManutencao: {
      ...perfil.perfilManutencao,
      modoRevisao: 'autorizadas',
      perfilPecasGlobal: 'original',
    },
    servicosIndependentes: servicosManutencao,
  };
}

export function useCustos(): ResultadoCalculo | null {
  const { perfil } = usePerfil();

  return useMemo(() => {
    const preset = obterPreset(perfil.moto.modelo);
    if (!preset) {
      return null;
    }
    return calcularResultado(normalizarPerfilMvp(perfil, preset), preset, dadosRJ);
  }, [perfil]);
}
