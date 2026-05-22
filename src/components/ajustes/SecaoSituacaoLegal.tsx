import type { Dispatch } from 'react';
import type {
  PerfilUsuario,
  PerfilAction,
  SituacaoMoto,
  PeriodicidadeAluguel,
} from '../../types/perfil';
import { Input } from '../ui/input';
import { Segmentado } from '../Segmentado';
import { BotaoReset } from '../BotaoReset';

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoSituacaoLegal({ financeiro, dispatch }: Props) {
  const { situacaoMoto } = financeiro;

  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-neutro">Situação Legal</p>
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
      {situacaoMoto === 'financiada' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Valor parcela (R$)</p>
            <Input
              type="number"
              value={financeiro.parcelaMensal ?? ''}
              min={0}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value;
                const v = parseFloat(raw);
                dispatch({
                  type: 'SET_PARCELA',
                  parcelaMensal: raw === '' ? null : isNaN(v) ? null : v,
                  parcelasRestantes: financeiro.parcelasRestantes,
                });
              }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Restantes</p>
            <Input
              type="number"
              value={financeiro.parcelasRestantes ?? ''}
              min={0}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value;
                const v = parseInt(raw, 10);
                dispatch({
                  type: 'SET_PARCELA',
                  parcelaMensal: financeiro.parcelaMensal,
                  parcelasRestantes: raw === '' ? null : isNaN(v) ? null : v,
                });
              }}
            />
          </div>
        </div>
      )}
      {situacaoMoto === 'alugada' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Aluguel mensal (R$)</p>
            <Input
              type="number"
              value={financeiro.aluguelMensal ?? ''}
              min={0}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value;
                const v = parseFloat(raw);
                dispatch({
                  type: 'SET_ALUGUEL',
                  aluguelMensal: raw === '' ? null : isNaN(v) ? null : v,
                  aluguelPeriodicidade: financeiro.aluguelPeriodicidade,
                });
              }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Periodicidade</p>
            <Segmentado
              opcoes={[
                { label: 'Mensal', valor: 'mensal' },
                { label: 'Semanal', valor: 'semanal' },
              ]}
              valor={financeiro.aluguelPeriodicidade ?? 'mensal'}
              onChange={(v) =>
                dispatch({
                  type: 'SET_ALUGUEL',
                  aluguelMensal: financeiro.aluguelMensal,
                  aluguelPeriodicidade: v as PeriodicidadeAluguel,
                })
              }
            />
          </div>
        </div>
      )}
    </section>
  );
}
