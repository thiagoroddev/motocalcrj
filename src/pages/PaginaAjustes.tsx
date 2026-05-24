import { useState } from 'react';
import { usePerfil } from '../hooks/usePerfil';
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
import { CampoResponsabilidadeAluguel } from '../components/ajustes/CampoResponsabilidadeAluguel';

export function PaginaAjustes() {
  const { perfil, dispatch } = usePerfil();
  const [dialogReset, setDialogReset] = useState(false);

  return (
    <>
      <div className="p-md space-y-3">
        <SecaoVeiculo moto={perfil.moto} dispatch={dispatch} />
        <SecaoUltimasManutencoes moto={perfil.moto} dispatch={dispatch} />
        <SecaoPreferencias perfilManutencao={perfil.perfilManutencao} dispatch={dispatch} />
        <SecaoUsoDiario moto={perfil.moto} trabalho={perfil.trabalho} dispatch={dispatch} />
        <SecaoFinanceiro financeiro={perfil.financeiro} dispatch={dispatch} />
        <SecaoSituacaoLegal financeiro={perfil.financeiro} dispatch={dispatch} />
        <CampoResponsabilidadeAluguel financeiro={perfil.financeiro} dispatch={dispatch} />
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

      <Dialog open={dialogReset} onOpenChange={setDialogReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar valores padrões?</DialogTitle>
            <DialogDescription>
              Os custos (alimentação, internet, seguro, financiamento, imprevistos) serão{' '}
              <strong>zerados</strong>. Uso (km/dia, dias/semana) e modo de revisão voltam ao
              padrão. Dados da moto e serviços de Mão de Obra não são alterados.
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
    </>
  );
}
