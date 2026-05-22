import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface DialogConfirmacaoProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onConfirmar: () => void;
  titulo: string;
  descricao: string;
  rotuloConfirmar?: string;
}

/** Diálogo de confirmação reutilizável para ações destrutivas (ex.: reset). */
export function DialogConfirmacao({
  aberto,
  onOpenChange,
  onConfirmar,
  titulo,
  descricao,
  rotuloConfirmar = 'Restaurar',
}: DialogConfirmacaoProps) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirmar();
              onOpenChange(false);
            }}
          >
            {rotuloConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
