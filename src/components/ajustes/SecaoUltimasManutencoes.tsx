import { useId, useState } from 'react';
import type { Dispatch } from 'react';
import type {
  PerfilUsuario,
  PerfilAction,
  KmUltimaTrocas,
  BateriaConfig,
} from '../../types/perfil';
import { Wrench } from 'lucide-react';
import { DialogConfirmacao } from '../DialogConfirmacao';
import { IconTrocar } from '../icons';
import { iconePeca } from '../icons/pecas';
import { TituloSecao } from '@/components/TituloSecao';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { BotaoReset } from '../BotaoReset';
import { CardBateria } from './CardBateria';
import { obterPreset } from '../../data/repositorioPresets';
import { chavesKmUltimaTrocaDoPreset } from '../../utils/calculos';

// Catálogo curado de itens rastreáveis em "Últimas manutenções", em ordem de
// exibição. A lista mostrada é filtrada pelo modelo (RF-6.39): só aparece o que
// o preset usa — freio dianteiro/traseiro segue o tipo do modelo (disco × tambor).
// Itens só-revisão (vela, filtros) ficam fora de propósito.
const LABELS_KM_ULTIMA_TROCA: { key: keyof KmUltimaTrocas; label: string }[] = [
  { key: 'oleo', label: 'Troca de óleo' },
  { key: 'pneuDianteiro', label: 'Pneu dianteiro' },
  { key: 'pneuTraseiro', label: 'Pneu traseiro' },
  { key: 'kitRelacao', label: 'Kit transmissão' },
  { key: 'sapataFreioDianteiro', label: 'Sapata de freio dianteiro' },
  { key: 'discoFreioDianteiro', label: 'Disco de freio dianteiro' },
  { key: 'pastilhaFreioDianteiro', label: 'Pastilha de freio dianteira' },
  { key: 'sapataFreioTraseiro', label: 'Sapata de freio traseiro' },
  { key: 'discoFreioTraseiro', label: 'Disco de freio traseiro' },
  { key: 'pastilhaFreioTraseiro', label: 'Pastilha de freio traseira' },
  // Bateria saiu daqui (TASK-RF-8.2): card próprio por data + vida útil em anos (RF-8.3).
  { key: 'kitEmbreagem', label: 'Kit embreagem' },
  { key: 'kitCilindro', label: 'Kit cilindro' },
  { key: 'caixaDirecao', label: 'Kit caixa de direção' },
];

