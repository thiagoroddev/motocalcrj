import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { Button } from '../../../components/ui/button';
import type { PerfilUso } from '../../../types/perfil';

const OPCOES: { valor: PerfilUso; titulo: string; descricao: string }[] = [
  {
    valor: 'entrega',
    titulo: 'Entregas',
    descricao: 'Motoboy, delivery - uso intenso e profissional',
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
      <div className="flex flex-col gap-2">
        {OPCOES.map((op) => (
          <Button
            key={op.valor}
            variant="outline"
            onClick={() => setPerfilUso(op.valor)}
            className={`w-full p-4 min-h-touch h-auto rounded-lg text-left justify-start flex-col items-start transition-colors ${
              perfilUso === op.valor ? 'border-primary bg-primary/20' : 'border-muted bg-card'
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
