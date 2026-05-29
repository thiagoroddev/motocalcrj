import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { IconAjuda } from './icons';
import { CONTEUDO_AJUDA, type ChaveAjuda } from '../data/conteudoAjuda';

interface PropsPopupAjuda {
  chave: ChaveAjuda;
  className?: string;
}

export function PopupAjuda({ chave, className }: PropsPopupAjuda) {
  const conteudo = CONTEUDO_AJUDA[chave];

  return (
    <Sheet>
      <SheetTrigger
        aria-label="Ajuda"
        className={`p-1 text-muted-foreground/50 hover:text-foreground transition-colors${
          className ? ` ${className}` : ''
        }`}
      >
        <IconAjuda className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl border-muted"
      >
        <SheetHeader>
          <SheetTitle>{conteudo.titulo}</SheetTitle>
        </SheetHeader>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{conteudo.intro}</p>
        <dl className="mt-4 space-y-3">
          {conteudo.secoes.map((secao) => (
            <div key={secao.titulo}>
              <dt className="text-sm font-semibold text-foreground">{secao.titulo}</dt>
              <dd className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                {secao.texto}
              </dd>
            </div>
          ))}
        </dl>
        <div className="h-2" />
      </SheetContent>
    </Sheet>
  );
}
