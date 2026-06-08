import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { getMarcasDisponiveis, getModelosPorMarca } from '../../../data/catalogoModelos';
import { Button } from '../../../components/ui/button';

// Etapa única de marca + modelo (ADR-020, passo 1; unifica os antigos Passo1/Passo2).
export function PassoModelo() {
  const MARCAS = getMarcasDisponiveis();
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const marcaInicial = MARCAS.includes(perfil.moto.marca)
    ? perfil.moto.marca
    : MARCAS.length === 1
      ? MARCAS[0]
      : '';
  const [marca, setMarca] = useState(marcaInicial);
  const [modelo, setModelo] = useState(() => {
    const modelos = getModelosPorMarca(marcaInicial);
    if (modelos.some((m) => m.id === perfil.moto.modelo)) return perfil.moto.modelo;
    return modelos.length === 1 ? modelos[0].id : '';
  });

  const modelos = getModelosPorMarca(marca);

  function selecionarMarca(novaMarca: string) {
    if (novaMarca === marca) return;
    setMarca(novaMarca);
    const modelosDaMarca = getModelosPorMarca(novaMarca);
    // Auto-seleciona o modelo quando a marca só tem um; senão limpa para forçar escolha.
    setModelo(modelosDaMarca.length === 1 ? modelosDaMarca[0].id : '');
  }

  function salvarEAvancar() {
    if (!modelo) return;
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'moto',
      valor: { ...perfil.moto, marca, modelo },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Qual a sua moto?"
      subtitulo="Marca e modelo — apenas modelos com dados completos"
      aoProximo={salvarEAvancar}
      podeContinuar={modelo.length > 0}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm font-medium">Marca</span>
          <div className="flex flex-wrap gap-2">
            {MARCAS.map((m) => (
              <Button
                key={m}
                variant="outline"
                onClick={() => selecionarMarca(m)}
                className={`flex-1 min-w-[40%] p-4 min-h-touch h-auto rounded-lg text-left justify-start transition-colors ${
                  marca === m ? 'border-primary bg-primary/20' : 'border-muted bg-card'
                }`}
              >
                <p className="text-foreground font-semibold">{m}</p>
              </Button>
            ))}
          </div>
        </div>

        {marca && (
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-sm font-medium">Modelo</span>
            {modelos.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum modelo disponível para {marca} ainda.
              </p>
            ) : (
              modelos.map((m) => (
                <Button
                  key={m.id}
                  variant="outline"
                  onClick={() => setModelo(m.id)}
                  className={`w-full p-4 min-h-touch h-auto rounded-lg text-left justify-start flex-col items-start transition-colors ${
                    modelo === m.id ? 'border-primary bg-primary/20' : 'border-muted bg-card'
                  }`}
                >
                  <p className="text-foreground font-semibold">{m.nome}</p>
                </Button>
              ))
            )}
          </div>
        )}
      </div>

      <p className="text-muted-foreground/50 text-xs mt-6 text-center">
        Mais modelos serão adicionados em breve
      </p>
    </PassoLayout>
  );
}
