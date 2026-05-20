import { createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  parsePasso,
  getProximoPasso,
  getPassoAnterior,
  CONFIG_PASSOS,
  type ConfigPasso,
} from './onboardingUtils';
import { usePerfil } from '../../hooks/usePerfil';
import { Passo1 } from './passos/Passo1';
import { Passo2 } from './passos/Passo2';
import { Passo3 } from './passos/Passo3';
import { Passo4 } from './passos/Passo4';
import { Passo5 } from './passos/Passo5';
import { Passo5Trocas } from './passos/Passo5Trocas';
import { Passo6 } from './passos/Passo6';
import { Passo6Financiamento } from './passos/Passo6Financiamento';
import { Passo6Aluguel } from './passos/Passo6Aluguel';
import { Passo6Responsabilidade } from './passos/Passo6Responsabilidade';
import { Passo7 } from './passos/Passo7';
import { Passo8 } from './passos/Passo8';
import { Passo9 } from './passos/Passo9';
import { PassoConfirmacao } from './passos/PassoConfirmacao';

interface OnboardingCtxValue {
  passo: string;
  config: ConfigPasso;
  irParaProximo: () => void;
  irParaAnterior: () => void;
  temAnterior: boolean;
}

const OnboardingCtx = createContext<OnboardingCtxValue | null>(null);

export function useOnboarding(): OnboardingCtxValue {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) {
    throw new Error('useOnboarding deve ser usado dentro de FluxoOnboarding');
  }
  return ctx;
}

export function FluxoOnboarding() {
  const location = useLocation();
  const navigate = useNavigate();
  const { perfil } = usePerfil();

  const passo = parsePasso(location.pathname);
  const config = CONFIG_PASSOS[passo] ?? CONFIG_PASSOS['1'];

  function irParaProximo() {
    const proximo = getProximoPasso(passo, perfil.financeiro.situacaoMoto);
    if (!proximo) {
      return;
    }
    if (proximo === 'concluir') {
      navigate('/estimativa', { replace: true });
    } else {
      navigate(`/onboarding/${proximo}`);
    }
  }

  function irParaAnterior() {
    const anterior = getPassoAnterior(passo, perfil.financeiro.situacaoMoto);
    if (anterior) {
      navigate(`/onboarding/${anterior}`);
    }
  }

  const temAnterior = getPassoAnterior(passo, perfil.financeiro.situacaoMoto) !== null;

  return (
    <OnboardingCtx.Provider value={{ passo, config, irParaProximo, irParaAnterior, temAnterior }}>
      <Routes>
        <Route path="1" element={<Passo1 />} />
        <Route path="2" element={<Passo2 />} />
        <Route path="3" element={<Passo3 />} />
        <Route path="4" element={<Passo4 />} />
        <Route path="5" element={<Passo5 />} />
        <Route path="5trocas" element={<Passo5Trocas />} />
        <Route path="6" element={<Passo6 />} />
        <Route path="6/financiamento" element={<Passo6Financiamento />} />
        <Route path="6/aluguel" element={<Passo6Aluguel />} />
        <Route path="6/responsabilidade" element={<Passo6Responsabilidade />} />
        <Route path="7" element={<Passo7 />} />
        <Route path="8" element={<Passo8 />} />
        <Route path="9" element={<Passo9 />} />
        <Route path="confirmacao" element={<PassoConfirmacao />} />
        <Route path="*" element={<Navigate to="/onboarding/1" replace />} />
      </Routes>
    </OnboardingCtx.Provider>
  );
}
