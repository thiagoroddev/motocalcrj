import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import type { ResponsabilidadeCusto } from '../../../types/perfil';

type CampoResp = 'documentos' | 'manutencao' | 'seguro';

const CAMPOS: { id: CampoResp; titulo: string }[] = [
  { id: 'documentos', titulo: 'Documentação (IPVA, licenciamento)' },
  { id: 'manutencao', titulo: 'Manutenção' },
  { id: 'seguro', titulo: 'Seguro' },
];

const OPCOES: { valor: ResponsabilidadeCusto; label: string }[] = [
  { valor: 'eu', label: 'Eu pago' },
  { valor: 'locador', label: 'Locador' },
  { valor: 'dividido', label: 'Dividido' },
];

export function Passo6Responsabilidade() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();
  const [resp, setResp] = useState({ ...perfil.financeiro.responsabilidadeAluguel });

  function salvarEAvancar() {
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: { ...perfil.financeiro, responsabilidadeAluguel: resp },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Quem paga o quê?"
      subtitulo="Defina a responsabilidade de cada custo no aluguel"
      aoProximo={salvarEAvancar}
    >
      <div className="flex flex-col gap-lg">
        {CAMPOS.map(({ id, titulo }) => (
          <div key={id}>
            <p className="text-foreground text-sm font-medium mb-sm">{titulo}</p>
            <div className="flex gap-xs">
              {OPCOES.map(({ valor, label }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setResp((prev) => ({ ...prev, [id]: valor }))}
                  className={`flex-1 h-10 rounded-btn text-xs font-semibold transition-colors ${
                    resp[id] === valor
                      ? 'bg-primary text-foreground'
                      : 'bg-card border border-muted text-muted-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PassoLayout>
  );
}
