import { useId, useState } from 'react';
import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction, KmUltimaTrocas } from '../../types/perfil';
import { Wrench } from 'lucide-react';
import { DialogConfirmacao } from '../DialogConfirmacao';
import { IconTrocar } from '../icons';
import { iconePeca } from '../icons/pecas';
import { TituloSecao } from '@/components/TituloSecao';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { BotaoReset } from '../BotaoReset';

const COMPONENTES_TROCA: { key: keyof KmUltimaTrocas; label: string }[] = [
  { key: 'oleo', label: 'Troca de óleo' },
  { key: 'pneuDianteiro', label: 'Pneu dianteiro' },
  { key: 'pneuTraseiro', label: 'Pneu traseiro' },
  { key: 'kitRelacao', label: 'Kit relação' },
  { key: 'sapataFreioDianteiro', label: 'Sapata de freio dianteiro' },
  { key: 'sapataFreioTraseiro', label: 'Sapata de freio traseiro' },
  { key: 'bateria', label: 'Bateria' },
  { key: 'kitEmbreagem', label: 'Kit embreagem' },
  { key: 'kitCilindro', label: 'Kit cilindro' },
  { key: 'retificaCabecote', label: 'Retífica de cabeçote' },
  { key: 'retificaCompleta', label: 'Retífica completa' },
];

interface Props {
  moto: PerfilUsuario['moto'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoUltimasManutencoes({ moto, dispatch }: Props) {
  const idMotor = useId();
  const idPrefix = useId();
  const [replicaPendente, setReplicaPendente] = useState<{
    key: keyof KmUltimaTrocas;
    label: string;
    valorAtual: number;
  } | null>(null);
  const kmUltimaRevisao = moto.kmUltimaRevisao ?? 0;
  const podeReplicarKmRevisao = kmUltimaRevisao > 0;
  const temAlteracao =
    COMPONENTES_TROCA.some(({ key }) => moto.kmUltimaTrocas[key] > 0) ||
    moto.kmMotorRefeito != null;

  function resetar() {
    COMPONENTES_TROCA.forEach(({ key }) =>
      dispatch({ type: 'SET_KM_ULTIMA_TROCA', componente: key, km: 0 }),
    );
    dispatch({ type: 'SET_MOTOR_REFEITO', km: null });
  }

  function aplicarKmUltimaRevisao(key: keyof KmUltimaTrocas) {
    if (!podeReplicarKmRevisao) return;
    dispatch({ type: 'SET_KM_ULTIMA_TROCA', componente: key, km: kmUltimaRevisao });
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
          <TituloSecao icone={Wrench}>KM - últimas trocas/manutenções</TituloSecao>
          <BotaoReset desabilitado={!temAlteracao} onReset={resetar} />
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-4">
          {COMPONENTES_TROCA.map(({ key, label }) => {
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
                  placeholder="0"
                  onChange={(e) => {
                    const raw = e.target.value;
                    const v = parseInt(raw, 10);
                    if (raw === '') {
                      dispatch({ type: 'SET_KM_ULTIMA_TROCA', componente: key, km: 0 });
                      return;
                    }
                    if (!isNaN(v) && v >= 0) {
                      dispatch({ type: 'SET_KM_ULTIMA_TROCA', componente: key, km: v });
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
                  <span>Km da última revisão</span>
                </button>
              </div>
            );
          })}
        </div>
        {moto.kmAtual >= 60_000 && (
          <div className="space-y-1">
            <Label htmlFor={idMotor} className="text-xs text-muted-foreground font-normal">
              Retífica do motor (KM)
            </Label>
            <Input
              id={idMotor}
              type="number"
              inputMode="numeric"
              value={moto.kmMotorRefeito ?? ''}
              min={0}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value;
                const v = parseInt(raw, 10);
                if (raw === '') {
                  dispatch({ type: 'SET_MOTOR_REFEITO', km: null });
                  return;
                }
                if (!isNaN(v) && v >= 0) {
                  dispatch({ type: 'SET_MOTOR_REFEITO', km: v });
                }
              }}
            />
          </div>
        )}
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
