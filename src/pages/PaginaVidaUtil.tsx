import { useState, useEffect } from 'react';
import type { Dispatch } from 'react';
import { RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePerfil } from '../hooks/usePerfil';
import { perfilPadrao } from '../context/PerfilContext';
import { CATALOGO } from '../data/catalogoModelos';
import type { PresetMoto } from '../types/calculos';
import type {
  PerfilAction,
  PecaOverride,
  TipoCombustivel,
  ConfiguracaoCombustivel,
} from '../types/perfil';

// ── Carregamento de presets ──────────────────────────────────

const _rawPresets = import.meta.glob('../presets/*.json', { eager: true });

const PRESETS: Record<string, PresetMoto> = Object.fromEntries(
  Object.entries(_rawPresets).map(([path, mod]) => [
    path.split('/').pop()!.replace('.json', ''),
    (mod as { default: PresetMoto }).default,
  ]),
);

// ── IconeReset ───────────────────────────────────────────────

function IconeReset({ visivel, onClick }: { visivel: boolean; onClick: () => void }) {
  if (!visivel) return <div className="w-8 shrink-0" />;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-8 shrink-0 flex items-center justify-center text-muted-foreground/40 hover:text-primary transition-colors"
      aria-label="Restaurar valor padrão"
    >
      <RotateCcw className="w-4 h-4" />
    </button>
  );
}

// ── CardCombustivel ──────────────────────────────────────────

interface PropsCombustivel {
  tipo: TipoCombustivel;
  config: ConfiguracaoCombustivel;
  padrao: ConfiguracaoCombustivel;
  ehPreferido: boolean;
  dispatch: Dispatch<PerfilAction>;
}

const NOME_COMBUSTIVEL: Record<TipoCombustivel, string> = {
  comum: 'Gasolina Comum',
  aditivada: 'Gasolina Aditivada',
  etanol: 'Etanol',
};

function CardCombustivel({ tipo, config, padrao, ehPreferido, dispatch }: PropsCombustivel) {
  const [preco, setPreco] = useState(config.preco.toFixed(2));
  const [autonomia, setAutonomia] = useState(config.autonomia.toFixed(1));

  useEffect(() => {
    setPreco(config.preco.toFixed(2));
  }, [config.preco]);
  useEffect(() => {
    setAutonomia(config.autonomia.toFixed(1));
  }, [config.autonomia]);

  const temOverridePreco = Math.abs(config.preco - padrao.preco) >= 0.01;
  const temOverrideAutonomia = Math.abs(config.autonomia - padrao.autonomia) >= 0.1;
  const temOverride = temOverridePreco || temOverrideAutonomia;

  function handleBlurPreco() {
    const num = parseFloat(preco.replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      setPreco(config.preco.toFixed(2));
      return;
    }
    dispatch({ type: 'SET_COMBUSTIVEL', tipo, campo: 'preco', valor: num });
  }

  function handleBlurAutonomia() {
    const num = parseFloat(autonomia.replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      setAutonomia(config.autonomia.toFixed(1));
      return;
    }
    dispatch({ type: 'SET_COMBUSTIVEL', tipo, campo: 'autonomia', valor: num });
  }

  function resetar() {
    dispatch({ type: 'SET_COMBUSTIVEL', tipo, campo: 'preco', valor: padrao.preco });
    dispatch({ type: 'SET_COMBUSTIVEL', tipo, campo: 'autonomia', valor: padrao.autonomia });
  }

  return (
    <div className="bg-card rounded-lg p-md space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          {ehPreferido && <span className="text-xs text-primary">●</span>}
          <span className="text-sm font-medium">{NOME_COMBUSTIVEL[tipo]}</span>
          {ehPreferido && <span className="text-xs text-primary font-medium">Preferido</span>}
        </div>
        <div className="flex items-center gap-1">
          {!ehPreferido && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground px-2"
              onClick={() => dispatch({ type: 'SET_TIPO_COMBUSTIVEL_PREFERIDO', tipo })}
            >
              Usar este
            </Button>
          )}
          <IconeReset visivel={temOverride} onClick={resetar} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-1">
          <span className="label-neutro block">Preço (R$/L)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverridePreco ? ' border-primary' : ''}`}
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onBlur={handleBlurPreco}
            min={0.01}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <span className="label-neutro block">Autonomia (km/L)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverrideAutonomia ? ' border-primary' : ''}`}
            value={autonomia}
            onChange={(e) => setAutonomia(e.target.value)}
            onBlur={handleBlurAutonomia}
            min={0.1}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}

// ── CardItemPreco ────────────────────────────────────────────

interface PropsCardItemPreco {
  id: string;
  nome: string;
  precoOriginal: number;
  precoParalela: number;
  intervaloKm: number;
  override: PecaOverride | null;
  dispatch: Dispatch<PerfilAction>;
}

