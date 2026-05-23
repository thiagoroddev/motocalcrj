import { useMemo } from 'react';
import { usePerfil } from './usePerfil';
import dadosRJJson from '../data/dados_rj.json';
import { calcularResultado } from '../utils/calculos';
import type { PresetMoto, DadosRJ, ResultadoCalculo } from '../types/calculos';

const _rawPresets = import.meta.glob('../presets/*.json', { eager: true });

const PRESETS: Record<string, PresetMoto> = Object.fromEntries(
  Object.entries(_rawPresets).map(([path, mod]) => [
    path.split('/').pop()!.replace('.json', ''),
    (mod as { default: PresetMoto }).default,
  ]),
);

const dadosRJ = dadosRJJson as unknown as DadosRJ;

export function useCustos(): ResultadoCalculo | null {
  const { perfil } = usePerfil();

  return useMemo(() => {
    const preset = PRESETS[perfil.moto.modelo];
    if (!preset) {
      return null;
    }
    return calcularResultado(perfil, preset, dadosRJ);
  }, [perfil]);
}
