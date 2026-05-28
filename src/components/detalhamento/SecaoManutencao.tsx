import { useState } from 'react';
import { Eye, HelpCircle } from 'lucide-react';
import type { CustoPeca, CustoServicoRevisao } from '../../types/calculos';
import type { ModoRevisao } from '../../types/perfil';
import { CategoriaAccordion } from './CategoriaAccordion';
import { Toggle } from './Toggle';
import { BotaoLapisEdicao } from './BotaoLapisEdicao';
import { PopoverDetalhesPeca } from './PopoverDetalhesPeca';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type ItemDetalheManutencao = CustoPeca | CustoServicoRevisao;

type Props = {
  totalManutencaoComRevisao: number;
  totalRevisao: number;
  eventosRevisaoNoAno: number;
  modoRevisao: ModoRevisao;
  kmAtual: number;
  kmAnual: number;
  servicosRevisao: [string, CustoServicoRevisao][];
  pecas: [string, CustoPeca][];
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

export function SecaoManutencao({
  totalManutencaoComRevisao,
  totalRevisao,
  eventosRevisaoNoAno,
  modoRevisao,
  kmAtual,
  kmAnual,
  servicosRevisao,
  pecas,
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
  const [itemDetalhado, setItemDetalhado] = useState<ItemDetalheManutencao | null>(null);
  const [ajudaAberta, setAjudaAberta] = useState<CustoPeca['modo'] | null>(null);
  const ehAutorizada = modoRevisao === 'autorizadas';
  const servicosVisiveis = servicosRevisao.filter(([, servico]) => servico.custoAnual > 0);
  const pecasVisiveis = pecas.filter(([, peca]) => peca.custoAnual > 0);
  const servicosAncorados = servicosVisiveis.filter(([, servico]) => servico.modo === 'ancorado');
  const servicosAmortizados = servicosVisiveis.filter(
    ([, servico]) => servico.modo === 'amortizado',
  );
  const pecasAncoradas = pecasVisiveis.filter(([, peca]) => peca.modo === 'ancorado');
  const pecasAmortizadas = pecasVisiveis.filter(([, peca]) => peca.modo === 'amortizado');

  function multiplicadorAmortizado(valor: number): string {
    return `≈${valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}×`;
  }

  function abrirDetalhes(item: ItemDetalheManutencao) {
    setItemDetalhado(item);
  }

  function renderizarLinhaPeca(id: string, peca: CustoPeca) {
    const ativa = filtrosPecas[id] ?? true;
    const freq =
      peca.modo === 'ancorado'
        ? `${peca.trocasNoAno.toLocaleString('pt-BR')}×`
        : multiplicadorAmortizado(peca.trocasNoAno);

    return (
      <div key={id} className="flex items-center gap-2">
        <Toggle ativo={ativa} onClick={() => onTogglePeca(id)} />
        <span
          className={`text-right text-[10px] text-muted-foreground/40 shrink-0 tabular-nums ${peca.modo === 'ancorado' ? 'w-5' : 'w-11'}`}
        >
          {freq}
        </span>
        <span className="flex-1 min-w-0 text-muted-foreground/70 text-xs truncate">
          {peca.label}
        </span>
        {peca.fonte === 'registro' && (
          <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full shrink-0">
            real
          </span>
        )}
        <span
          className={`text-xs font-medium tabular-nums ${ativa ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
        >
          {pp(peca.custoAnual)}
        </span>
        <button
          type="button"
          onClick={() => abrirDetalhes(peca)}
          aria-label={`Ver detalhes de ${peca.label}`}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <BotaoLapisEdicao onClick={() => onEditarPeca(id)} ariaLabel={`Editar ${peca.label}`} />
      </div>
    );
  }

  function renderizarLinhaServico(id: string, servico: CustoServicoRevisao) {
    const ativo = filtrosServicosRevisao[id] ?? true;
    const freq =
      servico.modo === 'ancorado'
        ? `${servico.eventosNoAno.toLocaleString('pt-BR')}×`
        : multiplicadorAmortizado(servico.eventosNoAno);

    return (
      <div key={id} className="flex items-center gap-2">
        <Toggle ativo={ativo} onClick={() => onToggleServicoRevisao(id)} />
        <span
          className={`text-right text-[10px] text-muted-foreground/40 shrink-0 tabular-nums ${servico.modo === 'ancorado' ? 'w-5' : 'w-11'}`}
        >
          {freq}
        </span>
        <span className="flex-1 min-w-0 text-muted-foreground/70 text-xs truncate">
          {servico.label}
        </span>
        <span
          className={`text-xs font-medium tabular-nums ${ativo ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
        >
          {pp(servico.custoAnual)}
        </span>
        <button
          type="button"
          onClick={() => abrirDetalhes(servico)}
          aria-label={`Ver detalhes de ${servico.label}`}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <BotaoLapisEdicao
          onClick={() => onEditarServicoRevisao(id)}
          ariaLabel={`Editar ${servico.label}`}
        />
      </div>
    );
  }

  function renderizarGrupoItens(
    titulo: string,
    modo: CustoPeca['modo'],
    itensPecas: [string, CustoPeca][],
    itensServicos: [string, CustoServicoRevisao][],
  ) {
    const totalItens = itensPecas.length + itensServicos.length;
    if (totalItens === 0) return null;
    const descricaoCurta =
      modo === 'ancorado' ? 'Projeção real por km informado' : 'Provisão proporcional ao km rodado';

    return (
      <div className="rounded-md border border-border/70 bg-background/25">
        <div className="flex items-center gap-1.5 border-b border-border/70 px-2 py-2">
          <span className="text-[11px] font-medium text-muted-foreground">{titulo}</span>
          <span className="text-[10px] text-muted-foreground/40">({totalItens})</span>
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
        <div className="space-y-2 px-2 py-2">
          {itensServicos.map(([id, servico]) => renderizarLinhaServico(id, servico))}
          {itensPecas.map(([id, peca]) => renderizarLinhaPeca(id, peca))}
        </div>
      </div>
    );
  }

  return (
    <>
      <CategoriaAccordion
        label="Manutenção"
        corClasse="bg-amber-400"
        valorExibido={pp(totalManutencaoComRevisao)}
        porcentagem={pct(totalManutencaoComRevisao, filtroAtivo)}
        ativo={filtroAtivo}
        expandido={expandido}
        onToggleAtivo={onToggleAtivo}
        onToggleExpandido={onToggleExpandido}
      >
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Toggle ativo={filtroRevisao} onClick={onToggleRevisao} />
            <span className="w-5 text-right text-[10px] text-muted-foreground/40 shrink-0 tabular-nums">
              {Math.ceil(eventosRevisaoNoAno)}×
            </span>
            <span className="flex-1 text-muted-foreground/70 text-xs truncate">
              Revisão Geral
              <span className="ml-1 text-[10px] text-muted-foreground/40">
                ({ehAutorizada ? 'autorizada' : 'independente'})
              </span>
            </span>
            <span
              className={`text-xs font-medium tabular-nums ${filtroRevisao ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
            >
              {pp(totalRevisao)}
            </span>
            {ehAutorizada && (
              <BotaoLapisEdicao
                onClick={onEditarRevisaoGeral}
                ariaLabel="Editar Revisão Geral autorizada"
              />
            )}
          </div>
          {renderizarGrupoItens('Ancorados', 'ancorado', pecasAncoradas, servicosAncorados)}
          {renderizarGrupoItens('Amortizados', 'amortizado', pecasAmortizadas, servicosAmortizados)}
        </div>
      </CategoriaAccordion>

      <PopoverDetalhesPeca
        item={itemDetalhado}
        aberto={itemDetalhado !== null}
        kmAtual={kmAtual}
        kmAnual={kmAnual}
        onOpenChange={(aberto) => !aberto && setItemDetalhado(null)}
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
                <p className="rounded-md bg-muted/30 p-3 text-xs">
                  Exemplo: última troca em 60.000 km, intervalo de 16.000 km e janela até 108.200
                  km. As próximas trocas caem em 76.000, 92.000 e 108.000 km.
                </p>
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
