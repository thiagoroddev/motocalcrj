import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Store, TriangleAlert } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TituloSecao } from '@/components/TituloSecao';
import { AjudaInline } from '@/components/AjudaInline';
import { AvisoFonte } from '@/components/AvisoFonte';
import { LinhaRevisaoConcessionaria } from '@/components/mao-de-obra/LinhaRevisaoConcessionaria';
import { ListaServicos, BotaoRestaurarTudo } from '@/components/mao-de-obra/ListaServicos';
import { SecaoServicosExtras } from '@/components/mao-de-obra/SecaoServicosExtras';
import { ControleEstimativaMaoDeObra } from '@/components/mao-de-obra/ControleEstimativaMaoDeObra';
import { usePerfil } from '../hooks/usePerfil';
import { obterPreset } from '../data/repositorioPresets';
import { normalizarPerfilMvp } from '../hooks/useCustos';
import { obterServicosManutencaoBase } from '../utils/servicosManutencaoPreset';
import { SERVICOS_DE_PNEU } from '../utils/calculos';
import {
  resolverStatusPrecoAutorizada,
  concessionariaInformaPrecoCompleto,
} from '../utils/statusPrecoAutorizada';
import { montarEstimativaMaoDeObra } from '../utils/maoDeObraEstimada';
import type { ServicoIndependente } from '../types/perfil';

type AbaMaoDeObra = 'concessionaria' | 'excepcional';

type LocationStateMaoDeObra = {
  abaInicial?: AbaMaoDeObra | 'honda' | 'independente';
  destaqueIndex?: number;
};

const DURACAO_DESTAQUE_MS = 2000;

function normalizarAbaInicial(abaInicial?: LocationStateMaoDeObra['abaInicial']): AbaMaoDeObra {
  return abaInicial === 'excepcional' ? 'excepcional' : 'concessionaria';
}

// ── PaginaMaoDeObra ──────────────────────────────────────────

