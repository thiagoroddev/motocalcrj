import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { usePerfil } from '../hooks/usePerfil';
import { NavBar } from '../components/layout/NavBar';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { getNomeModelo } from '../data/catalogoModelos';

type DialogAberto = 'apagar' | 'mudarVeiculo' | null;

export function PaginaPerfil() {
  const { perfil, dispatch } = usePerfil();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<DialogAberto>(null);

  const nomeModelo = getNomeModelo(perfil.moto.modelo);
  const tipoComb = perfil.financeiro.tipoGasolinaPreferida;
  const consumo = perfil.financeiro.combustiveis[tipoComb].autonomia;
  const nomePreset = `${perfil.moto.marca}: ${nomeModelo}`;

  function confirmarApagarTudo() {
    dispatch({ type: 'RESETAR_PERFIL' });
    navigate('/onboarding/1', { replace: true });
  }

  function confirmarMudarVeiculo() {
    setDialog(null);
    navigate('/onboarding/1');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between px-md py-3 bg-card border-b border-muted flex-shrink-0">
        <h1 className="text-foreground text-base font-semibold">Perfil</h1>
        <button
          type="button"
          aria-label="Ajuda"
          className="w-7 h-7 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-sm font-medium"
        >
          ?
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20 p-md flex flex-col gap-md">
        {/* Predefinição Atual */}
        <div className="bg-card rounded-lg p-md">
          <p className="label-neutro mb-sm">Predefinição Atual</p>
          <div className="flex items-start justify-between mb-md">
            <div>
              <h2 className="text-foreground text-lg font-bold">{nomePreset}</h2>
              <p className="text-muted-foreground text-sm">Ano: {perfil.moto.ano}</p>
              <p className="text-muted-foreground text-sm">Autonomia: {consumo} km/l</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold flex-shrink-0">
              {perfil.moto.marca.charAt(0)}
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate('/ajustes')}
            >
              <span>Editar predefinição</span>
              <IcLapis />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setDialog('mudarVeiculo')}
            >
              <span>Mudar veículo</span>
              <IcMais />
            </Button>

            <Button variant="outline" className="w-full justify-between opacity-40" disabled>
              <span>Mudar predefinição</span>
              <IcTrocar />
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDialog('apagar')}
            >
              <IcReset />
              <span>Apagar Tudo</span>
            </Button>
          </div>
        </div>

        {/* Exportar & Importar */}
        <div className="bg-card rounded-lg p-md">
          <div className="flex items-center gap-sm mb-md">
            <IcNuvemBaixar className="text-muted-foreground" />
            <p className="text-foreground text-sm font-semibold">Exportar &amp; Importar</p>
          </div>

          <div className="mb-md">
            <p className="label-neutro mb-xs">Salvar Dados</p>
            <p className="text-muted-foreground text-xs mb-sm">
              Gere um arquivo de backup com todas as suas configurações e histórico.
            </p>
            <Button variant="outline" className="w-full gap-2" disabled>
              <IcBaixar />
              Exportar Backup (.json)
            </Button>
          </div>

          <Separator className="mb-md" />

          <div>
            <p className="label-neutro mb-xs">Restaurar</p>
            <p className="text-muted-foreground text-xs mb-sm">
              Importe seus dados de um arquivo MotoCalc anterior.
            </p>
            <Button variant="outline" className="w-full gap-2" disabled>
              <IcSubir />
              Importar Backup
            </Button>
          </div>
        </div>

        {/* Configurações Gerais */}
        <div className="bg-card rounded-lg overflow-hidden">
          <LinhaConfig icone={<IcGlobo />} label="Idioma" valor="Português (Brasil)" />
          <Separator />
          <LinhaConfig icone={<IcLua />} label="Aparência" valor="Modo Escuro (Padrão)" />
          <Separator />
          <LinhaConfig
            icone={<IcCadeado />}
            label="Privacidade e Termos"
            valor="Versão 2.4.0 (2024)"
          />
        </div>
      </main>

      <NavBar />

      {/* Dialog: Apagar Tudo */}
      <Dialog open={dialog === 'apagar'} onOpenChange={(aberto) => !aberto && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar Tudo</DialogTitle>
            <DialogDescription>
              Isso vai apagar permanentemente todos os seus dados e configurações. Essa ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarApagarTudo}>
              Apagar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Mudar Veículo */}
      <Dialog
        open={dialog === 'mudarVeiculo'}
        onOpenChange={(aberto) => !aberto && setDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudar Veículo</DialogTitle>
            <DialogDescription>
              Isso vai iniciar a configuração para um novo veículo. Sua predefinição atual (
              {nomePreset}) será mantida e você poderá alternar entre as duas depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarMudarVeiculo}>Configurar novo veículo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function LinhaConfig({ icone, label, valor }: { icone: ReactNode; label: string; valor: string }) {
  return (
    <div className="flex items-center gap-md px-md py-3">
      <span className="text-muted-foreground flex-shrink-0">{icone}</span>
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{valor}</p>
      </div>
      <IcChevron />
    </div>
  );
}

// ── Ícones inline ────────────────────────────────────────────────────────────

function IcLapis() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IcMais() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <line x1={12} y1={5} x2={12} y2={19} strokeLinecap="round" />
      <line x1={5} y1={12} x2={19} y2={12} strokeLinecap="round" />
    </svg>
  );
}

function IcTrocar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" strokeLinecap="round" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" strokeLinecap="round" />
    </svg>
  );
}

function IcReset() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3" strokeLinecap="round" />
    </svg>
  );
}

function IcNuvemBaixar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`w-4 h-4 ${className ?? ''}`}
      aria-hidden="true"
    >
      <polyline points="8 17 12 21 16 17" />
      <line x1={12} y1={12} x2={12} y2={21} strokeLinecap="round" />
      <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" strokeLinecap="round" />
    </svg>
  );
}

function IcBaixar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
      <polyline points="7 10 12 15 17 10" />
      <line x1={12} y1={15} x2={12} y2={3} strokeLinecap="round" />
    </svg>
  );
}

function IcSubir() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
      <polyline points="17 8 12 3 7 8" />
      <line x1={12} y1={3} x2={12} y2={15} strokeLinecap="round" />
    </svg>
  );
}

function IcGlobo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={10} />
      <line x1={2} y1={12} x2={22} y2={12} />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IcLua() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IcCadeado() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IcChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4 text-muted-foreground flex-shrink-0"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
