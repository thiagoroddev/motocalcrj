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
  PerfilPecas,
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
  perfilPecasGlobal: PerfilPecas;
  dispatch: Dispatch<PerfilAction>;
}

function CardItemPreco({
  id,
  nome,
  precoOriginal,
  precoParalela,
  intervaloKm,
  override,
  perfilPecasGlobal,
  dispatch,
}: PropsCardItemPreco) {
  const perfilEfetivo = override?.perfilPecasOverride ?? perfilPecasGlobal;
  const precoBase = perfilEfetivo === 'original' ? precoOriginal : precoParalela;
  const precoEfetivo = override?.precoEditado ?? precoBase;

  const [preco, setPreco] = useState(precoEfetivo.toFixed(2));

  useEffect(() => {
    setPreco(precoEfetivo.toFixed(2));
  }, [precoEfetivo]);

  const temOverride = override?.precoEditado != null || override?.perfilPecasOverride != null;

  function handleBlur() {
    const num = parseFloat(preco.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setPreco(precoEfetivo.toFixed(2));
      return;
    }
    if (Math.abs(num - precoBase) < 0.01) {
      if (override?.precoEditado != null)
        dispatch({ type: 'RESET_PECA_OVERRIDE', id, campo: 'preco' });
      return;
    }
    dispatch({ type: 'SET_PECA_OVERRIDE', id, campo: 'preco', valor: num });
  }

  function trocarPerfil(novoPerfil: PerfilPecas) {
    if (override?.precoEditado != null)
      dispatch({ type: 'RESET_PECA_OVERRIDE', id, campo: 'preco' });
    if (novoPerfil === perfilPecasGlobal) {
      dispatch({ type: 'RESET_PECA_OVERRIDE', id, campo: 'perfilPecas' });
    } else {
      dispatch({ type: 'SET_PECA_OVERRIDE', id, campo: 'perfilPecas', valor: novoPerfil });
    }
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

      {/* Toggle Original / Paralela */}
      <div className="flex rounded overflow-hidden border border-muted">
        {(['original', 'paralela'] as PerfilPecas[]).map((p, i) => (
          <button
            key={p}
            type="button"
            onClick={() => trocarPerfil(p)}
            className={`flex-1 py-2 transition-colors${i > 0 ? ' border-l border-muted' : ''} ${
              perfilEfetivo === p
                ? 'bg-primary/20 text-primary'
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="block text-[10px] font-medium uppercase tracking-wide">
              {p === 'original' ? 'Original' : 'Paralela'}
            </span>
            <span className="block text-[9px] font-normal opacity-70">
              R$ {(p === 'original' ? precoOriginal : precoParalela).toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-1">
          <span className="label-neutro block">Preço (R$)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${override?.precoEditado != null ? ' border-primary' : ''}`}
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onBlur={handleBlur}
            min={0}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <span className="label-neutro block">Vida útil (km)</span>
          <div className="rounded-input border border-muted bg-muted/20 min-h-touch text-sm flex items-center px-3 text-muted-foreground/60 select-none cursor-default">
            {intervaloKm.toLocaleString('pt-BR')}
          </div>
          <p className="text-[10px] text-muted-foreground/40 leading-tight">
            Alterar na aba M. Obra
          </p>
        </div>
      </div>
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
              perfilPecasGlobal={perfil.perfilManutencao.perfilPecasGlobal}
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
