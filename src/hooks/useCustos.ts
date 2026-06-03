import { useMemo } from 'react';
import { usePerfil } from './usePerfil';
import dadosRJJson from '../data/dados_rj.json';
import { obterPreset } from '../data/repositorioPresets';
import { calcularResultado } from '../utils/calculos';
import type { DadosRJ, ResultadoCalculo } from '../types/calculos';
import type { PerfilUsuario } from '../types/perfil';

const dadosRJ = dadosRJJson as unknown as DadosRJ;

function normalizarPerfilMvp(perfil: PerfilUsuario): PerfilUsuario {
  if (perfil.perfilManutencao.modoRevisao === 'autorizadas') return perfil;

  return {
    ...perfil,
    perfilManutencao: {
      ...perfil.perfilManutencao,
      modoRevisao: 'autorizadas',
    },
  };
}

export function useCustos(): ResultadoCalculo | null {
  const { perfil } = usePerfil();

  return useMemo(() => {
    const preset = obterPreset(perfil.moto.modelo);
    if (!preset) {
      return null;
    }
    return calcularResultado(normalizarPerfilMvp(perfil), preset, dadosRJ);
  }, [perfil]);
}
