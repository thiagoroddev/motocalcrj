import type { CustoPeca } from '../../types/calculos';
import type { ModoRevisao } from '../../types/perfil';
import { CategoriaAccordion } from './CategoriaAccordion';
import { Toggle } from './Toggle';

type Props = {
  totalManutencaoComRevisao: number;
  totalRevisao: number;
  modoRevisao: ModoRevisao;
  pecas: [string, CustoPeca][];
  filtroAtivo: boolean;
  filtroRevisao: boolean;
  filtrosPecas: Record<string, boolean>;
  kmAnual: number;
  expandido: boolean;
  onToggleAtivo: () => void;
  onToggleExpandido: () => void;
  onToggleRevisao: () => void;
  onTogglePeca: (id: string) => void;
  pp: (anual: number) => string;
  pct: (valor: number) => string;
};

export function SecaoManutencao({
  totalManutencaoComRevisao,
  totalRevisao,
  modoRevisao,
  pecas,
  filtroAtivo,
  filtroRevisao,
  filtrosPecas,
  kmAnual,
  expandido,
  onToggleAtivo,
  onToggleExpandido,
  onToggleRevisao,
  onTogglePeca,
  pp,
  pct,
}: Props) {
  return (
    <CategoriaAccordion
      label="Manutenção"
      corClasse="bg-amber-400"
      valorExibido={pp(totalManutencaoComRevisao)}
      porcentagem={pct(totalManutencaoComRevisao)}
      ativo={filtroAtivo}
      expandido={expandido}
      onToggleAtivo={onToggleAtivo}
      onToggleExpandido={onToggleExpandido}
    >
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Toggle ativo={filtroRevisao} onClick={onToggleRevisao} />
          <span className="flex-1 text-muted-foreground/70 text-xs truncate">
            Revisão Geral
            <span className="ml-1 text-[10px] text-muted-foreground/40">
              ({modoRevisao === 'autorizadas' ? 'autorizada' : 'independente'})
            </span>
          </span>
          <span
            className={`text-xs font-medium tabular-nums ${filtroRevisao ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
          >
            {pp(totalRevisao)}
          </span>
        </div>
        {pecas.map(([id, peca]) => {
          const ativa = filtrosPecas[id] ?? true;
          const freq = Math.ceil(kmAnual / peca.intervaloKm);
          return (
            <div key={id} className="flex items-center gap-2">
              <Toggle ativo={ativa} onClick={() => onTogglePeca(id)} />
              <span className="w-5 text-right text-[10px] text-muted-foreground/40 flex-shrink-0 tabular-nums">
                {freq}×
              </span>
              <span className="flex-1 text-muted-foreground/70 text-xs truncate">{peca.label}</span>
              {peca.fonte === 'registro' && (
                <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full flex-shrink-0">
                  real
                </span>
              )}
              <span
                className={`text-xs font-medium tabular-nums ${ativa ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}
              >
                {pp(peca.custoAnual)}
              </span>
            </div>
          );
        })}
      </div>
    </CategoriaAccordion>
  );
}
