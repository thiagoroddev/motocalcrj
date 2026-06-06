import { useId } from 'react';
import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, PeriodicidadeAluguel } from '../../../types/perfil';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Segmentado } from '../../Segmentado';
import { calcularParcelasRestantesAtuais } from '../../../utils/calculos';

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

/**
 * Renderiza apenas o bloco condicional de financiamento/aluguel baseado
 * em `situacaoMoto`. Para 'quitada', não renderiza nada. O Segmentado
 * de troca de tipo (Quitada/Financiada/Alugada) fica em `SecaoSituacaoLegal`.
 */
export function CampoFinanciamento({ financeiro, dispatch }: Props) {
  const idParcela = useId();
  const idRestantes = useId();
  const idAluguel = useId();
  const { situacaoMoto } = financeiro;

  if (situacaoMoto === 'financiada') {
    // Mostra as parcelas que faltam HOJE (derivado pelo tempo). Ao editar, o
    // valor digitado vira o novo snapshot - o reducer re-ancora a referência.
    const restantesHoje = calcularParcelasRestantesAtuais(
      financeiro.parcelasRestantes,
      financeiro.dataReferenciaParcelas,
    );
    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={idParcela} className="text-xs text-muted-foreground font-normal">
            Valor parcela (R$)
          </Label>
          <Input
            id={idParcela}
            type="number"
            inputMode="decimal"
            value={financeiro.parcelaMensal ?? ''}
            min={0}
            placeholder="0"
            onChange={(e) => {
              const raw = e.target.value;
              const v = parseFloat(raw);
              if (raw === '') {
                dispatch({
                  type: 'SET_PARCELA',
                  parcelaMensal: null,
                  parcelasRestantes: financeiro.parcelasRestantes,
                });
                return;
              }
              if (!isNaN(v) && v >= 0) {
                dispatch({
                  type: 'SET_PARCELA',
                  parcelaMensal: v,
                  parcelasRestantes: financeiro.parcelasRestantes,
                });
              }
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={idRestantes} className="text-xs text-muted-foreground font-normal">
            Restantes
          </Label>
          <Input
            id={idRestantes}
            type="number"
            inputMode="numeric"
            value={financeiro.parcelasRestantes == null ? '' : restantesHoje}
            min={0}
            placeholder="0"
            onChange={(e) => {
              const raw = e.target.value;
              const v = parseInt(raw, 10);
              if (raw === '') {
                dispatch({
                  type: 'SET_PARCELA',
                  parcelaMensal: financeiro.parcelaMensal,
                  parcelasRestantes: null,
                });
                return;
              }
              if (!isNaN(v) && v >= 0) {
                dispatch({
                  type: 'SET_PARCELA',
                  parcelaMensal: financeiro.parcelaMensal,
                  parcelasRestantes: v,
                });
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (situacaoMoto === 'alugada') {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor={idAluguel} className="text-xs text-muted-foreground font-normal">
            Aluguel mensal (R$)
          </Label>
          <Input
            id={idAluguel}
            type="number"
            inputMode="decimal"
            value={financeiro.aluguelValor ?? ''}
            min={0}
            placeholder="0"
            onChange={(e) => {
              const raw = e.target.value;
              const v = parseFloat(raw);
              if (raw === '') {
                dispatch({
                  type: 'SET_ALUGUEL',
                  aluguelValor: null,
                  aluguelPeriodicidade: financeiro.aluguelPeriodicidade,
                });
                return;
              }
              if (!isNaN(v) && v >= 0) {
                dispatch({
                  type: 'SET_ALUGUEL',
                  aluguelValor: v,
                  aluguelPeriodicidade: financeiro.aluguelPeriodicidade,
                });
              }
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
                aluguelValor: financeiro.aluguelValor,
                aluguelPeriodicidade: v as PeriodicidadeAluguel,
              })
            }
          />
        </div>
      </div>
    );
  }

  return null;
}
