import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../../../hooks/usePerfil';
import { PassoLayout } from '../PassoLayout';
import { getNomeModelo } from '../../../data/catalogoModelos';
import type { SituacaoMoto } from '../../../types/perfil';

const SITUACAO_LABEL: Record<SituacaoMoto, string> = {
  quitada: 'Quitada',
  financiada: 'Financiada',
  alugada: 'Alugada',
};

export function PassoConfirmacao() {
  const { perfil, dispatch } = usePerfil();
  const navigate = useNavigate();
  const { moto, trabalho, financeiro } = perfil;

  function concluir() {
    dispatch({ type: 'COMMIT_ONBOARDING' });
    navigate('/estimativa', { replace: true });
  }

  function editarPasso(passo: string) {
    navigate(`/onboarding/${passo}`);
  }

  return (
    <PassoLayout
      titulo="Tudo certo!"
      subtitulo="Revise seus dados antes de concluir"
      aoProximo={concluir}
      textoBotao="Concluir configuração"
    >
      <div className="flex flex-col gap-sm">
        <SessaoResumo titulo="Moto" aoEditar={() => editarPasso('2')}>
          <LinhaResumo
            label="Marca / Modelo"
            valor={`${moto.marca} ${getNomeModelo(moto.modelo)} ${moto.ano}`}
          />
          <LinhaResumo
            label="Uso"
            valor={moto.perfilUso === 'entrega' ? 'Entregas' : 'Passageiro'}
          />
        </SessaoResumo>

        <SessaoResumo titulo="Quilometragem" aoEditar={() => editarPasso('5')}>
          <LinhaResumo label="KM atual" valor={`${moto.kmAtual.toLocaleString('pt-BR')} km`} />
          <LinhaResumo
            label="KM última revisão"
            valor={
              moto.kmUltimaRevisao != null
                ? `${moto.kmUltimaRevisao.toLocaleString('pt-BR')} km`
                : '—'
            }
          />
        </SessaoResumo>

        <SessaoResumo titulo="Rodagem" aoEditar={undefined}>
          <LinhaResumo label="Km por dia (padrão)" valor={`${trabalho.kmPorDia} km`} />
          <LinhaResumo label="Dias por semana (padrão)" valor={`${trabalho.diasPorSemana} dias`} />
        </SessaoResumo>

        <SessaoResumo titulo="Situação da moto" aoEditar={() => editarPasso('6')}>
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
        </SessaoResumo>

        <SessaoResumo titulo="Seguro" aoEditar={() => editarPasso('7')}>
          <LinhaResumo label="Seguro" valor={financeiro.seguro.tem ? 'Sim' : 'Não'} />
          {financeiro.seguro.tem && (
            <LinhaResumo
              label="Valor"
              valor={`R$ ${financeiro.seguro.valorAnual.toFixed(2)}/${financeiro.seguro.periodicidade === 'mensal' ? 'mês' : 'ano'}`}
            />
          )}
        </SessaoResumo>

        <SessaoResumo titulo="Gastos operacionais" aoEditar={() => editarPasso('8')}>
          <LinhaResumo
            label="Internet"
            valor={financeiro.internet > 0 ? `R$ ${financeiro.internet.toFixed(2)}/mês` : '—'}
          />
        </SessaoResumo>

        <SessaoResumo titulo="Alimentação" aoEditar={() => editarPasso('9')}>
          <LinhaResumo
            label="Alimentação"
            valor={
              financeiro.alimentacaoDia > 0
                ? `R$ ${financeiro.alimentacaoDia.toFixed(2)}/dia`
                : 'Não come na rua'
            }
          />
        </SessaoResumo>
      </div>
    </PassoLayout>
  );
}

function SessaoResumo({
  titulo,
  aoEditar,
  children,
}: {
  titulo: string;
  aoEditar: (() => void) | undefined;
  children: ReactNode;
}) {
  return (
    <div className="bg-card rounded-card p-md">
      <div className="flex items-center justify-between mb-sm">
        <p className="text-primary text-xs font-semibold uppercase tracking-wider">{titulo}</p>
        {aoEditar && (
          <button
            type="button"
            onClick={aoEditar}
            className="text-primary text-xs font-medium hover:underline"
          >
            Editar
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function LinhaResumo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between items-center py-xs border-b border-muted last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground text-sm font-medium">{valor}</span>
    </div>
  );
}
