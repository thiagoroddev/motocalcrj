import { useParams } from 'react-router-dom';

export function PaginaOnboarding() {
  const { passo } = useParams<{ passo: string }>();
  return (
    <div className="min-h-screen bg-surface text-white flex items-center justify-center p-md">
      <p className="text-neutral">Onboarding — Passo {passo ?? '1'}</p>
    </div>
  );
}
