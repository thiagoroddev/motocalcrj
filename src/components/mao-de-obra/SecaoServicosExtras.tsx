import type { Dispatch, ReactNode } from 'react';
import { Tag } from 'lucide-react';
import { TituloSecao } from '@/components/TituloSecao';
import { AjudaInline } from '@/components/AjudaInline';
import { ControleEstimativaMaoDeObra } from './ControleEstimativaMaoDeObra';
import { ListaServicos } from './ListaServicos';
import type { EstimativaMaoDeObraItem } from '../../utils/maoDeObraEstimada';
import type { ServicoIndependente, PerfilAction } from '../../types/perfil';

interface Props {
  avulsosCompletos: ServicoIndependente[];
  avulsosIncompletos: ServicoIndependente[];
  servicosPadrao: ServicoIndependente[];
  estimativaLigada: boolean;
  dispatch: Dispatch<PerfilAction>;
  montarEstimativa: (servico: ServicoIndependente) => EstimativaMaoDeObraItem;
  // Onboarding: esconde o campo de intervalo dos cards.
  ocultarIntervalo?: boolean;
  // Mostra o título "Serviços Extras" (aba M.Obra); no onboarding pode ser omitido.
  mostrarTitulo?: boolean;
  temOverridesCompletos?: boolean;
  temOverridesIncompletos?: boolean;
  onRestaurarCompletos?: () => void;
  onRestaurarIncompletos?: () => void;
  // Conteúdo extra logo abaixo do toggle de estimativa, dentro da subseção
  // "Valor Incompleto" (ex.: card de total no onboarding).
  slotAposToggle?: ReactNode;
}

// Subseções "Valor Completo (peça + M.O)" e "Valor Incompleto (apenas M.O)" dos
// Serviços Extras de concessionária. Compartilhado pela aba Mão de Obra e pelo
// passo de M.O. do onboarding (BG-035). A divisão Completo/Incompleto vem de
// `concessionariaInformaPrecoCompleto` (BG-033).
export function SecaoServicosExtras({
  avulsosCompletos,
  avulsosIncompletos,
  servicosPadrao,
  estimativaLigada,
  dispatch,
  montarEstimativa,
  ocultarIntervalo = false,
  mostrarTitulo = true,
  temOverridesCompletos = false,
  temOverridesIncompletos = false,
  onRestaurarCompletos,
  onRestaurarIncompletos,
  slotAposToggle,
}: Props) {
  if (avulsosCompletos.length === 0 && avulsosIncompletos.length === 0) return null;

  return (
    <div className="space-y-4">
      {mostrarTitulo && <TituloSecao icone={Tag}>Serviços Extras</TituloSecao>}

      {avulsosCompletos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">
              Valor Completo (peça + M.O)
            </h3>
            <AjudaInline titulo="Valor Completo (peça + M.O)">
              A concessionária informa o <strong>valor cheio</strong> deste serviço — já inclui a
              peça e a mão de obra. Edite com o <strong>preço total</strong> do orçamento da
              concessionária. Por isso a peça não aparece separada em Insumos.
            </AjudaInline>
          </div>
          <ListaServicos
            servicos={avulsosCompletos}
            dispatch={dispatch}
            servicosPadrao={servicosPadrao}
            temOverrides={temOverridesCompletos}
            onRestaurarTudo={onRestaurarCompletos ?? (() => {})}
            modo="autorizada"
            montarEstimativa={montarEstimativa}
            ocultarIntervalo={ocultarIntervalo}
          />
        </div>
      )}

      {avulsosIncompletos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-medium text-muted-foreground">
              Valor Incompleto (apenas M.O)
            </h3>
            <AjudaInline titulo="Valor Incompleto (apenas M.O)">
              A concessionária <strong>não informa</strong> o preço deste serviço. Aqui você coloca{' '}
              <strong>apenas a mão de obra</strong> (ou usa a estimativa ~); a peça é precificada à
              parte, na aba <strong>Insumos</strong>. Por isso edite só o valor da M.O., não o total
              com a peça.
            </AjudaInline>
          </div>
          {/* Toggle logo abaixo do título: a estimativa só atinge avulsos sem valor. */}
          <ControleEstimativaMaoDeObra ligada={estimativaLigada} dispatch={dispatch} />
          {slotAposToggle}
          <ListaServicos
            servicos={avulsosIncompletos}
            dispatch={dispatch}
            servicosPadrao={servicosPadrao}
            temOverrides={temOverridesIncompletos}
            onRestaurarTudo={onRestaurarIncompletos ?? (() => {})}
            modo="autorizada"
            montarEstimativa={montarEstimativa}
            ocultarIntervalo={ocultarIntervalo}
          />
        </div>
      )}
    </div>
  );
}
