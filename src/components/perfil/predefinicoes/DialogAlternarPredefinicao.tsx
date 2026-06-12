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

export function DialogAlternarPredefinicao({ onClose }: Props) {
  const { presets, presetAtivoId, ativarPreset } = usePerfil();

  function alternar(presetId: string) {
    ativarPreset(presetId);
    onClose();
  }

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alternar predefinição</DialogTitle>
          <DialogDescription>
            Escolha qual configuração deseja usar. Cada predefinição mantém seus próprios dados.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto">
          {presets.map((preset) => {
            const ativa = preset.presetId === presetAtivoId;
            const nomeModelo = getNomeModelo(preset.perfil.moto.modelo);

            return (
              <Button
                key={preset.presetId}
                type="button"
                variant="outline"
                className="h-auto min-h-touch w-full justify-between whitespace-normal p-3 text-left"
                disabled={ativa}
                onClick={() => alternar(preset.presetId)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
