import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import { useLocation } from 'react-router-dom';
import { Store, TriangleAlert, Tag } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TituloSecao } from '@/components/TituloSecao';
import { DialogConfirmacao } from '@/components/DialogConfirmacao';
import { AjudaInline } from '@/components/AjudaInline';
import { CardServico } from '@/components/mao-de-obra/CardServico';
import { ControleEstimativaMaoDeObra } from '@/components/mao-de-obra/ControleEstimativaMaoDeObra';
import { LinhaRevisaoConcessionaria } from '@/components/mao-de-obra/LinhaRevisaoConcessionaria';
import { usePerfil } from '../hooks/usePerfil';
import { obterPreset } from '../data/repositorioPresets';
import { normalizarPerfilMvp } from '../hooks/useCustos';
import { obterServicosManutencaoBase } from '../utils/servicosManutencaoPreset';
import {
  resolverStatusPrecoAutorizada,
  concessionariaInformaPrecoCompleto,
} from '../utils/statusPrecoAutorizada';
import {
  montarEstimativaMaoDeObra,
  type EstimativaMaoDeObraItem,
} from '../utils/maoDeObraEstimada';
import type { ServicoIndependente, PerfilAction } from '../types/perfil';

type AbaMaoDeObra = 'concessionaria' | 'excepcional';

type LocationStateMaoDeObra = {
  abaInicial?: AbaMaoDeObra | 'honda' | 'independente';
  destaqueIndex?: number;
};

const DURACAO_DESTAQUE_MS = 2000;

function normalizarAbaInicial(abaInicial?: LocationStateMaoDeObra['abaInicial']): AbaMaoDeObra {
  return abaInicial === 'excepcional' ? 'excepcional' : 'concessionaria';
}

// ── BotaoRestaurarTudo ───────────────────────────────────────

function BotaoRestaurarTudo({ onRestaurar }: { onRestaurar: () => void }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-muted-foreground"
        onClick={() => setAberto(true)}
      >
        Restaurar tudo
      </Button>
      <DialogConfirmacao
        aberto={aberto}
        onOpenChange={setAberto}
        onConfirmar={onRestaurar}
        titulo="Restaurar tudo?"
        descricao="Todos os valores desta aba voltam ao padrão."
      />
    </>
  );
}

// ── ListaServicos ────────────────────────────────────────────

interface PropsListaServicos {
  servicos: ServicoIndependente[];
  dispatch: Dispatch<PerfilAction>;
  servicosPadrao: ServicoIndependente[];
  temOverrides: boolean;
  onRestaurarTudo: () => void;
  modo?: 'independente' | 'autorizada';
  // Quando fornecido, cada card recebe seu bundle de estimativa por-item (A) —
  // mantém a aba Mão de Obra sincronizada com o popup do Detalhamento.
  montarEstimativa?: (servico: ServicoIndependente) => EstimativaMaoDeObraItem;
}

function ListaServicos({
  servicos,
  dispatch,
  servicosPadrao,
  temOverrides,
  onRestaurarTudo,
  modo = 'independente',
  montarEstimativa,
}: PropsListaServicos) {
  return (
    <div className="space-y-2">
      {servicos.map((s) => (
        <CardServico
          key={s.id}
          servico={s}
          servicoPadrao={servicosPadrao.find((padrao) => padrao.id === s.id)}
          dispatch={dispatch}
          modo={modo}
          estimativaMaoDeObra={montarEstimativa?.(s)}
        />
      ))}
      {temOverrides && <BotaoRestaurarTudo onRestaurar={onRestaurarTudo} />}
    </div>
  );
}

// ── PaginaMaoDeObra ──────────────────────────────────────────

