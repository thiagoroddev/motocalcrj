import type { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { IconAjuda } from './icons';

interface PropsAjudaInline {
  titulo: string;
  children: ReactNode;
  className?: string;
}

// Ajuda contextual inline: ícone "?" ao lado de um rótulo que abre o mesmo Sheet
// inferior do PopupAjuda, mas com conteúdo passado direto (sem depender do
// registro de ajuda por-rota CONTEUDO_AJUDA).
export function AjudaInline({ titulo, children, className }: PropsAjudaInline) {
  return (
    <Sheet>
      <SheetTrigger
        aria-label={`Ajuda: ${titulo}`}
        className={`shrink-0 p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground${
          className ? ` ${className}` : ''
        }`}
      >
        <IconAjuda className="w-4 h-4" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl border-muted"
      >
        <SheetHeader>
          <SheetTitle>{titulo}</SheetTitle>
        </SheetHeader>
        <SheetDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {children}
        </SheetDescription>
        <div className="h-2" />
      </SheetContent>
    </Sheet>
  );
}
