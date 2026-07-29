import type { ReactNode } from 'react';
import { Button } from '../../components/ui/button';
import { useOnboarding } from './FluxoOnboarding';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../../hooks/usePerfil';

interface Props {
  titulo: string;
  subtitulo?: string;
  aoProximo: () => void;
  podeContinuar?: boolean;
  textoBotao?: string;
  children: ReactNode;
}

export function PassoLayout({
  titulo,
  subtitulo,
  aoProximo,
  podeContinuar = true,
  textoBotao,
  children,
}: Props) {
  const { config, irParaAnterior, temAnterior } = useOnboarding();
  const { rascunhoPredefinicao, dispatch } = usePerfil();
  const navigate = useNavigate();
  // No reset (presetIdEmReset), cancelar restaura a predefinição; fora dele é
  // o cancelamento da criação de uma predefinição nova. (TASK-RF-6.36)
  const emReset = rascunhoPredefinicao?.presetIdEmReset != null;
  // Rotas semânticas (ADR-020): cada passo mostra "Próximo"; a Confirmação define
  // seu próprio rótulo via `textoBotao`.
  const labelBotao = textoBotao ?? 'Próximo';

  function cancelarCriacao() {
    dispatch({ type: 'CANCELAR_NOVA_PREDEFINICAO' });
    navigate('/perfil', { replace: true });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col ">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-label-sm text-muted-foreground">{config.label}</span>
          <div className="flex items-center gap-2">
            {rascunhoPredefinicao && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={cancelarCriacao}
              >
                {emReset ? 'Cancelar reset' : 'Cancelar criação'}
              </Button>
            )}
            <span className="text-label-sm text-muted-foreground">{config.percentual}%</span>
          </div>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${config.percentual}%` }}
          />
        </div>
      </div>

      {/* <main> e não <div>: leitor de tela precisa de um marco principal para
          pular direto ao conteúdo (WCAG 2.4.1). O LayoutApp e a PaginaPerfil já
          tinham; o onboarding era o único fluxo sem — e é a primeira tela que um
          usuário novo encontra (TASK-RNF-9.1, achado `landmark-one-main`). */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <h1 className="text-foreground text-2xl font-semibold mb-1">{titulo}</h1>
        {subtitulo && <p className="text-muted-foreground text-sm mb-6">{subtitulo}</p>}
        {children}
      </main>

      <div className="p-4 pt-4 border-t border-muted flex gap-2">
        {temAnterior && (
          <Button
            variant="outline"
            onClick={irParaAnterior}
            className="flex-1 min-h-touch rounded-btn border-muted font-medium"
          >
            Voltar
          </Button>
        )}
        <Button
          onClick={aoProximo}
          disabled={!podeContinuar}
          className="flex-1 min-h-touch rounded-btn font-semibold text-foreground disabled:opacity-40"
        >
          {labelBotao}
        </Button>
      </div>
    </div>
  );
}
