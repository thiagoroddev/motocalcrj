import { useState } from 'react';
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

type ChaveCategoriaSemExpansao = 'internet' | 'seguro' | 'alimentacao' | 'financiamento';

const CATEGORIAS_SEM_EXPANSAO: {
  chave: ChaveCategoriaSemExpansao;
  label: string;
  cor: string;
}[] = [
  { chave: 'internet', label: 'Internet', cor: 'bg-sky-500' },
  { chave: 'seguro', label: 'Seguro', cor: 'bg-primary' },
  { chave: 'alimentacao', label: 'Alimentação', cor: 'bg-yellow-400' },
  { chave: 'financiamento', label: 'Financiamento', cor: 'bg-orange-500' },
];

const FILTRO_PARA_CATEGORIA: Partial<
  Record<keyof Omit<FiltrosCategorias, 'manutencaoPorPeca'>, keyof CategoriaDisplay>
> = {
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
  const { perfil, dispatch } = usePerfil();
  const resultado = useCustos();
  const [filtros, setFiltros] = useState<FiltrosCategorias>(() =>
    categoriasParaFiltros(perfil.configuracaoDisplay.categoriasAtivas),
  );
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});
  const [periodo, setPeriodo] = useState<Periodo>('ano');

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

  const pct = (valor: number) =>
    totalFiltrado > 0 ? `${Math.round((valor / totalFiltrado) * 100)}%` : '0%';
  const pp = (anual: number) => moeda(converterParaPeriodo(anual, periodo, diasAno, horasDia));
  const cvt = (anual: number) => converterParaPeriodo(anual, periodo, diasAno, horasDia);

  function toggleFiltro(cat: keyof Omit<FiltrosCategorias, 'manutencaoPorPeca'>) {
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

  const toggleAcordeao = (id: string) => setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="px-md py-md space-y-3">
      <CabecalhoVoltar titulo="Detalhamento" />

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
        porcentagem={pct(custos.documentos.total)}
        ativo={filtros.documentos}
        expandido={!!expandido['documentos']}
        onToggleAtivo={() => toggleFiltro('documentos')}
        onToggleExpandido={() => toggleAcordeao('documentos')}
      >
        <LinhaDetalhe label="IPVA" valor={cvt(custos.documentos.detalhes.ipva)} />
        <LinhaDetalhe label="Licenciamento" valor={cvt(custos.documentos.detalhes.licenciamento)} />
      </CategoriaAccordion>

      <SecaoManutencao
        totalManutencaoComRevisao={totalManutencaoComRevisao}
        totalRevisao={custos.revisao.total}
        modoRevisao={custos.revisao.detalhes.modo}
        pecas={[...custos.manutencao.detalhes.entries()]}
        filtroAtivo={filtros.manutencao}
        filtroRevisao={filtros.revisao}
        filtrosPecas={filtros.manutencaoPorPeca}
        expandido={!!expandido['manutencao']}
        onToggleAtivo={() => toggleFiltro('manutencao')}
        onToggleExpandido={() => toggleAcordeao('manutencao')}
        onToggleRevisao={() => toggleFiltro('revisao')}
        onTogglePeca={togglePeca}
        pp={pp}
        pct={pct}
      />

      <CategoriaAccordion
        label="Combustível"
        corClasse="bg-green-500"
        valorExibido={pp(custos.combustivel.total)}
        porcentagem={pct(custos.combustivel.total)}
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
      </CategoriaAccordion>

      {CATEGORIAS_SEM_EXPANSAO.filter((c) => custos[c.chave].ativo).map((c) => (
        <CategoriaAccordion
          key={c.chave}
          label={c.label}
          corClasse={c.cor}
          valorExibido={pp(custos[c.chave].total)}
          porcentagem={pct(custos[c.chave].total)}
          ativo={filtros[c.chave]}
          expandido={false}
          onToggleAtivo={() => toggleFiltro(c.chave)}
          onToggleExpandido={() => {}}
          semExpansao
        />
      ))}

      <SecaoImprevistos
        gastosCustom={perfil.financeiro.gastosCustom}
        dispatch={dispatch}
        valorTotal={custos.gastosCustom.total}
        expandido={!!expandido['imprevistos']}
        onToggleExpandido={() => toggleAcordeao('imprevistos')}
        pp={pp}
        pct={pct}
      />

      <div className="h-6" />
    </div>
  );
}
