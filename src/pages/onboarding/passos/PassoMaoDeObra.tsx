import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { obterPreset } from '../../../data/repositorioPresets';
import { normalizarPerfilMvp } from '../../../hooks/useCustos';
import { obterServicosManutencaoBase } from '../../../utils/servicosManutencaoPreset';
import { concessionariaInformaPrecoCompleto } from '../../../utils/statusPrecoAutorizada';
import { montarEstimativaMaoDeObra, somarMaoDeObraEfetiva } from '../../../utils/maoDeObraEstimada';
import { SecaoServicosExtras } from '../../../components/mao-de-obra/SecaoServicosExtras';
import type { ServicoIndependente } from '../../../types/perfil';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PassoMaoDeObra() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const preset = obterPreset(perfil.moto.modelo);
  const perfilMvp = normalizarPerfilMvp(perfil, preset);
  const servicosPadrao = obterServicosManutencaoBase(preset);

  // Avulsos km-driven, divididos em Completo (Honda: peça + M.O.) e Incompleto
  // (só M.O.) pelo serviço-base — mesmas subseções da aba Mão de Obra. (BG-033/BG-035)
  const avulsos = perfilMvp.servicosIndependentes.filter(
    (s) =>
      !s.ehExcepcional &&
      !s.incluidoNaRevisaoAutorizada &&
      // Bateria (TASK-RF-8.5): temporal (intervalKm 0), mas deve aparecer aqui também.
      (s.intervalKm > 0 || s.id === 'troca-bateria'),
  );
  const ehCompleto = (s: ServicoIndependente) =>
    concessionariaInformaPrecoCompleto(servicosPadrao.find((p) => p.id === s.id) ?? s);
  const avulsosCompletos = avulsos.filter(ehCompleto);
  const avulsosIncompletos = avulsos.filter((s) => !ehCompleto(s));

  // Total dinâmico só dos INCOMPLETOS (a M.O. que o usuário preenche/estima);
  // começa em 0 e cresce com edição/estimativa.
  const { total, temEstimado } = somarMaoDeObraEfetiva(avulsosIncompletos, perfil, preset);
  const ligada = perfil.perfilManutencao.incluirEstimativaMaoDeObra === true;

  const cardTotalIncompletos = (
    <div className="bg-card rounded-lg p-4 flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        Mão de obra desses {avulsosIncompletos.length} serviços
      </span>
      <span className={`text-lg font-bold ${temEstimado ? 'text-warning' : 'text-foreground'}`}>
        {temEstimado ? '~' : ''}
        {formatarMoeda(total)}
      </span>
    </div>
  );

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
          revisões periódicas. Para os <strong className="text-foreground">serviços avulsos</strong>{' '}
          abaixo: no <strong className="text-foreground">Valor Completo</strong> a concessionária dá
          o preço cheio; no <strong className="text-foreground">Valor Incompleto</strong> você
          coloca só a mão de obra (ou pede uma{' '}
          <strong className="text-foreground">estimativa (~)</strong>).
        </p>

        <SecaoServicosExtras
          avulsosCompletos={avulsosCompletos}
          avulsosIncompletos={avulsosIncompletos}
          servicosPadrao={servicosPadrao}
          estimativaLigada={ligada}
          dispatch={dispatch}
          montarEstimativa={(s) => montarEstimativaMaoDeObra(perfil, preset, s.id)}
          ocultarIntervalo
          mostrarTitulo={false}
          slotAposToggle={cardTotalIncompletos}
        />
      </div>
    </PassoLayout>
  );
}
