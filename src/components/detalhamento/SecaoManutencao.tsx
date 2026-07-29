import { useState } from 'react';
import { Eye, HelpCircle, TriangleAlert } from 'lucide-react';
import type {
  CustoPeca,
  CustoServicoRevisao,
  PendenciaMaoDeObraConcessionaria,
} from '../../types/calculos';
import type { ModoRevisao } from '../../types/perfil';
import {
  montarItensManutencao,
  type ItemManutencaoComposto,
  type StatusItemManutencao,
} from '../../utils/itensManutencao';
import { CategoriaAccordion } from './CategoriaAccordion';
import { Toggle } from './Toggle';
import { BotaoLapisEdicao } from './BotaoLapisEdicao';
import { PopoverDetalhesPeca } from './PopoverDetalhesPeca';
import { PopoverDetalhesRevisao } from './PopoverDetalhesRevisao';
import type { CicloRevisao, ProximaRevisao } from '../../utils/cicloRevisao';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type Props = {
  totalManutencaoComRevisao: number;
  totalRevisao: number;
  eventosRevisaoNoAno: number;
  // Ciclo de revisões da concessionária (marcos + custo de cada), para o popover.
  cicloRevisao: CicloRevisao | null;
  // Revisões previstas na janela de 12 meses (ancorado, informativo no popover).
  proximasRevisoes: ProximaRevisao[];
  modoRevisao: ModoRevisao;
  kmAtual: number;
  kmAnual: number;
  servicosRevisao: [string, CustoServicoRevisao][];
  custoIncompleto: boolean;
  pendenciasMaoDeObra: PendenciaMaoDeObraConcessionaria[];
  pecas: [string, CustoPeca][];
  // Nome de exibição por peça (do preset), para itens só-serviço usarem o nome
  // do componente em vez do nome do serviço (F).
  nomePorPeca: Record<string, string>;
  filtroAtivo: boolean;
  filtroRevisao: boolean;
  filtrosServicosRevisao: Record<string, boolean>;
  filtrosPecas: Record<string, boolean>;
  expandido: boolean;
  onToggleAtivo: () => void;
  onToggleExpandido: () => void;
  onToggleRevisao: () => void;
  onToggleServicoRevisao: (id: string) => void;
  onTogglePeca: (id: string) => void;
  onEditarPeca: (pecaId: string) => void;
  onEditarRevisaoGeral: () => void;
  onEditarServicoRevisao: (servicoId: string) => void;
  pp: (anual: number) => string;
  pct: (valor: number, ativo?: boolean) => string;
};

// Marcador de status do item, visível sem clique (TASK-REF-32.6 — C).
// Cada item tem um único status; `oficial` e `semMaoDeObra` não marcam nada
// (estado esperado). Precedência faltando > estimado > editado já vem resolvida
// no view-model.
function MarcadorStatus({ status }: { status: StatusItemManutencao }) {
  if (status === 'faltando') {
    return (
      <span
        className="font-semibold text-yellow-500"
        title="Falta o valor de mão de obra da concessionária"
      >
        !
      </span>
    );
  }
  if (status === 'estimado') {
    return (
      <span className="text-warning/80" title="Mão de obra estimada (~)">
        ~
      </span>
    );
  }
  return null;
}

