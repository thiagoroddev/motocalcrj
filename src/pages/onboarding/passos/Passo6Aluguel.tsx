import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import type { PeriodicidadeAluguel } from '../../../types/perfil';

export function Passo6Aluguel() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const fin = perfil.financeiro;
  const [aluguel, setAluguel] = useState(fin.aluguelValor != null ? String(fin.aluguelValor) : '');
  const [periodicidade, setPeriodicidade] = useState<PeriodicidadeAluguel>(
    fin.aluguelPeriodicidade ?? 'mensal',
  );

  const aluguelNum = parseFloat(aluguel);
  const valido = !isNaN(aluguelNum) && aluguelNum > 0;

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: { ...fin, aluguelValor: aluguelNum, aluguelPeriodicidade: periodicidade },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Detalhes do aluguel"
      subtitulo="Quanto você paga e com qual frequência"
      aoProximo={salvarEAvancar}
      podeContinuar={valido}
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">Valor do aluguel (R$)</span>
          <Input
            type="number"
            value={aluguel}
            onChange={(e) => setAluguel(e.target.value)}
            min={0}
            step={0.01}
            placeholder="0,00"
            className="min-h-touch bg-card rounded-input border-muted text-foreground px-4 placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">Periodicidade</span>
          <div className="flex gap-2">
            {(['mensal', 'semanal'] as PeriodicidadeAluguel[]).map((p) => (
              <Button
                key={p}
                onClick={() => setPeriodicidade(p)}
                className={`flex-1 min-h-touch rounded-btn text-sm font-semibold transition-colors ${
                  periodicidade === p
                    ? 'bg-primary text-foreground hover:bg-primary/90'
                    : 'bg-card border border-muted text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {p === 'mensal' ? 'Mensal' : 'Semanal'}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </PassoLayout>
  );
}
