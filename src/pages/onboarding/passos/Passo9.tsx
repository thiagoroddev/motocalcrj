import type { ReactNode } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { getNomeModelo } from '../../../data/catalogoModelos';
import type { SituacaoMoto } from '../../../types/perfil';

const SITUACAO_LABEL: Record<SituacaoMoto, string> = {
  quitada: 'Quitada',
  financiada: 'Financiada',
  alugada: 'Alugada',
};

export function Passo9() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();
  const { moto, trabalho, financeiro } = perfil;

  function concluir() {
    dispatch({ type: 'COMMIT_ONBOARDING' });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Tudo certo!"
      subtitulo="Revise seus dados antes de concluir"
      aoProximo={concluir}
      textoBotao="Concluir configuração"
    >
      <div className="flex flex-col gap-sm">
        <SessaoResumo titulo="Moto">
          <LinhaResumo
            label="Marca / Modelo"
            valor={`${moto.marca} ${getNomeModelo(moto.modelo)} ${moto.ano}`}
          />
          <LinhaResumo
            label="Uso"
            valor={moto.perfilUso === 'entrega' ? 'Entregas' : 'Passageiro'}
          />
        </SessaoResumo>

        <SessaoResumo titulo="Rodagem">
          <LinhaResumo label="Km por dia" valor={`${trabalho.kmPorDia} km`} />
          <LinhaResumo label="Dias por semana" valor={`${trabalho.diasPorSemana} dias`} />
        </SessaoResumo>

        <SessaoResumo titulo="Financeiro">
          <LinhaResumo label="Situação" valor={SITUACAO_LABEL[financeiro.situacaoMoto]} />
          {financeiro.situacaoMoto === 'financiada' && financeiro.parcelaMensal != null && (
            <LinhaResumo
              label="Parcela mensal"
              valor={`R$ ${financeiro.parcelaMensal.toFixed(2)}`}
            />
          )}
          {financeiro.situacaoMoto === 'alugada' && financeiro.aluguelMensal != null && (
            <LinhaResumo
              label="Aluguel"
              valor={`R$ ${financeiro.aluguelMensal.toFixed(2)}/${financeiro.aluguelPeriodicidade ?? 'mês'}`}
            />
          )}
          <LinhaResumo label="Seguro" valor={financeiro.seguro.tem ? 'Sim' : 'Não'} />
          <LinhaResumo
            label="Internet"
            valor={financeiro.internet > 0 ? `R$ ${financeiro.internet.toFixed(2)}/mês` : '—'}
          />
          <LinhaResumo
            label="Alimentação"
            valor={
              financeiro.alimentacaoDia > 0 ? `R$ ${financeiro.alimentacaoDia.toFixed(2)}/dia` : '—'
            }
          />
        </SessaoResumo>
      </div>
    </PassoLayout>
  );
}

function SessaoResumo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="bg-surface-cont rounded-card p-md">
      <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-sm">{titulo}</p>
      {children}
    </div>
  );
}

function LinhaResumo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between items-center py-xs border-b border-surface-bright last:border-0">
      <span className="text-neutral text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{valor}</span>
    </div>
  );
}
