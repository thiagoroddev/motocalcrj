import { useMemo } from 'react';
import { usePerfil } from './usePerfil';
import { dadosRJ } from '../data/dadosRJ';
import { obterPreset } from '../data/repositorioPresets';
import { calcularResultado } from '../utils/calculos';
import { resolverServicosManutencaoPerfil } from '../utils/servicosManutencaoPreset';
import type { PresetMoto, ResultadoCalculo } from '../types/calculos';
import type { PerfilUsuario } from '../types/perfil';

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
