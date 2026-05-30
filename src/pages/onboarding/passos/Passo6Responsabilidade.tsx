import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { Button } from '../../../components/ui/button';
import type { ResponsabilidadeAluguel, ResponsabilidadeCusto } from '../../../types/perfil';

type CampoResp = keyof ResponsabilidadeAluguel;

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
  const resp = perfil.financeiro.responsabilidadeAluguel;

  return (
    <PassoLayout
      titulo="Quem paga o quê?"
      subtitulo="Defina a responsabilidade de cada custo no aluguel"
      aoProximo={irParaProximo}
    >
      <div className="flex flex-col gap-6">
        {CAMPOS.map(({ id, titulo }) => (
          <div key={id}>
            <p className="text-foreground text-sm font-medium mb-2">{titulo}</p>
            <div className="flex gap-1">
              {OPCOES.map(({ valor, label }) => (
                <Button
                  key={valor}
                  onClick={() =>
                    dispatch({
                      type: 'SET_RESPONSABILIDADE_ALUGUEL',
                      config: { [id]: valor },
                    })
                  }
                  className={`flex-1 min-h-touch rounded-btn text-xs font-semibold transition-colors ${
                    resp[id] === valor
                      ? 'bg-primary text-foreground hover:bg-primary/90'
                      : 'bg-card border border-muted text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PassoLayout>
  );
}
