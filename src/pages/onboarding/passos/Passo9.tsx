import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export function Passo9() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const [comeNaRua, setComeNaRua] = useState(perfil.financeiro.alimentacaoDia > 0);
  const [gastoDia, setGastoDia] = useState(
    perfil.financeiro.alimentacaoDia > 0 ? String(perfil.financeiro.alimentacaoDia) : '20',
  );

  function salvarEAvancar() {
    const gastoDiaNum = parseFloat(gastoDia);
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: {
        ...perfil.financeiro,
        alimentacaoDia: comeNaRua && !isNaN(gastoDiaNum) && gastoDiaNum > 0 ? gastoDiaNum : 0,
      },
    });
    irParaProximo();
  }

  const cardClassName = (ativo: boolean) =>
    `flex flex-col items-center gap-1 p-4 min-h-touch h-auto rounded-lg border-2 transition-colors w-full ${
      ativo
        ? 'border-primary bg-primary/10 text-foreground hover:bg-primary/20'
        : 'border-muted bg-card text-muted-foreground hover:bg-muted/50'
    }`;

  return (
    <PassoLayout
      titulo="Alimentação no trabalho"
      subtitulo="Você costuma comer fora durante o expediente?"
      aoProximo={salvarEAvancar}
      textoBotao="Próximo →"
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setComeNaRua(true)} className={cardClassName(comeNaRua)}>
            <span className="text-2xl">🍴</span>
            <span className="text-sm font-medium text-center">Sim, como na rua</span>
          </Button>

          <Button onClick={() => setComeNaRua(false)} className={cardClassName(!comeNaRua)}>
            <span className="text-2xl">🥡</span>
            <span className="text-sm font-medium text-center">Não, levo de casa</span>
          </Button>
        </div>

        {comeNaRua && (
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm font-medium">
              Gasto médio por dia (R$)
            </span>
            <Input
              type="number"
              value={gastoDia}
              onChange={(e) => setGastoDia(e.target.value)}
              min={0}
              step={0.01}
              placeholder="20,00"
              className="min-h-touch bg-card rounded-input border-muted text-foreground px-4 placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </label>
        )}

        <p className="text-muted-foreground/50 text-xs text-center">
          Fique tranquilo! Estes valores podem ser atualizados a qualquer momento em Configurações.
        </p>
      </div>
    </PassoLayout>
  );
}
