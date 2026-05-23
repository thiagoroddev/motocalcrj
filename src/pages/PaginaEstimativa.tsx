import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../hooks/usePerfil';
import { useCustos } from '../hooks/useCustos';
import { calcularBreakdownPercentual, categoriasParaFiltros } from '../utils/calculos';
import { Button } from '../components/ui/button';
import { CardCpk } from '../components/estimativa/CardCpk';
import { CardPeriodo } from '../components/estimativa/CardPeriodo';
import { SecaoRodagem } from '../components/estimativa/SecaoRodagem';
import { DistribuicaoCustos } from '../components/estimativa/DistribuicaoCustos';
import type { SegmentoDonut } from '../components/estimativa/DonutChart';

const CATEG_CONFIG: Record<string, { label: string; cor: string }> = {
  documentos: { label: 'Documentos', cor: '#60A5FA' },
  manutencao: { label: 'Manutenção', cor: '#F59E0B' },
  combustivel: { label: 'Combustível', cor: '#22C55E' },
  internet: { label: 'Internet', cor: '#0EA5E9' },
  seguro: { label: 'Seguro', cor: '#0078FF' },
  alimentacao: { label: 'Alimentação', cor: '#FBBF24' },
  financiamento: { label: 'Financiamento', cor: '#F97316' },
  gastosCustom: { label: 'Gastos extras', cor: '#EC4899' },
};

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
        <p className="text-muted-foreground/60 text-sm text-center">
          Modelo não encontrado. Refaça o onboarding.
        </p>
      </div>
    );
  }

  const { granularidades, granularidadesMoto, kmAnual, diasAno, custos } = resultado;
  const dias = perfil.trabalho.diasPorSemana;
  const horas = perfil.trabalho.horasPorDia;
  const porHora = diasAno > 0 && horas > 0 ? granularidades.anual / (diasAno * horas) : 0;

  const filtrosAtivos = categoriasParaFiltros(perfil.configuracaoDisplay.categoriasAtivas);
  const breakdown = calcularBreakdownPercentual(custos, filtrosAtivos);
  const segmentos: SegmentoDonut[] = Object.entries(CATEG_CONFIG)
    .map(([id, cfg]) => ({
      id,
      label: cfg.label,
      // revisao é sub-item de manutencao — soma aqui para o visual
      porcentagem:
        id === 'manutencao'
          ? (breakdown.manutencao ?? 0) + (breakdown.revisao ?? 0)
          : (breakdown[id] ?? 0),
      cor: cfg.cor,
    }))
    .filter((s) => s.porcentagem > 0);

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
      <SecaoRodagem
        kmDiaInput={kmDiaInput}
        onKmDiaChange={setKmDiaInput}
        onKmDiaBlur={handleKmBlur}
        dias={dias}
        onStepDias={stepDias}
      />

      <CardCpk
        porKm={granularidades.porKm}
        porKmSemAlimentacao={
          granularidadesMoto.porKm !== granularidades.porKm ? granularidadesMoto.porKm : undefined
        }
      />

      <div className="grid grid-cols-2 gap-sm">
        <CardPeriodo label="Por Hora" valor={porHora} />
        <CardPeriodo label="Por Dia" valor={granularidades.diario} />
      </div>

      <div className="space-y-sm">
        <CardPeriodo label="Estimado por semana" valor={granularidades.semanal} km={kmAnual / 52} />
        <CardPeriodo label="Estimado por mês" valor={granularidades.mensal} km={kmAnual / 12} />
        <CardPeriodo label="Estimado por ano" valor={granularidades.anual} km={kmAnual} />
      </div>

      <DistribuicaoCustos segmentos={segmentos} />

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 bg-card border-muted rounded-lg py-3 text-sm font-medium hover:bg-card hover:border-primary"
        onClick={() => navigate('/estimativa/detalhamento')}
      >
        <span className="text-primary text-lg">+</span>
        Visualizar / Editar
      </Button>

      <div className="h-2" />
    </div>
  );
}
