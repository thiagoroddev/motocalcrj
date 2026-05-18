import { useState, useEffect, useRef } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { getNomeModelo, CATALOGO } from '../../../data/catalogoModelos';
import { buscarPrecoFipe } from '../../../services/fipeService';
import type { FipeCache } from '../../../types/perfil';

const ANO_MIN = 2000;
const ANO_MAX = new Date().getFullYear() + 1;
const CACHE_DIAS = 30;

function cacheValida(cache: FipeCache | null, marca: string, modelo: string, ano: number): boolean {
  if (!cache || cache.anoModelo !== ano || cache.marca !== marca || cache.modelo !== modelo) {
    return false;
  }
  const diffDias = (Date.now() - new Date(cache.dataConsulta).getTime()) / 86_400_000;
  return diffDias < CACHE_DIAS;
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function Passo3() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();
  const [ano, setAno] = useState(String(perfil.moto.ano));

  const anoNum = parseInt(ano, 10);
  const valido = !isNaN(anoNum) && anoNum >= ANO_MIN && anoNum <= ANO_MAX;

  type FipeEstado = 'inativo' | 'buscando' | 'ok' | 'erro';
  const [fipeEstado, setFipeEstado] = useState<FipeEstado>('inativo');
  const { marca, modelo } = perfil.moto;
  const fipeCacheRef = useRef(perfil.fipeCache);

  useEffect(() => {
    fipeCacheRef.current = perfil.fipeCache;
  }, [perfil.fipeCache]);

  const [fipeInfo, setFipeInfo] = useState<{ valor: number; mesReferencia: string } | null>(
    cacheValida(perfil.fipeCache, marca, modelo, anoNum)
      ? { valor: perfil.fipeCache!.valor, mesReferencia: '' }
      : null,
  );

  useEffect(() => {
    if (!valido) {
      setFipeInfo(null);
      setFipeEstado('inativo');
      return;
    }

    const fipeCache = fipeCacheRef.current;
    if (cacheValida(fipeCache, marca, modelo, anoNum)) {
      setFipeInfo({ valor: fipeCache!.valor, mesReferencia: '' });
      setFipeEstado('ok');
      return;
    }

    const modeloDados = CATALOGO[modelo];
    if (!modeloDados) {
      return;
    }

    let cancelado = false;
    setFipeEstado('buscando');
    setFipeInfo(null);

    const timerId = setTimeout(() => {
      buscarPrecoFipe(marca, modeloDados.nomeFipe, anoNum).then((resultado) => {
        if (cancelado) {
          return;
        }
        if (resultado) {
          setFipeInfo({ valor: resultado.valor, mesReferencia: resultado.mesReferencia });
          setFipeEstado('ok');
          dispatch({
            type: 'SET_FIPE_CACHE',
            cache: {
              valor: resultado.valor,
              codigoFipe: resultado.codigoFipe,
              dataConsulta: new Date().toISOString().slice(0, 10),
              anoModelo: resultado.anoModelo,
              marca,
              modelo,
            },
          });
        } else {
          setFipeEstado('erro');
        }
      });
    }, 800);

    return () => {
      cancelado = true;
      clearTimeout(timerId);
    };
  }, [anoNum, valido, marca, modelo, dispatch]);

  function salvarEAvancar() {
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
      podeContinuar={valido && fipeEstado !== 'buscando'}
    >
      <input
        type="number"
        value={ano}
        onChange={(e) => setAno(e.target.value)}
        min={ANO_MIN}
        max={ANO_MAX}
        placeholder={String(new Date().getFullYear())}
        autoFocus
        className="w-full min-h-touch bg-card rounded-input border border-muted text-foreground px-md placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
      />

      {valido && ano.length >= 4 && (
        <div className="mt-md">
          {fipeEstado === 'buscando' && (
            <p className="text-muted-foreground/60 text-sm">Consultando FIPE…</p>
          )}
          {fipeEstado === 'ok' && fipeInfo && (
            <div className="space-y-xs">
              <div className="bg-card rounded-lg px-md py-sm flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Valor FIPE</span>
                <div className="text-right">
                  <span className="text-foreground font-semibold">
                    {formatarMoeda(fipeInfo.valor)}
                  </span>
                  {fipeInfo.mesReferencia && (
                    <p className="text-muted-foreground/50 text-xs">{fipeInfo.mesReferencia}</p>
                  )}
                </div>
              </div>
              {new Date().getFullYear() - anoNum < 15 ? (
                <div className="bg-card rounded-lg px-md py-sm flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">IPVA estimado (2% a.a.)</span>
                  <span className="text-foreground font-semibold">
                    {formatarMoeda(fipeInfo.valor * 0.02)}
                  </span>
                </div>
              ) : (
                <p className="text-muted-foreground/50 text-xs px-xs">
                  Moto com mais de 15 anos — isenta de IPVA no RJ.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!valido && ano.length >= 4 && (
        <p className="text-warning text-sm mt-sm">
          Use um ano entre {ANO_MIN} e {ANO_MAX}.
        </p>
      )}
    </PassoLayout>
  );
}
