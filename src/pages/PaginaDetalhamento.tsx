import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';
import { useCustos } from '../hooks/useCustos';
import {
  calcularTotalFiltrado,
  calcularGranularidades,
  categoriasParaFiltros,
} from '../utils/calculos';
import type { FiltrosCategorias } from '../types/calculos';
import type { CategoriaDisplay } from '../types/perfil';
import { moeda, cpkFormatado } from '../utils/formatters';
import { CardTotalAnual } from '../components/detalhamento/CardTotalAnual';
import { CategoriaAccordion } from '../components/detalhamento/CategoriaAccordion';
import { LinhaDetalhe } from '../components/detalhamento/LinhaDetalhe';
import { SecaoImprevistos } from '../components/detalhamento/SecaoImprevistos';
import { SecaoManutencao } from '../components/detalhamento/SecaoManutencao';
import { SeletorPeriodo, type Periodo } from '../components/detalhamento/SeletorPeriodo';
import { CabecalhoVoltar } from '../components/CabecalhoVoltar';
import { DialogEdicaoCusto, type EdicaoAlvo } from '../components/detalhamento/DialogEdicaoCusto';

type ChaveCategoriaSemExpansao = 'internet' | 'seguro' | 'alimentacao' | 'financiamento';
type ChaveFiltroCategoria = keyof Omit<
  FiltrosCategorias,
  'manutencaoPorPeca' | 'revisaoPorServico' | 'imprevistosSugeridos'
>;

const CATEGORIAS_SEM_EXPANSAO: {
  chave: ChaveCategoriaSemExpansao;
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

function converterParaPeriodo(
  anual: number,
  periodo: Periodo,
  diasAno: number,
  horasDia: number,
): number {
  const d: Record<Periodo, number> = {
    ano: 1,
    mes: 12,
    sem: 52,
    dia: diasAno,
    hora: diasAno * horasDia,
  };
  return anual / d[periodo];
}

export function PaginaDetalhamento() {
  const navigate = useNavigate();
  const { perfil, dispatch } = usePerfil();
  const resultado = useCustos();
  const [filtros, setFiltros] = useState<FiltrosCategorias>(() =>
    categoriasParaFiltros(
      perfil.configuracaoDisplay.categoriasAtivas,
      perfil.configuracaoDisplay.imprevistosSugeridosAtivos,
    ),
  );
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});
  const [periodo, setPeriodo] = useState<Periodo>('ano');
  const [edicao, setEdicao] = useState<EdicaoAlvo | null>(null);

  if (!resultado) {
    return (
      <div className="flex items-center justify-center h-64 px-md">
        <p className="text-muted-foreground/60 text-sm text-center">Modelo não encontrado.</p>
      </div>
    );
  }

  const { custos, kmAnual, diasAno } = resultado;
  const horasDia = perfil.trabalho.horasPorDia;
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
  const pp = (anual: number) => moeda(converterParaPeriodo(anual, periodo, diasAno, horasDia));
  const cvt = (anual: number) => converterParaPeriodo(anual, periodo, diasAno, horasDia);

  function toggleFiltro(cat: ChaveFiltroCategoria) {
    setFiltros((prev) => {
      const novo: FiltrosCategorias = { ...prev, [cat]: !prev[cat] };
      if (cat === 'manutencao' && !novo.manutencao) novo.revisao = false;
      return novo;
    });
    const cat2 = FILTRO_PARA_CATEGORIA[cat];
    if (cat2) dispatch({ type: 'TOGGLE_CATEGORIA', categoria: cat2 });
  }

  function togglePeca(id: string) {
    const atual = filtros.manutencaoPorPeca[id] ?? true;
    setFiltros((prev) => ({
      ...prev,
      manutencaoPorPeca: { ...prev.manutencaoPorPeca, [id]: !atual },
    }));
  }

  function toggleServicoRevisao(id: string) {
    const atual = filtros.revisaoPorServico[id] ?? true;
    setFiltros((prev) => ({
      ...prev,
      revisaoPorServico: { ...prev.revisaoPorServico, [id]: !atual },
    }));
  }

  function toggleImprevistoSugerido(id: string) {
    const atual = filtros.imprevistosSugeridos[id] ?? false;
    setFiltros((prev) => ({
      ...prev,
      imprevistosSugeridos: { ...prev.imprevistosSugeridos, [id]: !atual },
    }));
    dispatch({ type: 'TOGGLE_IMPREVISTO_SUGERIDO', id });
  }

  function toggleCategoriaImprevistos() {
    setFiltros((prev) => ({ ...prev, gastosCustom: !prev.gastosCustom }));
    dispatch({ type: 'TOGGLE_CATEGORIA', categoria: 'imprevistos' });
  }

  const toggleAcordeao = (id: string) => setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));

  function irParaRevisaoHonda(destaqueIndex?: number) {
    navigate('/mao-de-obra', { state: { abaInicial: 'honda', destaqueIndex } });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <CabecalhoVoltar titulo="Detalhamento" />

      <div className="px-md py-md space-y-3">
        <CardTotalAnual totalFiltrado={totalFiltrado} mensal={gran.mensal} porKm={gran.porKm} />
        <SeletorPeriodo periodo={periodo} onChange={setPeriodo} />
        {perfil.trabalho.diasPorSemana === 1 && (
          <p className="text-muted-foreground/60 text-xs px-xs">
            Com 1 dia/semana configurado, os modos Dia e Sem mostram o mesmo valor. Ajuste em
            Estimativa.
          </p>
        )}

        <CategoriaAccordion
          label="Documentos"
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
        </CategoriaAccordion>

        <SecaoManutencao
          totalManutencaoComRevisao={totalManutencaoComRevisao}
          totalRevisao={custos.revisao.detalhes.base}
          eventosRevisaoNoAno={custos.revisao.detalhes.eventosNoAno}
          modoRevisao={custos.revisao.detalhes.modo}
          servicosRevisao={[...custos.revisao.detalhes.servicos.entries()]}
          pecas={[...custos.manutencao.detalhes.entries()]}
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
          onEditarRevisaoGeral={() => irParaRevisaoHonda()}
          onEditarServicoRevisao={(servicoId) =>
            setEdicao({ tipo: 'servicoAutorizada', servicoId })
          }
          pp={pp}
          pct={pct}
        />

        <CategoriaAccordion
          label="Combustível"
          corClasse="bg-green-500"
          valorExibido={pp(custos.combustivel.total)}
          porcentagem={pct(custos.combustivel.total, filtros.combustivel)}
          ativo={filtros.combustivel}
          expandido={!!expandido['combustivel']}
          onToggleAtivo={() => toggleFiltro('combustivel')}
          onToggleExpandido={() => toggleAcordeao('combustivel')}
          onEditar={() => setEdicao({ tipo: 'combustivel' })}
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
        </CategoriaAccordion>

        {CATEGORIAS_SEM_EXPANSAO.filter((c) => custos[c.chave].ativo).map((c) => (
          <CategoriaAccordion
            key={c.chave}
            label={c.label}
            corClasse={c.cor}
            valorExibido={pp(custos[c.chave].total)}
            porcentagem={pct(custos[c.chave].total, filtros[c.chave])}
            ativo={filtros[c.chave]}
            expandido={false}
            onToggleAtivo={() => toggleFiltro(c.chave)}
            onToggleExpandido={() => {}}
            onEditar={() => setEdicao(c.edicao)}
            semExpansao
          />
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
