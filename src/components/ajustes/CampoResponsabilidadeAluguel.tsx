import type { Dispatch } from 'react';
import type {
  PerfilUsuario,
  PerfilAction,
  ResponsabilidadeAluguel,
  ResponsabilidadeCusto,
} from '../../types/perfil';
import { Segmentado } from '../Segmentado';
import { BotaoReset } from '../BotaoReset';

const CAMPOS: { key: keyof ResponsabilidadeAluguel; label: string }[] = [
  { key: 'documentos', label: 'Documentação (IPVA, licenciamento)' },
  { key: 'manutencao', label: 'Manutenção' },
  { key: 'seguro', label: 'Seguro' },
];

const OPCOES: { label: string; valor: ResponsabilidadeCusto }[] = [
  { label: 'Eu pago', valor: 'eu' },
  { label: 'Locador', valor: 'locador' },
  { label: 'Dividido', valor: 'dividido' },
];

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

export function CampoResponsabilidadeAluguel({ financeiro, dispatch }: Props) {
  if (financeiro.situacaoMoto !== 'alugada') return null;

  const { responsabilidadeAluguel } = financeiro;
  const temAlteracao = CAMPOS.some(({ key }) => responsabilidadeAluguel[key] !== 'eu');

  function resetar() {
    dispatch({
      type: 'SET_RESPONSABILIDADE_ALUGUEL',
      config: { documentos: 'eu', manutencao: 'eu', seguro: 'eu' },
    });
  }

  return (
    <section className="bg-card rounded-lg p-md space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-neutro">Responsabilidade do aluguel</p>
        <BotaoReset desabilitado={!temAlteracao} onReset={resetar} />
      </div>
      {CAMPOS.map(({ key, label }) => (
        <div key={key} className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Segmentado
            opcoes={OPCOES}
            valor={responsabilidadeAluguel[key]}
            onChange={(v) =>
              dispatch({
                type: 'SET_RESPONSABILIDADE_ALUGUEL',
                config: { [key]: v as ResponsabilidadeCusto },
              })
            }
          />
        </div>
      ))}
    </section>
  );
}
