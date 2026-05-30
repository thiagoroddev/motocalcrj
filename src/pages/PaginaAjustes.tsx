import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

type LocationStateAjustes = {
  focoSecao?: 'veiculo';
};

const DURACAO_DESTAQUE_MS = 2000;

export function PaginaAjustes() {
  const { perfil, dispatch } = usePerfil();
  const [dialogReset, setDialogReset] = useState(false);
  const location = useLocation();
  const focoSecao = (location.state as LocationStateAjustes | null)?.focoSecao ?? null;
  const refVeiculo = useRef<HTMLDivElement | null>(null);
  const [secaoDestacada, setSecaoDestacada] = useState<'veiculo' | null>(null);

  useEffect(() => {
    if (focoSecao !== 'veiculo') return;
    setSecaoDestacada('veiculo');
    refVeiculo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const timer = setTimeout(() => setSecaoDestacada(null), DURACAO_DESTAQUE_MS);
    return () => clearTimeout(timer);
  }, [focoSecao]);

  return (
    <>
      <div className="p-4 space-y-3">
        <div
          ref={refVeiculo}
          className={`rounded-lg transition-shadow${
            secaoDestacada === 'veiculo' ? ' ring-2 ring-primary' : ''
          }`}
        >
          <SecaoVeiculo moto={perfil.moto} dispatch={dispatch} />
        </div>
        <SecaoUltimasManutencoes moto={perfil.moto} dispatch={dispatch} />
        <SecaoPreferencias
          perfilManutencao={perfil.perfilManutencao}
          moto={perfil.moto}
          dispatch={dispatch}
        />
        <SecaoUsoDiario trabalho={perfil.trabalho} dispatch={dispatch} />
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
