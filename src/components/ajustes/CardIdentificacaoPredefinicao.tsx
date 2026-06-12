import { useId, useState } from 'react';
import { Tag } from 'lucide-react';
import type { Dispatch } from 'react';
import type { PerfilAction, PresetEntry } from '../../types/perfil';
import { getNomeModelo } from '../../data/catalogoModelos';
import {
  gerarNomePredefinicao,
  LIMITE_SUFIXO_PREDEFINICAO,
  normalizarSufixoPredefinicao,
  obterErroSufixoPredefinicao,
} from '../../utils/predefinicoes';
import { TituloSecao } from '../TituloSecao';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface Props {
  preset: PresetEntry;
  presets: PresetEntry[];
  dispatch: Dispatch<PerfilAction>;
}

export function CardIdentificacaoPredefinicao({ preset, presets, dispatch }: Props) {
  const idModelo = useId();
  const idSufixo = useId();
  const [sufixo, setSufixo] = useState(preset.sufixo);
  const normalizado = normalizarSufixoPredefinicao(sufixo);
  const erro = obterErroSufixoPredefinicao(
    sufixo,
    preset.perfil.moto.modelo,
    presets,
    preset.presetId,
  );
  const alterado = normalizado !== preset.sufixo;

  function salvar() {
    if (erro || !alterado) {
      return;
    }

    setSufixo(normalizado);
    dispatch({
      type: 'RENOMEAR_PREDEFINICAO',
      presetId: preset.presetId,
      sufixo: normalizado,
    });
  }

  return (
    <section className="space-y-3 rounded-lg bg-card p-4">
      <TituloSecao icone={Tag}>Identificação da predefinição</TituloSecao>
      <p className="text-xs text-muted-foreground">
        O sufixo diferencia suas configurações sem alterar o nome oficial do modelo.
      </p>

      <div className="space-y-1">
        <Label htmlFor={idModelo} className="text-xs font-normal text-muted-foreground">
          Modelo
        </Label>
        <Input
          id={idModelo}
          value={`${preset.perfil.moto.marca}: ${getNomeModelo(preset.perfil.moto.modelo)}`}
          readOnly
          className="text-muted-foreground"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={idSufixo} className="text-xs font-normal text-muted-foreground">
            Sufixo da predefinição
          </Label>
          <span className="text-xs text-muted-foreground">
            {sufixo.length}/{LIMITE_SUFIXO_PREDEFINICAO}
          </span>
        </div>
        <Input
          id={idSufixo}
          value={sufixo}
          maxLength={LIMITE_SUFIXO_PREDEFINICAO}
          onChange={(evento) => setSufixo(evento.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={`${idSufixo}-ajuda`}
        />
        <p
          id={`${idSufixo}-ajuda`}
          className={`text-xs ${erro ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {erro ?? `Nome técnico: ${gerarNomePredefinicao(preset.perfil.moto.modelo, normalizado)}`}
        </p>
      </div>

      <Button className="w-full" disabled={Boolean(erro) || !alterado} onClick={salvar}>
        Salvar sufixo
      </Button>
    </section>
  );
}
