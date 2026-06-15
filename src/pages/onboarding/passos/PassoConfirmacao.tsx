import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../../../hooks/usePerfil';
import { PassoLayout } from '../PassoLayout';
import { SecaoRodagem } from '../../../components/estimativa/SecaoRodagem';
import { getNomeModelo } from '../../../data/catalogoModelos';
import { Button } from '../../../components/ui/button';
import type { SituacaoMoto } from '../../../types/perfil';
import { sufixoValorSeguro, valorSeguroNoPeriodo } from '../../../utils/seguro';
import { perfilProntoParaCommit } from '../../../utils/onboardingGuards';

const SITUACAO_LABEL: Record<SituacaoMoto, string> = {
  quitada: 'Quitada',
  financiada: 'Financiada',
  alugada: 'Alugada',
};

export function PassoConfirmacao() {
  const { perfil, dispatch } = usePerfil();
  const navigate = useNavigate();
  const { moto, trabalho, financeiro, perfilManutencao } = perfil;
  const podeConcluir = perfilProntoParaCommit(perfil);
  const vidaUtilPersonalizada = perfil.servicosIndependentes.some(
    (s) => s.intervaloKmInformadoUsuario === true,
  );
  const trocasRegistradas = Object.values(moto.kmUltimaTrocas).filter((km) => km > 0).length;

  // Rodagem não tem passo próprio: é editada inline aqui, com o mesmo card da Estimativa.
  const [kmDiaInput, setKmDiaInput] = useState(String(trabalho.kmPorDia));
  function handleKmDiaBlur() {
    const v = parseInt(kmDiaInput, 10);
    if (!isNaN(v) && v >= 1 && v <= 999) {
      dispatch({ type: 'SET_KM_POR_DIA', valor: v });
    } else {
      setKmDiaInput(String(trabalho.kmPorDia));
    }
  }
  function stepDias(delta: number) {
    const novo = trabalho.diasPorSemana + delta;
    if (novo >= 1 && novo <= 7) {
      dispatch({ type: 'SET_DIAS_POR_SEMANA', valor: novo });
    }
  }

  function concluir() {
    if (!podeConcluir) {
      navigate('/onboarding/modelo', { replace: true });
      return;
    }

    dispatch({ type: 'COMMIT_ONBOARDING' });
    navigate('/estimativa', { replace: true });
  }

  function editarPasso(passo: string) {
    // `editando` faz o passo voltar direto à Confirmação ao salvar (RF-6.31.6).
    navigate(`/onboarding/${passo}`, { state: { editando: true } });
  }

  return (
    <PassoLayout
      titulo="Tudo certo!"
      subtitulo="Revise seus dados antes de concluir"
      aoProximo={concluir}
      podeContinuar={podeConcluir}
      textoBotao="Concluir configuração"
    >
      <div className="flex flex-col gap-2">
        {/* Rodagem: única seção editável inline aqui (não tem passo próprio) — destacada. */}
        <div className="rounded-lg ring-2 ring-primary/50">
          <SecaoRodagem
            kmDiaInput={kmDiaInput}
            onKmDiaChange={setKmDiaInput}
            onKmDiaBlur={handleKmDiaBlur}
            dias={trabalho.diasPorSemana}
            onStepDias={stepDias}
          />
        </div>

        <SessaoResumo titulo="Moto" aoEditar={() => editarPasso('modelo')}>
          <LinhaResumo
            label="Marca / Modelo"
            valor={`${moto.marca} ${getNomeModelo(moto.modelo)} ${moto.ano}`}
          />
        </SessaoResumo>

        <SessaoResumo titulo="Quilometragem" aoEditar={() => editarPasso('km')}>
          <LinhaResumo label="KM atual" valor={`${moto.kmAtual.toLocaleString('pt-BR')} km`} />
          <LinhaResumo
            label="KM última revisão periódica"
            valor={
              moto.kmUltimaRevisao != null
                ? `${moto.kmUltimaRevisao.toLocaleString('pt-BR')} km`
                : '-'
            }
          />
        </SessaoResumo>

        <SessaoResumo titulo="Situação da moto" aoEditar={() => editarPasso('situacao')}>
          <LinhaResumo label="Situação" valor={SITUACAO_LABEL[financeiro.situacaoMoto]} />
          {financeiro.situacaoMoto === 'financiada' && financeiro.parcelaMensal != null && (
            <LinhaResumo
              label="Parcela mensal"
              valor={`R$ ${financeiro.parcelaMensal.toFixed(2)}`}
            />
          )}
          {financeiro.situacaoMoto === 'alugada' && financeiro.aluguelValor != null && (
            <LinhaResumo
              label="Aluguel"
              valor={`R$ ${financeiro.aluguelValor.toFixed(2)}/${financeiro.aluguelPeriodicidade ?? 'mês'}`}
            />
          )}
        </SessaoResumo>

        <SessaoResumo titulo="Seguro" aoEditar={() => editarPasso('seguro')}>
          <LinhaResumo label="Seguro" valor={financeiro.seguro.valorAnual > 0 ? 'Sim' : 'Não'} />
          {financeiro.seguro.valorAnual > 0 && (
            <LinhaResumo
              label="Valor"
              valor={`R$ ${valorSeguroNoPeriodo(
                financeiro.seguro.valorAnual,
                financeiro.seguro.periodicidade,
              ).toFixed(2)}/${sufixoValorSeguro(financeiro.seguro.periodicidade)}`}
            />
          )}
        </SessaoResumo>

        <SessaoResumo titulo="Alimentação" aoEditar={() => editarPasso('alimentacao')}>
          <LinhaResumo
            label="Alimentação"
            valor={
              financeiro.alimentacaoDia > 0
                ? `R$ ${financeiro.alimentacaoDia.toFixed(2)}/dia`
                : 'Não come na rua'
            }
          />
        </SessaoResumo>

        <SessaoResumo titulo="Gastos operacionais" aoEditar={() => editarPasso('internet')}>
          <LinhaResumo
            label="Internet"
            valor={financeiro.internet > 0 ? `R$ ${financeiro.internet.toFixed(2)}/mês` : '-'}
          />
        </SessaoResumo>

        <SessaoResumo titulo="Vida útil das peças" aoEditar={() => editarPasso('vida-util')}>
          <LinhaResumo
            label="Intervalos de troca"
            valor={vidaUtilPersonalizada ? 'Personalizada' : 'Padrão'}
          />
        </SessaoResumo>

        <SessaoResumo titulo="Mão de obra" aoEditar={() => editarPasso('mao-de-obra')}>
          <LinhaResumo
            label="Estimativa"
            valor={perfilManutencao.incluirEstimativaMaoDeObra ? 'Estimado' : 'Padrão'}
          />
        </SessaoResumo>

        <SessaoResumo
          titulo="Últimas manutenções"
          aoEditar={() => editarPasso('ultimas-manutencoes')}
        >
          <LinhaResumo
            label="Trocas registradas"
            valor={trocasRegistradas > 0 ? `${trocasRegistradas}` : 'Nenhuma'}
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
    <div className="bg-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-primary text-xs font-semibold uppercase tracking-wider">{titulo}</p>
        {aoEditar && (
          <Button
            variant="link"
            onClick={aoEditar}
            className="h-auto p-0 text-xs font-medium text-primary"
          >
            Editar
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

function LinhaResumo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-muted last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground text-sm font-medium">{valor}</span>
    </div>
  );
}
