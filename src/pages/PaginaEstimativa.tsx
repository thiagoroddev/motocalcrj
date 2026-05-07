import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';
import { useCustos } from '../hooks/useCustos';
import { DonutChart } from '../components/estimativa/DonutChart';
import type { SegmentoDonut } from '../components/estimativa/DonutChart';
import { calcularBreakdownPercentual } from '../utils/calculos';
import { filtrosPadrao } from '../types/calculos';
import { moeda, kmFormatado, cpkFormatado } from '../utils/formatters';

// ─── Configuração visual das categorias ──────────────────────────

const CATEG_CONFIG: Record<string, { label: string; cor: string }> = {
  documentos: { label: 'Documentos', cor: '#60A5FA' },
  revisao: { label: 'Revisão', cor: '#A78BFA' },
  manutencao: { label: 'Manutenção', cor: '#F59E0B' },
  combustivel: { label: 'Combustível', cor: '#22C55E' },
  internet: { label: 'Internet', cor: '#0EA5E9' },
  seguro: { label: 'Seguro', cor: '#0078FF' },
  alimentacao: { label: 'Alimentação', cor: '#FBBF24' },
};

// ─── Sub-componentes inline ───────────────────────────────────────

function LabelCampo({ children }: { children: React.ReactNode }) {
  return <p className="text-neutral/60 text-[10px] uppercase tracking-wider mb-1">{children}</p>;
}

