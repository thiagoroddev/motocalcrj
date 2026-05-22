import { useState, useEffect } from 'react';
import type { Dispatch } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BotaoReset } from '@/components/BotaoReset';
import { DialogConfirmacao } from '@/components/DialogConfirmacao';
import { usePerfil } from '../hooks/usePerfil';
import { SERVICOS_INDEPENDENTES_PADRAO } from '../context/PerfilContext';
import type { PresetMoto, RevisaoAutorizadaPreset } from '../types/calculos';
import type { ServicoIndependente, PerfilAction, RevisaoAutorizadaOverride } from '../types/perfil';

// ── Carregamento de presets ──────────────────────────────────

const _rawPresets = import.meta.glob('../presets/*.json', { eager: true });

const PRESETS: Record<string, PresetMoto> = Object.fromEntries(
  Object.entries(_rawPresets).map(([path, mod]) => [
    path.split('/').pop()!.replace('.json', ''),
    (mod as { default: PresetMoto }).default,
  ]),
);

// ── BotaoRestaurarTudo ───────────────────────────────────────

function BotaoRestaurarTudo({ onRestaurar }: { onRestaurar: () => void }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-muted-foreground"
        onClick={() => setAberto(true)}
      >
        Restaurar tudo
      </Button>
      <DialogConfirmacao
        aberto={aberto}
        onOpenChange={setAberto}
        onConfirmar={onRestaurar}
        titulo="Restaurar tudo?"
        descricao="Todos os valores desta aba voltam ao padrão."
      />
    </>
  );
}

// ── LinhaRevisaoHonda ────────────────────────────────────────

interface PropsLinhaHonda {
  index: number;
  revisao: RevisaoAutorizadaPreset;
  override: RevisaoAutorizadaOverride | null;
  dispatch: Dispatch<PerfilAction>;
}

