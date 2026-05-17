import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { getMarcasDisponiveis } from '../../../data/catalogoModelos';

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
      <div className="flex flex-col gap-sm">
        {MARCAS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMarca(m)}
            className={`p-md rounded-card border text-left transition-colors ${
              marca === m ? 'border-primary bg-primary/20' : 'border-muted bg-card'
            }`}
          >
            <p className="text-foreground font-semibold">{m}</p>
          </button>
        ))}
      </div>

      <p className="text-muted-foreground/50 text-xs mt-lg text-center">
        Mais modelos serão adicionados em breve
      </p>
    </PassoLayout>
  );
}
