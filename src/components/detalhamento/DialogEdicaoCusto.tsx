import { Wrench, Package } from 'lucide-react';
import type { Dispatch } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { CardCombustivel } from '../custos-pecas/CardCombustivel';
import { CardItemPreco } from '../custos-pecas/CardItemPreco';
import { CardServico } from '../mao-de-obra/CardServico';
import { CampoSeguro } from '../ajustes/campos/CampoSeguro';
import { CampoAlimentacao } from '../ajustes/campos/CampoAlimentacao';
import { CampoInternet } from '../ajustes/campos/CampoInternet';
import { CampoFinanciamento } from '../ajustes/campos/CampoFinanciamento';
import { SecaoUsoDiario } from '../ajustes/SecaoUsoDiario';
import { SecaoPreferencias } from '../ajustes/SecaoPreferencias';
import { ControleEstimativaMaoDeObra } from '../mao-de-obra/ControleEstimativaMaoDeObra';
import { perfilPadrao } from '../../context/PerfilContext';
import { CATALOGO, obterConsumoKmL } from '../../data/catalogoModelos';
import { dadosRJ } from '../../data/dadosRJ';
import { obterPreset } from '../../data/repositorioPresets';
import { MAPA_PECA_PARA_SERVICO, resolverServicoPorPeca } from '../../utils/calculos';
import {
  obterServicosManutencaoBase,
  resolverServicosManutencaoPerfil,
} from '../../utils/servicosManutencaoPreset';
import { montarEstimativaMaoDeObra } from '../../utils/maoDeObraEstimada';
import type {
  PerfilUsuario,
  PerfilAction,
  ServicoIndependente,
  TipoCombustivel,
  ConfiguracaoCombustivel,
} from '../../types/perfil';

export type EdicaoAlvo =
  | { tipo: 'combustivel' }
  | { tipo: 'internet' }
  | { tipo: 'alimentacao' }
  | { tipo: 'seguro' }
  | { tipo: 'financiamento' }
  | { tipo: 'usoDiario' }
  | { tipo: 'preferencias' }
  | { tipo: 'estimativaMaoDeObra' }
  | { tipo: 'pecaComMO'; pecaId: string }
  | { tipo: 'servicoAutorizada'; servicoId: string };

type Props = {
  alvo: EdicaoAlvo | null;
  perfil: PerfilUsuario;
  dispatch: Dispatch<PerfilAction>;
  onClose: () => void;
};

function tituloDoAlvo(alvo: EdicaoAlvo, perfil: PerfilUsuario): string {
  switch (alvo.tipo) {
    case 'combustivel':
      return 'Combustível';
    case 'internet':
      return 'Internet';
    case 'alimentacao':
      return 'Alimentação';
    case 'seguro':
      return 'Seguro';
    case 'financiamento':
      return perfil.financeiro.situacaoMoto === 'alugada' ? 'Aluguel' : 'Financiamento';
    case 'usoDiario':
      return 'Uso diário';
    case 'preferencias':
      return 'Preferências';
    case 'estimativaMaoDeObra':
      return 'Estimativa de mão de obra';
    case 'pecaComMO': {
      const preset = obterPreset(perfil.moto.modelo);
      const peca = preset?.pecas.find((p) => p.id === alvo.pecaId);
      if (peca) return peca.nome;
      const pneu = preset?.pneus.find((p) => p.id === alvo.pecaId);
      if (pneu) return pneu.posicao === 'dianteiro' ? 'Pneu dianteiro' : 'Pneu traseiro';
      return 'Editar';
    }
    case 'servicoAutorizada': {
      const servico = perfil.servicosIndependentes.find((s) => s.id === alvo.servicoId);
      return servico?.nome ?? 'Editar';
    }
  }
}