function LinhaRevisaoHonda({ index, revisao, override, dispatch }: PropsLinhaHonda) {
  const pecasEfetivas = override?.precoPecas ?? revisao.precoPecas;
  const moEfetiva = override?.precoMaoDeObra ?? revisao.precoMaoDeObra;

  const [pecas, setPecas] = useState(pecasEfetivas.toFixed(2));
  const [mo, setMo] = useState(moEfetiva.toFixed(2));

  useEffect(() => {
    setPecas((override?.precoPecas ?? revisao.precoPecas).toFixed(2));
  }, [override?.precoPecas, revisao.precoPecas]);

  useEffect(() => {
    setMo((override?.precoMaoDeObra ?? revisao.precoMaoDeObra).toFixed(2));
  }, [override?.precoMaoDeObra, revisao.precoMaoDeObra]);

  const temOverride = override !== null;
  const totalEfetivo = override?.precoTotal ?? revisao.precoTotal;
  const temOverridePecas =
    temOverride && Math.abs((override?.precoPecas ?? 0) - revisao.precoPecas) >= 0.01;
  const temOverrideMo =
    temOverride && Math.abs((override?.precoMaoDeObra ?? 0) - revisao.precoMaoDeObra) >= 0.01;

  function commitPecas(numPecas: number) {
    const moAtual = override?.precoMaoDeObra ?? revisao.precoMaoDeObra;
    const ambosIguaisAoPreset =
      Math.abs(numPecas - revisao.precoPecas) < 0.01 &&
      Math.abs(moAtual - revisao.precoMaoDeObra) < 0.01;
    if (ambosIguaisAoPreset) {
      if (temOverride) dispatch({ type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE', index });
    } else {
      dispatch({
        type: 'SET_REVISAO_AUTORIZADA_OVERRIDE',
        index,
        precoPecas: numPecas,
        precoMaoDeObra: moAtual,
      });
    }
  }

  function commitMo(numMo: number) {
    const pecasAtual = override?.precoPecas ?? revisao.precoPecas;
    const ambosIguaisAoPreset =
      Math.abs(pecasAtual - revisao.precoPecas) < 0.01 &&
      Math.abs(numMo - revisao.precoMaoDeObra) < 0.01;
    if (ambosIguaisAoPreset) {
      if (temOverride) dispatch({ type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE', index });
    } else {
      dispatch({
        type: 'SET_REVISAO_AUTORIZADA_OVERRIDE',
        index,
        precoPecas: pecasAtual,
        precoMaoDeObra: numMo,
      });
    }
  }

  function handleBlurPecas() {
    const num = parseFloat(pecas.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setPecas(pecasEfetivas.toFixed(2));
      return;
    }
    commitPecas(num);
  }

  function handleBlurMo() {
    const num = parseFloat(mo.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setMo(moEfetiva.toFixed(2));
      return;
    }
    commitMo(num);
  }

  return (
    <div className="bg-card rounded-lg p-md space-y-1.5">
      <span className="label-neutro block">
        {revisao.intervaloKm.toLocaleString('pt-BR')} km · {revisao.intervaloMeses} meses
      </span>
      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-1">
          <span className="label-neutro block">Peças (R$)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverridePecas ? ' border-primary' : ''}`}
            value={pecas}
            onChange={(e) => setPecas(e.target.value)}
            onBlur={handleBlurPecas}
            min={0}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <span className="label-neutro block">Mão de obra (R$)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverrideMo ? ' border-primary' : ''}`}
            value={mo}
            onChange={(e) => setMo(e.target.value)}
            onBlur={handleBlurMo}
            min={0}
            step={0.01}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Total:{' '}
          <span className={temOverride ? 'text-foreground' : ''}>
            R${' '}
            {totalEfetivo.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </span>
        <BotaoReset
          desabilitado={!temOverride}
          onReset={() => dispatch({ type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE', index })}
        />
      </div>
    </div>
  );
}

// ── CardServico ──────────────────────────────────────────────

interface PropsCardServico {
  servico: ServicoIndependente;
  dispatch: Dispatch<PerfilAction>;
}

function CardServico({ servico, dispatch }: PropsCardServico) {
  const padrao = SERVICOS_INDEPENDENTES_PADRAO.find((s) => s.id === servico.id);

  const [preco, setPreco] = useState(servico.precoMaoDeObra.toFixed(2));
  const [intervalo, setIntervalo] = useState(String(servico.intervalKm));

  useEffect(() => {
    setPreco(servico.precoMaoDeObra.toFixed(2));
  }, [servico.precoMaoDeObra]);

  useEffect(() => {
    setIntervalo(String(servico.intervalKm));
  }, [servico.intervalKm]);

  const temOverridePreco = padrao !== undefined && servico.precoMaoDeObra !== padrao.precoMaoDeObra;
  const temOverrideIntervalo = padrao !== undefined && servico.intervalKm !== padrao.intervalKm;
  const temOverride = temOverridePreco || temOverrideIntervalo;

  function handleBlurPreco() {
    const num = parseFloat(preco.replace(',', '.'));
    if (isNaN(num) || num < 0) {
      setPreco(servico.precoMaoDeObra.toFixed(2));
      return;
    }
    dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...servico, precoMaoDeObra: num } });
  }

  function handleBlurIntervalo() {
    const num = parseInt(intervalo, 10);
    if (isNaN(num) || num <= 0) {
      setIntervalo(String(servico.intervalKm));
      return;
    }
    dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...servico, intervalKm: num } });
  }

  return (
    <div className="bg-card rounded-lg p-md space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium truncate min-w-0 text-foreground">{servico.nome}</span>
        <BotaoReset
          desabilitado={!temOverride}
          onReset={() => {
            if (padrao) dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...padrao } });
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-sm">
        <div className="space-y-1">
          <span className="label-neutro block">Preço MO (R$)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverridePreco ? ' border-primary' : ''}`}
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onBlur={handleBlurPreco}
            min={0}
            step={0.01}
          />
        </div>
        <div className="space-y-1">
          <span className="label-neutro block">Intervalo (km)</span>
          <Input
            type="number"
            className={`rounded-input bg-input min-h-touch text-sm${temOverrideIntervalo ? ' border-primary' : ''}`}
            value={intervalo}
            onChange={(e) => setIntervalo(e.target.value)}
            onBlur={handleBlurIntervalo}
            min={0}
            step={500}
          />
        </div>
      </div>
    </div>
  );
}

// ── ListaServicos ────────────────────────────────────────────

interface PropsListaServicos {
  servicos: ServicoIndependente[];
  dispatch: Dispatch<PerfilAction>;
  temOverrides: boolean;
  onRestaurarTudo: () => void;
}

function ListaServicos({ servicos, dispatch, temOverrides, onRestaurarTudo }: PropsListaServicos) {
  return (
    <div className="space-y-sm">
      {servicos.map((s) => (
        <CardServico key={s.id} servico={s} dispatch={dispatch} />
      ))}
      {temOverrides && <BotaoRestaurarTudo onRestaurar={onRestaurarTudo} />}
    </div>
  );
}

// ── PaginaMaoDeObra ──────────────────────────────────────────

export function PaginaMaoDeObra() {
  const { perfil, dispatch } = usePerfil();
  const preset = PRESETS[perfil.moto.modelo];
  const modoAtivo = perfil.perfilManutencao.modoRevisao;

  const servicosNormais = perfil.servicosIndependentes.filter((s) => !s.ehExcepcional);
  const servicosExcepcionais = perfil.servicosIndependentes.filter((s) => s.ehExcepcional);

  const temOverridesHonda = perfil.revisaoAutorizadaOverrides.length > 0;

  function servicoDifereDopadrao(s: ServicoIndependente): boolean {
    const p = SERVICOS_INDEPENDENTES_PADRAO.find((ps) => ps.id === s.id);
    if (!p) return false;
    return s.precoMaoDeObra !== p.precoMaoDeObra || s.intervalKm !== p.intervalKm;
  }

  const temOverridesNormais = servicosNormais.some(servicoDifereDopadrao);
  const temOverridesExcepcionais = servicosExcepcionais.some(servicoDifereDopadrao);

  function restaurarGrupo(servicos: ServicoIndependente[]) {
    servicos.forEach((s) => {
      const padrao = SERVICOS_INDEPENDENTES_PADRAO.find((p) => p.id === s.id);
      if (padrao) dispatch({ type: 'SET_SERVICO_INDEPENDENTE', payload: { ...padrao } });
    });
  }

  function restaurarHonda() {
    perfil.revisaoAutorizadaOverrides.forEach((o) => {
      dispatch({ type: 'RESET_REVISAO_AUTORIZADA_OVERRIDE', index: o.index });
    });
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs
        defaultValue={modoAtivo === 'autorizadas' ? 'honda' : 'independente'}
        className="flex flex-col flex-1"
      >
        <TabsList className="grid grid-cols-3 mx-md mt-md shrink-0">
          <TabsTrigger value="honda">{modoAtivo === 'autorizadas' ? '● ' : ''}Honda</TabsTrigger>
          <TabsTrigger value="independente">
            {modoAtivo === 'independentes' ? '● ' : ''}Independente
          </TabsTrigger>
          <TabsTrigger value="excepcional">Excepcional</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="honda" className="px-md pb-md pt-3">
            {!preset ? (
              <p className="text-muted-foreground text-sm">
                Preset não encontrado para este modelo.
              </p>
            ) : (
              <div className="space-y-sm">
                {preset.revisaoAutorizada.map((revisao, idx) => {
                  const override = perfil.revisaoAutorizadaOverrides.find((o) => o.index === idx);
                  return (
                    <LinhaRevisaoHonda
                      key={idx}
                      index={idx}
                      revisao={revisao}
                      override={override ?? null}
                      dispatch={dispatch}
                    />
                  );
                })}
                {temOverridesHonda && <BotaoRestaurarTudo onRestaurar={restaurarHonda} />}
              </div>
            )}
          </TabsContent>

          <TabsContent value="independente" className="px-md pb-md pt-3">
            <ListaServicos
              servicos={servicosNormais}
              dispatch={dispatch}
              temOverrides={temOverridesNormais}
              onRestaurarTudo={() => restaurarGrupo(servicosNormais)}
            />
          </TabsContent>

          <TabsContent value="excepcional" className="px-md pb-md pt-3">
            <div className="space-y-sm">
              {perfil.moto.kmAtual >= 70000 && (
                <div className="rounded-lg border px-md py-sm bg-warning/10 border-warning/30 text-warning text-sm">
                  Atenção: sua moto está próxima ou acima de 70.000 km. Considere revisar os
                  serviços excepcionais.
                </div>
              )}
              <ListaServicos
                servicos={servicosExcepcionais}
                dispatch={dispatch}
                temOverrides={temOverridesExcepcionais}
                onRestaurarTudo={() => restaurarGrupo(servicosExcepcionais)}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
