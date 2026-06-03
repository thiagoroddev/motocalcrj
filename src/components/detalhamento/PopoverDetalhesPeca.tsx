import type { ItemManutencaoComposto } from '../../utils/itensManutencao';
import { kmFormatado, moeda } from '../../utils/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type Props = {
  item: ItemManutencaoComposto | null;
  aberto: boolean;
  kmAtual: number;
  kmAnual: number;
  onOpenChange: (aberto: boolean) => void;
};

interface ParteComposicao {
  chave: string;
  rotulo: string;
  custoPorTroca: number;
}

function numeroDecimal(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function rotuloMaoDeObra(item: ItemManutencaoComposto): string {
  if (item.status === 'estimado') return 'Mão de obra (estimada ~)';
  if (item.status === 'editado') return 'Mão de obra (informada por você)';
  // Oficial sem peça avulsa = total Honda (peça embutida no preço).
  return item.peca ? 'Mão de obra (concessionária)' : 'Concessionária (peça + M.O.)';
}

// As partes que compõem UMA troca do componente: peça (Insumos) e/ou M.O.
// (serviço). É a fonte da soma "peça + M.O." que o popover detalha.
function montarComposicao(item: ItemManutencaoComposto): ParteComposicao[] {
  const partes: ParteComposicao[] = [];
  if (item.peca) {
    partes.push({ chave: 'peca', rotulo: 'Peça', custoPorTroca: item.peca.preco });
  }
  if (item.servico) {
    partes.push({
      chave: 'mo',
      rotulo: rotuloMaoDeObra(item),
      custoPorTroca: item.servico.precoServico,
    });
  }
  return partes;
}

export function PopoverDetalhesPeca({ item, aberto, kmAtual, kmAnual, onOpenChange }: Props) {
  const ehAncorada = item?.modo === 'ancorado';
  const base = item?.peca ?? item?.servico ?? null;
  const intervaloKm = item?.peca?.intervaloKm ?? item?.servico?.intervalKm ?? 0;
  const intervaloMeses = item?.peca?.intervaloMeses;
  const kmUltimaTroca = base?.kmUltimaTroca ?? 0;
  const kmDasProximasTrocas = base?.kmDasProximasTrocas ?? [];
  const quantidadeEventos = item?.freq ?? 0;

  const composicao = item ? montarComposicao(item) : [];
  // Custo de uma troca completa = soma das partes (peça + M.O.). É o valor que
  // se repete a cada evento e é amortizado/projetado abaixo.
  const custoPorTroca = composicao.reduce((soma, parte) => soma + parte.custoPorTroca, 0);

  const intervaloLabel =
    intervaloKm > 0 ? kmFormatado(intervaloKm) : intervaloMeses ? `${intervaloMeses} meses` : '-';
  const formulaEventos =
    intervaloKm > 0
      ? `${kmAnual.toLocaleString('pt-BR')} / ${intervaloKm.toLocaleString('pt-BR')} = ≈${numeroDecimal(quantidadeEventos)}x`
      : `12 / ${intervaloMeses ?? 1} = ≈${numeroDecimal(quantidadeEventos)}x`;

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
                      <th className="px-2 py-2 font-medium text-right">Custo anual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-2 py-2 tabular-nums">{intervaloLabel}</td>
                      <td className="px-2 py-2 tabular-nums">
                        {kmUltimaTroca > 0 ? kmFormatado(kmUltimaTroca) : 'Nao informada'}
                      </td>
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

            {/* Sempre visível: deixa explícito o preço cheio da peça (e a M.O.,
                quando há) que está sendo amortizado. Com valor incompleto,
                mostra só a peça + o total (= peça). */}
            <div className="space-y-2">
              <p className="label-neutro">Composição por troca</p>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[320px] text-left text-xs">
                  <tbody>
                    {composicao.map((parte) => (
                      <tr key={parte.chave} className="border-t border-border first:border-t-0">
                        <td className="px-2 py-2 text-muted-foreground">{parte.rotulo}</td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {moeda(parte.custoPorTroca)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-border bg-muted/20 font-medium">
                      <td className="px-2 py-2">Total por troca</td>
                      <td className="px-2 py-2 text-right tabular-nums">{moeda(custoPorTroca)}</td>
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
                      {kmDasProximasTrocas.length > 0 ? (
                        kmDasProximasTrocas.map((km, index) => (
                          <tr key={km} className="border-t border-border">
                            <td className="px-2 py-2">{index + 1}o</td>
                            <td className="px-2 py-2 tabular-nums">{kmFormatado(km)}</td>
                            <td className="px-2 py-2 text-right tabular-nums">
                              {moeda(custoPorTroca)}
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
                        <th className="px-2 py-2 font-medium text-right">Custo anual</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="px-2 py-2 tabular-nums">{kmFormatado(kmAnual)}</td>
                        <td className="px-2 py-2 font-mono text-[11px]">
                          {formulaEventos} x {moeda(custoPorTroca)}
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
                  fração do custo por troca pelo km anual estimado, sem afirmar que a troca
                  acontecerá em uma quilometragem específica.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
