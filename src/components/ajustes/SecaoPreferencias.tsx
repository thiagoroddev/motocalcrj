import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, ModoRevisao, ModoExibicao } from '../../types/perfil';
import { Segmentado } from '../Segmentado';

interface Props {
  perfilManutencao: PerfilUsuario['perfilManutencao'];
  modoExibicao: ModoExibicao;
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoPreferencias({ perfilManutencao, modoExibicao, dispatch }: Props) {
  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <p className="label-neutro">Preferências</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Manutenção / Peças</p>
      <Segmentado
        opcoes={[
          { label: 'Autorizada', valor: 'autorizadas' },
          { label: 'Independente', valor: 'independentes' },
        ]}
        valor={perfilManutencao.modoRevisao}
        onChange={(v) => dispatch({ type: 'SET_MODO_REVISAO', modo: v as ModoRevisao })}
      />
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Estimativa sobre dados</p>
      <Segmentado
        opcoes={[
          { label: 'Predefinidos', valor: 'predefinidos' },
          { label: '+ Registros', valor: 'personalizado' },
        ]}
        valor={modoExibicao}
        onChange={(v) => dispatch({ type: 'SET_MODO_EXIBICAO', modo: v as ModoExibicao })}
      />
    </section>
  );
}
