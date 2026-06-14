import { usePerfil } from '../hooks/usePerfil';
import { perfilPadrao } from '../context/PerfilContext';
import { CATALOGO, obterConsumoKmL } from '../data/catalogoModelos';
import { dadosRJ } from '../data/dadosRJ';
import { obterPreset } from '../data/repositorioPresets';
import { Fuel, Cog } from 'lucide-react';
import { CardCombustivel } from '@/components/custos-pecas/CardCombustivel';
import { CardItemPreco } from '@/components/custos-pecas/CardItemPreco';
import { TituloSecao } from '@/components/TituloSecao';
import { resolverServicoPorPeca, ehPecaCobertaPorServicoCompleto } from '../utils/calculos';
import { resolverServicosManutencaoPerfil } from '../utils/servicosManutencaoPreset';
import type { TipoCombustivel, ConfiguracaoCombustivel } from '../types/perfil';

// ── PaginaInsumos ────────────────────────────────────────────

export function PaginaInsumos() {
  const { perfil, dispatch } = usePerfil();
  const preset = obterPreset(perfil.moto.modelo);
  const servicosManutencao = resolverServicosManutencaoPerfil(perfil, preset);
  const catalogo = CATALOGO[perfil.moto.modelo];
  const aceitaEtanol = catalogo?.aceitaEtanol ?? true;

  const tiposCombustivel: TipoCombustivel[] = [
    'comum',
    'aditivada',
    ...(aceitaEtanol ? (['etanol'] as TipoCombustivel[]) : []),
  ];

  const autonomiaBase =
    obterConsumoKmL(perfil.moto.modelo) ?? perfil.financeiro.combustiveis.comum.autonomia;

  const padraoCombustiveis: Record<TipoCombustivel, ConfiguracaoCombustivel> = {
    comum: { preco: perfilPadrao.financeiro.combustiveis.comum.preco, autonomia: autonomiaBase },
    aditivada: {
      preco: perfilPadrao.financeiro.combustiveis.aditivada.preco,
      autonomia: autonomiaBase,
    },
    etanol: {
      preco: perfilPadrao.financeiro.combustiveis.etanol.preco,
      autonomia: Math.round(autonomiaBase * dadosRJ.autonomiaEtanolFatorReducao),
    },
  };

  function resolverIntervalo(id: string, fallback: number): number {
    return resolverServicoPorPeca(id, servicosManutencao)?.intervalKm ?? fallback;
  }

  // Peça coberta por serviço avulso completo (Honda) não aparece em Insumos — o
  // preço completo da concessionária já a inclui (espelha o cálculo, ADR-007). BG-034.
  const modoRevisao = perfil.perfilManutencao.modoRevisao;
  const pecaCoberta = (id: string) =>
    ehPecaCobertaPorServicoCompleto(id, modoRevisao, servicosManutencao);

  const itensPecas = preset
    ? [
        ...preset.pecas
          .filter((p) => !p.incluidoNaRevisaoAutorizada && !pecaCoberta(p.id))
          .map((p) => ({
            id: p.id,
            nome: p.nome,
            precoOriginal: p.precoOriginal,
            precoParalela: p.precoParalela,
            intervaloKm: resolverIntervalo(p.id, p.intervaloKm ?? 0),
          })),
        ...preset.pneus
          .filter((p) => !pecaCoberta(p.id))
          .map((p) => ({
            id: p.id,
            nome: `Pneu ${p.posicao}`,
            precoOriginal: p.precoOriginal,
            precoParalela: p.precoParalela,
            intervaloKm: resolverIntervalo(p.id, p.vidaUtilKm),
          })),
      ]
    : [];

  return (
    <div className="overflow-y-auto h-full px-4 pb-4 pt-2 space-y-6">
      <section className="space-y-2">
        <TituloSecao icone={Fuel}>Combustível</TituloSecao>
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
        <section className="space-y-2">
          <TituloSecao icone={Cog}>Peças e Pneus</TituloSecao>
          <div data-testid="lista-insumos-pecas" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {itensPecas.map((item) => (
              <CardItemPreco
                key={item.id}
                {...item}
                override={perfil.pecasOverrides.find((o) => o.id === item.id) ?? null}
                dispatch={dispatch}
              />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-muted-foreground text-sm">Preset não encontrado para este modelo.</p>
      )}
    </div>
  );
}
