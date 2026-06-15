import { useState } from 'react';
import type { Dispatch } from 'react';
import { Button } from '@/components/ui/button';
import { DialogConfirmacao } from '@/components/DialogConfirmacao';
import { CardServico } from './CardServico';
import type { EstimativaMaoDeObraItem } from '../../utils/maoDeObraEstimada';
import type { ServicoIndependente, PerfilAction, VidaUtilBateriaAnos } from '../../types/perfil';

export function BotaoRestaurarTudo({ onRestaurar }: { onRestaurar: () => void }) {
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

interface PropsListaServicos {
  servicos: ServicoIndependente[];
  dispatch: Dispatch<PerfilAction>;
  servicosPadrao: ServicoIndependente[];
  temOverrides: boolean;
  onRestaurarTudo: () => void;
  modo?: 'independente' | 'autorizada';
  // Quando fornecido, cada card recebe seu bundle de estimativa por-item (A) —
  // mantém a aba Mão de Obra sincronizada com o popup do Detalhamento.
  montarEstimativa?: (servico: ServicoIndependente) => EstimativaMaoDeObraItem;
  // Onboarding (RF-6.32.1): esconde o campo de intervalo dos cards.
  ocultarIntervalo?: boolean;
  // Bateria (TASK-RF-8.4): vida útil em anos, repassada ao CardServico do `troca-bateria`.
  vidaUtilBateriaAnos?: VidaUtilBateriaAnos;
}

export function ListaServicos({
  servicos,
  dispatch,
  servicosPadrao,
  temOverrides,
  onRestaurarTudo,
  modo = 'independente',
  montarEstimativa,
  ocultarIntervalo = false,
  vidaUtilBateriaAnos,
}: PropsListaServicos) {
  return (
    <div className="space-y-2">
      {servicos.map((s) => (
        <CardServico
          key={s.id}
          servico={s}
          servicoPadrao={servicosPadrao.find((padrao) => padrao.id === s.id)}
          dispatch={dispatch}
          modo={modo}
          estimativaMaoDeObra={montarEstimativa?.(s)}
          ocultarIntervalo={ocultarIntervalo}
          vidaUtilBateriaAnos={vidaUtilBateriaAnos}
        />
      ))}
      {temOverrides && <BotaoRestaurarTudo onRestaurar={onRestaurarTudo} />}
    </div>
  );
}