export function DialogEdicaoCusto({ alvo, perfil, dispatch, onClose }: Props) {
  const aberto = alvo !== null;

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {alvo && (
          <>
            <DialogHeader>
              <DialogTitle>{tituloDoAlvo(alvo, perfil)}</DialogTitle>
              <DialogDescription>
                Edite os valores - as alterações são aplicadas automaticamente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <ConteudoEdicao alvo={alvo} perfil={perfil} dispatch={dispatch} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

type PropsConteudo = {
  alvo: EdicaoAlvo;
  perfil: PerfilUsuario;
  dispatch: Dispatch<PerfilAction>;
};

function ConteudoEdicao({ alvo, perfil, dispatch }: PropsConteudo) {
  if (alvo.tipo === 'combustivel')
    return <ConteudoCombustivel perfil={perfil} dispatch={dispatch} />;
  if (alvo.tipo === 'internet')
    return <CampoInternet financeiro={perfil.financeiro} dispatch={dispatch} />;
  if (alvo.tipo === 'alimentacao')
    return <CampoAlimentacao financeiro={perfil.financeiro} dispatch={dispatch} />;
  if (alvo.tipo === 'seguro')
    return <CampoSeguro financeiro={perfil.financeiro} dispatch={dispatch} />;
  if (alvo.tipo === 'financiamento')
    return <CampoFinanciamento financeiro={perfil.financeiro} dispatch={dispatch} />;
  if (alvo.tipo === 'usoDiario')
    return <SecaoUsoDiario trabalho={perfil.trabalho} dispatch={dispatch} />;
  if (alvo.tipo === 'preferencias')
    return <SecaoPreferencias perfilManutencao={perfil.perfilManutencao} dispatch={dispatch} />;
  if (alvo.tipo === 'estimativaMaoDeObra')
    return <ConteudoEstimativaMaoDeObra perfil={perfil} dispatch={dispatch} />;
  if (alvo.tipo === 'servicoAutorizada')
    return (
      <ConteudoServicoAutorizada servicoId={alvo.servicoId} perfil={perfil} dispatch={dispatch} />
    );
  return <ConteudoPecaComMO pecaId={alvo.pecaId} perfil={perfil} dispatch={dispatch} />;
}

// O perfil cru guarda os intervalos default (genéricos); o preset traz os
// sincronizados (vida útil mora no serviço — ADR-014). A edição opera sobre o
// serviço EFETIVO (mesclado), para o intervalo/preço baterem com o que o
// Detalhamento e o cálculo usam — senão o popup mostraria o default defasado.
function resolverServicoEfetivo(
  perfil: PerfilUsuario,
  servicoId: string,
): ServicoIndependente | undefined {
  const preset = obterPreset(perfil.moto.modelo);
  return resolverServicosManutencaoPerfil(perfil, preset).find((s) => s.id === servicoId);
}

function resolverServicoBase(
  perfil: PerfilUsuario,
  servicoId: string,
): ServicoIndependente | undefined {
  return obterServicosManutencaoBase(obterPreset(perfil.moto.modelo)).find(
    (servico) => servico.id === servicoId,
  );
}

// Bundle de estimativa por-item passado ao CardServico (ADR-014, A), via o
// helper compartilhado (mesma fonte da aba Mão de Obra).
function estimativaDoServico(perfil: PerfilUsuario, servicoId: string) {
  return montarEstimativaMaoDeObra(perfil, obterPreset(perfil.moto.modelo), servicoId);
}

// Controle global da estimativa de M.O. (ADR-013/014) — mesmo controle da aba
// Preferências e da tela de onboarding, acessível direto pelo chip do card de total.
function ConteudoEstimativaMaoDeObra({
  perfil,
  dispatch,
}: {
  perfil: PerfilUsuario;
  dispatch: Dispatch<PerfilAction>;
}) {
  return (
    <ControleEstimativaMaoDeObra
      ligada={perfil.perfilManutencao.incluirEstimativaMaoDeObra === true}
      dispatch={dispatch}
    />
  );
}

function ConteudoServicoAutorizada({
  servicoId,
  perfil,
  dispatch,
}: {
  servicoId: string;
  perfil: PerfilUsuario;
  dispatch: Dispatch<PerfilAction>;
}) {
  const servico = resolverServicoEfetivo(perfil, servicoId);
  if (!servico) {
    return <p className="text-sm text-muted-foreground">Serviço não encontrado.</p>;
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-px">
        <Wrench className="w-4 h-4 text-muted-foreground/70" aria-hidden="true" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Serviço avulso concessionária
        </span>
      </div>
      <CardServico
        servico={servico}
        servicoPadrao={resolverServicoBase(perfil, servico.id)}
        dispatch={dispatch}
        modo="autorizada"
        estimativaMaoDeObra={estimativaDoServico(perfil, servico.id)}
      />
    </div>
  );
}

function ConteudoCombustivel({
  perfil,
  dispatch,
}: {
  perfil: PerfilUsuario;
  dispatch: Dispatch<PerfilAction>;
}) {
  const catalogo = CATALOGO[perfil.moto.modelo];
  const aceitaEtanol = catalogo?.aceitaEtanol ?? true;
  const tipos: TipoCombustivel[] = [
    'comum',
    'aditivada',
    ...(aceitaEtanol ? (['etanol'] as TipoCombustivel[]) : []),
  ];
  const autonomiaBase =
    obterConsumoKmL(perfil.moto.modelo) ?? perfil.financeiro.combustiveis.comum.autonomia;
  const padraoCombustiveis: Record<TipoCombustivel, ConfiguracaoCombustivel> = {
    comum: { preco: perfilPadrao.financeiro.combustiveis.comum.preco, autonomia: autonomiaBase },
    aditivada: {
      preco: perfilPadrao.financeiro.combustiveis.aditivada.preco,
      autonomia: autonomiaBase,
    },
    etanol: {
      preco: perfilPadrao.financeiro.combustiveis.etanol.preco,
      autonomia: Math.round(autonomiaBase * dadosRJ.autonomiaEtanolFatorReducao),
    },
  };

  return (
    <>
      {tipos.map((tipo) => (
        <CardCombustivel
          key={tipo}
          tipo={tipo}
          config={perfil.financeiro.combustiveis[tipo]}
          padrao={padraoCombustiveis[tipo]}
          ehPreferido={perfil.financeiro.tipoGasolinaPreferida === tipo}
          dispatch={dispatch}
        />
      ))}
    </>
  );
}

function ConteudoPecaComMO({
  pecaId,
  perfil,
  dispatch,
}: {
  pecaId: string;
  perfil: PerfilUsuario;
  dispatch: Dispatch<PerfilAction>;
}) {
  const preset = obterPreset(perfil.moto.modelo);
  if (!preset) {
    return <p className="text-sm text-muted-foreground">Preset não encontrado.</p>;
  }
  const servicosManutencao = resolverServicosManutencaoPerfil(perfil, preset);
  function resolverIntervalo(id: string, fallback: number): number {
    return resolverServicoPorPeca(id, servicosManutencao)?.intervalKm ?? fallback;
  }

  const peca = preset.pecas.find((p) => p.id === pecaId);
  const pneu = preset.pneus.find((p) => p.id === pecaId);
  if (!peca && !pneu) {
    return <p className="text-sm text-muted-foreground">Item não encontrado no preset.</p>;
  }

  const item = peca
    ? {
        id: peca.id,
        nome: peca.nome,
        precoOriginal: peca.precoOriginal,
        precoParalela: peca.precoParalela,
        intervaloKm: resolverIntervalo(peca.id, peca.intervaloKm ?? 0),
      }
    : {
        id: pneu!.id,
        nome: pneu!.posicao === 'dianteiro' ? 'Pneu dianteiro' : 'Pneu traseiro',
        precoOriginal: pneu!.precoOriginal,
        precoParalela: pneu!.precoParalela,
        intervaloKm: resolverIntervalo(pneu!.id, pneu!.vidaUtilKm),
      };

  const servicoId = MAPA_PECA_PARA_SERVICO[pecaId];
  const servico = servicoId ? resolverServicoEfetivo(perfil, servicoId) : undefined;
  const override = perfil.pecasOverrides.find((o) => o.id === pecaId) ?? null;

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-px">
          <Package className="w-4 h-4 text-muted-foreground/70" aria-hidden="true" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Preço da peça
          </span>
        </div>
        <CardItemPreco
          id={item.id}
          nome={item.nome}
          precoOriginal={item.precoOriginal}
          precoParalela={item.precoParalela}
          intervaloKm={item.intervaloKm}
          override={override}
          dispatch={dispatch}
          mostrarDicaAbaMO={false}
        />
      </div>

      {servico ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-px">
            <Wrench className="w-4 h-4 text-muted-foreground/70" aria-hidden="true" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Mão de obra
            </span>
          </div>
          <CardServico
            servico={servico}
            servicoPadrao={resolverServicoBase(perfil, servico.id)}
            dispatch={dispatch}
            modo="autorizada"
            estimativaMaoDeObra={estimativaDoServico(perfil, servico.id)}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 leading-relaxed px-px">
          Este item não tem serviço de troca cadastrado - apenas o preço da peça é editável aqui.
        </p>
      )}
    </>
  );
}
