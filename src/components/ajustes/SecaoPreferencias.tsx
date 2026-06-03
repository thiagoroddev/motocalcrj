import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, PerfilUso } from '../../types/perfil';
import { SlidersHorizontal } from 'lucide-react';
import { Segmentado } from '../Segmentado';
import { BotaoReset } from '../BotaoReset';
import { TituloSecao } from '@/components/TituloSecao';

interface Props {
  perfilManutencao: PerfilUsuario['perfilManutencao'];
  moto: PerfilUsuario['moto'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoPreferencias({ perfilManutencao, moto, dispatch }: Props) {
  const temAlteracao =
    perfilManutencao.modoRevisao !== 'autorizadas' ||
    moto.perfilUso !== 'entrega' ||
    perfilManutencao.incluirEstimativaMaoDeObra === true;

  function resetar() {
    dispatch({ type: 'SET_MODO_REVISAO', modo: 'autorizadas' });
    dispatch({ type: 'SET_PERFIL_USO', perfilUso: 'entrega' });
    dispatch({ type: 'SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA', valor: false });
  }

  return (
    <section className="bg-card rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <TituloSecao icone={SlidersHorizontal}>Preferências</TituloSecao>
        <BotaoReset desabilitado={!temAlteracao} onReset={resetar} />
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Perfil de trabalho</p>
      <Segmentado
        opcoes={[
          { label: 'Entrega', valor: 'entrega' },
          { label: 'Passageiro', valor: 'passageiro' },
        ]}
        valor={moto.perfilUso}
        onChange={(v) => dispatch({ type: 'SET_PERFIL_USO', perfilUso: v as PerfilUso })}
      />
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        Estimativas de mão de obra
      </p>
      <Segmentado
        opcoes={[
          { label: 'Só valor real', valor: 'nao' },
          { label: 'Incluir ~estimativa', valor: 'sim' },
        ]}
        valor={perfilManutencao.incluirEstimativaMaoDeObra ? 'sim' : 'nao'}
        onChange={(v) =>
          dispatch({ type: 'SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA', valor: v === 'sim' })
        }
      />
      <p className="text-[10px] text-muted-foreground/60 leading-tight">
        Completa a mão de obra que a concessionária não informa com uma estimativa (~), marcada como
        aproximada. Desligado, o custo mostra só valores reais.
      </p>
    </section>
  );
}
