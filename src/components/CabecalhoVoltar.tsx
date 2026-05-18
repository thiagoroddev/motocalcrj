import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { IconVoltar } from './icons';

interface PropsCabecalhoVoltar {
  titulo: string;
}

export function CabecalhoVoltar({ titulo }: PropsCabecalhoVoltar) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 pb-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        aria-label="Voltar"
        className="-ml-2 text-muted-foreground/50 hover:text-foreground hover:bg-transparent"
      >
        <IconVoltar className="w-5 h-5" />
      </Button>
      <p className="text-foreground font-semibold text-base flex-1">{titulo}</p>
    </div>
  );
}