export function PaginaMaoDeObra() {
  const { perfil, dispatch } = usePerfil();
  const location = useLocation();
  const navState = (location.state ?? null) as LocationStateMaoDeObra | null;
  const preset = obterPreset(perfil.moto.modelo);
  const perfilMvp = normalizarPerfilMvp(perfil, preset);
  const servicosPadrao = obterServicosManutencaoBase(preset);

  const abaInicial = normalizarAbaInicial(navState?.abaInicial);
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
  // Aba Concessionária: serviços avulsos km-driven fora das revisões fixas.
  // Mesmo quando o preço ainda está `nao_informado`, o card aparece para o
  // usuário conseguir preencher o valor da concessionária.
  const servicosAvulsosAutorizada = servicosNormais.filter(
    (s) => !s.incluidoNaRevisaoAutorizada && s.intervalKm > 0,
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
  const menorIntervaloExcepcional = servicosExcepcionais.reduce<number | null>(
    (menor, servico) => (menor === null ? servico.intervalKm : Math.min(menor, servico.intervalKm)),
    null,
  );
  const deveAlertarExcepcional =
    menorIntervaloExcepcional !== null && perfil.moto.kmAtual >= menorIntervaloExcepcional;
  const limiteExcepcionalFormatado = menorIntervaloExcepcional?.toLocaleString('pt-BR') ?? '0';

  const temOverridesConcessionaria = perfil.revisaoAutorizadaOverrides.length > 0;

  function servicoDifereDopadraoIndependente(s: ServicoIndependente): boolean {
    const p = servicosPadrao.find((ps) => ps.id === s.id);
    if (!p) return false;
    return (
      s.precoIndependente !== p.precoIndependente ||
      s.intervaloKmInformadoUsuario === true ||
      s.intervalKm !== p.intervalKm
    );
  }

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

  const temOverridesExcepcionais = servicosExcepcionais.some(servicoDifereDopadraoIndependente);
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
        <TabsList className="grid grid-cols-2 mx-4 mt-4 shrink-0">
          <TabsTrigger value="concessionaria">Concessionária</TabsTrigger>
          <TabsTrigger value="excepcional">Excepcional</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="concessionaria" className="px-4 pb-4 pt-3">
            {!preset ? (
              <p className="text-muted-foreground text-sm">
                Preset não encontrado para este modelo.
              </p>
            ) : (
              <div className="space-y-2">
                <TituloSecao icone={Store}>Mão de Obra - Concessionária</TituloSecao>
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
                  <div className="space-y-4 pt-4">
                    <TituloSecao icone={Tag}>Serviços Extras</TituloSecao>

                    {avulsosCompletos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Valor Completo (peça + M.O)
                          </h3>
                          <AjudaInline titulo="Valor Completo (peça + M.O)">
                            A concessionária informa o <strong>valor cheio</strong> deste serviço —
                            já inclui a peça e a mão de obra. Edite com o{' '}
                            <strong>preço total</strong> do orçamento da concessionária. Por isso a
                            peça não aparece separada em Insumos.
                          </AjudaInline>
                        </div>
                        <ListaServicos
                          servicos={avulsosCompletos}
                          dispatch={dispatch}
                          servicosPadrao={servicosPadrao}
                          temOverrides={temOverridesCompletos}
                          onRestaurarTudo={() => restaurarGrupo(avulsosCompletos)}
                          modo="autorizada"
                          montarEstimativa={(s) => montarEstimativaMaoDeObra(perfil, preset, s.id)}
                        />
                      </div>
                    )}

                    {avulsosIncompletos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Valor Incompleto (apenas M.O)
                          </h3>
                          <AjudaInline titulo="Valor Incompleto (apenas M.O)">
                            A concessionária <strong>não informa</strong> o preço deste serviço.
                            Aqui você coloca <strong>apenas a mão de obra</strong> (ou usa a
                            estimativa ~); a peça é precificada à parte, na aba{' '}
                            <strong>Insumos</strong>. Por isso edite só o valor da M.O., não o total
                            com a peça.
                          </AjudaInline>
                        </div>
                        {/* Toggle logo abaixo do título: a estimativa só atinge avulsos sem valor. */}
                        <ControleEstimativaMaoDeObra
                          ligada={estimativaLigada}
                          dispatch={dispatch}
                        />
                        <ListaServicos
                          servicos={avulsosIncompletos}
                          dispatch={dispatch}
                          servicosPadrao={servicosPadrao}
                          temOverrides={temOverridesIncompletos}
                          onRestaurarTudo={() => restaurarGrupo(avulsosIncompletos)}
                          modo="autorizada"
                          montarEstimativa={(s) => montarEstimativaMaoDeObra(perfil, preset, s.id)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="excepcional" className="px-4 pb-4 pt-3">
            <div className="space-y-2">
              <TituloSecao icone={TriangleAlert}>Serviços Excepcionais</TituloSecao>
              {deveAlertarExcepcional && (
                <div className="rounded-lg border px-4 py-2 bg-warning/10 border-warning/30 text-warning text-sm">
                  Atenção: sua moto está próxima ou acima de {limiteExcepcionalFormatado} km.
                  Considere revisar os serviços excepcionais.
                </div>
              )}
              <ListaServicos
                servicos={servicosExcepcionais}
                dispatch={dispatch}
                servicosPadrao={servicosPadrao}
                temOverrides={temOverridesExcepcionais}
                onRestaurarTudo={() => restaurarGrupo(servicosExcepcionais)}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
