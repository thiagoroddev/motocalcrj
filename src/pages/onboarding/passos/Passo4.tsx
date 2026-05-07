import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import type { PerfilUso } from '../../../types/perfil';

const OPCOES: { valor: PerfilUso; titulo: string; descricao: string }[] = [
  {
    valor: 'entrega',
    titulo: 'Entregas',
    descricao: 'Motoboy, delivery — uso intenso e profissional',
  },
  {
    valor: 'passageiro',
    titulo: 'Passageiro',
    descricao: 'Mototáxi, transporte de pessoas',
  },
];

export function Passo4() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();
  const [perfilUso, setPerfilUso] = useState<PerfilUso>(perfil.moto.perfilUso);

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'moto',
      valor: { ...perfil.moto, perfilUso },
    });
    irParaProximo();
  }

  return (
    <PassoLayout titulo="Como você usa a moto?" aoProximo={salvarEAvancar}>
      <div className="flex flex-col gap-sm">
        {OPCOES.map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => setPerfilUso(op.valor)}
            className={`p-md rounded-card border text-left transition-colors ${
              perfilUso === op.valor
                ? 'border-primary bg-primary/20'
                : 'border-surface-bright bg-surface-cont'
            }`}
          >
            <p className="text-white font-semibold">{op.titulo}</p>
            <p className="text-neutral text-sm mt-xs">{op.descricao}</p>
          </button>
        ))}
      </div>
    </PassoLayout>
  );
}
