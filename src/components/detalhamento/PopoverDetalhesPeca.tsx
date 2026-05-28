import type { CustoPeca, CustoServicoRevisao } from '../../types/calculos';
import { kmFormatado, moeda } from '../../utils/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type ItemDetalheManutencao = CustoPeca | CustoServicoRevisao;

type Props = {
  item: ItemDetalheManutencao | null;
  aberto: boolean;
  kmAtual: number;
  kmAnual: number;
  onOpenChange: (aberto: boolean) => void;
};

function numeroDecimal(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function intervaloFormatado(item: ItemDetalheManutencao): string {
  const intervaloKm = resolverIntervaloKm(item);
  if (intervaloKm > 0) {
    return kmFormatado(intervaloKm);
  }
  if ('intervaloMeses' in item && item.intervaloMeses) {
    return `${item.intervaloMeses} meses`;
  }
  return '-';
}

function kmOuVazio(valor: number): string {
  return valor > 0 ? kmFormatado(valor) : 'Nao informada';
}

function eventosNoAno(item: ItemDetalheManutencao): number {
  return 'trocasNoAno' in item ? item.trocasNoAno : item.eventosNoAno;
}

function resolverIntervaloKm(item: ItemDetalheManutencao): number {
  return 'intervaloKm' in item ? item.intervaloKm : item.intervalKm;
}

function precoUnitario(item: ItemDetalheManutencao): number {
  return 'preco' in item ? item.preco : item.precoServico;
}

function intervaloMeses(item: ItemDetalheManutencao): number | undefined {
  return 'intervaloMeses' in item ? item.intervaloMeses : undefined;
}

export function PopoverDetalhesPeca({ item, aberto, kmAtual, kmAnual, onOpenChange }: Props) {
  const ehAncorada = item?.modo === 'ancorado';
  const quantidadeEventos = item ? eventosNoAno(item) : 0;
  const intervaloKm = item ? resolverIntervaloKm(item) : 0;

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{item?.label ?? 'Detalhes do item'}</DialogTitle>
          <DialogDescription>
            {ehAncorada
              ? 'Projeção real baseada no km da última manutenção informado em Ajustes.'
              : 'Provisão proporcional ao km rodado, sem previsão de evento real.'}
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="label-neutro">Item</p>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2 font-medium">Intervalo</th>
                      <th className="px-2 py-2 font-medium">Ultima manutenção</th>
                      <th className="px-2 py-2 font-medium">Trocas-ano</th>
                      <th className="px-2 py-2 font-medium text-right">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-2 py-2 tabular-nums">{intervaloFormatado(item)}</td>
                      <td className="px-2 py-2 tabular-nums">{kmOuVazio(item.kmUltimaTroca)}</td>
                      <td className="px-2 py-2 tabular-nums">
                        {ehAncorada
                          ? `${quantidadeEventos.toLocaleString('pt-BR')} real${quantidadeEventos === 1 ? '' : 's'}`
                          : `≈${numeroDecimal(quantidadeEventos)}`}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {moeda(item.custoAnual)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {ehAncorada ? (
              <div className="space-y-2">
                <p className="label-neutro">Manutenções previstas</p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full min-w-[320px] text-left text-xs">
                    <thead className="bg-muted/30 text-muted-foreground">
                      <tr>
                        <th className="px-2 py-2 font-medium">Ordem</th>
                        <th className="px-2 py-2 font-medium">Quilometragem</th>
                        <th className="px-2 py-2 font-medium text-right">Custo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.kmDasProximasTrocas.length > 0 ? (
                        item.kmDasProximasTrocas.map((km, index) => (
                          <tr key={km} className="border-t border-border">
                            <td className="px-2 py-2">{index + 1}o</td>
                            <td className="px-2 py-2 tabular-nums">{kmFormatado(km)}</td>
                            <td className="px-2 py-2 text-right tabular-nums">
                              {moeda(precoUnitario(item))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t border-border">
                          <td className="px-2 py-3 text-muted-foreground" colSpan={3}>
                            Nenhuma troca prevista entre {kmFormatado(kmAtual)} e{' '}
                            {kmFormatado(kmAtual + kmAnual)}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="label-neutro">Provisão no período</p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full min-w-[420px] text-left text-xs">
                    <thead className="bg-muted/30 text-muted-foreground">
                      <tr>
                        <th className="px-2 py-2 font-medium">Km no período</th>
                        <th className="px-2 py-2 font-medium">Cálculo</th>
                        <th className="px-2 py-2 font-medium text-right">Custo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="px-2 py-2 tabular-nums">{kmFormatado(kmAnual)}</td>
                        <td className="px-2 py-2 font-mono text-[11px]">
                          {intervaloKm > 0
                            ? `${kmAnual.toLocaleString('pt-BR')} / ${intervaloKm.toLocaleString('pt-BR')} = ≈${numeroDecimal(quantidadeEventos)}x`
                            : `12 / ${intervaloMeses(item) ?? 1} = ≈${numeroDecimal(quantidadeEventos)}x`}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {moeda(item.custoAnual)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground/70">
                  Este item não tem uma última manutenção usada como âncora. O app distribui uma
                  fração do preço pelo km anual estimado, sem afirmar que a troca acontecerá em uma
                  quilometragem específica.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
