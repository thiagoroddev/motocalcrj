import { createContext, useContext, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  parsePasso,
  getProximoPasso,
  getPassoAnterior,
  proximoEmEdicao,
  CONFIG_PASSOS,
  type ConfigPasso,
} from './onboardingUtils';
import { usePerfil } from '../../hooks/usePerfil';
import { perfilProntoParaCommit } from '../../utils/onboardingGuards';
import { PassoModelo } from './passos/PassoModelo';
import { Passo3 } from './passos/Passo3';
import { Passo4 } from './passos/Passo4';
import { Passo5 } from './passos/Passo5';
import { Passo5Manutencoes } from './passos/Passo5Manutencoes';
import { Passo6 } from './passos/Passo6';
import { Passo6Financiamento } from './passos/Passo6Financiamento';
import { Passo6Aluguel } from './passos/Passo6Aluguel';
import { Passo6Responsabilidade } from './passos/Passo6Responsabilidade';
import { Passo7 } from './passos/Passo7';
import { Passo8 } from './passos/Passo8';
import { Passo9 } from './passos/Passo9';
import { PassoMaoDeObra } from './passos/PassoMaoDeObra';
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
  const { perfil, rascunhoPredefinicao } = usePerfil();
  const entradaInvalidaNoOnboarding = useRef(
    perfil.onboardingConcluido && !rascunhoPredefinicao,
  ).current;

  const passo = parsePasso(location.pathname);
  const config = CONFIG_PASSOS[passo] ?? CONFIG_PASSOS['modelo'];
  // Modo edição: o usuário veio da Confirmação via "Editar". Ao salvar, deve
  // voltar direto à Confirmação em vez de percorrer o resto do fluxo (RF-6.31.6).
  const editando = (location.state as { editando?: boolean } | null)?.editando === true;

  if (entradaInvalidaNoOnboarding) {
    return <Navigate to="/perfil" replace />;
  }

  if (passo === 'confirmacao' && !perfilProntoParaCommit(perfil)) {
    return <Navigate to="/onboarding/modelo" replace />;
  }

  function irParaProximo() {
    const proximo = getProximoPasso(passo, perfil.financeiro.situacaoMoto);
    if (!proximo) {
      return;
    }
    // Em edição, volta à Confirmação — exceto quando o próximo é uma sub-rota
    // obrigatória de Situação, que precisa ser percorrida (carregando a edição).
    if (editando) {
      const destino = proximoEmEdicao(passo, perfil.financeiro.situacaoMoto);
      navigate(
        `/onboarding/${destino}`,
        destino === 'confirmacao' ? undefined : { state: { editando: true } },
      );
      return;
    }
    if (proximo === 'concluir') {
      navigate('/estimativa', { replace: true });
    } else {
      navigate(`/onboarding/${proximo}`);
    }
  }

  function irParaAnterior() {
    if (editando) {
      navigate('/onboarding/confirmacao');
      return;
    }
    const anterior = getPassoAnterior(passo, perfil.financeiro.situacaoMoto);
    if (anterior) {
      navigate(`/onboarding/${anterior}`);
    }
  }

  const temAnterior = editando || getPassoAnterior(passo, perfil.financeiro.situacaoMoto) !== null;

  return (
    <OnboardingCtx.Provider value={{ passo, config, irParaProximo, irParaAnterior, temAnterior }}>
      <Routes>
        <Route path="modelo" element={<PassoModelo />} />
        <Route path="ano" element={<Passo3 />} />
        <Route path="km" element={<Passo5 />} />
        <Route path="situacao" element={<Passo6 />} />
        <Route path="situacao/financiamento" element={<Passo6Financiamento />} />
        <Route path="situacao/aluguel" element={<Passo6Aluguel />} />
        <Route path="situacao/responsabilidade" element={<Passo6Responsabilidade />} />
        <Route path="seguro" element={<Passo7 />} />
        <Route path="alimentacao" element={<Passo9 />} />
        <Route path="internet" element={<Passo8 />} />
        <Route path="vida-util" element={<Passo4 />} />
        <Route path="mao-de-obra" element={<PassoMaoDeObra />} />
        <Route path="ultimas-manutencoes" element={<Passo5Manutencoes />} />
        <Route path="confirmacao" element={<PassoConfirmacao />} />
        <Route path="*" element={<Navigate to="/onboarding/modelo" replace />} />
      </Routes>
    </OnboardingCtx.Provider>
  );
}
