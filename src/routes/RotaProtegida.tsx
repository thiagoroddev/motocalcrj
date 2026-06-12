import { Navigate, Outlet } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';

export function RotaProtegida() {
  const { temPresetAtivo, rascunhoPredefinicao } = usePerfil();

  if (rascunhoPredefinicao) {
    return <Navigate to="/onboarding/ano" replace />;
  }

  if (!temPresetAtivo) {
    return <Navigate to="/onboarding/modelo" replace />;
  }

  return <Outlet />;
}
