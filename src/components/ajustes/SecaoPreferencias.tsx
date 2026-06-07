import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction } from '../../types/perfil';
import { SlidersHorizontal } from 'lucide-react';
import { ControleEstimativaMaoDeObra } from '../mao-de-obra/ControleEstimativaMaoDeObra';
import { BotaoReset } from '../BotaoReset';
import { TituloSecao } from '@/components/TituloSecao';

interface Props {
  perfilManutencao: PerfilUsuario['perfilManutencao'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoPreferencias({ perfilManutencao, dispatch }: Props) {
  const temAlteracao =
    perfilManutencao.modoRevisao !== 'autorizadas' ||
    perfilManutencao.incluirEstimativaMaoDeObra === true;

  function resetar() {
    dispatch({ type: 'SET_MODO_REVISAO', modo: 'autorizadas' });
    dispatch({ type: 'SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA', valor: false });
  }

  return (
    <section className="bg-card rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <TituloSecao icone={SlidersHorizontal}>Preferências</TituloSecao>
        <BotaoReset desabilitado={!temAlteracao} onReset={resetar} />
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        Estimativas de mão de obra
      </p>
      <ControleEstimativaMaoDeObra
        ligada={perfilManutencao.incluirEstimativaMaoDeObra === true}
        dispatch={dispatch}
      />
    </section>
  );
}
