import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChangeEvent, ReactNode } from 'react';
import { usePerfil } from '../hooks/usePerfil';
import { CabecalhoVoltar } from '../components/CabecalhoVoltar';
import { NavBar } from '../components/layout/NavBar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
import { IconAlternar } from '../components/icons';
import { serializarBackup, parsearBackup, nomeArquivoBackup } from '../services/backup';
import type { Backup } from '../schemas/backupSchema';
import { baixarTexto, lerArquivoTexto } from '../utils/arquivo';
import { DialogCriarPredefinicao } from '../components/perfil/predefinicoes/DialogCriarPredefinicao';
import { DialogAlternarPredefinicao } from '../components/perfil/predefinicoes/DialogAlternarPredefinicao';
import { DialogDeletarPredefinicao } from '../components/perfil/predefinicoes/DialogDeletarPredefinicao';

type DialogAberto =
  | 'resetar'
  | 'criarPredefinicao'
  | 'alternarPredefinicao'
  | 'deletarPredefinicao'
  | 'privacidade'
  | null;

// Mantida em sincronia com a "version" do package.json (exibida em Privacidade e
// Termos). Hardcode evita importar package.json para fora do rootDir do TS.
const APP_VERSAO = '0.1.0';

export function PaginaPerfil() {
  const { perfil, presets, presetAtivo, presetAtivoId, dispatch } = usePerfil();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<DialogAberto>(null);
  const inputBackupRef = useRef<HTMLInputElement>(null);
  // Backup lido e validado, aguardando confirmação (a restauração é destrutiva).
  const [backupPendente, setBackupPendente] = useState<Backup | null>(null);
  const [erroImportacao, setErroImportacao] = useState(false);

  const nomeModelo = getNomeModelo(perfil.moto.modelo);
  const tipoComb = perfil.financeiro.tipoGasolinaPreferida;
  const consumo = perfil.financeiro.combustiveis[tipoComb].autonomia;
  const nomePreset = `${perfil.moto.marca}: ${nomeModelo}`;

  function confirmarResetarPredefinicao() {
    dispatch({ type: 'RESETAR_PREDEFINICAO_ATIVA' });
    navigate('/onboarding/ano');
  }

  function confirmarCriarPredefinicao(modeloId: string, sufixo: string) {
    setDialog(null);
    dispatch({ type: 'INICIAR_NOVA_PREDEFINICAO', modeloId, sufixo });
    navigate('/onboarding/ano');
  }

  function exportarBackup() {
    baixarTexto(nomeArquivoBackup(), serializarBackup(presets, presetAtivoId));
  }

  async function aoSelecionarArquivoBackup(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    // Limpa o input para permitir reimportar o mesmo arquivo depois.
    evento.target.value = '';
    if (!arquivo) return;
    try {
      const texto = await lerArquivoTexto(arquivo);
      setBackupPendente(parsearBackup(texto));
    } catch {
      setErroImportacao(true);
    }
  }

  function confirmarRestaurarBackup() {
    if (!backupPendente) return;
    dispatch({
      type: 'RESTAURAR_BACKUP',
      presets: backupPendente.presets,
      presetAtivoId: backupPendente.presetAtivoId,
    });
    setBackupPendente(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <CabecalhoVoltar titulo="Perfil" />

      <main className="flex-1 overflow-y-auto pb-20 p-4 flex flex-col gap-4">
        {/* Predefinição Atual */}
        <div className="bg-card rounded-lg p-4">
          <p className="label-neutro mb-2">Predefinição Atual</p>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-foreground text-lg font-bold">{nomePreset}</h2>
                {presetAtivo && (
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                    {presetAtivo.sufixo}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">Ano: {perfil.moto.ano}</p>
              <p className="text-muted-foreground text-sm">Autonomia: {consumo} km/l</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold flex-shrink-0">
              {perfil.moto.marca.charAt(0)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
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
              onClick={() => setDialog('criarPredefinicao')}
            >
              <span>Criar nova predefinição</span>
              <IcMais />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={presets.length < 2}
              onClick={() => setDialog('alternarPredefinicao')}
            >
              <span>Alternar predefinição</span>
              <IconAlternar className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setDialog('deletarPredefinicao')}
            >
              <span>Deletar predefinição</span>
              <IcLixeira />
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDialog('resetar')}
            >
              <IcReset />
              <span>Resetar predefinição</span>
            </Button>
          </div>
        </div>

        {/* Exportar & Importar */}
        <div className="bg-card rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <IcNuvemBaixar className="text-muted-foreground" />
            <p className="text-foreground text-sm font-semibold">Exportar &amp; Importar</p>
          </div>

          <div className="mb-4">
            <p className="label-neutro mb-1">Salvar Dados</p>
            <p className="text-muted-foreground text-xs mb-2">
              Gere um arquivo de backup com todas as suas configurações e histórico.
            </p>
            <Button variant="outline" className="w-full gap-2" onClick={exportarBackup}>
              <IcBaixar />
              Exportar Backup (.json)
            </Button>
          </div>

          <Separator className="mb-4" />

          <div>
            <p className="label-neutro mb-1">Restaurar</p>
            <p className="text-muted-foreground text-xs mb-2">
              Importe seus dados de um arquivo MotoCalc anterior.
            </p>
            <input
              ref={inputBackupRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={aoSelecionarArquivoBackup}
            />
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => inputBackupRef.current?.click()}
            >
              <IcSubir />
              Importar Backup
            </Button>
          </div>
        </div>

        {/* Configurações Gerais */}
        <div className="bg-card rounded-lg overflow-hidden">
          <LinhaConfig
            icone={<IcCadeado />}
            label="Privacidade e Termos"
            valor={`Versão ${APP_VERSAO}`}
            onClick={() => setDialog('privacidade')}
          />
        </div>
      </main>

      <NavBar />

      {/* Dialog: Resetar predefinição */}
      <Dialog open={dialog === 'resetar'} onOpenChange={(aberto) => !aberto && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar predefinição</DialogTitle>
            <DialogDescription>
              Isso vai apagar todos os dados editados de <strong>{nomePreset}</strong>
              {presetAtivo ? ` (${presetAtivo.sufixo})` : ''} e reiniciar o onboarding desta
              predefinição. As outras predefinições não são afetadas. Essa ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarResetarPredefinicao}>
              Resetar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {dialog === 'criarPredefinicao' && (
        <DialogCriarPredefinicao
          onClose={() => setDialog(null)}
          onConfirmar={confirmarCriarPredefinicao}
        />
      )}

      {dialog === 'alternarPredefinicao' && (
        <DialogAlternarPredefinicao onClose={() => setDialog(null)} />
      )}

      {dialog === 'deletarPredefinicao' && (
        <DialogDeletarPredefinicao onClose={() => setDialog(null)} />
      )}

      {/* Dialog: confirmar restauração de backup (substitui todos os dados) */}
      <Dialog
        open={backupPendente !== null}
        onOpenChange={(aberto) => !aberto && setBackupPendente(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar backup</DialogTitle>
            <DialogDescription>
              Isso vai <strong>substituir todas as suas predefinições atuais</strong> pelas{' '}
              {backupPendente?.presets.length ?? 0} do arquivo. Seus dados atuais serão perdidos.
              Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupPendente(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarRestaurarBackup}>
              Substituir e restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Privacidade e Termos */}
      <Dialog open={dialog === 'privacidade'} onOpenChange={(aberto) => !aberto && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacidade e Termos</DialogTitle>
            <DialogDescription>Versão {APP_VERSAO}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Privacidade</p>
              <p>
                O MotoCalc RJ funciona inteiramente no seu aparelho. Suas predefinições,
                quilometragens e preços ficam salvos apenas no navegador deste dispositivo. Nada é
                enviado para servidores: não há cadastro, coleta de dados pessoais nem rastreadores.
                Por não possuir banco de dados na nuvem, você é o único responsável por proteger
                suas informações exportando seus próprios arquivos de backup (formato .json). O
                backup é um arquivo <code>.json</code> que só você gera e guarda.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Termos de uso</p>
              <p>
                O aplicativo tem caráter informativo e não substitui avaliações mecânicas
                profissionais ou orientações financeiras/contábeis. Os valores apresentados são
                estimativas médias aproximadas para permitir cálculos mais completos, não constituem
                aconselhamento financeiro nem possuem dados exatos. Preços e vida útil de peças, mão
                de obra e tabela FIPE são referências estimadas e podem divergir do praticado na sua
                região ou concessionária. Os dados de revisões periódicas foram obtidos dos sites
                oficiais das concessionárias e podem estar desatualizados. Use os resultados por sua
                conta. Cobertura voltada a motos e custos do Rio de Janeiro (RJ).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: erro de importação */}
      <Dialog open={erroImportacao} onOpenChange={(aberto) => !aberto && setErroImportacao(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivo inválido</DialogTitle>
            <DialogDescription>
              Não foi possível ler este arquivo como um backup do MotoCalc. Verifique se é o arquivo{' '}
              <code>.json</code> exportado pelo app e tente novamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setErroImportacao(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function LinhaConfig({
  icone,
  label,
  valor,
  onClick,
}: {
  icone: ReactNode;
  label: string;
  valor: string;
  onClick?: () => void;
}) {
  const conteudo = (
    <>
      <span className="text-muted-foreground flex-shrink-0">{icone}</span>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{valor}</p>
      </div>
      <IcChevron />
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
      >
        {conteudo}
      </button>
    );
  }

  return <div className="flex items-center gap-4 px-4 py-3">{conteudo}</div>;
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

function IcLixeira() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1={10} y1={11} x2={10} y2={17} strokeLinecap="round" />
      <line x1={14} y1={11} x2={14} y2={17} strokeLinecap="round" />
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