function CardItemPreco({
  id,
  nome,
  precoOriginal,
  precoParalela,
  intervaloKm,
  override,
  dispatch,
}: PropsCardItemPreco) {
  const originalEfetivo = override?.precoEditadoOriginal ?? precoOriginal;
  const paralelaEfetiva = override?.precoEditadaParalela ?? precoParalela;

  const [localOriginal, setLocalOriginal] = useState(originalEfetivo.toFixed(2));
  const [localParalela, setLocalParalela] = useState(paralelaEfetiva.toFixed(2));

  useEffect(() => {
    setLocalOriginal(originalEfetivo.toFixed(2));
  }, [originalEfetivo]);
  useEffect(() => {
    setLocalParalela(paralelaEfetiva.toFixed(2));
  }, [paralelaEfetiva]);

  const temOverride =
    override?.precoEditadoOriginal != null || override?.precoEditadaParalela != null;

  function handleBlurOriginal() {
    const num = parseFloat(localOriginal.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setLocalOriginal(originalEfetivo.toFixed(2));
      return;
    }
    if (Math.abs(num - precoOriginal) < 0.01) {
      if (override?.precoEditadoOriginal != null)
        dispatch({ type: 'RESET_PECA_OVERRIDE', id, campo: 'precoOriginal' });
      return;
    }
    dispatch({ type: 'SET_PECA_OVERRIDE', id, campo: 'precoOriginal', valor: num });
  }

  function handleBlurParalela() {
    const num = parseFloat(localParalela.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setLocalParalela(paralelaEfetiva.toFixed(2));
      return;
    }
    if (Math.abs(num - precoParalela) < 0.01) {
      if (override?.precoEditadaParalela != null)
        dispatch({ type: 'RESET_PECA_OVERRIDE', id, campo: 'precoParalela' });
      return;
    }
    dispatch({ type: 'SET_PECA_OVERRIDE', id, campo: 'precoParalela', valor: num });
  }

  return (
    <div className="bg-card rounded-lg p-md space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{nome}</span>
        <IconeReset
          visivel={temOverride}
          onClick={() => dispatch({ type: 'RESET_PECA_OVERRIDE', id })}
        />
      </div>

      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-1">
          <span className="label-neutro block">Original (R$)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${override?.precoEditadoOriginal != null ? ' border-primary' : ''}`}
            value={localOriginal}
            onChange={(e) => setLocalOriginal(e.target.value)}
            onBlur={handleBlurOriginal}
            min={0}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <span className="label-neutro block">Paralela (R$)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${override?.precoEditadaParalela != null ? ' border-primary' : ''}`}
            value={localParalela}
            onChange={(e) => setLocalParalela(e.target.value)}
            onBlur={handleBlurParalela}
            min={0}
            step={0.01}
          />
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/50 leading-tight">
        Vida útil: {intervaloKm.toLocaleString('pt-BR')} km · Alterar na aba M. Obra
      </p>
    </div>
  );
}

// ── PaginaVidaUtil ───────────────────────────────────────────

export function PaginaVidaUtil() {
  const { perfil, dispatch } = usePerfil();
  const preset = PRESETS[perfil.moto.modelo];
  const catalogo = CATALOGO[perfil.moto.modelo];
  const aceitaEtanol = catalogo?.aceitaEtanol ?? true;
  const usaComBau = perfil.moto.perfilUso === 'entrega';

  const tiposCombustivel: TipoCombustivel[] = [
    'comum',
    'aditivada',
    ...(aceitaEtanol ? (['etanol'] as TipoCombustivel[]) : []),
  ];

  const autonomiaBase = catalogo
    ? usaComBau
      ? catalogo.consumoKmLComBau
      : catalogo.consumoKmL
    : perfilPadrao.financeiro.combustiveis.comum.autonomia;

  const padraoCombustiveis: Record<TipoCombustivel, ConfiguracaoCombustivel> = {
    comum: { preco: perfilPadrao.financeiro.combustiveis.comum.preco, autonomia: autonomiaBase },
    aditivada: {
      preco: perfilPadrao.financeiro.combustiveis.aditivada.preco,
      autonomia: autonomiaBase,
    },
    etanol: {
      preco: perfilPadrao.financeiro.combustiveis.etanol.preco,
      autonomia: Math.round(autonomiaBase * 0.78),
    },
  };

  function resolverIntervalo(id: string, fallback: number): number {
    return perfil.servicosIndependentes.find((s) => s.id === id)?.intervalKm ?? fallback;
  }

  const itensPecas = preset
    ? [
        ...preset.pecas.map((p) => ({
          id: p.id,
          nome: p.nome,
          precoOriginal: p.precoOriginal,
          precoParalela: p.precoParalela,
          intervaloKm: resolverIntervalo(p.id, usaComBau ? p.intervaloKmEntrega : p.intervaloKm),
        })),
        ...preset.pneus.map((p) => ({
          id: p.id,
          nome: `Pneu ${p.posicao}`,
          precoOriginal: p.precoOriginal,
          precoParalela: p.precoParalela,
          intervaloKm: resolverIntervalo(p.id, p.vidaUtilKm),
        })),
      ]
    : [];

  return (
    <div className="overflow-y-auto h-full px-md pb-md pt-sm space-y-lg">
      <section className="space-y-sm">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-px">
          Combustível
        </h2>
        {tiposCombustivel.map((tipo) => (
          <CardCombustivel
            key={tipo}
            tipo={tipo}
            config={perfil.financeiro.combustiveis[tipo]}
            padrao={padraoCombustiveis[tipo]}
            ehPreferido={perfil.financeiro.tipoGasolinaPreferida === tipo}
            dispatch={dispatch}
          />
        ))}
      </section>

      {preset ? (
        <section className="space-y-sm">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-px">
            Peças e Pneus
          </h2>
          {itensPecas.map((item) => (
            <CardItemPreco
              key={item.id}
              {...item}
              override={perfil.pecasOverrides.find((o) => o.id === item.id) ?? null}
              dispatch={dispatch}
            />
          ))}
        </section>
      ) : (
        <p className="text-muted-foreground text-sm">Preset não encontrado para este modelo.</p>
      )}
    </div>
  );
}
