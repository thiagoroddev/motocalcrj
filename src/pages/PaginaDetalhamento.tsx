import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';
import { useCustos } from '../hooks/useCustos';
import { obterPreset } from '../data/repositorioPresets';
import {
  calcularTotalFiltrado,
  calcularGranularidades,
  categoriasParaFiltros,
  converterAnualParaPeriodo,
  calcularParcelasRestantesAtuais,
} from '../utils/calculos';
import type { FiltrosCategorias } from '../types/calculos';
import type { CategoriaDisplay } from '../types/perfil';
import { moeda, cpkFormatado } from '../utils/formatters';
import { CardTotalAnual } from '../components/detalhamento/CardTotalAnual';
import { CategoriaAccordion } from '../components/detalhamento/CategoriaAccordion';
import { BotaoLapisEdicao } from '../components/detalhamento/BotaoLapisEdicao';
import { LinhaDetalhe } from '../components/detalhamento/LinhaDetalhe';
import { SecaoImprevistos } from '../components/detalhamento/SecaoImprevistos';
import { SecaoManutencao } from '../components/detalhamento/SecaoManutencao';
import { SeletorPeriodo, type Periodo } from '../components/SeletorPeriodo';
import { CabecalhoVoltar } from '../components/CabecalhoVoltar';
import { DialogEdicaoCusto, type EdicaoAlvo } from '../components/detalhamento/DialogEdicaoCusto';

type ChaveCategoriaSimples = 'internet' | 'seguro' | 'alimentacao' | 'financiamento';
type ChaveFiltroCategoria = keyof Omit<
  FiltrosCategorias,
  'manutencaoPorPeca' | 'revisaoPorServico' | 'imprevistosSugeridos'
>;

const CATEGORIAS_SIMPLES: {
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

const FILTRO_PARA_CATEGORIA: Partial<Record<ChaveFiltroCategoria, keyof CategoriaDisplay>> = {
  documentos: 'documentacao',
  manutencao: 'manutencao',
  combustivel: 'combustivel',
  internet: 'internet',
  seguro: 'seguro',
  alimentacao: 'alimentacao',
  financiamento: 'financiamento',
};

const ROTULO_PERIODO_CURTO: Record<Periodo, string> = {
  ano: 'ano',
  mes: 'mês',
  sem: 'semana',
  dia: 'dia',
  hora: 'hora',
};

function formatarNumeroPtBr(
  valor: number,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits, maximumFractionDigits });
}

function formatarKm(valor: number): string {
  const casasDecimais = Number.isInteger(valor) || valor >= 100 ? 0 : 1;
  return `${formatarNumeroPtBr(valor, casasDecimais, casasDecimais)} km`;
}

function formatarKmNoPeriodo(valor: number, periodo: Periodo): string {
  return `${formatarKm(valor)}/${ROTULO_PERIODO_CURTO[periodo]}`;
}

function formatarQuantidade(valor: number, unidade: string): string {
  const casasDecimais = Number.isInteger(valor) ? 0 : 1;
  return `${formatarNumeroPtBr(valor, casasDecimais, casasDecimais)} ${unidade}`;
}

function formatarLitros(valor: number): string {
  return `${formatarNumeroPtBr(valor, 2, 2)} L`;
}

function formatarPrecoLitro(valor: number): string {
  return `${moeda(valor)}/L`;
}

function montarFormulaCombustivel(
  kmPeriodo: number,
  consumoEfetivo: number,
  precoLitro: number,
  totalPeriodo: string,
): string {
  if (consumoEfetivo <= 0) {
    return 'Informe consumo efetivo para calcular.';
  }

  return `${formatarKm(kmPeriodo)} / ${formatarNumeroPtBr(
    consumoEfetivo,
    1,
    1,
  )} km/L x ${formatarPrecoLitro(precoLitro)} = ${totalPeriodo}`;
}

