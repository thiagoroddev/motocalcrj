import { usePerfil } from '../hooks/usePerfil';
import { perfilPadrao } from '../context/PerfilContext';
import { CATALOGO } from '../data/catalogoModelos';
import { CardCombustivel } from '@/components/custos-pecas/CardCombustivel';
import { CardItemPreco } from '@/components/custos-pecas/CardItemPreco';
import type { PresetMoto } from '../types/calculos';
import type { TipoCombustivel, ConfiguracaoCombustivel } from '../types/perfil';

// ── Carregamento de presets ──────────────────────────────────

const _rawPresets = import.meta.glob('../presets/*.json', { eager: true });

const PRESETS: Record<string, PresetMoto> = Object.fromEntries(
  Object.entries(_rawPresets).map(([path, mod]) => [
    path.split('/').pop()!.replace('.json', ''),
    (mod as { default: PresetMoto }).default,
  ]),
);

// ── PaginaInsumos ────────────────────────────────────────────

export function PaginaInsumos() {
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
          intervaloKm: resolverIntervalo(
            p.id,
            (usaComBau ? p.intervaloKmEntrega : p.intervaloKm) ?? 0,
          ),
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
