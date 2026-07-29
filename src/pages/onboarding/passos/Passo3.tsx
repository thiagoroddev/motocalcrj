import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { getNomeModelo, CATALOGO, obterAnosModelo } from '../../../data/catalogoModelos';
import { dadosRJ } from '../../../data/dadosRJ';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { AvisoFonte } from '../../../components/AvisoFonte';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function Passo3() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const { marca, modelo } = perfil.moto;
  const modeloDados = CATALOGO[modelo];

  // Anos do modelo = anos que a FIPE conhece (ela precifica cada ano-modelo).
  // Auto-mantida pelo script de atualização FIPE; ordenados desc.
  const anos = obterAnosModelo(modelo);
  const anoInicial = anos.includes(perfil.moto.ano)
    ? perfil.moto.ano
    : (anos[0] ?? perfil.moto.ano);
  const [ano, setAno] = useState<number>(anoInicial);

  // FIPE é por ano (deprecia). O consumo é do modelo e fica só no passo de km/consumo (Passo5).
  const valorFipe = modeloDados ? modeloDados.tabelaFipe[String(ano)] : undefined;

  const aliquotaIpva = dadosRJ.ipva.aliquotaMotos;
  const percentualIpva = (aliquotaIpva * 100).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  });

  function salvarEAvancar() {
    if (anos.length === 0) {
      return;
    }

    dispatch({
      type: 'SET_FIPE_CACHE',
      cache:
        valorFipe !== undefined && modeloDados
          ? {
              valor: valorFipe,
              codigoFipe: modeloDados.codigoFipe,
              dataConsulta: new Date().toISOString().slice(0, 10),
              anoModelo: ano,
              marca,
              modelo,
            }
          : null,
    });
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'moto',
      valor: { ...perfil.moto, ano },
    });
    irParaProximo();
  }

  return (
    <PassoLayout
      titulo="Qual o ano da moto?"
      subtitulo={
        perfil.moto.marca && perfil.moto.modelo
          ? `${perfil.moto.marca} ${getNomeModelo(perfil.moto.modelo)}`
          : undefined
      }
      aoProximo={salvarEAvancar}
      podeContinuar={anos.length > 0}
    >
      <Select value={String(ano)} onValueChange={(valor) => setAno(Number(valor))}>
        <SelectTrigger aria-label="Ano da moto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {anos.map((anoOpcao) => (
            <SelectItem key={anoOpcao} value={String(anoOpcao)}>
              {anoOpcao}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-4 space-y-2">
        {valorFipe !== undefined ? (
          <div className="space-y-1">
            <div className="bg-card rounded-lg px-4 py-2 flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Valor FIPE</span>
              <span className="text-foreground font-semibold">{formatarMoeda(valorFipe)}</span>
            </div>
            {new Date().getFullYear() - ano < 15 ? (
              <div className="bg-card rounded-lg px-4 py-2 flex justify-between items-center">
                <span className="text-muted-foreground text-sm">
                  IPVA estimado ({percentualIpva}% a.a.)
                </span>
                <span className="text-foreground font-semibold">
                  {formatarMoeda(valorFipe * aliquotaIpva)}
                </span>
              </div>
            ) : (
              <p className="text-muted-foreground/70 text-xs px-1">
                Moto com mais de 15 anos - isenta de IPVA no RJ.
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground/60 text-sm">
            Valor FIPE indisponível para {ano}. O IPVA será calculado quando disponível.
          </p>
        )}
        <AvisoFonte>
          Valor FIPE de referência e alíquota de IPVA (SEFAZ-RJ); podem estar desatualizados.
        </AvisoFonte>
      </div>
    </PassoLayout>
  );
}
