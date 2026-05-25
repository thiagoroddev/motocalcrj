import type { CustoPeca, CustoServicoRevisao } from '../../types/calculos';
import type { ModoRevisao } from '../../types/perfil';
import { CategoriaAccordion } from './CategoriaAccordion';
import { Toggle } from './Toggle';
import { BotaoLapisEdicao } from './BotaoLapisEdicao';

type Props = {
  totalManutencaoComRevisao: number;
  totalRevisao: number;
  eventosRevisaoNoAno: number;
  modoRevisao: ModoRevisao;
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
  const ehAutorizada = modoRevisao === 'autorizadas';

  return (
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
        {servicosRevisao.map(([id, servico]) => {
          const ativo = filtrosServicosRevisao[id] ?? true;
          const freq = Math.ceil(servico.eventosNoAno);
          return (
            <div key={id} className="flex items-center gap-2">
              <Toggle ativo={ativo} onClick={() => onToggleServicoRevisao(id)} />
              <span className="w-5 text-right text-[10px] text-muted-foreground/40 shrink-0 tabular-nums">
                {freq}×
              </span>
              <span className="flex-1 text-muted-foreground/70 text-xs truncate">
                {servico.label}
              </span>
              <span
                className={`text-xs font-medium tabular-nums ${ativo ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
              >
                {pp(servico.custoAnual)}
              </span>
              <BotaoLapisEdicao
                onClick={() => onEditarServicoRevisao(id)}
                ariaLabel={`Editar ${servico.label}`}
              />
            </div>
          );
        })}
        {pecas.map(([id, peca]) => {
          const ativa = filtrosPecas[id] ?? true;
          const freq = Math.ceil(peca.trocasNoAno);
          return (
            <div key={id} className="flex items-center gap-2">
              <Toggle ativo={ativa} onClick={() => onTogglePeca(id)} />
              <span className="w-5 text-right text-[10px] text-muted-foreground/40 shrink-0 tabular-nums">
                {freq}×
              </span>
              <span className="flex-1 text-muted-foreground/70 text-xs truncate">{peca.label}</span>
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
              <BotaoLapisEdicao
                onClick={() => onEditarPeca(id)}
                ariaLabel={`Editar ${peca.label}`}
              />
            </div>
          );
        })}
      </div>
    </CategoriaAccordion>
  );
}
