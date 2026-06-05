import type { CicloRevisao, ProximaRevisao } from '../../utils/cicloRevisao';
import { kmFormatado, moeda } from '../../utils/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type Props = {
  aberto: boolean;
  ciclo: CicloRevisao | null;
  kmAnual: number;
  // Custo anual amortizado da Revisão Geral (= base do pacote no cálculo).
  totalRevisao: number;
  // Revisões previstas na janela de 12 meses (ancorado, informativo).
  proximasRevisoes: ProximaRevisao[];
  onOpenChange: (aberto: boolean) => void;
};

export function PopoverDetalhesRevisao({
  aberto,
  ciclo,
  kmAnual,
  totalRevisao,
  proximasRevisoes,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Revisão Geral</DialogTitle>
          <DialogDescription>
            Pacote da concessionária. Cada revisão do ciclo tem um custo próprio; o app soma o ciclo
            e provisiona a fração proporcional ao km rodado no ano.
          </DialogDescription>
        </DialogHeader>

        {ciclo && ciclo.revisoes.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="label-neutro">Revisões do ciclo</p>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2 font-medium">Revisão</th>
                      <th className="px-2 py-2 font-medium">Quilometragem</th>
                      <th className="px-2 py-2 font-medium text-right">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ciclo.revisoes.map((r) => (
                      <tr key={r.ordem} className="border-t border-border">
                        <td className="px-2 py-2 tabular-nums">{r.ordem}ª</td>
                        <td className="px-2 py-2 tabular-nums">{kmFormatado(r.intervaloKm)}</td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {moeda(r.precoTotal)}
                          {r.editado && (
                            <span className="ml-1 text-[9px] text-primary">editado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-border bg-muted/20 font-medium">
                      <td className="px-2 py-2" colSpan={2}>
                        Ciclo completo ({kmFormatado(ciclo.kmCiclo)})
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {moeda(ciclo.custoCicloCompleto)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <p className="label-neutro">Provisão no período</p>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2 font-medium">Km no período</th>
                      <th className="px-2 py-2 font-medium">Cálculo</th>
                      <th className="px-2 py-2 font-medium text-right">Custo anual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-2 py-2 tabular-nums">{kmFormatado(kmAnual)}</td>
                      <td className="px-2 py-2 font-mono text-[11px]">
                        {moeda(ciclo.custoCicloCompleto)} ÷ {kmFormatado(ciclo.kmCiclo)} ×{' '}
                        {kmFormatado(kmAnual)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{moeda(totalRevisao)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground/70">
                A Revisão Geral é provisionada: somamos o custo do ciclo completo e distribuímos a
                fração correspondente ao km que você roda por ano — sem afirmar em qual
                quilometragem exata cada revisão vai cair.
              </p>
            </div>

            <div className="space-y-2">
              <p className="label-neutro">Próximas revisões ({kmFormatado(kmAnual)})</p>
              {proximasRevisoes.length > 0 ? (
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full min-w-[420px] text-left text-xs">
                    <thead className="bg-muted/30 text-muted-foreground">
                      <tr>
                        <th className="px-2 py-2 font-medium">Ordem</th>
                        <th className="px-2 py-2 font-medium">Quilometragem</th>
                        <th className="px-2 py-2 font-medium text-right">Custo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proximasRevisoes.map((r, index) => (
                        <tr key={r.km} className="border-t border-border">
                          <td className="px-2 py-2">{index + 1}ª</td>
                          <td className="px-2 py-2 tabular-nums">{kmFormatado(r.km)}</td>
                          <td className="px-2 py-2 text-right tabular-nums">
                            {moeda(r.precoTotal)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-border bg-muted/20 font-medium">
                        <td className="px-2 py-2" colSpan={2}>
                          Total previsto na janela
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {moeda(proximasRevisoes.reduce((soma, r) => soma + r.precoTotal, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/70">
                  Nenhuma revisão prevista nos próximos {kmFormatado(kmAnual)}.
                </p>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground/70">
                Informativo: as revisões previstas a partir da sua última revisão informada (ou do
                km atual, se não houver). O <strong>custo anual acima segue amortizado</strong> —
                esta lista não substitui o valor provisionado, só mostra o que vem por aí.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/70">
            Sem cronograma de revisões da concessionária para este modelo.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
