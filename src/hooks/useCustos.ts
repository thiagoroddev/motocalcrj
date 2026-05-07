import { useMemo } from 'react';
import { usePerfil } from './usePerfil';
import pop110iJson from '../presets/pop110i.json';
import dadosRJJson from '../data/dados_rj.json';
import { calcularResultado } from '../utils/calculos';
import type { PresetMoto, DadosRJ, ResultadoCalculo } from '../types/calculos';

const PRESETS: Record<string, PresetMoto> = {
  pop110i: pop110iJson as unknown as PresetMoto,
};

const dadosRJ = dadosRJJson as unknown as DadosRJ;

export function useCustos(): ResultadoCalculo | null {
  const { perfil } = usePerfil();

  return useMemo(() => {
    const preset = PRESETS[perfil.moto.modelo];
    if (!preset) {
      return null;
    }
    return calcularResultado(perfil, preset, dadosRJ, perfil.configuracaoDisplay.modoExibicao);
  }, [perfil]);
}
