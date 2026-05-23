import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { IconVoltar } from './icons';

interface PropsCabecalhoVoltar {
  titulo: string;
}

export function CabecalhoVoltar({ titulo }: PropsCabecalhoVoltar) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-3 px-md py-3 bg-card border-b border-muted shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        aria-label="Voltar"
        className="-ml-2 text-muted-foreground/50 hover:text-foreground hover:bg-transparent"
      >
        <IconVoltar className="w-5 h-5" />
      </Button>
      <h1 className="text-foreground font-semibold text-base flex-1">{titulo}</h1>
    </header>
  );
}
