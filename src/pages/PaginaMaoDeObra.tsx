import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import { useLocation } from 'react-router-dom';
import { Store, Wrench, TriangleAlert, Tag } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TituloSecao } from '@/components/TituloSecao';
import { DialogConfirmacao } from '@/components/DialogConfirmacao';
import { CardServico } from '@/components/mao-de-obra/CardServico';
import { LinhaRevisaoHonda } from '@/components/mao-de-obra/LinhaRevisaoHonda';
import { usePerfil } from '../hooks/usePerfil';
import { SERVICOS_INDEPENDENTES_PADRAO } from '../context/PerfilContext';
import { obterPreset } from '../data/repositorioPresets';
import type { ServicoIndependente, PerfilAction } from '../types/perfil';

type LocationStateMaoDeObra = {
  abaInicial?: 'honda' | 'independente' | 'excepcional';
  destaqueIndex?: number;
};

const DURACAO_DESTAQUE_MS = 2000;

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
  temOverrides: boolean;
  onRestaurarTudo: () => void;
  modo?: 'independente' | 'autorizada';
}

function ListaServicos({
  servicos,
  dispatch,
  temOverrides,
  onRestaurarTudo,
  modo = 'independente',
}: PropsListaServicos) {
  return (
    <div className="space-y-2">
      {servicos.map((s) => (
        <CardServico key={s.id} servico={s} dispatch={dispatch} modo={modo} />
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
  const modoAtivo = perfil.perfilManutencao.modoRevisao;

  const abaInicial =
    navState?.abaInicial ?? (modoAtivo === 'autorizadas' ? 'honda' : 'independente');
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

  const servicosNormais = perfil.servicosIndependentes.filter((s) => !s.ehExcepcional);
  const servicosExcepcionais = perfil.servicosIndependentes.filter((s) => s.ehExcepcional);
  // Aba Honda: serviços avulsos fora das revisões (ADR-007) - só os que a
  // concessionária cobra à parte, com precoTotalAutorizada > 0 no preset.
  const servicosAvulsosAutorizada = servicosNormais.filter(
    (s) => !s.incluidoNaRevisaoAutorizada && (s.precoTotalAutorizada > 0 || ehAvulsoEditado(s)),
  );
  const menorIntervaloExcepcional = servicosExcepcionais.reduce<number | null>(
    (menor, servico) => (menor === null ? servico.intervalKm : Math.min(menor, servico.intervalKm)),
    null,
  );
  const deveAlertarExcepcional =
    menorIntervaloExcepcional !== null && perfil.moto.kmAtual >= menorIntervaloExcepcional;
  const limiteExcepcionalFormatado = menorIntervaloExcepcional?.toLocaleString('pt-BR') ?? '0';

  const temOverridesHonda = perfil.revisaoAutorizadaOverrides.length > 0;

  function ehAvulsoEditado(s: ServicoIndependente): boolean {
    const p = SERVICOS_INDEPENDENTES_PADRAO.find((ps) => ps.id === s.id);
    return (
      !!p && !p.incluidoNaRevisaoAutorizada && s.precoTotalAutorizada !== p.precoTotalAutorizada
    );
  }

  function servicoDifereDopadraoIndependente(s: ServicoIndependente): boolean {
    const p = SERVICOS_INDEPENDENTES_PADRAO.find((ps) => ps.id === s.id);
    if (!p) return false;
    return s.precoIndependente !== p.precoIndependente || s.intervalKm !== p.intervalKm;
  }

  function servicoDifereDopadraoAutorizada(s: ServicoIndependente): boolean {
    const p = SERVICOS_INDEPENDENTES_PADRAO.find((ps) => ps.id === s.id);
    if (!p) return false;
    return s.precoTotalAutorizada !== p.precoTotalAutorizada || s.intervalKm !== p.intervalKm;
  }

  const temOverridesNormais = servicosNormais.some(servicoDifereDopadraoIndependente);
  const temOverridesExcepcionais = servicosExcepcionais.some(servicoDifereDopadraoIndependente);
  const temOverridesAvulsosAutorizada = servicosAvulsosAutorizada.some(
    servicoDifereDopadraoAutorizada,
  );

  function restaurarGrupo(servicos: ServicoIndependente[]) {
    servicos.forEach((s) => {
      const padrao = SERVICOS_INDEPENDENTES_PADRAO.find((p) => p.id === s.id);
      if (padrao) dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...padrao } });
    });
  }

  function restaurarHonda() {
    perfil.revisaoAutorizadaOverrides.forEach((o) => {
      dispatch({ type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE', index: o.index });
    });
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue={abaInicial} className="flex flex-col flex-1">
        <TabsList className="grid grid-cols-3 mx-4 mt-4 shrink-0">
          <TabsTrigger value="honda">{modoAtivo === 'autorizadas' ? '● ' : ''}Honda</TabsTrigger>
          <TabsTrigger value="independente">
            {modoAtivo === 'independentes' ? '● ' : ''}Independente
          </TabsTrigger>
          <TabsTrigger value="excepcional">Excepcional</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="honda" className="px-4 pb-4 pt-3">
            {!preset ? (
              <p className="text-muted-foreground text-sm">
                Preset não encontrado para este modelo.
              </p>
            ) : (
              <div className="space-y-2">
                <TituloSecao icone={Store}>Mão de Obra - Oficina Autorizada</TituloSecao>
                {preset.revisaoAutorizada.map((revisao, idx) => {
                  const override = perfil.revisaoAutorizadaOverrides.find((o) => o.index === idx);
                  const ehDestacado = indiceDestacado === idx;
                  return (
                    <LinhaRevisaoHonda
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
                {temOverridesHonda && <BotaoRestaurarTudo onRestaurar={restaurarHonda} />}

                {servicosAvulsosAutorizada.length > 0 && (
                  <div className="space-y-2 pt-4">
                    <TituloSecao icone={Tag}>Serviços avulsos</TituloSecao>
                    <ListaServicos
                      servicos={servicosAvulsosAutorizada}
                      dispatch={dispatch}
                      temOverrides={temOverridesAvulsosAutorizada}
                      onRestaurarTudo={() => restaurarGrupo(servicosAvulsosAutorizada)}
                      modo="autorizada"
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="independente" className="px-4 pb-4 pt-3">
            <div className="space-y-2">
              <TituloSecao icone={Wrench}>Mão de Obra - Oficina Independente</TituloSecao>
              <ListaServicos
                servicos={servicosNormais}
                dispatch={dispatch}
                temOverrides={temOverridesNormais}
                onRestaurarTudo={() => restaurarGrupo(servicosNormais)}
              />
            </div>
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
