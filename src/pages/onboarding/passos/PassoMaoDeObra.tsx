import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { obterPreset } from '../../../data/repositorioPresets';
import { normalizarPerfilMvp } from '../../../hooks/useCustos';
import { resolverStatusPrecoAutorizada } from '../../../utils/statusPrecoAutorizada';
import { somarMaoDeObraEstimavel } from '../../../utils/maoDeObraEstimada';
import { ControleEstimativaMaoDeObra } from '../../../components/mao-de-obra/ControleEstimativaMaoDeObra';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PassoMaoDeObra() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const preset = obterPreset(perfil.moto.modelo);
  const perfilMvp = normalizarPerfilMvp(perfil, preset);

  // Avulsos km-driven sem valor oficial: são os que a estimativa (~) completaria.
  const avulsosSemValor = perfilMvp.servicosIndependentes.filter(
    (s) =>
      !s.ehExcepcional &&
      !s.incluidoNaRevisaoAutorizada &&
      s.intervalKm > 0 &&
      resolverStatusPrecoAutorizada(s) === 'nao_informado',
  );
  const { total: totalEstimado, quantidade } = somarMaoDeObraEstimavel(
    avulsosSemValor,
    preset?.marca,
    preset?.fatorMaoDeObra ?? 1,
  );
  const ligada = perfil.perfilManutencao.incluirEstimativaMaoDeObra === true;

  return (
    <PassoLayout
      titulo="Valor de mão de obra"
      subtitulo="Como o app trata a mão de obra que a concessionária não informa"
      aoProximo={irParaProximo}
      podeContinuar
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          O app usa os <strong className="text-foreground">valores oficiais</strong> para as
          revisões periódicas. Para alguns{' '}
          <strong className="text-foreground">serviços avulsos</strong>, porém, a concessionária não
          publica o preço da mão de obra. Você pode deixá-los em branco ou pedir uma{' '}
          <strong className="text-foreground">estimativa (~)</strong> — para todos de uma vez agora,
          ou item a item depois.
        </p>

        <ControleEstimativaMaoDeObra ligada={ligada} dispatch={dispatch} />

        {quantidade > 0 && (
          <div className="bg-card rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Exemplo — {quantidade} serviço{quantidade === 1 ? '' : 's'} sem valor oficial
            </p>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Padrão (sem estimativa)</span>
              <span className="text-foreground font-semibold">{formatarMoeda(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Estimado</span>
              <span className="text-warning font-semibold">~{formatarMoeda(totalEstimado)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground/60 pt-1">
              Mão de obra estimada por ciclo dos serviços sem valor oficial; os valores oficiais não
              mudam.
            </p>
          </div>
        )}
      </div>
    </PassoLayout>
  );
}
