import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';
import { useCustos } from '../hooks/useCustos';
import { calcularTotalFiltrado, calcularGranularidades } from '../utils/calculos';
import { filtrosPadrao } from '../types/calculos';
import type { FiltrosCategorias } from '../types/calculos';
import { moeda, cpkFormatado } from '../utils/formatters';

type Periodo = 'ano' | 'mes' | 'sem' | 'dia' | 'hora';

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'ano', label: 'Ano' },
  { id: 'mes', label: 'Mês' },
  { id: 'sem', label: 'Sem' },
  { id: 'dia', label: 'Dia' },
  { id: 'hora', label: 'Hora' },
];

function converterParaPeriodo(
  anual: number,
  periodo: Periodo,
  diasAno: number,
  horasDia: number,
): number {
  if (periodo === 'mes') {
    return anual / 12;
  }
  if (periodo === 'sem') {
    return anual / 52;
  }
  if (periodo === 'dia') {
    return anual / diasAno;
  }
  if (periodo === 'hora') {
    return anual / (diasAno * horasDia);
  }
  return anual;
}

// ─── Sub-componentes ──────────────────────────────────────────────

function Toggle({
  ativo,
  label,
  onClick,
}: {
  ativo: boolean;
  label?: string;
  onClick: () => void;
}) {
  return (
    <label
      className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative cursor-pointer ${ativo ? 'bg-primary' : 'bg-surface-bright'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={ativo}
        onChange={() => onClick()}
        aria-label={label ?? (ativo ? 'Desativar' : 'Ativar')}
        className="sr-only"
      />
      <span
        className={`block w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform ${ativo ? 'translate-x-[19px]' : 'translate-x-[3px]'}`}
      />
    </label>
  );
}

function CategoriaAccordion({
  label,
  corClasse,
  valorExibido,
  porcentagem,
  ativo,
  expandido,
  onToggleAtivo,
  onToggleExpandido,
  semExpansao = false,
  children,
}: {
  label: string;
  corClasse: string;
  valorExibido: string;
  porcentagem: string;
  ativo: boolean;
  expandido: boolean;
  onToggleAtivo: () => void;
  onToggleExpandido: () => void;
  semExpansao?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-surface-cont rounded-card overflow-hidden">
      <div
        className={`flex items-center gap-3 p-md ${!semExpansao ? 'cursor-pointer' : ''}`}
        onClick={!semExpansao ? onToggleExpandido : undefined}
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${corClasse}`} />
        <span className="flex-1 text-white text-sm font-medium">
          {label}
          <span className="ml-1.5 text-[10px] font-normal text-neutral/40">{porcentagem}</span>
        </span>
        <span
          className={`text-sm font-semibold tabular-nums ${ativo ? 'text-white' : 'text-neutral/30'}`}
        >
          {valorExibido}
        </span>
        <Toggle ativo={ativo} onClick={onToggleAtivo} />
        {!semExpansao && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className={`w-4 h-4 text-neutral/40 flex-shrink-0 transition-transform ${expandido ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {expandido && children && (
        <div className="px-md pb-md space-y-2 border-t border-surface-bright pt-3">{children}</div>
      )}
    </div>
  );
}

function LinhaDetalhe({
  label,
  valor,
  formatter = moeda,
  suffix,
}: {
  label: string;
  valor: number;
  formatter?: (v: number) => string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral/60 text-xs">{label}</span>
      <span className="text-neutral text-xs font-medium">
        {suffix ? `${valor.toFixed(1)} ${suffix}` : formatter(valor)}
      </span>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────

export function PaginaDetalhamento() {
  const navigate = useNavigate();
  const { perfil, dispatch } = usePerfil();
  const resultado = useCustos();

  const [filtros, setFiltros] = useState<FiltrosCategorias>(filtrosPadrao);
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});
  const [periodo, setPeriodo] = useState<Periodo>('ano');

  if (!resultado) {
    return (
      <div className="flex items-center justify-center h-64 px-md">
        <p className="text-neutral/60 text-sm text-center">Modelo não encontrado.</p>
      </div>
    );
  }

  const { custos, kmAnual, diasAno } = resultado;
  const horasDia = perfil.trabalho.horasPorDia;

  const totalCustomAtivo = perfil.financeiro.gastosCustom
    .filter((g) => g.ativo)
    .reduce((acc, g) => acc + g.valorMensal * 12, 0);

  const totalFiltrado = calcularTotalFiltrado(custos, filtros);
  const totalGeral = totalFiltrado + totalCustomAtivo;
  const gran = calcularGranularidades(totalGeral, diasAno, kmAnual);

  const totalManutencaoComRevisao = custos.manutencao.total + custos.revisao.total;

  const totalBase =
    custos.documentos.total +
    totalManutencaoComRevisao +
    custos.combustivel.total +
    custos.internet.total +
    custos.seguro.total +
    custos.alimentacao.total +
    totalCustomAtivo;

  function pct(valor: number): string {
    return totalBase > 0 ? `${Math.round((valor / totalBase) * 100)}%` : '0%';
  }

  function pp(anual: number): string {
    return moeda(converterParaPeriodo(anual, periodo, diasAno, horasDia));
  }

  function cvt(anual: number): number {
    return converterParaPeriodo(anual, periodo, diasAno, horasDia);
  }

  function toggleFiltro(cat: keyof Omit<FiltrosCategorias, 'manutencaoPorPeca'>) {
    setFiltros((prev) => {
      const novo: FiltrosCategorias = { ...prev, [cat]: !prev[cat] };
      if (cat === 'manutencao' && !novo.manutencao) {
        novo.revisao = false;
      }
      return novo;
    });
  }

  function togglePeca(id: string) {
    const atual = filtros.manutencaoPorPeca[id] ?? true;
    setFiltros((prev) => ({
      ...prev,
      manutencaoPorPeca: { ...prev.manutencaoPorPeca, [id]: !atual },
    }));
  }

  function toggleAcordeao(id: string) {
    setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const pecas = [...custos.manutencao.detalhes.entries()];

  return (
    <div className="px-md py-md space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 pb-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="p-1 -ml-1 text-neutral/50 hover:text-white transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className="w-5 h-5"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-white font-semibold text-base flex-1">Detalhamento</p>
      </div>

      {/* Total card — sempre anual */}
      <div className="bg-primary/10 border border-primary/20 rounded-card p-md">
        <p className="text-neutral/60 text-[10px] uppercase tracking-wider mb-1">
          Total anual estimado
        </p>
        <p className="text-white font-bold text-3xl">{moeda(totalGeral)}</p>
        <div className="flex gap-md mt-2 text-xs text-neutral/60">
          <span>{moeda(gran.mensal)}/mês</span>
          <span>{cpkFormatado(gran.porKm)}/km</span>
        </div>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-1.5 bg-surface-cont rounded-card p-1">
        {PERIODOS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPeriodo(id)}
            className={`flex-1 h-8 rounded text-xs font-medium transition-colors ${
              periodo === id ? 'bg-primary text-white' : 'text-neutral/60 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Documentos */}
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

      {/* Manutenção — inclui Revisão Geral como primeiro item */}
      <CategoriaAccordion
        label="Manutenção"
        corClasse="bg-amber-400"
        valorExibido={pp(totalManutencaoComRevisao)}
        porcentagem={pct(totalManutencaoComRevisao)}
        ativo={filtros.manutencao}
        expandido={!!expandido['manutencao']}
        onToggleAtivo={() => toggleFiltro('manutencao')}
        onToggleExpandido={() => toggleAcordeao('manutencao')}
      >
        <div className="space-y-2.5">
          {/* Revisão Geral */}
          <div className="flex items-center gap-2">
            <Toggle ativo={filtros.revisao} onClick={() => toggleFiltro('revisao')} />
            <span className="flex-1 text-neutral/70 text-xs truncate">
              Revisão Geral
              <span className="ml-1 text-[10px] text-neutral/40">
                ({custos.revisao.detalhes.modo === 'autorizadas' ? 'autorizada' : 'independente'})
              </span>
            </span>
            <span
              className={`text-xs font-medium tabular-nums ${filtros.revisao ? 'text-neutral' : 'text-neutral/30'}`}
            >
              {pp(custos.revisao.total)}
            </span>
          </div>

          {/* Peças */}
          {pecas.map(([id, peca]) => {
            const pecaAtiva = filtros.manutencaoPorPeca[id] ?? true;
            const freq = Math.ceil(kmAnual / peca.intervaloKm);
            return (
              <div key={id} className="flex items-center gap-2">
                <Toggle ativo={pecaAtiva} onClick={() => togglePeca(id)} />
                <span className="w-5 text-right text-[10px] text-neutral/40 flex-shrink-0 tabular-nums">
                  {freq}×
                </span>
                <span className="flex-1 text-neutral/70 text-xs truncate">{peca.label}</span>
                {peca.fonte === 'registro' && (
                  <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full flex-shrink-0">
                    real
                  </span>
                )}
                <span
                  className={`text-xs font-medium tabular-nums ${pecaAtiva ? 'text-neutral' : 'text-neutral/30'}`}
                >
                  {pp(peca.custoAnual)}
                </span>
              </div>
            );
          })}
        </div>
      </CategoriaAccordion>

      {/* Combustível */}
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

      {/* Internet */}
      {custos.internet.ativo && (
        <CategoriaAccordion
          label="Internet"
          corClasse="bg-sky-500"
          valorExibido={pp(custos.internet.total)}
          porcentagem={pct(custos.internet.total)}
          ativo={filtros.internet}
          expandido={false}
          onToggleAtivo={() => toggleFiltro('internet')}
          onToggleExpandido={() => {}}
          semExpansao
        />
      )}

      {/* Seguro */}
      {custos.seguro.ativo && (
        <CategoriaAccordion
          label="Seguro"
          corClasse="bg-primary"
          valorExibido={pp(custos.seguro.total)}
          porcentagem={pct(custos.seguro.total)}
          ativo={filtros.seguro}
          expandido={false}
          onToggleAtivo={() => toggleFiltro('seguro')}
          onToggleExpandido={() => {}}
          semExpansao
        />
      )}

      {/* Alimentação */}
      {custos.alimentacao.ativo && (
        <CategoriaAccordion
          label="Alimentação"
          corClasse="bg-yellow-400"
          valorExibido={pp(custos.alimentacao.total)}
          porcentagem={pct(custos.alimentacao.total)}
          ativo={filtros.alimentacao}
          expandido={false}
          onToggleAtivo={() => toggleFiltro('alimentacao')}
          onToggleExpandido={() => {}}
          semExpansao
        />
      )}

      {/* Imprevistos */}
      <div className="bg-surface-cont rounded-card overflow-hidden">
        <div
          className="flex items-center gap-3 p-md cursor-pointer"
          onClick={() => toggleAcordeao('imprevistos')}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-warning/60" />
          <span className="flex-1 text-white text-sm font-medium">
            Imprevistos
            <span className="ml-1.5 text-[10px] font-normal text-neutral/40">
              {pct(totalCustomAtivo)}
            </span>
          </span>
          <span className="text-sm font-semibold tabular-nums text-white">
            {pp(totalCustomAtivo)}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className={`w-4 h-4 text-neutral/40 flex-shrink-0 transition-transform ${expandido['imprevistos'] ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {expandido['imprevistos'] && (
          <div className="px-md pb-md space-y-2 border-t border-surface-bright pt-3">
            {perfil.financeiro.gastosCustom.length > 0 &&
              perfil.financeiro.gastosCustom.map((g) => (
                <div key={g.id} className="flex items-center gap-2">
                  <Toggle
                    ativo={g.ativo}
                    onClick={() => dispatch({ type: 'TOGGLE_GASTO_CUSTOM', id: g.id })}
                  />
                  <span className="flex-1 text-neutral/70 text-xs truncate">{g.nome}</span>
                  <span
                    className={`text-xs font-medium tabular-nums ${g.ativo ? 'text-neutral' : 'text-neutral/30'}`}
                  >
                    {pp(g.valorMensal * 12)}
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'DELETE_GASTO_CUSTOM', id: g.id })}
                    aria-label={`Remover ${g.nome}`}
                    className="p-1 text-neutral/30 hover:text-danger transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                      className="w-3.5 h-3.5"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" />
                      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}

            <div className="pt-2 border-t border-surface-bright">
              <div className="flex items-start gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                  className="w-4 h-4 text-neutral/40 flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
                <p className="text-neutral/40 text-xs leading-relaxed">
                  Para adicionar despesas vá à aba{' '}
                  <span className="text-neutral/60 font-medium">Registros</span> e registre um
                  gasto. Ele aparecerá aqui quando o modo{' '}
                  <span className="text-neutral/60 font-medium">Personalizado</span> estiver ativo —
                  ativado automaticamente com o primeiro registro.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}
