import type { Dispatch } from 'react';
import type { PerfilAction } from '../../types/perfil';
import { Segmentado } from '../Segmentado';

interface Props {
  // Reflete `perfilManutencao.incluirEstimativaMaoDeObra` (modo global).
  ligada: boolean;
  dispatch: Dispatch<PerfilAction>;
  className?: string;
}

// Controle único do modo de estimativa de M.O. (ADR-013/014). Usado no popup do
// Detalhamento, em Ajustes (Preferências) e na tela de onboarding de mão de obra,
// para que o rótulo e a semântica fiquem em um só lugar.
export function ControleEstimativaMaoDeObra({ ligada, dispatch, className }: Props) {
  return (
    <div className={`space-y-2${className ? ` ${className}` : ''}`}>
      <Segmentado
        opcoes={[
          { label: 'Padrão', valor: 'nao' },
          { label: 'Estimado', valor: 'sim' },
        ]}
        valor={ligada ? 'sim' : 'nao'}
        onChange={(v) =>
          dispatch({ type: 'SET_INCLUIR_ESTIMATIVA_MAO_DE_OBRA', valor: v === 'sim' })
        }
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground/70">
        <strong className="text-foreground">Padrão:</strong> usa só os valores reais; cada serviço
        sem valor ainda pode ser estimado (~) ou digitado individualmente.{' '}
        <strong className="text-foreground">Estimado:</strong> aplica a estimativa (~) em todos os
        serviços sem valor oficial, sem edição. Onde há valor real, ele sempre prevalece.
      </p>
    </div>
  );
}
