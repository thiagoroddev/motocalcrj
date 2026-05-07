import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';
import { useCustos } from '../hooks/useCustos';
import { calcularTotalFiltrado, calcularGranularidades } from '../utils/calculos';
import { filtrosPadrao } from '../types/calculos';
import type { FiltrosCategorias } from '../types/calculos';
import { moeda, cpkFormatado } from '../utils/formatters';

// ─── Sub-componentes ──────────────────────────────────────────────

function Toggle({ ativo, onClick }: { ativo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${ativo ? 'bg-primary' : 'bg-surface-bright'}`}
    >
      <span
        className={`block w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform ${ativo ? 'translate-x-[19px]' : 'translate-x-[3px]'}`}
      />
    </button>
  );
}

function CategoriaAccordion({
  label,
  cor,
  total,
  ativo,
  expandido,
  onToggleAtivo,
  onToggleExpandido,
  semExpansao = false,
  children,
}: {
  label: string;
  cor: string;
  total: number;
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
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
        <span className="flex-1 text-white text-sm font-medium">{label}</span>
        <span
          className={`text-sm font-semibold tabular-nums ${ativo ? 'text-white' : 'text-neutral/30'}`}
        >
          {moeda(total)}
        </span>
        <Toggle ativo={ativo} onClick={onToggleAtivo} />
        {!semExpansao && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
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
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');

  if (!resultado) {
    return (
      <div className="flex items-center justify-center h-64 px-md">
        <p className="text-neutral/60 text-sm text-center">Modelo não encontrado.</p>
      </div>
    );
  }

  const { custos, kmAnual, diasAno } = resultado;

  const totalFiltrado = calcularTotalFiltrado(custos, filtros);
  const totalCustomAtivo = perfil.financeiro.gastosCustom
    .filter((g) => g.ativo)
    .reduce((acc, g) => acc + g.valorMensal * 12, 0);
  const totalGeral = totalFiltrado + totalCustomAtivo;
  const gran = calcularGranularidades(totalGeral, diasAno, kmAnual);

  function toggleFiltro(cat: keyof Omit<FiltrosCategorias, 'manutencaoPorPeca'>) {
    setFiltros((prev) => ({ ...prev, [cat]: !prev[cat] }));
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

  function submeterGasto() {
    const valor = parseFloat(novoValor);
    if (!novoNome.trim() || isNaN(valor) || valor <= 0) {
      return;
    }
    dispatch({
      type: 'ADD_GASTO_CUSTOM',
      gasto: { nome: novoNome.trim(), valorMensal: valor, ativo: true },
    });
    setNovoNome('');
    setNovoValor('');
  }

  const pecas = [...custos.manutencao.detalhes.entries()];

  return (
    <div className="px-md py-md space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 pb-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-neutral/50 hover:text-white transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-white font-semibold text-base flex-1">Detalhamento</p>
      </div>

      {/* Total card */}
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

      {/* Documentos */}
      <CategoriaAccordion
        label="Documentos"
        cor="#60A5FA"
        total={custos.documentos.total}
        ativo={filtros.documentos}
        expandido={!!expandido['documentos']}
        onToggleAtivo={() => toggleFiltro('documentos')}
        onToggleExpandido={() => toggleAcordeao('documentos')}
      >
        <LinhaDetalhe label="IPVA" valor={custos.documentos.detalhes.ipva} />
        <LinhaDetalhe label="Licenciamento" valor={custos.documentos.detalhes.licenciamento} />
      </CategoriaAccordion>

      {/* Revisão */}
      <CategoriaAccordion
        label="Revisão"
        cor="#A78BFA"
        total={custos.revisao.total}
        ativo={filtros.revisao}
        expandido={!!expandido['revisao']}
        onToggleAtivo={() => toggleFiltro('revisao')}
        onToggleExpandido={() => toggleAcordeao('revisao')}
      >
        <p className="text-neutral/50 text-xs">
          Modo:{' '}
          {custos.revisao.detalhes.modo === 'autorizadas'
            ? 'Revisão autorizada'
            : 'Oficina independente'}
        </p>
      </CategoriaAccordion>

      {/* Manutenção */}
      <CategoriaAccordion
        label="Manutenção"
        cor="#F59E0B"
        total={custos.manutencao.total}
        ativo={filtros.manutencao}
        expandido={!!expandido['manutencao']}
        onToggleAtivo={() => toggleFiltro('manutencao')}
        onToggleExpandido={() => toggleAcordeao('manutencao')}
      >
        <div className="space-y-2.5">
          {pecas.map(([id, peca]) => {
            const pecaAtiva = filtros.manutencaoPorPeca[id] ?? true;
            return (
              <div key={id} className="flex items-center gap-2">
                <Toggle ativo={pecaAtiva} onClick={() => togglePeca(id)} />
                <span className="flex-1 text-neutral/70 text-xs truncate">{peca.label}</span>
                {peca.fonte === 'registro' && (
                  <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    real
                  </span>
                )}
                <span
                  className={`text-xs font-medium tabular-nums ${pecaAtiva ? 'text-neutral' : 'text-neutral/30'}`}
                >
                  {moeda(peca.custoAnual)}
                </span>
              </div>
            );
          })}
        </div>
      </CategoriaAccordion>

      {/* Combustível */}
      <CategoriaAccordion
        label="Combustível"
        cor="#22C55E"
        total={custos.combustivel.total}
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
          cor="#0EA5E9"
          total={custos.internet.total}
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
          cor="#0078FF"
          total={custos.seguro.total}
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
          cor="#FBBF24"
          total={custos.alimentacao.total}
          ativo={filtros.alimentacao}
          expandido={false}
          onToggleAtivo={() => toggleFiltro('alimentacao')}
          onToggleExpandido={() => {}}
          semExpansao
        />
      )}

      {/* Gastos adicionais */}
      <section className="bg-surface-cont rounded-card p-md space-y-3">
        <p className="text-white text-sm font-semibold">Gastos adicionais</p>

        {perfil.financeiro.gastosCustom.length === 0 && (
          <p className="text-neutral/40 text-xs">Nenhum gasto adicional cadastrado.</p>
        )}

        {perfil.financeiro.gastosCustom.map((g) => (
          <div key={g.id} className="flex items-center gap-2">
            <Toggle
              ativo={g.ativo}
              onClick={() => dispatch({ type: 'TOGGLE_GASTO_CUSTOM', id: g.id })}
            />
            <span className="flex-1 text-neutral/70 text-xs truncate">{g.nome}</span>
            <span
              className={`text-xs font-medium tabular-nums ${g.ativo ? 'text-neutral' : 'text-neutral/30'}`}
            >
              {moeda(g.valorMensal * 12)}/ano
            </span>
            <button
              type="button"
              onClick={() => dispatch({ type: 'DELETE_GASTO_CUSTOM', id: g.id })}
              className="p-1 text-neutral/30 hover:text-danger transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-3.5 h-3.5"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" />
                <path d="M10 11v6M14 11v6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}

        <div className="pt-2 border-t border-surface-bright space-y-2">
          <p className="text-neutral/50 text-[10px] uppercase tracking-wider">Adicionar gasto</p>
          <input
            type="text"
            placeholder="Nome do gasto"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            aria-label="Nome do gasto adicional"
            className="w-full bg-surface-bright border border-surface-bright rounded-input text-white px-md h-9 text-sm focus:outline-none focus:border-primary placeholder:text-neutral/30"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="R$/mês"
              value={novoValor}
              onChange={(e) => setNovoValor(e.target.value)}
              aria-label="Valor mensal do gasto"
              min={0.01}
              step={0.01}
              className="flex-1 bg-surface-bright border border-surface-bright rounded-input text-white px-md h-9 text-sm focus:outline-none focus:border-primary placeholder:text-neutral/30"
            />
            <button
              type="button"
              onClick={submeterGasto}
              disabled={!novoNome.trim() || !novoValor}
              className="bg-primary text-white rounded-input px-4 h-9 text-sm font-medium disabled:opacity-40 hover:bg-primary/80 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      </section>

      <div className="h-6" />
    </div>
  );
}
