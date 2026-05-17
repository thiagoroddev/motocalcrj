import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';

export function Passo6Financiamento() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const fin = perfil.financeiro;
  const [parcela, setParcela] = useState(
    fin.parcelaMensal != null ? String(fin.parcelaMensal) : '',
  );
  const [restantes, setRestantes] = useState(
    fin.parcelasRestantes != null ? String(fin.parcelasRestantes) : '',
  );

  const parcelaNum = parseFloat(parcela);
  const restantesNum = parseInt(restantes, 10);
  const valido = !isNaN(parcelaNum) && parcelaNum > 0 && !isNaN(restantesNum) && restantesNum >= 1;

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: { ...fin, parcelaMensal: parcelaNum, parcelasRestantes: restantesNum },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Detalhes do financiamento"
      subtitulo="Informe o valor da parcela e quantas faltam"
      aoProximo={salvarEAvancar}
      podeContinuar={valido}
    >
      <div className="flex flex-col gap-md">
        <label className="flex flex-col gap-xs">
          <span className="text-muted-foreground text-sm font-medium">Parcela mensal (R$)</span>
          <input
            type="number"
            value={parcela}
            onChange={(e) => setParcela(e.target.value)}
            min={0}
            step={0.01}
            placeholder="0,00"
            className="min-h-touch bg-card rounded-input border border-muted text-foreground px-md placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-xs">
          <span className="text-muted-foreground text-sm font-medium">Parcelas restantes</span>
          <input
            type="number"
            value={restantes}
            onChange={(e) => setRestantes(e.target.value)}
            min={1}
            placeholder="12"
            className="min-h-touch bg-card rounded-input border border-muted text-foreground px-md placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
          />
        </label>
      </div>
    </PassoLayout>
  );
}
