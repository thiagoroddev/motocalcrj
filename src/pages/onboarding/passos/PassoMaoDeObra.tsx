import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { obterPreset } from '../../../data/repositorioPresets';
import { normalizarPerfilMvp } from '../../../hooks/useCustos';
import { obterServicosManutencaoBase } from '../../../utils/servicosManutencaoPreset';
import { concessionariaInformaPrecoCompleto } from '../../../utils/statusPrecoAutorizada';
import { montarEstimativaMaoDeObra, somarMaoDeObraEfetiva } from '../../../utils/maoDeObraEstimada';
import { ControleEstimativaMaoDeObra } from '../../../components/mao-de-obra/ControleEstimativaMaoDeObra';
import { CardServico } from '../../../components/mao-de-obra/CardServico';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PassoMaoDeObra() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const preset = obterPreset(perfil.moto.modelo);
  const perfilMvp = normalizarPerfilMvp(perfil, preset);
  const servicosPadrao = obterServicosManutencaoBase(preset);

  // Avulsos km-driven que NÃO têm preço completo de concessionária (peça + M.O.).
  // Inclui os Yamaha que informam só a M.O. (incompletos) — o usuário confere/edita
  // o valor; exclui só os Honda completos. O "completo" deriva do serviço-base. (BG-033)
  const avulsos = perfilMvp.servicosIndependentes.filter((s) => {
    if (s.ehExcepcional || s.incluidoNaRevisaoAutorizada || s.intervalKm <= 0) return false;
    const base = servicosPadrao.find((p) => p.id === s.id) ?? s;
    return !concessionariaInformaPrecoCompleto(base);
  });

  // Total dinâmico: começa em 0 (tudo sem valor/sem estimativa) e cresce conforme
  // o usuário edita ou liga estimativas (por item ou no toggle global).
  const { total, temEstimado } = somarMaoDeObraEfetiva(avulsos, perfil, preset);
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
          revisões periódicas. Para os <strong className="text-foreground">serviços avulsos</strong>{' '}
          abaixo a concessionária não publica o preço da mão de obra. Deixe em branco, digite o
          valor, ou peça uma <strong className="text-foreground">estimativa (~)</strong> — por item
          ou em todos pelo botão.
        </p>

        <ControleEstimativaMaoDeObra ligada={ligada} dispatch={dispatch} />

        {avulsos.length > 0 && (
          <>
            <div className="bg-card rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Mão de obra desses {avulsos.length} serviços
              </span>
              <span
                className={`text-lg font-bold ${temEstimado ? 'text-warning' : 'text-foreground'}`}
              >
                {temEstimado ? '~' : ''}
                {formatarMoeda(total)}
              </span>
            </div>

            <div className="space-y-2">
              {avulsos.map((s) => (
                <CardServico
                  key={s.id}
                  servico={s}
                  servicoPadrao={servicosPadrao.find((p) => p.id === s.id)}
                  dispatch={dispatch}
                  modo="autorizada"
                  estimativaMaoDeObra={montarEstimativaMaoDeObra(perfil, preset, s.id)}
                  ocultarIntervalo
                />
              ))}
            </div>
          </>
        )}
      </div>
    </PassoLayout>
  );
}
