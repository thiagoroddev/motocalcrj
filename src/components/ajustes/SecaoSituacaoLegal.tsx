import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, SituacaoMoto } from '../../types/perfil';
import { Scale } from 'lucide-react';
import { Segmentado } from '../Segmentado';
import { BotaoReset } from '../BotaoReset';
import { TituloSecao } from '@/components/TituloSecao';
import { CampoFinanciamento } from './campos/CampoFinanciamento';

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoSituacaoLegal({ financeiro, dispatch }: Props) {
  const { situacaoMoto } = financeiro;

  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <div className="flex items-center justify-between">
        <TituloSecao icone={Scale}>Situação Legal</TituloSecao>
        <BotaoReset
          desabilitado={situacaoMoto === 'quitada'}
          onReset={() => dispatch({ type: 'SET_SITUACAO_MOTO', situacao: 'quitada' })}
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Tipo de aquisição</p>
        <Segmentado
          opcoes={[
            { label: 'Quitada', valor: 'quitada' },
            { label: 'Financiada', valor: 'financiada' },
            { label: 'Alugada', valor: 'alugada' },
          ]}
          valor={situacaoMoto}
          onChange={(v) => dispatch({ type: 'SET_SITUACAO_MOTO', situacao: v as SituacaoMoto })}
        />
      </div>
      <CampoFinanciamento financeiro={financeiro} dispatch={dispatch} />
    </section>
  );
}
