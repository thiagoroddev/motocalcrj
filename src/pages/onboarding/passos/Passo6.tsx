import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../../../hooks/usePerfil';
import { PassoLayout } from '../PassoLayout';
import { getProximoPasso } from '../onboardingUtils';
import { Button } from '../../../components/ui/button';
import type { SituacaoMoto } from '../../../types/perfil';

const OPCOES: { valor: SituacaoMoto; titulo: string; descricao: string }[] = [
  { valor: 'quitada', titulo: 'Quitada', descricao: 'Moto paga, sem parcelas' },
  { valor: 'financiada', titulo: 'Financiada', descricao: 'Ainda pagando parcelas' },
  { valor: 'alugada', titulo: 'Alugada', descricao: 'Moto de terceiros ou locadora' },
];

export function Passo6() {
  const { perfil, dispatch } = usePerfil();
  const navigate = useNavigate();
  const [situacao, setSituacao] = useState<SituacaoMoto>(perfil.financeiro.situacaoMoto);

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: { ...perfil.financeiro, situacaoMoto: situacao },
    });
    // Usa situacao local - não perfil.financeiro.situacaoMoto que ainda é o valor antigo
    const proximo = getProximoPasso('situacao', situacao);
    if (proximo && proximo !== 'concluir') {
      navigate(`/onboarding/${proximo}`);
    }
  }

  return (
    <PassoLayout titulo="Qual a situação da sua moto?" aoProximo={salvarEAvancar}>
      <div className="flex flex-col gap-2">
        {OPCOES.map((op) => (
          <Button
            key={op.valor}
            variant="outline"
            onClick={() => setSituacao(op.valor)}
            className={`w-full p-4 min-h-touch h-auto rounded-lg text-left justify-start flex-col items-start transition-colors ${
              situacao === op.valor ? 'border-primary bg-primary/20' : 'border-muted bg-card'
            }`}
          >
            <p className="text-foreground font-semibold">{op.titulo}</p>
            <p className="text-muted-foreground text-sm mt-1">{op.descricao}</p>
          </Button>
        ))}
      </div>
    </PassoLayout>
  );
}
