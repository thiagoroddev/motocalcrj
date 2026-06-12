import type { PresetEntry } from '../types/perfil';

export const LIMITE_SUFIXO_PREDEFINICAO = 15;

type PresetEntryLegado = Omit<PresetEntry, 'sufixo'> & {
  sufixo?: string;
};

export function normalizarSufixoPredefinicao(sufixo: string): string {
  return sufixo.trim().toLowerCase();
}

export function gerarNomePredefinicao(modeloId: string, sufixo: string): string {
  return `${modeloId}_${normalizarSufixoPredefinicao(sufixo)}`;
}

export function obterErroSufixoPredefinicao(
  sufixo: string,
  modeloId: string,
  presets: PresetEntry[],
  presetIgnoradoId?: string,
): string | null {
  const normalizado = normalizarSufixoPredefinicao(sufixo);

  if (!normalizado) {
    return 'Informe um sufixo.';
  }

  if (normalizado.length > LIMITE_SUFIXO_PREDEFINICAO) {
    return `Use no máximo ${LIMITE_SUFIXO_PREDEFINICAO} caracteres.`;
  }

  if (!/^[a-z0-9][a-z0-9_-]*$/.test(normalizado)) {
    return 'Use letras sem acento, números, hífen ou sublinhado.';
  }

  const repetido = presets.some(
    (preset) =>
      preset.presetId !== presetIgnoradoId &&
      preset.perfil.moto.modelo === modeloId &&
      normalizarSufixoPredefinicao(preset.sufixo) === normalizado,
  );

  return repetido ? 'Esse sufixo já existe para o modelo.' : null;
}

export function sugerirSufixoPredefinicao(
  modeloId: string,
  presets: Pick<PresetEntry, 'sufixo' | 'perfil'>[],
): string {
  const maiorVersao = presets.reduce((maior, preset) => {
    if (preset.perfil.moto.modelo !== modeloId) {
      return maior;
    }

    const resultado = /^v(\d+)$/.exec(normalizarSufixoPredefinicao(preset.sufixo));
    return resultado ? Math.max(maior, Number(resultado[1])) : maior;
  }, 0);

  return `v${maiorVersao + 1}`;
}

export function normalizarPredefinicoesPersistidas(presets: PresetEntryLegado[]): {
  presets: PresetEntry[];
  houveAlteracao: boolean;
} {
  let houveAlteracao = false;
  const normalizados: PresetEntry[] = [];

  for (const preset of presets) {
    const modeloId = preset.perfil.moto.modelo;
    const sufixoInformado = preset.sufixo ? normalizarSufixoPredefinicao(preset.sufixo) : '';
    const erroSufixo = obterErroSufixoPredefinicao(
      sufixoInformado,
      modeloId,
      normalizados,
      preset.presetId,
    );
    const sufixo = erroSufixo ? sugerirSufixoPredefinicao(modeloId, normalizados) : sufixoInformado;
    const nome = gerarNomePredefinicao(modeloId, sufixo);

    if (preset.sufixo !== sufixo || preset.nome !== nome) {
      houveAlteracao = true;
    }

    normalizados.push({
      ...preset,
      sufixo,
      nome,
    });
  }

  return { presets: normalizados, houveAlteracao };
}
