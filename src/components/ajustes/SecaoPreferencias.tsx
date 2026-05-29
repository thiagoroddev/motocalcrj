import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, ModoRevisao, PerfilUso } from '../../types/perfil';
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
    perfilManutencao.modoRevisao !== 'independentes' || moto.perfilUso !== 'entrega';

  function resetar() {
    dispatch({ type: 'SET_MODO_REVISAO', modo: 'independentes' });
    dispatch({ type: 'SET_PERFIL_USO', perfilUso: 'entrega' });
  }

  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <div className="flex items-center justify-between">
        <TituloSecao icone={SlidersHorizontal}>Preferências</TituloSecao>
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
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Perfil de trabalho</p>
      <Segmentado
        opcoes={[
          { label: 'Entrega', valor: 'entrega' },
          { label: 'Passageiro', valor: 'passageiro' },
        ]}
        valor={moto.perfilUso}
        onChange={(v) => dispatch({ type: 'SET_PERFIL_USO', perfilUso: v as PerfilUso })}
      />
    </section>
  );
}
