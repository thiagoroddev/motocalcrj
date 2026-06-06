import type { PresetMoto } from '../types/calculos';
import type { PerfilUsuario } from '../types/perfil';
import { obterServicosManutencaoBase } from '../utils/servicosManutencaoPreset';

function filtrarArray<T>(itens: T[], pertenceAoPreset: (item: T) => boolean): T[] {
  const filtrados = itens.filter(pertenceAoPreset);
  return filtrados.length === itens.length ? itens : filtrados;
}

function filtrarRegistro(
  registro: Record<string, boolean>,
  idsValidos: ReadonlySet<string>,
): Record<string, boolean> {
  const entradas = Object.entries(registro);
  const filtradas = entradas.filter(([id]) => idsValidos.has(id));
  return filtradas.length === entradas.length ? registro : Object.fromEntries(filtradas);
}

export function normalizarPerfilContraPreset(
  perfil: PerfilUsuario,
  preset: PresetMoto,
): PerfilUsuario {
  const idsPecas = new Set([...preset.pecas, ...preset.pneus].map((item) => item.id));
  const servicosCanonicos = obterServicosManutencaoBase(preset);
  const idsServicos = new Set(servicosCanonicos.map((servico) => servico.id));
  const idsServicosExcepcionais = new Set(
    servicosCanonicos.filter((servico) => servico.ehExcepcional).map((servico) => servico.id),
  );

  const pecasOverrides = filtrarArray(perfil.pecasOverrides, (override) =>
    idsPecas.has(override.id),
  );
  const servicosIndependentes = filtrarArray(perfil.servicosIndependentes, (servico) =>
    idsServicos.has(servico.id),
  );
  const revisaoAutorizadaOverrides = filtrarArray(
    perfil.revisaoAutorizadaOverrides,
    (override) => override.index < preset.revisaoAutorizada.length,
  );
  const imprevistosSugeridosAtivos = filtrarRegistro(
    perfil.configuracaoDisplay.imprevistosSugeridosAtivos,
    idsServicosExcepcionais,
  );
  const manutencaoPorPeca = filtrarRegistro(
    perfil.configuracaoDisplay.filtrosManutencao.manutencaoPorPeca,
    idsPecas,
  );
  const revisaoPorServico = filtrarRegistro(
    perfil.configuracaoDisplay.filtrosManutencao.revisaoPorServico,
    idsServicos,
  );
  const estimativaAtual = perfil.perfilManutencao.estimativaMaoDeObraPorServico;
  const estimativaMaoDeObraPorServico = estimativaAtual
    ? filtrarRegistro(estimativaAtual, idsServicos)
    : estimativaAtual;

  const perfilManutencaoMudou = estimativaMaoDeObraPorServico !== estimativaAtual;
  const configuracaoDisplayMudou =
    imprevistosSugeridosAtivos !== perfil.configuracaoDisplay.imprevistosSugeridosAtivos ||
    manutencaoPorPeca !== perfil.configuracaoDisplay.filtrosManutencao.manutencaoPorPeca ||
    revisaoPorServico !== perfil.configuracaoDisplay.filtrosManutencao.revisaoPorServico;
  const perfilMudou =
    pecasOverrides !== perfil.pecasOverrides ||
    servicosIndependentes !== perfil.servicosIndependentes ||
    revisaoAutorizadaOverrides !== perfil.revisaoAutorizadaOverrides ||
    perfilManutencaoMudou ||
    configuracaoDisplayMudou;

  if (!perfilMudou) {
    return perfil;
  }

  return {
    ...perfil,
    perfilManutencao: perfilManutencaoMudou
      ? { ...perfil.perfilManutencao, estimativaMaoDeObraPorServico }
      : perfil.perfilManutencao,
    configuracaoDisplay: configuracaoDisplayMudou
      ? {
          ...perfil.configuracaoDisplay,
          imprevistosSugeridosAtivos,
          filtrosManutencao: {
            ...perfil.configuracaoDisplay.filtrosManutencao,
            manutencaoPorPeca,
            revisaoPorServico,
          },
        }
      : perfil.configuracaoDisplay,
    pecasOverrides,
    servicosIndependentes,
    revisaoAutorizadaOverrides,
  };
}
