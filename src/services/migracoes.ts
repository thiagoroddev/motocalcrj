import { VERSAO_SCHEMA_ATUAL } from '../types/perfil';

type RegistroDesconhecido = Record<string, unknown>;

function ehRegistro(valor: unknown): valor is RegistroDesconhecido {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function temPropriedade(registro: RegistroDesconhecido, propriedade: string): boolean {
  return Object.prototype.hasOwnProperty.call(registro, propriedade);
}

export function migrarPerfil(perfil: unknown): unknown {
  if (!ehRegistro(perfil)) {
    return perfil;
  }

  if (perfil.schemaVersion === VERSAO_SCHEMA_ATUAL) {
    return perfil;
  }

  if (perfil.schemaVersion !== 1 || !ehRegistro(perfil.financeiro)) {
    return perfil;
  }

  const financeiro = perfil.financeiro;
  if (!temPropriedade(financeiro, 'aluguelMensal')) {
    return perfil;
  }

  const { aluguelMensal, ...financeiroSemAluguelMensal } = financeiro;
  return {
    ...perfil,
    schemaVersion: VERSAO_SCHEMA_ATUAL,
    financeiro: {
      ...financeiroSemAluguelMensal,
      aluguelValor: aluguelMensal,
    },
  };
}
