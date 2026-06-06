import type { Periodo } from '../../types/calculos';
import type { PerfilUsuario, SituacaoMoto } from '../../types/perfil';
import { calcularParcelasRestantesAtuais } from '../../utils/calculos';
import { formatarQuantidade, ROTULO_PERIODO_CURTO } from '../../utils/formatadoresDetalhamento';
import { moeda } from '../../utils/formatters';
import type { EdicaoAlvo } from './DialogEdicaoCusto';
import { LinhaDetalheTexto, NotaRodape } from './ElementosDetalhamento';

export type ChaveCategoriaSimples = 'internet' | 'seguro' | 'alimentacao' | 'financiamento';

export const CATEGORIAS_SIMPLES: {
  chave: ChaveCategoriaSimples;
  label: string;
  cor: string;
  edicao: EdicaoAlvo;
}[] = [
  { chave: 'internet', label: 'Internet', cor: 'bg-sky-500', edicao: { tipo: 'internet' } },
  { chave: 'seguro', label: 'Seguro', cor: 'bg-primary', edicao: { tipo: 'seguro' } },
  {
    chave: 'alimentacao',
    label: 'Alimentação',
    cor: 'bg-yellow-400',
    edicao: { tipo: 'alimentacao' },
  },
  {
    chave: 'financiamento',
    label: 'Financiamento',
    cor: 'bg-orange-500',
    edicao: { tipo: 'financiamento' },
  },
];

export function obterLabelCategoriaSimples(
  label: string,
  chave: ChaveCategoriaSimples,
  situacaoMoto: SituacaoMoto,
): string {
  return chave === 'financiamento' && situacaoMoto === 'alugada' ? 'Aluguel' : label;
}

interface DetalhesCategoriaSimplesProps {
  chave: ChaveCategoriaSimples;
  perfil: PerfilUsuario;
  custoAnual: number;
  periodo: Periodo;
  diasTrabalhadosNoPeriodo: number;
  formatarValorPeriodo: (valorAnual: number) => string;
  onEditar: () => void;
  ariaLabel: string;
}

export function DetalhesCategoriaSimples({
  chave,
  perfil,
  custoAnual,
  periodo,
  diasTrabalhadosNoPeriodo,
  formatarValorPeriodo,
  onEditar,
  ariaLabel,
}: DetalhesCategoriaSimplesProps) {
  if (chave === 'internet') {
    return (
      <>
        <LinhaDetalheTexto label="Mensalidade" valor={`${moeda(perfil.financeiro.internet)}/mês`} />
        <LinhaDetalheTexto
          label="Cálculo anual"
          valor={`${moeda(perfil.financeiro.internet)} x 12 = ${moeda(custoAnual)}`}
        />
        <NotaRodape onEditar={onEditar} ariaLabel={ariaLabel}>
          Valor fixo mensal rateado pelo período selecionado.
        </NotaRodape>
      </>
    );
  }

  if (chave === 'seguro') {
    const seguradora = perfil.financeiro.seguro.empresa?.trim() || 'Não informada';
    return (
      <>
        <LinhaDetalheTexto label="Valor anual" valor={moeda(perfil.financeiro.seguro.valorAnual)} />
        <LinhaDetalheTexto
          label="Periodicidade"
          valor={perfil.financeiro.seguro.periodicidade === 'mensal' ? 'Mensal' : 'Anual'}
        />
        <LinhaDetalheTexto label="Seguradora" valor={seguradora} />
        {custoAnual !== perfil.financeiro.seguro.valorAnual && (
          <LinhaDetalheTexto label="Custo considerado" valor={moeda(custoAnual)} />
        )}
        <NotaRodape onEditar={onEditar} ariaLabel={ariaLabel}>
          Valor anual rateado pelo período selecionado.
        </NotaRodape>
      </>
    );
  }

  if (chave === 'alimentacao') {
    return (
      <>
        <LinhaDetalheTexto
          label="Valor por dia"
          valor={`${moeda(perfil.financeiro.alimentacaoDia)}/dia`}
        />
        <LinhaDetalheTexto
          label="Dias no período"
          valor={`${formatarQuantidade(diasTrabalhadosNoPeriodo, 'dias')}/${ROTULO_PERIODO_CURTO[periodo]}`}
        />
        <LinhaDetalheTexto
          label="Dias/semana"
          valor={`${perfil.trabalho.diasPorSemana} dias/semana`}
        />
        <LinhaDetalheTexto
          label="Cálculo"
          valor={`${moeda(perfil.financeiro.alimentacaoDia)} x ${formatarQuantidade(
            diasTrabalhadosNoPeriodo,
            'dias',
          )} = ${formatarValorPeriodo(custoAnual)}`}
        />
        <NotaRodape onEditar={onEditar} ariaLabel={ariaLabel}>
          {`Os dias vêm da configuração de trabalho na Estimativa: ${perfil.trabalho.diasPorSemana} dias/semana x 52 semanas.`}
        </NotaRodape>
      </>
    );
  }

  if (perfil.financeiro.situacaoMoto === 'alugada') {
    const aluguel = perfil.financeiro.aluguelValor ?? 0;
    const periodicidade = perfil.financeiro.aluguelPeriodicidade ?? 'mensal';
    const multiplicador = periodicidade === 'semanal' ? 52 : 12;
    return (
      <>
        <LinhaDetalheTexto
          label="Aluguel"
          valor={`${moeda(aluguel)}/${periodicidade === 'semanal' ? 'semana' : 'mês'}`}
        />
        <LinhaDetalheTexto
          label="Cálculo anual"
          valor={`${moeda(aluguel)} x ${multiplicador} = ${moeda(custoAnual)}`}
        />
        <NotaRodape onEditar={onEditar} ariaLabel={ariaLabel}>
          Valor recorrente rateado pelo período selecionado.
        </NotaRodape>
      </>
    );
  }

  const restantesHoje = calcularParcelasRestantesAtuais(
    perfil.financeiro.parcelasRestantes,
    perfil.financeiro.dataReferenciaParcelas,
  );
  const parcelasNoAno = Math.min(12, restantesHoje);
  return (
    <>
      <LinhaDetalheTexto
        label="Parcela"
        valor={`${moeda(perfil.financeiro.parcelaMensal ?? 0)}/mês`}
      />
      <LinhaDetalheTexto
        label="Parcelas restantes"
        valor={
          perfil.financeiro.parcelasRestantes != null ? String(restantesHoje) : 'Não informado'
        }
      />
      <LinhaDetalheTexto
        label="Cálculo anual"
        valor={`${moeda(perfil.financeiro.parcelaMensal ?? 0)} x ${parcelasNoAno} = ${moeda(
          custoAnual,
        )}`}
      />
      <p className="border-t border-muted/70 pt-2 text-[11px] leading-relaxed text-muted-foreground/45">
        {restantesHoje > 0
          ? 'Projeta apenas as parcelas que ainda faltam nos próximos 12 meses.'
          : 'Financiamento quitado - não entra mais no custo.'}
      </p>
    </>
  );
}
