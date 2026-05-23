import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, ModoRevisao } from '../../types/perfil';
import { Segmentado } from '../Segmentado';
import { BotaoReset } from '../BotaoReset';

interface Props {
  perfilManutencao: PerfilUsuario['perfilManutencao'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoPreferencias({ perfilManutencao, dispatch }: Props) {
  const temAlteracao = perfilManutencao.modoRevisao !== 'independentes';

  function resetar() {
    dispatch({ type: 'SET_MODO_REVISAO', modo: 'independentes' });
  }

  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-neutro">Preferências</p>
        <BotaoReset desabilitado={!temAlteracao} onReset={resetar} />
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Manutenção / Peças</p>
      <Segmentado
        opcoes={[
          { label: 'Autorizada', valor: 'autorizadas' },
          { label: 'Independente', valor: 'independentes' },
        ]}
        valor={perfilManutencao.modoRevisao}
        onChange={(v) => dispatch({ type: 'SET_MODO_REVISAO', modo: v as ModoRevisao })}
      />
    </section>
  );
}