export function PaginaMaoDeObra() {
  const { perfil, dispatch } = usePerfil();
  const location = useLocation();
  const navState = (location.state ?? null) as LocationStateMaoDeObra | null;
  const preset = obterPreset(perfil.moto.modelo);
  const perfilMvp = normalizarPerfilMvp(perfil, preset);
  const servicosPadrao = obterServicosManutencaoBase(preset);

  const destaqueIndex = navState?.destaqueIndex ?? null;
  const refDestaque = useRef<HTMLDivElement | null>(null);
  const [indiceDestacado, setIndiceDestacado] = useState<number | null>(destaqueIndex);

  useEffect(() => {
    if (destaqueIndex == null) return;
    setIndiceDestacado(destaqueIndex);
    refDestaque.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(() => setIndiceDestacado(null), DURACAO_DESTAQUE_MS);
    return () => clearTimeout(timer);
  }, [destaqueIndex]);

  const servicosNormais = perfilMvp.servicosIndependentes.filter((s) => !s.ehExcepcional);
  const servicosExcepcionais = perfilMvp.servicosIndependentes.filter((s) => s.ehExcepcional);
  // A aba Independente existe apenas quando o preset tem conteúdo próprio para
  // ela. Hoje são os pneus Yamaha: M.O. de oficina + peça em Insumos. (BG-036)
  const pneusIndependentes = servicosExcepcionais.filter((s) => SERVICOS_DE_PNEU.has(s.id));
  const temAbaIndependente = pneusIndependentes.length > 0;
  const abaInicialRecebida = normalizarAbaInicial(navState?.abaInicial);
  const abaInicial = temAbaIndependente ? abaInicialRecebida : 'concessionaria';
  // Aba Concessionária: serviços avulsos km-driven fora das revisões fixas.
  // Mesmo quando o preço ainda está `nao_informado`, o card aparece para o
  // usuário conseguir preencher o valor da concessionária.
  // Bateria (TASK-RF-8.4): `troca-bateria` é temporal (intervalKm 0) mas aparece
  // nos Serviços Extras (completo Honda / incompleto Yamaha) com select de vida
  // útil em anos no lugar do intervalo em km.
  const servicosAvulsosAutorizada = servicosNormais.filter(
    (s) => !s.incluidoNaRevisaoAutorizada && (s.intervalKm > 0 || s.id === 'troca-bateria'),
  );
  // "Completo" = a concessionária informa o valor cheio (peça + M.O.) no preset —
  // só Honda (`concessionariaIncluiPeca`). Yamaha informa só a M.O. (peça à parte),
  // então é incompleto mesmo com M.O. real. O status nasce do serviço-base e não
  // muda com edição/estimativa do usuário. (BG-032 / corrigido BG-033)
  function ehAvulsoCompleto(s: ServicoIndependente): boolean {
    const base = servicosPadrao.find((p) => p.id === s.id);
    return base != null && concessionariaInformaPrecoCompleto(base);
  }
  const avulsosCompletos = servicosAvulsosAutorizada.filter(ehAvulsoCompleto);
  const avulsosIncompletos = servicosAvulsosAutorizada.filter((s) => !ehAvulsoCompleto(s));
  const estimativaLigada = perfil.perfilManutencao.incluirEstimativaMaoDeObra === true;
  const menorIntervaloIndependente = pneusIndependentes.reduce<number | null>(
    (menor, servico) => (menor === null ? servico.intervalKm : Math.min(menor, servico.intervalKm)),
    null,
  );
  const deveAlertarIndependente =
    menorIntervaloIndependente !== null && perfil.moto.kmAtual >= menorIntervaloIndependente;
  const limiteIndependenteFormatado = menorIntervaloIndependente?.toLocaleString('pt-BR') ?? '0';

  const temOverridesConcessionaria = perfil.revisaoAutorizadaOverrides.length > 0;

  function servicoDifereDopadraoAutorizada(s: ServicoIndependente): boolean {
    const p = servicosPadrao.find((ps) => ps.id === s.id);
    if (!p) return false;
    return (
      s.precoTotalAutorizada !== p.precoTotalAutorizada ||
      resolverStatusPrecoAutorizada(s) !== resolverStatusPrecoAutorizada(p) ||
      s.intervaloKmInformadoUsuario === true ||
      s.intervalKm !== p.intervalKm
    );
  }

  const temOverridesPneus = pneusIndependentes.some(servicoDifereDopadraoAutorizada);
  const temOverridesCompletos = avulsosCompletos.some(servicoDifereDopadraoAutorizada);
  const temOverridesIncompletos = avulsosIncompletos.some(servicoDifereDopadraoAutorizada);

  function restaurarGrupo(servicos: ServicoIndependente[]) {
    servicos.forEach((s) => {
      const padrao = servicosPadrao.find((p) => p.id === s.id);
      if (padrao) dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...padrao } });
    });
  }

  function restaurarConcessionaria() {
    perfil.revisaoAutorizadaOverrides.forEach((o) => {
      dispatch({ type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE', index: o.index });
    });
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue={abaInicial} className="flex flex-col flex-1">
        {temAbaIndependente && (
          <TabsList className="grid grid-cols-2 mx-4 mt-4 shrink-0">
            <TabsTrigger value="concessionaria">Concessionária</TabsTrigger>
            <TabsTrigger value="excepcional">Independente</TabsTrigger>
          </TabsList>
        )}

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="concessionaria" className="px-4 pb-4 pt-3">
            {!preset ? (
              <p className="text-muted-foreground text-sm">
                Preset não encontrado para este modelo.
              </p>
            ) : (
              <div className="space-y-2">
                <TituloSecao icone={Store}>Mão de Obra - Concessionária</TituloSecao>
                <AvisoFonte>
                  Valores obtidos dos sites oficiais das concessionárias; podem estar
                  desatualizados.
                </AvisoFonte>
                {preset.revisaoAutorizada.map((revisao, idx) => {
                  const override = perfil.revisaoAutorizadaOverrides.find((o) => o.index === idx);
                  const ehDestacado = indiceDestacado === idx;
                  return (
                    <LinhaRevisaoConcessionaria
                      key={idx}
                      ref={ehDestacado ? refDestaque : undefined}
                      index={idx}
                      revisao={revisao}
                      override={override ?? null}
                      dispatch={dispatch}
                      destacado={ehDestacado}
                    />
                  );
                })}
                {temOverridesConcessionaria && (
                  <BotaoRestaurarTudo onRestaurar={restaurarConcessionaria} />
                )}

                {servicosAvulsosAutorizada.length > 0 && (
                  <div className="pt-4">
                    <SecaoServicosExtras
                      avulsosCompletos={avulsosCompletos}
                      avulsosIncompletos={avulsosIncompletos}
                      servicosPadrao={servicosPadrao}
                      estimativaLigada={estimativaLigada}
                      dispatch={dispatch}
                      montarEstimativa={(s) => montarEstimativaMaoDeObra(perfil, preset, s.id)}
                      temOverridesCompletos={temOverridesCompletos}
                      temOverridesIncompletos={temOverridesIncompletos}
                      onRestaurarCompletos={() => restaurarGrupo(avulsosCompletos)}
                      onRestaurarIncompletos={() => restaurarGrupo(avulsosIncompletos)}
                      vidaUtilBateriaAnos={perfil.perfilManutencao.bateria.vidaUtilAnos}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {temAbaIndependente && (
            <TabsContent value="excepcional" className="px-4 pb-4 pt-3">
              <div className="space-y-4">
                <TituloSecao icone={TriangleAlert}>Serviços Independentes (oficina)</TituloSecao>
                {deveAlertarIndependente && (
                  <div className="rounded-lg border px-4 py-2 bg-warning/10 border-warning/30 text-warning text-sm">
                    Atenção: sua moto está próxima ou acima de {limiteIndependenteFormatado} km.
                    Considere revisar os serviços de oficina independente.
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Mão de obra (oficina independente)
                    </h3>
                    <AjudaInline titulo="Mão de obra (oficina independente)">
                      O pneu é trocado em <strong>oficina independente</strong> (a concessionária
                      não faz). Aqui vai <strong>apenas a mão de obra</strong> (ou a estimativa ~);
                      a peça do pneu é precificada na aba <strong>Insumos</strong> e somada ao
                      custo.
                    </AjudaInline>
                  </div>
                  {/* Toggle abaixo do título: estimativa só atinge avulsos sem valor. */}
                  <ControleEstimativaMaoDeObra ligada={estimativaLigada} dispatch={dispatch} />
                  <ListaServicos
                    servicos={pneusIndependentes}
                    dispatch={dispatch}
                    servicosPadrao={servicosPadrao}
                    temOverrides={temOverridesPneus}
                    onRestaurarTudo={() => restaurarGrupo(pneusIndependentes)}
                    modo="autorizada"
                    montarEstimativa={(s) => montarEstimativaMaoDeObra(perfil, preset, s.id)}
                  />
                </div>
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
