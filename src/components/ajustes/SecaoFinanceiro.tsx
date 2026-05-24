import type { Dispatch } from 'react';
import type { PerfilUsuario, PerfilAction } from '../../types/perfil';
import { CampoSeguro } from './campos/CampoSeguro';
import { CampoAlimentacao } from './campos/CampoAlimentacao';
import { CampoInternet } from './campos/CampoInternet';

interface Props {
  financeiro: PerfilUsuario['financeiro'];
  dispatch: Dispatch<PerfilAction>;
}

export function SecaoFinanceiro({ financeiro, dispatch }: Props) {
  return (
    <>
      <CampoSeguro financeiro={financeiro} dispatch={dispatch} />
      <CampoAlimentacao financeiro={financeiro} dispatch={dispatch} />
      <CampoInternet financeiro={financeiro} dispatch={dispatch} />
    </>
  );
}
