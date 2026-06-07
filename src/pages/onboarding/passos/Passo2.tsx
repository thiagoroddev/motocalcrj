import { useState, useEffect } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { getModelosPorMarca } from '../../../data/catalogoModelos';
import type { DadosModeloCatalogo } from '../../../data/catalogoModelos';
import { Button } from '../../../components/ui/button';

export function Passo2() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const modelos = getModelosPorMarca(perfil.moto.marca);
  const modeloAtualValido = modelos.find((m) => m.id === perfil.moto.modelo);

  const [selecionado, setSelecionado] = useState<DadosModeloCatalogo | null>(
    modeloAtualValido ?? (modelos.length === 1 ? modelos[0] : null),
  );

  // Auto-seleciona se só há um modelo disponível
  useEffect(() => {
    if (modelos.length === 1 && !selecionado) {
      setSelecionado(modelos[0]);
    }
  }, [modelos, selecionado]);

  function salvarEAvancar() {
    if (!selecionado) {
      return;
    }
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'moto',
      valor: { ...perfil.moto, modelo: selecionado.id },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Qual o modelo?"
      subtitulo={perfil.moto.marca}
      aoProximo={salvarEAvancar}
      podeContinuar={selecionado !== null}
    >
      <div className="flex flex-col gap-2">
        {modelos.map((modelo) => (
          <Button
            key={modelo.id}
            variant="outline"
            onClick={() => setSelecionado(modelo)}
            className={`w-full p-4 min-h-touch h-auto rounded-lg text-left justify-start flex-col items-start transition-colors ${
              selecionado?.id === modelo.id
                ? 'border-primary bg-primary/20'
                : 'border-muted bg-card'
            }`}
          >
            <p className="text-foreground font-semibold">{modelo.nome}</p>
            <p className="text-muted-foreground text-xs mt-1">
              Consumo profissional definido pelo ano
            </p>
          </Button>
        ))}
      </div>

      {modelos.length === 0 && (
        <p className="text-muted-foreground text-sm text-center mt-6">
          Nenhum modelo disponível para {perfil.moto.marca} ainda.
        </p>
      )}
    </PassoLayout>
  );
}