// Nota explicativa no rodapé do conteúdo expandido. Quando editável, o lápis
// fica aqui (não no header do card), para os toggles de todas as categorias
// permanecerem alinhados. O texto quebra linha respeitando o espaço do lápis.
function NotaRodape({
  children,
  onEditar,
  ariaLabel,
}: {
  children: ReactNode;
  onEditar?: () => void;
  ariaLabel?: string;
}) {
  return (
    <div className="flex items-start gap-2 border-t border-muted/70 pt-2">
      <p className="flex-1 min-w-0 text-[11px] leading-relaxed text-muted-foreground/45">
        {children}
      </p>
      {onEditar && <BotaoLapisEdicao onClick={onEditar} ariaLabel={ariaLabel ?? 'Editar'} />}
    </div>
  );
}

function LinhaDetalheTexto({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground/60 text-xs">{label}</span>
      <span className="min-w-0 text-right text-muted-foreground text-xs font-medium tabular-nums break-words">
        {valor}
      </span>
    </div>
  );
}

export function PaginaDetalhamento() {
  const navigate = useNavigate();
  const { perfil, dispatch } = usePerfil();
  const resultado = useCustos();
  const filtros = categoriasParaFiltros(
    perfil.configuracaoDisplay.categoriasAtivas,
    perfil.configuracaoDisplay.imprevistosSugeridosAtivos,
    perfil.configuracaoDisplay.filtrosManutencao,
  );
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});
  const [periodo, setPeriodo] = useState<Periodo>('ano');
  const [edicao, setEdicao] = useState<EdicaoAlvo | null>(null);

  if (!resultado) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <p className="text-muted-foreground/60 text-sm text-center">Modelo não encontrado.</p>
      </div>
    );
  }

  const { custos, kmAnual, diasAno } = resultado;
  const horasDia = perfil.trabalho.horasPorDia;
  // Nome de exibição por peça (do preset), para a Manutenção nomear itens
  // só-serviço (Honda) pelo componente, não pelo nome do serviço (F).
  const presetAtual = obterPreset(perfil.moto.modelo);
  const nomePorPeca: Record<string, string> = {};
  if (presetAtual) {
    for (const p of presetAtual.pecas) nomePorPeca[p.id] = p.nome;
    for (const pn of presetAtual.pneus) {
      nomePorPeca[pn.id] = pn.posicao === 'dianteiro' ? 'Pneu dianteiro' : 'Pneu traseiro';
    }
  }
  const totalFiltrado = calcularTotalFiltrado(custos, filtros);
  const gran = calcularGranularidades(totalFiltrado, diasAno, kmAnual);
  const totalManutencaoComRevisao = custos.manutencao.total + custos.revisao.total;
  const totalImprevistos = filtros.gastosCustom
    ? custos.gastosCustom.total +
      [...custos.gastosCustom.detalhes.sugeridos.entries()].reduce(
        (soma, [id, imprevisto]) =>
          filtros.imprevistosSugeridos[id] === true ? soma + imprevisto.custoAnual : soma,
        0,
      )
    : 0;

  const pct = (valor: number, ativo: boolean = true) =>
    !ativo || totalFiltrado <= 0 ? '0%' : `${Math.round((valor / totalFiltrado) * 100)}%`;
  const pp = (anual: number) => moeda(converterAnualParaPeriodo(anual, periodo, diasAno, horasDia));
  const cvt = (anual: number) => converterAnualParaPeriodo(anual, periodo, diasAno, horasDia);
  const totalFiltradoNoPeriodo = cvt(totalFiltrado);
  const kmNoPeriodo = cvt(kmAnual);
  const diasTrabalhadosNoPeriodo = cvt(diasAno);
  const pendenciasMaoDeObra = custos.revisao.detalhes.pendenciasMaoDeObra;
  const custoManutencaoIncompleto = custos.revisao.detalhes.custoIncompleto;
  const incluiEstimativaMaoDeObra = perfil.perfilManutencao.incluirEstimativaMaoDeObra ?? false;
  const avisoCustoParcial = custoManutencaoIncompleto
    ? `Custo parcial: falta valor de mão de obra da concessionária para ${pendenciasMaoDeObra.length} serviço${pendenciasMaoDeObra.length === 1 ? '' : 's'} na categoria Manutenção.${incluiEstimativaMaoDeObra ? ' Os demais usam estimativa (~).' : ''}`
    : incluiEstimativaMaoDeObra
      ? 'Inclui estimativas de mão de obra (~) onde a concessionária não informa o valor.'
      : undefined;
  const tipoUsoLabel = perfil.moto.perfilUso === 'entrega' ? 'Entrega' : 'Passageiro';
  const modoRevisaoLabel = 'Concessionária';
  const precoCombustivel =
    perfil.financeiro.combustiveis[perfil.financeiro.tipoGasolinaPreferida].preco;
  const kmCombustivelNoPeriodo = cvt(custos.combustivel.detalhes.kmAnual);
  const litrosCombustivelNoPeriodo =
    custos.combustivel.detalhes.consumoEfetivo > 0
      ? kmCombustivelNoPeriodo / custos.combustivel.detalhes.consumoEfetivo
      : 0;
  const totalCombustivelPeriodo = pp(custos.combustivel.total);

  function toggleFiltro(cat: ChaveFiltroCategoria) {
    if (cat === 'revisao') {
      dispatch({ type: 'TOGGLE_REVISAO_MANUTENCAO' });
      return;
    }
    const cat2 = FILTRO_PARA_CATEGORIA[cat];
    if (cat2) dispatch({ type: 'TOGGLE_CATEGORIA', categoria: cat2 });
  }

  function togglePeca(id: string) {
    dispatch({ type: 'TOGGLE_MANUTENCAO_POR_PECA', id });
  }

  function toggleServicoRevisao(id: string) {
    dispatch({ type: 'TOGGLE_REVISAO_POR_SERVICO', id });
  }

  function toggleImprevistoSugerido(id: string) {
    dispatch({ type: 'TOGGLE_IMPREVISTO_SUGERIDO', id });
  }

  function toggleCategoriaImprevistos() {
    dispatch({ type: 'TOGGLE_CATEGORIA', categoria: 'imprevistos' });
  }

  const toggleAcordeao = (id: string) => setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));

  function irParaRevisaoConcessionaria(destaqueIndex?: number) {
    navigate('/mao-de-obra', { state: { abaInicial: 'concessionaria', destaqueIndex } });
  }

  function labelCategoriaSimples(label: string, chave: ChaveCategoriaSimples): string {
    if (chave === 'financiamento' && perfil.financeiro.situacaoMoto === 'alugada') {
      return 'Aluguel';
    }
    return label;
  }

  function renderizarDetalhesCategoriaSimples(
    chave: ChaveCategoriaSimples,
    onEditar: () => void,
    ariaLabel: string,
  ) {
    if (chave === 'internet') {
      return (
        <>
          <LinhaDetalheTexto
            label="Mensalidade"
            valor={`${moeda(perfil.financeiro.internet)}/mês`}
          />
          <LinhaDetalheTexto
            label="Cálculo anual"
            valor={`${moeda(perfil.financeiro.internet)} x 12 = ${moeda(custos.internet.total)}`}
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
          <LinhaDetalheTexto
            label="Valor anual"
            valor={moeda(perfil.financeiro.seguro.valorAnual)}
          />
          <LinhaDetalheTexto
            label="Periodicidade"
            valor={perfil.financeiro.seguro.periodicidade === 'mensal' ? 'Mensal' : 'Anual'}
          />
          <LinhaDetalheTexto label="Seguradora" valor={seguradora} />
          {custos.seguro.total !== perfil.financeiro.seguro.valorAnual && (
            <LinhaDetalheTexto label="Custo considerado" valor={moeda(custos.seguro.total)} />
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
            )} = ${pp(custos.alimentacao.total)}`}
          />
          <NotaRodape onEditar={onEditar} ariaLabel={ariaLabel}>
            {`Os dias vêm da configuração de trabalho na Estimativa: ${perfil.trabalho.diasPorSemana} dias/semana x 52 semanas.`}
          </NotaRodape>
        </>
      );
    }

    if (perfil.financeiro.situacaoMoto === 'alugada') {
      const aluguel = perfil.financeiro.aluguelMensal ?? 0;
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
            valor={`${moeda(aluguel)} x ${multiplicador} = ${moeda(custos.financiamento.total)}`}
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
            custos.financiamento.total,
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <CabecalhoVoltar titulo="Detalhamento" chaveAjuda="detalhamento" />

      <div className="px-4 py-4 space-y-3">
        <CardTotalAnual
          periodo={periodo}
          totalPeriodo={totalFiltradoNoPeriodo}
          kmPeriodo={formatarKmNoPeriodo(kmNoPeriodo, periodo)}
          porKm={gran.porKm}
          avisoCustoParcial={avisoCustoParcial}
          detalhesFixos={[
            {
              label: `${formatarKm(perfil.trabalho.kmPorDia)}/dia`,
              onClick: () => setEdicao({ tipo: 'usoDiario' }),
              ariaLabel: 'Editar km por dia',
            },
            {
              label: `${perfil.trabalho.diasPorSemana} dias/semana`,
              onClick: () => setEdicao({ tipo: 'usoDiario' }),
              ariaLabel: 'Editar dias por semana',
            },
            {
              label: tipoUsoLabel,
              onClick: () => setEdicao({ tipo: 'preferencias' }),
              ariaLabel: 'Editar perfil de uso',
            },
            {
              label: `Revisão ${modoRevisaoLabel}`,
              onClick: () => setEdicao({ tipo: 'preferencias' }),
              ariaLabel: 'Editar modo de revisão',
            },
            {
              label: incluiEstimativaMaoDeObra ? 'M.O. estimada ~' : 'M.O. valor real',
              onClick: () => setEdicao({ tipo: 'estimativaMaoDeObra' }),
              ariaLabel: 'Editar modo de estimativa de mão de obra',
            },
          ]}
        />
        <SeletorPeriodo periodo={periodo} onChange={setPeriodo} />
        {perfil.trabalho.diasPorSemana === 1 && (
          <p className="text-muted-foreground/60 text-xs px-1">
            Com 1 dia/semana configurado, os modos Dia e Sem mostram o mesmo valor. Ajuste em
            Estimativa.
          </p>
        )}

        <CategoriaAccordion
          label="Documentos"
          categoriaId="documentos"
          corClasse="bg-blue-400"
          valorExibido={pp(custos.documentos.total)}
          porcentagem={pct(custos.documentos.total, filtros.documentos)}
          ativo={filtros.documentos}
          expandido={!!expandido['documentos']}
          onToggleAtivo={() => toggleFiltro('documentos')}
          onToggleExpandido={() => toggleAcordeao('documentos')}
        >
          <LinhaDetalhe label="IPVA" valor={cvt(custos.documentos.detalhes.ipva)} />
          <LinhaDetalhe
            label="Licenciamento"
            valor={cvt(custos.documentos.detalhes.licenciamento)}
          />
          <LinhaDetalheTexto label="Base anual" valor={moeda(custos.documentos.total)} />
          <NotaRodape>Custo legal anual rateado pelo período selecionado.</NotaRodape>
        </CategoriaAccordion>

        <SecaoManutencao
          totalManutencaoComRevisao={totalManutencaoComRevisao}
          totalRevisao={custos.revisao.detalhes.base}
          eventosRevisaoNoAno={custos.revisao.detalhes.eventosNoAno}
          modoRevisao={custos.revisao.detalhes.modo}
          kmAtual={perfil.moto.kmAtual}
          kmAnual={kmAnual}
          servicosRevisao={[...custos.revisao.detalhes.servicos.entries()]}
          custoIncompleto={custoManutencaoIncompleto}
          pendenciasMaoDeObra={pendenciasMaoDeObra}
          pecas={[...custos.manutencao.detalhes.entries()]}
          nomePorPeca={nomePorPeca}
          filtroAtivo={filtros.manutencao}
          filtroRevisao={filtros.revisao}
          filtrosServicosRevisao={filtros.revisaoPorServico}
          filtrosPecas={filtros.manutencaoPorPeca}
          expandido={!!expandido['manutencao']}
          onToggleAtivo={() => toggleFiltro('manutencao')}
          onToggleExpandido={() => toggleAcordeao('manutencao')}
          onToggleRevisao={() => toggleFiltro('revisao')}
          onToggleServicoRevisao={toggleServicoRevisao}
          onTogglePeca={togglePeca}
          onEditarPeca={(pecaId) => setEdicao({ tipo: 'pecaComMO', pecaId })}
          onEditarRevisaoGeral={() => irParaRevisaoConcessionaria()}
          onEditarServicoRevisao={(servicoId) =>
            setEdicao({ tipo: 'servicoAutorizada', servicoId })
          }
          pp={pp}
          pct={pct}
        />

        <CategoriaAccordion
          label="Combustível"
          categoriaId="combustivel"
          corClasse="bg-green-500"
          valorExibido={totalCombustivelPeriodo}
          porcentagem={pct(custos.combustivel.total, filtros.combustivel)}
          ativo={filtros.combustivel}
          expandido={!!expandido['combustivel']}
          onToggleAtivo={() => toggleFiltro('combustivel')}
          onToggleExpandido={() => toggleAcordeao('combustivel')}
        >
          <LinhaDetalhe
            label="Custo por km"
            valor={custos.combustivel.detalhes.cpk}
            formatter={cpkFormatado}
          />
          <LinhaDetalhe
            label="Consumo efetivo"
            valor={custos.combustivel.detalhes.consumoEfetivo}
            suffix="km/L"
          />
          <LinhaDetalheTexto
            label="Km no período"
            valor={formatarKmNoPeriodo(kmCombustivelNoPeriodo, periodo)}
          />
          <LinhaDetalheTexto
            label="Litros estimados"
            valor={formatarLitros(litrosCombustivelNoPeriodo)}
          />
          <LinhaDetalheTexto
            label="Preço do combustível"
            valor={formatarPrecoLitro(precoCombustivel)}
          />
          <LinhaDetalheTexto
            label="Cálculo"
            valor={montarFormulaCombustivel(
              kmCombustivelNoPeriodo,
              custos.combustivel.detalhes.consumoEfetivo,
              precoCombustivel,
              totalCombustivelPeriodo,
            )}
          />
          <NotaRodape
            onEditar={() => setEdicao({ tipo: 'combustivel' })}
            ariaLabel="Editar combustível"
          >
            Projeção por km rodado. Não soma lançamentos reais de combustível.
          </NotaRodape>
        </CategoriaAccordion>

        {CATEGORIAS_SIMPLES.filter((c) => custos[c.chave].ativo).map((c) => (
          <CategoriaAccordion
            key={c.chave}
            label={labelCategoriaSimples(c.label, c.chave)}
            categoriaId={c.chave}
            corClasse={c.cor}
            valorExibido={pp(custos[c.chave].total)}
            porcentagem={pct(custos[c.chave].total, filtros[c.chave])}
            ativo={filtros[c.chave]}
            expandido={!!expandido[c.chave]}
            onToggleAtivo={() => toggleFiltro(c.chave)}
            onToggleExpandido={() => toggleAcordeao(c.chave)}
          >
            {renderizarDetalhesCategoriaSimples(
              c.chave,
              () => setEdicao(c.edicao),
              `Editar ${labelCategoriaSimples(c.label, c.chave)}`,
            )}
          </CategoriaAccordion>
        ))}

        <SecaoImprevistos
          gastosCustom={perfil.financeiro.gastosCustom}
          imprevistosSugeridos={[...custos.gastosCustom.detalhes.sugeridos.entries()]}
          filtrosImprevistosSugeridos={filtros.imprevistosSugeridos}
          onToggleImprevistoSugerido={toggleImprevistoSugerido}
          onEditarImprevistoSugerido={(id) =>
            setEdicao({ tipo: 'servicoExcepcional', servicoId: id })
          }
          dispatch={dispatch}
          valorTotal={totalImprevistos}
          categoriaAtiva={filtros.gastosCustom}
          onToggleCategoria={toggleCategoriaImprevistos}
          expandido={!!expandido['imprevistos']}
          onToggleExpandido={() => toggleAcordeao('imprevistos')}
          pp={pp}
          pct={pct}
        />

        <div className="h-6" />
      </div>

      <DialogEdicaoCusto
        alvo={edicao}
        perfil={perfil}
        dispatch={dispatch}
        onClose={() => setEdicao(null)}
      />
    </div>
  );
}
