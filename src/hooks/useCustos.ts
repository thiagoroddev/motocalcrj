import { useMemo } from 'react';
import { usePerfil } from './usePerfil';
import dadosRJJson from '../data/dados_rj.json';
import { obterPreset } from '../data/repositorioPresets';
import { calcularResultado } from '../utils/calculos';
import type { DadosRJ, ResultadoCalculo } from '../types/calculos';

const dadosRJ = dadosRJJson as unknown as DadosRJ;

export function useCustos(): ResultadoCalculo | null {
  const { perfil } = usePerfil();

  return useMemo(() => {
    const preset = obterPreset(perfil.moto.modelo);
    if (!preset) {
      return null;
    }
    return calcularResultado(perfil, preset, dadosRJ);
  }, [perfil]);
}
