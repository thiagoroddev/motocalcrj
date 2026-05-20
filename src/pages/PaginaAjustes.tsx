import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';
import { NavBar } from '../components/layout/NavBar';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { SecaoVeiculo } from '../components/ajustes/SecaoVeiculo';
import { SecaoUltimasManutencoes } from '../components/ajustes/SecaoUltimasManutencoes';
import { SecaoPreferencias } from '../components/ajustes/SecaoPreferencias';
import { SecaoUsoDiario } from '../components/ajustes/SecaoUsoDiario';
import { SecaoFinanceiro } from '../components/ajustes/SecaoFinanceiro';
import { SecaoSituacaoLegal } from '../components/ajustes/SecaoSituacaoLegal';

export function PaginaAjustes() {
  const { perfil, dispatch } = usePerfil();
  const navigate = useNavigate();
  const [dialogReset, setDialogReset] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center gap-3 px-md py-3 bg-card border-b border-muted shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Voltar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-foreground font-semibold text-base flex-1">Ajustes</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-md space-y-3">
          <SecaoVeiculo moto={perfil.moto} dispatch={dispatch} />
          <SecaoUltimasManutencoes moto={perfil.moto} dispatch={dispatch} />
          <SecaoPreferencias
            perfilManutencao={perfil.perfilManutencao}
            modoExibicao={perfil.configuracaoDisplay.modoExibicao}
            dispatch={dispatch}
          />
          <SecaoUsoDiario moto={perfil.moto} trabalho={perfil.trabalho} dispatch={dispatch} />
          <SecaoFinanceiro financeiro={perfil.financeiro} dispatch={dispatch} />
          <SecaoSituacaoLegal financeiro={perfil.financeiro} dispatch={dispatch} />
          <div className="pb-2">
            <Button
              variant="outline"
              className="w-full min-h-touch text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDialogReset(true)}
            >
              Restaurar valores padrões
            </Button>
          </div>
        </div>
      </main>

      <NavBar />

      <Dialog open={dialogReset} onOpenChange={setDialogReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar valores padrões?</DialogTitle>
            <DialogDescription>
              Uso, manutenção e financeiro voltam ao padrão. Dados da moto (modelo, KM) e serviços
              da aba M. Obra não são alterados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogReset(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                dispatch({ type: 'RESETAR_AJUSTES_PADRAO' });
                setDialogReset(false);
              }}
            >
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
