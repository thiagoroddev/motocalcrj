import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { getNomeModelo, CATALOGO, obterConsumoKmLPorAno } from '../../../data/catalogoModelos';
import { dadosRJ } from '../../../data/dadosRJ';
import { Input } from '../../../components/ui/input';

const ANO_MIN = 2000;
const ANO_MAX = new Date().getFullYear() + 1;

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function Passo3() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();
  const [ano, setAno] = useState(String(perfil.moto.ano));

  const anoNum = parseInt(ano, 10);
  const valido = !isNaN(anoNum) && anoNum >= ANO_MIN && anoNum <= ANO_MAX;

  const { marca, modelo } = perfil.moto;
  const modeloDados = CATALOGO[modelo];

  // FIPE vem da tabela hardcoded do preset (atualizada mensalmente pelo script
  // `npm run fipe:update`). Sem consulta em runtime — ver ADR-015.
  const valorFipe = valido && modeloDados ? modeloDados.tabelaFipe[String(anoNum)] : undefined;
  const consumoKmL = valido ? obterConsumoKmLPorAno(modelo, anoNum) : undefined;
  const anoSuportado = consumoKmL !== undefined;

  // Alíquota de IPVA da fonte canônica (`dados_rj.json` via dadosRJ) — ADR/REV-001-A06.
  const aliquotaIpva = dadosRJ.ipva.aliquotaMotos;
  const percentualIpva = (aliquotaIpva * 100).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  });

  function salvarEAvancar() {
    if (!anoSuportado) {
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
              anoModelo: anoNum,
              marca,
              modelo,
            }
          : null,
    });
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'moto',
      valor: { ...perfil.moto, ano: anoNum },
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
      podeContinuar={valido && anoSuportado}
    >
      <Input
        type="number"
        value={ano}
        onChange={(e) => setAno(e.target.value)}
        min={ANO_MIN}
        max={ANO_MAX}
        placeholder={String(new Date().getFullYear())}
        autoFocus
        className="min-h-touch rounded-input border-muted text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      {valido && ano.length >= 4 && (
        <div className="mt-4 space-y-2">
          {consumoKmL !== undefined ? (
            <div className="bg-card rounded-lg px-4 py-2 flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Consumo de referência</span>
              <span className="text-foreground font-semibold">
                {consumoKmL.toLocaleString('pt-BR')} km/L
              </span>
            </div>
          ) : (
            <p className="text-warning text-sm">
              Ainda não há referência de consumo para {anoNum}.
            </p>
          )}

          {valorFipe !== undefined ? (
            <div className="space-y-1">
              <div className="bg-card rounded-lg px-4 py-2 flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Valor FIPE</span>
                <span className="text-foreground font-semibold">{formatarMoeda(valorFipe)}</span>
              </div>
              {new Date().getFullYear() - anoNum < 15 ? (
                <div className="bg-card rounded-lg px-4 py-2 flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">
                    IPVA estimado ({percentualIpva}% a.a.)
                  </span>
                  <span className="text-foreground font-semibold">
                    {formatarMoeda(valorFipe * aliquotaIpva)}
                  </span>
                </div>
              ) : (
                <p className="text-muted-foreground/50 text-xs px-1">
                  Moto com mais de 15 anos - isenta de IPVA no RJ.
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground/60 text-sm">
              Valor FIPE indisponível para {anoNum}. O IPVA será calculado quando disponível.
            </p>
          )}
        </div>
      )}

      {!valido && ano.length >= 4 && (
        <p className="text-warning text-sm mt-2">
          Use um ano entre {ANO_MIN} e {ANO_MAX}.
        </p>
      )}
    </PassoLayout>
  );
}
