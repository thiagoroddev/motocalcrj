import { useState } from 'react';
import { usePerfil } from '../../../hooks/usePerfil';
import { perfilPadrao } from '../../../context/PerfilContext';
import { useOnboarding } from '../FluxoOnboarding';
import { PassoLayout } from '../PassoLayout';
import { Input } from '../../../components/ui/input';
import { obterConsumoKmL, getNomeModelo } from '../../../data/catalogoModelos';

export function Passo5() {
  const { perfil, dispatch } = usePerfil();
  const { irParaProximo } = useOnboarding();

  const [kmAtual, setKmAtual] = useState(
    perfil.moto.kmAtual > 0 ? String(perfil.moto.kmAtual) : '',
  );

  // Consumo é do modelo (manual/INMETRO); pré-preenchido e editável. Grava na
  // autonomia da gasolina do perfil - mesma fonte do cálculo de combustível.
  const consumoModelo = obterConsumoKmL(perfil.moto.modelo);
  const nomeModelo = `${perfil.moto.marca} ${getNomeModelo(perfil.moto.modelo)}`.trim();
  const autonomiaAtual = perfil.financeiro.combustiveis.comum.autonomia;
  // No primeiro acesso a autonomia ainda é o default pré-modelo: mostra o consumo
  // do modelo. Se o passo já rodou (ou o usuário editou), mostra o valor gravado.
  const consumoInicial =
    autonomiaAtual !== perfilPadrao.financeiro.combustiveis.comum.autonomia
      ? autonomiaAtual
      : (consumoModelo ?? autonomiaAtual);
  const [consumo, setConsumo] = useState(String(consumoInicial));

  const kmAtualNum = parseInt(kmAtual, 10);
  const valido = !isNaN(kmAtualNum) && kmAtualNum > 0;

  function salvarEAvancar() {
    const consumoNum = parseFloat(consumo.replace(',', '.'));
    const consumoFinal =
      !isNaN(consumoNum) && consumoNum > 0 ? consumoNum : (consumoModelo ?? autonomiaAtual);

    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'moto',
      valor: { ...perfil.moto, kmAtual: kmAtualNum },
    });
    dispatch({
      type: 'SET_ONBOARDING_CAMPO',
      campo: 'financeiro',
      valor: {
        ...perfil.financeiro,
        combustiveis: {
          ...perfil.financeiro.combustiveis,
          comum: { ...perfil.financeiro.combustiveis.comum, autonomia: consumoFinal },
          aditivada: { ...perfil.financeiro.combustiveis.aditivada, autonomia: consumoFinal },
        },
      },
    });
    irParaProximo();
  }

  const inputClassName =
    'flex-1 min-h-touch bg-card rounded-input border-muted text-foreground px-4 placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0';

  return (
    <PassoLayout
      titulo="Quilometragem e consumo"
      subtitulo="Informe o hodômetro atual e confira o consumo da sua moto"
      aoProximo={salvarEAvancar}
      podeContinuar={valido}
    >
      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">
            KM atual do hodômetro <span className="text-destructive">*</span>
          </span>
          <span className="text-muted-foreground/60 text-xs">
            Essencial para prever as próximas manutenções
          </span>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              inputMode="numeric"
              value={kmAtual}
              onChange={(e) => setKmAtual(e.target.value)}
              min={1}
              placeholder="Ex: 12500"
              className={inputClassName}
            />
            <span className="text-muted-foreground/60 text-sm font-medium w-8">KM</span>
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm font-medium">
            Consumo médio - {nomeModelo}
          </span>
          <span className="text-muted-foreground/60 text-xs">
            Já preenchido com a referência do modelo - ajuste se o seu for diferente
          </span>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              inputMode="decimal"
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
              min={0.1}
              step={0.1}
              placeholder="Ex: 54"
              className={inputClassName}
            />
            <span className="text-muted-foreground/60 text-sm font-medium w-8">km/L</span>
          </div>
        </label>
      </div>
    </PassoLayout>
  );
}
