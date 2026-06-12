import { useState } from 'react';
import { getNomeModelo } from '../../../data/catalogoModelos';
import { usePerfil } from '../../../hooks/usePerfil';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

interface Props {
  onClose: () => void;
}

export function DialogDeletarPredefinicao({ onClose }: Props) {
  const { presets, presetAtivoId, dispatch } = usePerfil();
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const naoAtivas = presets.filter((preset) => preset.presetId !== presetAtivoId);
  const semOpcoes = naoAtivas.length === 0;

  function selecionar(presetId: string) {
    // Selecionar de novo limpa o aviso da exclusão anterior.
    setMensagemSucesso(null);
    setSelecionadoId(presetId);
  }

  function confirmarDelecao() {
    const alvo = presets.find((preset) => preset.presetId === selecionadoId);
    if (!alvo) {
      return;
    }
    dispatch({ type: 'DELETAR_PREDEFINICAO', presetId: alvo.presetId });
    // Mantém o diálogo aberto para confirmar a exclusão: a lista atualiza na
    // hora (o item some) e o aviso dá o feedback explícito.
    setSelecionadoId(null);
    setMensagemSucesso(
      `Predefinição "${alvo.perfil.moto.marca}: ${getNomeModelo(alvo.perfil.moto.modelo)} (${alvo.sufixo})" deletada.`,
    );
  }

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deletar predefinição</DialogTitle>
          <DialogDescription>
            {semOpcoes
              ? 'Não há predefinições para deletar. A predefinição em uso não pode ser excluída — alterne para outra antes de removê-la.'
              : 'Escolha uma predefinição não ativa para remover. Essa ação não pode ser desfeita.'}
          </DialogDescription>
        </DialogHeader>

        {mensagemSucesso && (
          <p
            role="status"
            className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground"
          >
            {mensagemSucesso}
          </p>
        )}

        <div className="max-h-[55vh] space-y-2 overflow-y-auto">
          {presets.map((preset) => {
            const ativa = preset.presetId === presetAtivoId;
            const selecionada = preset.presetId === selecionadoId;
            const nomeModelo = getNomeModelo(preset.perfil.moto.modelo);

            return (
              <Button
                key={preset.presetId}
                type="button"
                variant="outline"
                aria-pressed={!ativa && selecionada}
                className={`h-auto min-h-touch w-full justify-between whitespace-normal p-3 text-left${
                  selecionada ? ' border-destructive ring-1 ring-destructive' : ''
                }`}
                disabled={ativa}
                onClick={() => selecionar(preset.presetId)}
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">
                    {preset.perfil.moto.marca}: {nomeModelo}
                  </span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    Ano {preset.perfil.moto.ano}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                    {preset.sufixo}
                  </Badge>
                  {ativa && <span className="text-xs text-muted-foreground">Em uso</span>}
                </span>
              </Button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="destructive" disabled={!selecionadoId} onClick={confirmarDelecao}>
            Deletar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
