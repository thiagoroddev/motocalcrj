import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { getMarcasDisponiveis } from '../../../data/catalogoModelos';
import { Button } from '../../../components/ui/button';

const MARCAS = getMarcasDisponiveis();

export function Passo1() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const marcaAtual = MARCAS.includes(perfil.moto.marca) ? perfil.moto.marca : '';
  const [marca, setMarca] = useState(marcaAtual);

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'moto',
      valor: { ...perfil.moto, marca, modelo: '' },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Qual a marca da sua moto?"
      subtitulo="Apenas modelos com dados completos disponíveis"
      aoProximo={salvarEAvancar}
      podeContinuar={marca.length > 0}
    >
      <div className="flex flex-col gap-2">
        {MARCAS.map((m) => (
          <Button
            key={m}
            variant="outline"
            onClick={() => setMarca(m)}
            className={`w-full p-4 min-h-touch h-auto rounded-lg text-left justify-start transition-colors ${
              marca === m ? 'border-primary bg-primary/20' : 'border-muted bg-card'
            }`}
          >
            <p className="text-foreground font-semibold">{m}</p>
          </Button>
        ))}
      </div>

      <p className="text-muted-foreground/50 text-xs mt-6 text-center">
        Mais modelos serão adicionados em breve
      </p>
    </PassoLayout>
  );
}