interface Props {
  moto: PerfilUsuario['moto'];
  bateria: BateriaConfig;
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoUltimasManutencoes({ moto, bateria, dispatch }: Props) {
  const idPrefix = useId();
  const [replicaPendente, setReplicaPendente] = useState<{
    key: keyof KmUltimaTrocas;
    label: string;
    valorAtual: number;
  } | null>(null);
  const kmUltimaRevisao = moto.kmUltimaRevisao ?? 0;
  const podeReplicarKmRevisao = kmUltimaRevisao > 0;
  // Não faz sentido ter trocado uma peça num km que a moto ainda não atingiu.
  // Capamos o registro ao km atual (quando informado) para evitar dado inválido
  // que distorce o ciclo ancorado. Com kmAtual 0 (não informado) não capamos,
  // senão travaria toda digitação.
  const kmAtual = moto.kmAtual;
  const caparAoKmAtual = (km: number): number => (kmAtual > 0 ? Math.min(km, kmAtual) : km);
  // Lista model-aware (RF-6.39): só os itens que o preset do modelo realmente usa
  // (ex.: disco/pastilha num modelo a disco; sapata num a tambor). Sem preset
  // (modelo desconhecido), mostra o catálogo completo como fallback seguro.
  const preset = obterPreset(moto.modelo);
  const chavesDoModelo = preset ? chavesKmUltimaTrocaDoPreset(preset) : null;
  const componentes = chavesDoModelo
    ? LABELS_KM_ULTIMA_TROCA.filter(({ key }) => chavesDoModelo.has(key))
    : LABELS_KM_ULTIMA_TROCA;
  const temAlteracao = componentes.some(({ key }) => moto.kmUltimaTrocas[key] > 0);

  function resetar() {
    componentes.forEach(({ key }) =>
      dispatch({ type: 'SET_KM_ULTIMA_TROCA', componente: key, km: 0 }),
    );
  }

  function aplicarKmUltimaRevisao(key: keyof KmUltimaTrocas) {
    if (!podeReplicarKmRevisao) return;
    dispatch({ type: 'SET_KM_ULTIMA_TROCA', componente: key, km: caparAoKmAtual(kmUltimaRevisao) });
  }

  function prepararReplicaKmRevisao(key: keyof KmUltimaTrocas, label: string) {
    if (!podeReplicarKmRevisao) return;
    const valorAtual = moto.kmUltimaTrocas[key];
    if (valorAtual > 0 && valorAtual !== kmUltimaRevisao) {
      setReplicaPendente({ key, label, valorAtual });
      return;
    }
    aplicarKmUltimaRevisao(key);
  }

  return (
    <>
      <section className="bg-card rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <TituloSecao icone={Wrench}>Registro últimas trocas/manutenções</TituloSecao>
          <BotaoReset desabilitado={!temAlteracao} onReset={resetar} />
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-4">
          {componentes.map(({ key, label }) => {
            const inputId = `${idPrefix}-${key}`;
            const IconePeca = iconePeca(key);
            return (
              <div key={key} className="space-y-1">
                <Label
                  htmlFor={inputId}
                  className="flex items-center gap-1.5 text-xs text-foreground font-medium"
                >
                  <IconePeca className="w-4 h-4 text-primary shrink-0" />
                  {label}
                </Label>
                <Input
                  id={inputId}
                  type="number"
                  inputMode="numeric"
                  value={moto.kmUltimaTrocas[key] || ''}
                  min={0}
                  max={kmAtual > 0 ? kmAtual : undefined}
                  placeholder="0"
                  onChange={(e) => {
                    const raw = e.target.value;
                    const v = parseInt(raw, 10);
                    if (raw === '') {
                      dispatch({ type: 'SET_KM_ULTIMA_TROCA', componente: key, km: 0 });
                      return;
                    }
                    if (!isNaN(v) && v >= 0) {
                      dispatch({
                        type: 'SET_KM_ULTIMA_TROCA',
                        componente: key,
                        km: caparAoKmAtual(v),
                      });
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!podeReplicarKmRevisao}
                  onClick={() => prepararReplicaKmRevisao(key, label)}
                  className="inline-flex min-h-6 w-full items-center gap-1.5 rounded-md px-1 text-left text-[10px] leading-tight text-muted-foreground/70 transition-colors hover:text-primary disabled:opacity-40 disabled:hover:text-muted-foreground/70"
                  aria-label={`Usar km da última revisão em ${label}`}
                  title={
                    podeReplicarKmRevisao
                      ? `Usar ${kmUltimaRevisao.toLocaleString('pt-BR')} km`
                      : 'Informe o km da última revisão'
                  }
                >
                  <IconTrocar className="h-3.5 w-3.5 shrink-0" />
                  <span>Clique aqui para usar km da última revisão</span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border/60 pt-3">
          <CardBateria bateria={bateria} dispatch={dispatch} />
        </div>
      </section>
      <DialogConfirmacao
        aberto={replicaPendente != null}
        onOpenChange={(aberto) => {
          if (!aberto) setReplicaPendente(null);
        }}
        onConfirmar={() => {
          if (replicaPendente) aplicarKmUltimaRevisao(replicaPendente.key);
          setReplicaPendente(null);
        }}
        titulo="Substituir km registrado?"
        descricao={
          replicaPendente
            ? `${replicaPendente.label} já está com ${replicaPendente.valorAtual.toLocaleString(
                'pt-BR',
              )} km. Ao confirmar, o valor será substituído por ${kmUltimaRevisao.toLocaleString(
                'pt-BR',
              )} km da última revisão. Esta ação não pode ser desfeita.`
            : ''
        }
        rotuloConfirmar="Substituir"
      />
    </>
  );
}
