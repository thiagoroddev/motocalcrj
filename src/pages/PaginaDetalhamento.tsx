import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';
import { useCustos } from '../hooks/useCustos';
import { obterPreset } from '../data/repositorioPresets';
import { montarCicloRevisao, projetarProximasRevisoes } from '../utils/cicloRevisao';
import {
  calcularBreakdownValores,
  calcularTotalFiltrado,
  calcularGranularidades,
  categoriasParaFiltros,
  converterAnualParaPeriodo,
} from '../utils/calculos';
import type { FiltrosCategorias } from '../types/calculos';
import type { CategoriaDisplay } from '../types/perfil';
import { moeda, cpkFormatado } from '../utils/formatters';
import {
  formatarKm,
  formatarKmNoPeriodo,
  formatarLitros,
  formatarPrecoLitro,
  montarFormulaCombustivel,
} from '../utils/formatadoresDetalhamento';
import { CardTotalAnual } from '../components/detalhamento/CardTotalAnual';
import { CategoriaAccordion } from '../components/detalhamento/CategoriaAccordion';
import {
  CATEGORIAS_SIMPLES,
  DetalhesCategoriaSimples,
  obterLabelCategoriaSimples,
} from '../components/detalhamento/DetalhesCategoriaSimples';
import { LinhaDetalheTexto, NotaRodape } from '../components/detalhamento/ElementosDetalhamento';
import { LinhaDetalhe } from '../components/detalhamento/LinhaDetalhe';
import { SecaoImprevistos } from '../components/detalhamento/SecaoImprevistos';
import { SecaoManutencao } from '../components/detalhamento/SecaoManutencao';
import { SeletorPeriodo, type Periodo } from '../components/SeletorPeriodo';
import { CabecalhoVoltar } from '../components/CabecalhoVoltar';
import { DialogEdicaoCusto, type EdicaoAlvo } from '../components/detalhamento/DialogEdicaoCusto';

type ChaveFiltroCategoria = keyof Omit<
  FiltrosCategorias,
  'manutencaoPorPeca' | 'revisaoPorServico' | 'imprevistosSugeridos'
>;

const FILTRO_PARA_CATEGORIA: Partial<Record<ChaveFiltroCategoria, keyof CategoriaDisplay>> = {
  documentos: 'documentacao',
  manutencao: 'manutencao',
  combustivel: 'combustivel',
  internet: 'internet',
  seguro: 'seguro',
  alimentacao: 'alimentacao',
  financiamento: 'financiamento',
};

export function PaginaDetalhamento() {
  const navigate = useNavigate();
  const { perfil, dispatch } = usePerfil();
  const resultado = useCustos();
  const filtros = categoriasParaFiltros(
    perfil.configuracaoDisplay.categoriasAtivas,
    {},
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
  const cicloRevisao = presetAtual
    ? montarCicloRevisao(presetAtual.revisaoAutorizada, perfil.revisaoAutorizadaOverrides)
    : null;
  const proximasRevisoes = presetAtual
    ? projetarProximasRevisoes(presetAtual.revisaoAutorizada, perfil.revisaoAutorizadaOverrides, {
        kmAtual: perfil.moto.kmAtual,
        kmAnual,
        kmUltimaRevisao: perfil.moto.kmUltimaRevisao,
      })
    : [];
  const nomePorPeca: Record<string, string> = {};
  if (presetAtual) {
    for (const p of presetAtual.pecas) nomePorPeca[p.id] = p.nome;
    for (const pn of presetAtual.pneus) {
      nomePorPeca[pn.id] = pn.posicao === 'dianteiro' ? 'Pneu dianteiro' : 'Pneu traseiro';
    }
  }
  const totalFiltrado = calcularTotalFiltrado(custos, filtros);
  const valoresFiltrados = calcularBreakdownValores(custos, filtros);
  const gran = calcularGranularidades(totalFiltrado, diasAno, kmAnual);
  const totalManutencaoComRevisao = valoresFiltrados.manutencao + valoresFiltrados.revisao;
  const totalImprevistos = filtros.gastosCustom ? custos.gastosCustom.total : 0;

  const pct = (valor: number, ativo: boolean = true) => {
    if (!ativo || totalFiltrado <= 0) return '0%';
    const p = (valor / totalFiltrado) * 100;
    return p < 1 ? `${p.toFixed(1).replace('.', ',')}%` : `${Math.round(p)}%`;
  };
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

  function toggleCategoriaImprevistos() {
    dispatch({ type: 'TOGGLE_CATEGORIA', categoria: 'imprevistos' });
  }

  const toggleAcordeao = (id: string) => setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));

  function irParaRevisaoConcessionaria(destaqueIndex?: number) {
    navigate('/mao-de-obra', { state: { abaInicial: 'concessionaria', destaqueIndex } });
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
          cicloRevisao={cicloRevisao}
          proximasRevisoes={proximasRevisoes}
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

        {/* Mostra TODAS as categorias simples (mesmo não informadas) para o usuário saber o que está
            fora do cálculo; o toggle de cada uma controla a inclusão. Única exceção: financiamento/
            aluguel some quando a moto é quitada (não há essa despesa). */}
        {CATEGORIAS_SIMPLES.filter((c) =>
          c.chave === 'financiamento' ? perfil.financeiro.situacaoMoto !== 'quitada' : true,
        ).map((c) => (
          <CategoriaAccordion
            key={c.chave}
            label={obterLabelCategoriaSimples(c.label, c.chave, perfil.financeiro.situacaoMoto)}
            categoriaId={c.chave}
            corClasse={c.cor}
            valorExibido={pp(custos[c.chave].total)}
            porcentagem={pct(custos[c.chave].total, filtros[c.chave])}
            ativo={filtros[c.chave]}
            expandido={!!expandido[c.chave]}
            onToggleAtivo={() => toggleFiltro(c.chave)}
            onToggleExpandido={() => toggleAcordeao(c.chave)}
          >
            <DetalhesCategoriaSimples
              chave={c.chave}
              perfil={perfil}
              custoAnual={custos[c.chave].total}
              periodo={periodo}
              diasTrabalhadosNoPeriodo={diasTrabalhadosNoPeriodo}
              formatarValorPeriodo={pp}
              onEditar={() => setEdicao(c.edicao)}
              ariaLabel={`Editar ${obterLabelCategoriaSimples(
                c.label,
                c.chave,
                perfil.financeiro.situacaoMoto,
              )}`}
            />
          </CategoriaAccordion>
        ))}

        <SecaoImprevistos
          gastosCustom={perfil.financeiro.gastosCustom}
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