function CardPeriodo({ label, valor, km }: { label: string; valor: number; km?: number }) {
  return (
    <div className="bg-surface-cont rounded-card p-md flex flex-col gap-1">
      <p className="text-neutral/50 text-[10px] uppercase tracking-wider">{label}</p>
      {km !== undefined && (
        <div className="flex items-center gap-1 text-neutral/60 text-xs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-3.5 h-3.5"
          >
            <circle cx={12} cy={12} r={9} />
            <path d="M12 7v5l3 3" strokeLinecap="round" />
          </svg>
          {kmFormatado(km)}
        </div>
      )}
      <p className="text-white font-bold text-lg">{moeda(valor)}</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────

export function PaginaEstimativa() {
  const navigate = useNavigate();
  const { perfil, dispatch } = usePerfil();
  const resultado = useCustos();

  const [kmDiaInput, setKmDiaInput] = useState(String(perfil.trabalho.kmPorDia));

  useEffect(() => {
    setKmDiaInput(String(perfil.trabalho.kmPorDia));
  }, [perfil.trabalho.kmPorDia]);

  if (!resultado) {
    return (
      <div className="flex items-center justify-center h-64 px-md">
        <p className="text-neutral/60 text-sm text-center">
          Modelo não encontrado. Refaça o onboarding.
        </p>
      </div>
    );
  }

  const { granularidades, granularidadesMoto, kmAnual, diasAno, custos } = resultado;
  const dias = perfil.trabalho.diasPorSemana;
  const horas = perfil.trabalho.horasPorDia;
  const porHora = diasAno > 0 && horas > 0 ? granularidades.anual / (diasAno * horas) : 0;

  // Donut
  const breakdown = calcularBreakdownPercentual(custos, filtrosPadrao);
  const segmentos: SegmentoDonut[] = Object.entries(CATEG_CONFIG).map(([id, cfg]) => ({
    id,
    label: cfg.label,
    porcentagem: breakdown[id] ?? 0,
    cor: cfg.cor,
  }));

  function handleKmBlur() {
    const v = parseInt(kmDiaInput, 10);
    if (!isNaN(v) && v > 0 && v !== perfil.trabalho.kmPorDia) {
      dispatch({ type: 'SET_KM_POR_DIA', valor: v });
    }
  }

  function stepDias(delta: number) {
    const novo = perfil.trabalho.diasPorSemana + delta;
    if (novo >= 1 && novo <= 7) {
      dispatch({ type: 'SET_DIAS_POR_SEMANA', valor: novo });
    }
  }

  return (
    <div className="px-md py-md space-y-md">
      {/* Seção rodagem */}
      <section className="bg-surface-cont rounded-card p-md space-y-md">
        <div>
          <LabelCampo>Média de KM rodados por dia</LabelCampo>
          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label="Quilômetros por dia"
              value={kmDiaInput}
              onChange={(e) => setKmDiaInput(e.target.value)}
              onBlur={handleKmBlur}
              className="flex-1 bg-surface-bright border border-surface-bright rounded-input text-white px-md h-10 focus:outline-none focus:border-primary"
              min={1}
              max={999}
            />
            <span className="text-neutral/60 text-sm font-medium">KM</span>
          </div>
        </div>

        <div>
          <LabelCampo>Dias trabalhados / semana</LabelCampo>
          <div className="flex items-center gap-md">
            <button
              type="button"
              onClick={() => stepDias(-1)}
              disabled={dias <= 1}
              className="w-9 h-9 rounded-full border border-surface-bright text-white flex items-center justify-center text-lg disabled:opacity-30 hover:border-primary transition-colors"
            >
              −
            </button>
            <span className="text-white font-bold text-xl w-6 text-center">{dias}</span>
            <button
              type="button"
              onClick={() => stepDias(1)}
              disabled={dias >= 7}
              className="w-9 h-9 rounded-full border border-surface-bright text-white flex items-center justify-center text-lg disabled:opacity-30 hover:border-primary transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* Custo por km */}
      <div className="bg-primary/10 border border-primary/20 rounded-card p-md">
        <LabelCampo>Custo de operação por km</LabelCampo>
        <p className="text-white font-bold text-3xl">{cpkFormatado(granularidades.porKm)}</p>
        {granularidadesMoto.porKm !== granularidades.porKm && (
          <p className="text-neutral/50 text-xs mt-1">
            Sem alimentação: {cpkFormatado(granularidadesMoto.porKm)}
          </p>
        )}
      </div>

      {/* Cards hora/dia */}
      <div className="grid grid-cols-2 gap-sm">
        <CardPeriodo label="Por Hora" valor={porHora} />
        <CardPeriodo label="Por Dia" valor={granularidades.diario} />
      </div>

      {/* Cards semana/mês/ano */}
      <div className="space-y-sm">
        <CardPeriodo label="Estimado por semana" valor={granularidades.semanal} km={kmAnual / 52} />
        <CardPeriodo label="Estimado por mês" valor={granularidades.mensal} km={kmAnual / 12} />
        <CardPeriodo label="Estimado por ano" valor={granularidades.anual} km={kmAnual} />
      </div>

      {/* Modo exibição badge */}
      {resultado.modoAtivo === 'personalizado' && (
        <div className="flex items-center gap-2">
          <span className="bg-primary/20 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
            Modo personalizado ativo
          </span>
        </div>
      )}

      {/* Distribuição de custos */}
      <section className="bg-surface-cont rounded-card p-md">
        <p className="text-white text-sm font-semibold mb-md">Distribuição de custos</p>

        <div className="flex items-center gap-md">
          <DonutChart segmentos={segmentos} tamanho={140} />

          <div className="flex-1 space-y-1.5">
            {segmentos
              .filter((s) => s.porcentagem >= 0.5)
              .sort((a, b) => b.porcentagem - a.porcentagem)
              .map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.cor }}
                  />
                  <span className="text-neutral/70 text-xs flex-1 truncate">{s.label}</span>
                  <span className="text-neutral text-xs font-medium">
                    {Math.round(s.porcentagem)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Detalhamento */}
      <button
        type="button"
        onClick={() => navigate('/detalhamento')}
        className="w-full flex items-center justify-center gap-2 bg-surface-cont border border-surface-bright rounded-card py-3 text-white text-sm font-medium hover:border-primary transition-colors"
      >
        <span className="text-primary text-lg">+</span>
        Visualizar / Editar
      </button>

      <div className="h-2" />
    </div>
  );
}
