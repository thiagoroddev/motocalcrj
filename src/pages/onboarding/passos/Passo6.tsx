import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../../../hooks/usePerfil';
import { PassoLayout } from '../PassoLayout';
import { getProximoPasso } from '../onboardingUtils';
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
    // Usa situacao local — não perfil.financeiro.situacaoMoto que ainda é o valor antigo
    const proximo = getProximoPasso('6', situacao);
    if (proximo && proximo !== 'concluir') {
      navigate(`/onboarding/${proximo}`);
    }
  }

  return (
    <PassoLayout titulo="Qual a situação da sua moto?" aoProximo={salvarEAvancar}>
      <div className="flex flex-col gap-sm">
        {OPCOES.map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => setSituacao(op.valor)}
            className={`p-md rounded-card border text-left transition-colors ${
              situacao === op.valor ? 'border-primary bg-primary/20' : 'border-muted bg-card'
            }`}
          >
            <p className="text-foreground font-semibold">{op.titulo}</p>
            <p className="text-muted-foreground text-sm mt-xs">{op.descricao}</p>
          </button>
        ))}
      </div>
    </PassoLayout>
  );
}
