import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { obterPreset } from '../../../data/repositorioPresets';
import { normalizarPerfilMvp } from '../../../hooks/useCustos';
import { CardVidaUtilOnboarding } from '../../../components/onboarding/CardVidaUtilOnboarding';

export function Passo4() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const preset = obterPreset(perfil.moto.modelo);
  const perfilMvp = normalizarPerfilMvp(perfil, preset);
  // Mesmos avulsos da aba Mão de Obra (Concessionária): km-driven, fora das
  // revisões fixas e não excepcionais. A lista varia por preset/marca.
  const avulsos = perfilMvp.servicosIndependentes.filter(
    (servico) =>
      !servico.ehExcepcional && !servico.incluidoNaRevisaoAutorizada && servico.intervalKm > 0,
  );

  return (
    <PassoLayout titulo="Vida útil das peças" aoProximo={irParaProximo}>
      <p className="text-muted-foreground text-sm mb-4">
        São estimativas para uso profissional/intenso. Você pode ajustá-las agora ou depois na tela
        de Mão de Obra, se discordar de alguma.
      </p>
      <div className="flex flex-col gap-2">
        {avulsos.map((servico) => (
          <CardVidaUtilOnboarding key={servico.id} servico={servico} dispatch={dispatch} />
        ))}
      </div>
    </PassoLayout>
  );
}
