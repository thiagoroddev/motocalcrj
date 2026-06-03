import { Wrench, Package } from 'lucide-react';
import type { Dispatch } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { CardCombustivel } from '../custos-pecas/CardCombustivel';
import { CardItemPreco } from '../custos-pecas/CardItemPreco';
import { CardServico } from '../mao-de-obra/CardServico';
import { CampoSeguro } from '../ajustes/campos/CampoSeguro';
import { CampoAlimentacao } from '../ajustes/campos/CampoAlimentacao';
import { CampoInternet } from '../ajustes/campos/CampoInternet';
import { CampoFinanciamento } from '../ajustes/campos/CampoFinanciamento';
import { SecaoUsoDiario } from '../ajustes/SecaoUsoDiario';
import { SecaoPreferencias } from '../ajustes/SecaoPreferencias';
import { perfilPadrao } from '../../context/PerfilContext';
import { CATALOGO } from '../../data/catalogoModelos';
import { obterPreset } from '../../data/repositorioPresets';
import { MAPA_PECA_PARA_SERVICO, resolverServicoComIntervaloEditado } from '../../utils/calculos';
import type {
  PerfilUsuario,
  PerfilAction,
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
  | { tipo: 'pecaComMO'; pecaId: string }
  | { tipo: 'servicoAutorizada'; servicoId: string }
  | { tipo: 'servicoExcepcional'; servicoId: string };

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
      return 'Modo de revisão';
    case 'pecaComMO': {
      const preset = obterPreset(perfil.moto.modelo);
      const peca = preset?.pecas.find((p) => p.id === alvo.pecaId);
      if (peca) return peca.nome;
      const pneu = preset?.pneus.find((p) => p.id === alvo.pecaId);
      if (pneu) return pneu.posicao === 'dianteiro' ? 'Pneu dianteiro' : 'Pneu traseiro';
      return 'Editar';
    }
    case 'servicoExcepcional': {
      const servico = perfil.servicosIndependentes.find((s) => s.id === alvo.servicoId);
      return servico?.nome ?? 'Editar';
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
    return (
      <SecaoPreferencias
        perfilManutencao={perfil.perfilManutencao}
        moto={perfil.moto}
        dispatch={dispatch}
      />
    );
  if (alvo.tipo === 'servicoExcepcional')
    return (
      <ConteudoServicoExcepcional servicoId={alvo.servicoId} perfil={perfil} dispatch={dispatch} />
    );
  if (alvo.tipo === 'servicoAutorizada')
    return (
      <ConteudoServicoAutorizada servicoId={alvo.servicoId} perfil={perfil} dispatch={dispatch} />
    );
  return <ConteudoPecaComMO pecaId={alvo.pecaId} perfil={perfil} dispatch={dispatch} />;
}

function ConteudoServicoExcepcional({
  servicoId,
  perfil,
  dispatch,
}: {
  servicoId: string;
  perfil: PerfilUsuario;
  dispatch: Dispatch<PerfilAction>;
}) {
  const servico = perfil.servicosIndependentes.find((s) => s.id === servicoId);
  if (!servico) {
    return <p className="text-sm text-muted-foreground">Serviço não encontrado.</p>;
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-px">
        <Wrench className="w-4 h-4 text-muted-foreground/70" aria-hidden="true" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Mão de obra
        </span>
      </div>
      <CardServico servico={servico} dispatch={dispatch} />
    </div>
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
  const servico = perfil.servicosIndependentes.find((s) => s.id === servicoId);
  if (!servico) {
    return <p className="text-sm text-muted-foreground">Serviço não encontrado.</p>;
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-px">
        <Wrench className="w-4 h-4 text-muted-foreground/70" aria-hidden="true" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Serviço avulso Honda
        </span>
      </div>
      <CardServico servico={servico} dispatch={dispatch} modo="autorizada" />
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
  const usaComBau = perfil.moto.perfilUso === 'entrega';
  const tipos: TipoCombustivel[] = [
    'comum',
    'aditivada',
    ...(aceitaEtanol ? (['etanol'] as TipoCombustivel[]) : []),
  ];
  const autonomiaBase = catalogo
    ? usaComBau
      ? catalogo.consumoKmLComBau
      : catalogo.consumoKmL
    : perfilPadrao.financeiro.combustiveis.comum.autonomia;
  const padraoCombustiveis: Record<TipoCombustivel, ConfiguracaoCombustivel> = {
    comum: { preco: perfilPadrao.financeiro.combustiveis.comum.preco, autonomia: autonomiaBase },
    aditivada: {
      preco: perfilPadrao.financeiro.combustiveis.aditivada.preco,
      autonomia: autonomiaBase,
    },
    etanol: {
      preco: perfilPadrao.financeiro.combustiveis.etanol.preco,
      autonomia: Math.round(autonomiaBase * 0.78),
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
  const usaComBau = perfil.moto.perfilUso === 'entrega';
  function resolverIntervalo(id: string, fallback: number): number {
    return (
      resolverServicoComIntervaloEditado(id, perfil.servicosIndependentes)?.intervalKm ?? fallback
    );
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
        intervaloKm: resolverIntervalo(
          peca.id,
          (usaComBau ? peca.intervaloKmEntrega : peca.intervaloKm) ?? 0,
        ),
      }
    : {
        id: pneu!.id,
        nome: pneu!.posicao === 'dianteiro' ? 'Pneu dianteiro' : 'Pneu traseiro',
        precoOriginal: pneu!.precoOriginal,
        precoParalela: pneu!.precoParalela,
        intervaloKm: resolverIntervalo(pneu!.id, pneu!.vidaUtilKm),
      };

  const servicoId = MAPA_PECA_PARA_SERVICO[pecaId];
  const servico = servicoId
    ? perfil.servicosIndependentes.find((s) => s.id === servicoId)
    : undefined;
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
          <CardServico servico={servico} dispatch={dispatch} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/60 leading-relaxed px-px">
          Este item não tem serviço de troca cadastrado - apenas o preço da peça é editável aqui.
        </p>
      )}
    </>
  );
}
