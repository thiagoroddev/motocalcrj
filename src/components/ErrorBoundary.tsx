import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { LocalStoragePerfilStorage } from '../services/perfilStorage';
import type { IPerfilStorage } from '../services/perfilStorage';

// Limpa os dados locais. Extraído para função pura (sem reload) para ser
// testável em ambiente node — o reload fica no handler do botão.
export function resetarPerfilStorage(storage: IPerfilStorage): void {
  storage.limpar();
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  temErro: boolean;
}

// Único caso em que o React exige class component: captura de erros de render
// na subárvore. Fica na raiz (fora dos providers) para também pegar erro
// vindo deles. A RNF-10 já blinda o carregamento de dados; este boundary
// cobre qualquer outro erro de render, evitando a tela branca sem saída.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { temErro: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { temErro: true };
  }

  componentDidCatch(erro: Error, info: ErrorInfo): void {
    // Visibilidade em dev e gancho para analytics futuro (TASK-RNF-8.1).
    // Não engole o erro silenciosamente.
    console.error('[ErrorBoundary] erro de render capturado:', erro, info.componentStack);
  }

  private aoResetar = (): void => {
    resetarPerfilStorage(new LocalStoragePerfilStorage());
    // Ponto de extensão: quando a TASK-RF-7.1 (Export/Import) existir, oferecer
    // "Exportar dados" aqui antes de resetar, para não perder o que dá para salvar.
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.temErro) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-semibold">Algo deu errado</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          O app encontrou um erro inesperado. Você pode tentar recarregar; se o problema persistir,
          resetar os dados locais costuma resolver.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-touch rounded-md bg-muted/30 text-foreground text-sm font-medium px-4 hover:bg-muted/50 transition-colors"
          >
            Recarregar
          </button>
          <button
            type="button"
            onClick={this.aoResetar}
            className="min-h-touch rounded-md bg-destructive/15 text-destructive text-sm font-medium px-4 hover:bg-destructive/25 transition-colors"
          >
            Resetar dados
          </button>
        </div>
      </div>
    );
  }
}
