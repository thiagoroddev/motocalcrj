import { Navigate, Outlet } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';

export function RotaProtegida() {
  const { temPresetAtivo } = usePerfil();

  if (!temPresetAtivo) {
    return <Navigate to="/onboarding/1" replace />;
  }

  return <Outlet />;
}
