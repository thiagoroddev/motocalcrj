import { useParams } from 'react-router-dom';

export function PaginaOnboarding() {
  const { passo } = useParams<{ passo: string }>();
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <p className="text-muted-foreground">Onboarding - Passo {passo ?? '1'}</p>
    </div>
  );
}
