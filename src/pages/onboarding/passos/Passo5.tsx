import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { Input } from '../../../components/ui/input';

export function Passo5() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();
  const [kmAtual, setKmAtual] = useState(
    perfil.moto.kmAtual > 0 ? String(perfil.moto.kmAtual) : '',
  );
  const [kmUltimaRevisao, setKmUltimaRevisao] = useState(
    perfil.moto.kmUltimaRevisao != null ? String(perfil.moto.kmUltimaRevisao) : '',
  );

  const kmAtualNum = parseInt(kmAtual, 10);
  const valido = !isNaN(kmAtualNum) && kmAtualNum > 0;

  function salvarEAvancar() {
    const kmRevisaoNum = parseInt(kmUltimaRevisao, 10);
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'moto',
      valor: {
        ...perfil.moto,
        kmAtual: kmAtualNum,
        kmUltimaRevisao: !isNaN(kmRevisaoNum) && kmRevisaoNum > 0 ? kmRevisaoNum : null,
      },
    });
    irParaProximo();
  }

  const inputClassName =
    'flex-1 min-h-touch bg-card rounded-input border-muted text-foreground px-md placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0';

  return (
    <PassoLayout
      titulo="Quilometragem"
      subtitulo="Informe o hodômetro atual da sua moto"
      aoProximo={salvarEAvancar}
      podeContinuar={valido}
    >
      <div className="flex flex-col gap-lg">
        <label className="flex flex-col gap-xs">
          <span className="text-muted-foreground text-sm font-medium">
            KM atual do hodômetro <span className="text-destructive">*</span>
          </span>
          <span className="text-muted-foreground/60 text-xs">
            Essencial para prever as próximas manutenções
          </span>
          <div className="flex items-center gap-xs">
            <Input
              type="number"
              value={kmAtual}
              onChange={(e) => setKmAtual(e.target.value)}
              min={1}
              placeholder="Ex: 12500"
              className={inputClassName}
            />
            <span className="text-muted-foreground/60 text-sm font-medium w-8">KM</span>
          </div>
        </label>

        <label className="flex flex-col gap-xs">
          <span className="text-muted-foreground text-sm font-medium">KM na última revisão</span>
          <span className="text-muted-foreground/60 text-xs">
            Ajuda a calcular o desgaste acumulado (opcional)
          </span>
          <div className="flex items-center gap-xs">
            <Input
              type="number"
              value={kmUltimaRevisao}
              onChange={(e) => setKmUltimaRevisao(e.target.value)}
              min={0}
              placeholder="Opcional"
              className={inputClassName}
            />
            <span className="text-muted-foreground/60 text-sm font-medium w-8">KM</span>
          </div>
        </label>
      </div>
    </PassoLayout>
  );
}
