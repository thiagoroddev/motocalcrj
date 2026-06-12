import { useState } from 'react';
import { CATALOGO, getNomeModelo } from '../../../data/catalogoModelos';
import { usePerfil } from '../../../hooks/usePerfil';
import {
  gerarNomePredefinicao,
  normalizarSufixoPredefinicao,
  obterErroSufixoPredefinicao,
  sugerirSufixoPredefinicao,
  LIMITE_SUFIXO_PREDEFINICAO,
} from '../../../utils/predefinicoes';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface Props {
  onClose: () => void;
  onConfirmar: (modeloId: string, sufixo: string) => void;
}

const MODELOS = Object.values(CATALOGO);

export function DialogCriarPredefinicao({ onClose, onConfirmar }: Props) {
  const { perfil, presets } = usePerfil();
  const modeloInicial = CATALOGO[perfil.moto.modelo]?.id ?? MODELOS[0]?.id ?? '';
  const [modeloId, setModeloId] = useState(modeloInicial);
  const [sufixo, setSufixo] = useState(() => sugerirSufixoPredefinicao(modeloInicial, presets));

  const modelo = CATALOGO[modeloId];
  const erro = obterErroSufixoPredefinicao(sufixo, modeloId, presets);
  const sufixoNormalizado = normalizarSufixoPredefinicao(sufixo);
  const nomeTecnico = modeloId ? gerarNomePredefinicao(modeloId, sufixoNormalizado || '...') : '';

  function trocarModelo(novoModeloId: string) {
    setModeloId(novoModeloId);
    setSufixo(sugerirSufixoPredefinicao(novoModeloId, presets));
  }

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar nova predefinição</DialogTitle>
          <DialogDescription>
            A predefinição atual será mantida. Escolha o modelo e um sufixo para identificar a nova
            configuração.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modelo-nova-predefinicao">Modelo</Label>
            <Select value={modeloId} onValueChange={trocarModelo}>
              <SelectTrigger id="modelo-nova-predefinicao">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELOS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.marca}: {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sufixo-nova-predefinicao">Sufixo da predefinição</Label>
              <span className="text-xs text-muted-foreground">
                {sufixo.length}/{LIMITE_SUFIXO_PREDEFINICAO}
              </span>
            </div>
            <Input
              id="sufixo-nova-predefinicao"
              value={sufixo}
              maxLength={LIMITE_SUFIXO_PREDEFINICAO}
              autoFocus
              onChange={(evento) => setSufixo(evento.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby="ajuda-sufixo-nova-predefinicao"
            />
            <p
              id="ajuda-sufixo-nova-predefinicao"
              className={`text-xs ${erro ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {erro ?? 'Letras sem acento, números, hífen ou sublinhado.'}
            </p>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
            <p className="text-xs text-muted-foreground">Identificação da predefinição</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {modelo ? `${modelo.marca}: ${getNomeModelo(modelo.id)}` : 'Modelo'}
              </span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {sufixoNormalizado || '...'}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Nome técnico: {nomeTecnico}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!modelo || Boolean(erro)}
            onClick={() => onConfirmar(modeloId, sufixoNormalizado)}
          >
            Criar predefinição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