export function SecaoManutencao({
  totalManutencaoComRevisao,
  totalRevisao,
  eventosRevisaoNoAno,
  cicloRevisao,
  proximasRevisoes,
  modoRevisao,
  kmAtual,
  kmAnual,
  servicosRevisao,
  custoIncompleto,
  pendenciasMaoDeObra,
  pecas,
  nomePorPeca,
  filtroAtivo,
  filtroRevisao,
  filtrosServicosRevisao,
  filtrosPecas,
  expandido,
  onToggleAtivo,
  onToggleExpandido,
  onToggleRevisao,
  onToggleServicoRevisao,
  onTogglePeca,
  onEditarPeca,
  onEditarRevisaoGeral,
  onEditarServicoRevisao,
  pp,
  pct,
}: Props) {
  const [itemDetalhado, setItemDetalhado] = useState<ItemManutencaoComposto | null>(null);
  const [revisaoAberta, setRevisaoAberta] = useState(false);
  const [ajudaAberta, setAjudaAberta] = useState<CustoPeca['modo'] | null>(null);
  const ehAutorizada = modoRevisao === 'autorizadas';

  // Fusão peça + M.O. em um item por componente (ADR-014). O total continua
  // somando os mapas separados no cálculo; aqui é só a visão.
  const itens = montarItensManutencao(pecas, servicosRevisao, pendenciasMaoDeObra, nomePorPeca);
  const itensVisiveis = itens.filter((item) => item.custoAnual > 0);
  const itensAncorados = itensVisiveis.filter((item) => item.modo === 'ancorado');
  const itensAmortizados = itensVisiveis.filter((item) => item.modo === 'amortizado');
  // Itens ancorados sem troca na janela de 12 meses: somem da lista (custo 0 no
  // período, comportamento correto), mas o usuário os configurou de propósito.
  // Listados no popup "?" dos Ancorados com o km da próxima troca para explicar
  // por que sumiram. `proximaTrocaKm` só existe em itens com peça (não Honda).
  const itensAncoradosOcultos = itens.filter(
    (item) => item.modo === 'ancorado' && item.custoAnual <= 0 && (item.proximaTrocaKm ?? 0) > 0,
  );

  function multiplicadorAmortizado(valor: number): string {
    return `≈${valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}×`;
  }

  // Tempo estimado até a próxima troca, no ritmo de km/ano informado: km que
  // faltam dividido pela rodagem anual, em meses. Usado na tabela de ancorados
  // ocultos para dizer "quando", não só "em qual km".
  function formatarMesesAteTroca(proximaTrocaKm: number): string {
    if (kmAnual <= 0) return '—';
    const meses = Math.round((Math.max(0, proximaTrocaKm - kmAtual) / kmAnual) * 12);
    return `~${meses.toLocaleString('pt-BR')} ${meses === 1 ? 'mês' : 'meses'}`;
  }

  function abrirDetalhes(item: ItemManutencaoComposto) {
    setItemDetalhado(item);
  }

  // A linha-componente controla os dois filtros (peça + serviço) de uma vez.
  // Dispara só os toggles necessários para convergir ambos ao mesmo estado,
  // mesmo que um perfil legado os tenha dessincronizados.
  function itemAtivo(item: ItemManutencaoComposto): boolean {
    const pecaAtiva = item.pecaId ? (filtrosPecas[item.pecaId] ?? true) : true;
    const servicoAtivo = item.servicoId ? (filtrosServicosRevisao[item.servicoId] ?? true) : true;
    return pecaAtiva && servicoAtivo;
  }

  function alternarItem(item: ItemManutencaoComposto) {
    const alvo = !itemAtivo(item);
    if (item.pecaId && (filtrosPecas[item.pecaId] ?? true) !== alvo) {
      onTogglePeca(item.pecaId);
    }
    if (item.servicoId && (filtrosServicosRevisao[item.servicoId] ?? true) !== alvo) {
      onToggleServicoRevisao(item.servicoId);
    }
  }

  function editarItem(item: ItemManutencaoComposto) {
    if (item.pecaId) {
      onEditarPeca(item.pecaId);
    } else if (item.servicoId) {
      onEditarServicoRevisao(item.servicoId);
    }
  }

  function renderizarLinhaItem(item: ItemManutencaoComposto) {
    const ativo = itemAtivo(item);
    const freq =
      item.modo === 'ancorado'
        ? `${item.freq.toLocaleString('pt-BR')}×`
        : multiplicadorAmortizado(item.freq);

    return (
      <div key={item.id} className="flex items-center gap-2">
        <Toggle
          ativo={ativo}
          label={`${ativo ? 'Desativar' : 'Ativar'} ${item.label}`}
          inativoPorPai={!filtroAtivo}
          onClick={() => alternarItem(item)}
        />
        <span
          className={`text-right text-[10px] text-muted-foreground/40 shrink-0 tabular-nums ${item.modo === 'ancorado' ? 'w-5' : 'w-11'}`}
        >
          {freq}
        </span>
        <span className="flex-1 min-w-0 text-muted-foreground/70 text-xs truncate">
          {item.label}
        </span>
        <span className="shrink-0">
          <MarcadorStatus status={item.status} />
        </span>
        {item.status === 'editado' && (
          <span
            className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full shrink-0"
            title="Mão de obra informada por você"
          >
            Edit
          </span>
        )}
        {item.pecaEditada && (
          <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full shrink-0">
            real
          </span>
        )}
        <span
          className={`text-xs font-medium tabular-nums ${ativo ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
        >
          {pp(item.custoAnual)}
        </span>
        <button
          type="button"
          onClick={() => abrirDetalhes(item)}
          aria-label={`Ver detalhes de ${item.label}`}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <BotaoLapisEdicao onClick={() => editarItem(item)} ariaLabel={`Editar ${item.label}`} />
      </div>
    );
  }

  function renderizarGrupoItens(
    titulo: string,
    modo: CustoPeca['modo'],
    itensGrupo: ItemManutencaoComposto[],
  ) {
    if (itensGrupo.length === 0) return null;
    const descricaoCurta =
      modo === 'ancorado' ? 'Projeção real por km informado' : 'Provisão proporcional ao km rodado';

    return (
      <div className="rounded-md border border-border/70 bg-background/25">
        <div className="flex items-center gap-1.5 border-b border-border/70 px-2 py-2">
          <span className="text-[11px] font-medium text-muted-foreground">{titulo}</span>
          <span className="text-[10px] text-muted-foreground/40">({itensGrupo.length})</span>
          <button
            type="button"
            onClick={() => setAjudaAberta(modo)}
            aria-label={`Entender ${titulo}`}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/45 transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span className="ml-auto text-[10px] text-muted-foreground/35">{descricaoCurta}</span>
        </div>
        <div className="space-y-2 px-2 py-2">{itensGrupo.map(renderizarLinhaItem)}</div>
      </div>
    );
  }

  return (
    <>
      <CategoriaAccordion
        label={custoIncompleto ? 'Manutenção (parcial)' : 'Manutenção'}
        categoriaId="manutencao"
        corClasse="bg-amber-400"
        valorExibido={pp(totalManutencaoComRevisao)}
        porcentagem={pct(totalManutencaoComRevisao, filtroAtivo)}
        ativo={filtroAtivo}
        expandido={expandido}
        onToggleAtivo={onToggleAtivo}
        onToggleExpandido={onToggleExpandido}
      >
        <div className="space-y-2.5">
          {custoIncompleto && (
            <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-warning">
              <div className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Custo parcial de manutenção</p>
                  <p className="text-xs leading-relaxed">
                    Falta valor de mão de obra da concessionária para{' '}
                    {pendenciasMaoDeObra.map((p) => p.label).join(', ')}. Informe na aba M. Obra ou
                    ative a estimativa.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Toggle
              ativo={filtroRevisao}
              label={`${filtroRevisao ? 'Desativar' : 'Ativar'} Revisão Geral`}
              inativoPorPai={!filtroAtivo}
              onClick={onToggleRevisao}
            />
            <span className="w-5 text-right text-[10px] text-muted-foreground/40 shrink-0 tabular-nums">
              {Math.ceil(eventosRevisaoNoAno)}×
            </span>
            <span className="flex-1 text-muted-foreground/70 text-xs truncate">
              Revisão Geral
              <span className="ml-1 text-[10px] text-muted-foreground/40">(concessionária)</span>
            </span>
            <span
              className={`text-xs font-medium tabular-nums ${filtroRevisao ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
            >
              {pp(totalRevisao)}
            </span>
            <button
              type="button"
              onClick={() => setRevisaoAberta(true)}
              aria-label="Ver detalhes da Revisão Geral"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {ehAutorizada && (
              <BotaoLapisEdicao
                onClick={onEditarRevisaoGeral}
                ariaLabel="Editar Revisão Geral concessionária"
              />
            )}
          </div>
          {renderizarGrupoItens('Ancorados', 'ancorado', itensAncorados)}
          {renderizarGrupoItens('Amortizados', 'amortizado', itensAmortizados)}
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 pt-1 text-[10px] text-muted-foreground/70">
            <span>
              <span className="font-semibold text-yellow-500">!</span> falta a mão de obra da
              concessionária
            </span>
            <span>
              <span className="text-warning/80">~</span> mão de obra estimada
            </span>
            <span>
              <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] text-primary">
                Edit
              </span>{' '}
              mão de obra informada por você
            </span>
          </div>
        </div>
      </CategoriaAccordion>

      <PopoverDetalhesPeca
        item={itemDetalhado}
        aberto={itemDetalhado !== null}
        kmAtual={kmAtual}
        kmAnual={kmAnual}
        onOpenChange={(aberto) => !aberto && setItemDetalhado(null)}
      />

      <PopoverDetalhesRevisao
        aberto={revisaoAberta}
        ciclo={cicloRevisao}
        kmAnual={kmAnual}
        totalRevisao={totalRevisao}
        proximasRevisoes={proximasRevisoes}
        onOpenChange={setRevisaoAberta}
      />

      <Dialog
        open={ajudaAberta !== null}
        onOpenChange={(aberto) => !aberto && setAjudaAberta(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {ajudaAberta === 'ancorado' ? 'Custos ancorados' : 'Custos amortizados'}
            </DialogTitle>
            <DialogDescription>
              {ajudaAberta === 'ancorado'
                ? 'Usam o km da última manutenção para prever trocas reais nos próximos 12 meses.'
                : 'Usam uma fração proporcional ao km rodado, sem prever uma data ou quilometragem exata.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            {ajudaAberta === 'ancorado' ? (
              <>
                <p>
                  Quando você informa o km da última troca em Ajustes, o app sabe onde a peça está
                  no ciclo. Por isso consegue contar eventos reais na janela de 12 meses.
                </p>
                {itensAncoradosOcultos.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-foreground">
                      Próximas trocas fora do período (12 meses)
                    </p>
                    <p className="text-xs">
                      No seu ritmo de ~{kmAnual.toLocaleString('pt-BR')} km/ano, as próximas trocas
                      caem assim:
                    </p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/60 text-left text-muted-foreground/60">
                          <th className="py-1 font-medium">Peça</th>
                          <th className="py-1 text-right font-medium">Próxima troca</th>
                          <th className="py-1 pl-2 text-right font-medium">Faltam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itensAncoradosOcultos.map((item) => (
                          <tr key={item.id} className="border-b border-border/30 last:border-0">
                            <td className="py-1 pr-2">{item.label}</td>
                            <td className="py-1 text-right tabular-nums">
                              {(item.proximaTrocaKm ?? 0).toLocaleString('pt-BR')} km
                            </td>
                            <td className="py-1 pl-2 text-right tabular-nums whitespace-nowrap">
                              {formatarMesesAteTroca(item.proximaTrocaKm ?? 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                <p>
                  Sem km da última manutenção, o app não sabe se a peça está perto ou longe da
                  troca. Então ele provisiona o custo proporcionalmente: km anual dividido pelo
                  intervalo, multiplicado pelo preço.
                </p>
                <p className="rounded-md bg-muted/30 p-3 text-xs">
                  Exemplo: 18.200 km/ano e intervalo de 12.000 km geram ≈1,52x do preço no custo
                  anual. Isso é provisão, não uma promessa de troca real.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
