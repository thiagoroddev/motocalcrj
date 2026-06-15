import { useId } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { SecaoUltimasManutencoes } from '../../../components/ajustes/SecaoUltimasManutencoes';
import { CardBateria } from '../../../components/ajustes/CardBateria';
import { Input } from '../../../components/ui/input';

export function Passo5Manutencoes() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();
  const idRevisao = useId();

  const { kmAtual, kmUltimaRevisao } = perfil.moto;

  return (
    <PassoLayout
      titulo="Últimas manutenções do veículo"
      subtitulo="Quanto mais você informar, mais precisas ficam as previsões - mas é tudo opcional"
      aoProximo={irParaProximo}
      podeContinuar
    >
      <div className="flex flex-col gap-4">
        <section className="bg-card rounded-lg p-4 space-y-3">
          <div className="flex items-stretch gap-2">
            <div className="flex-1 rounded-input bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">KM atual</p>
              <p className="text-foreground text-lg font-semibold">
                {kmAtual.toLocaleString('pt-BR')} km
              </p>
            </div>
            <div className="flex-1 space-y-1">
              <label htmlFor={idRevisao} className="text-xs text-muted-foreground">
                KM da última revisão geral
              </label>
              <Input
                id={idRevisao}
                type="number"
                inputMode="numeric"
                value={kmUltimaRevisao ?? ''}
                min={0}
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.value;
                  const v = parseInt(raw, 10);
                  if (raw === '') {
                    dispatch({ type: 'SET_KM_ULTIMA_REVISAO', km: null });
                    return;
                  }
                  if (!isNaN(v) && v >= 0) {
                    dispatch({ type: 'SET_KM_ULTIMA_REVISAO', km: v });
                  }
                }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Informar o km da última revisão e das trocas ancora o cálculo no seu histórico real;
            deixar em branco faz o app distribuir o desgaste ao longo do tempo.
          </p>
        </section>

        <SecaoUltimasManutencoes moto={perfil.moto} dispatch={dispatch} />
        <CardBateria
          bateria={perfil.perfilManutencao.bateria}
          anoMoto={perfil.moto.ano}
          dispatch={dispatch}
        />
      </div>
    </PassoLayout>
  );
}
