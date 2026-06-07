import { CATALOGO, obterConsumoKmL } from '../data/catalogoModelos';
import type { PerfilUsuario } from '../types/perfil';

export function perfilProntoParaCommit(perfil: PerfilUsuario): boolean {
  const { marca, modelo, kmAtual } = perfil.moto;
  const modeloDados = CATALOGO[modelo];

  return (
    marca.trim().length > 0 &&
    modelo.trim().length > 0 &&
    modeloDados !== undefined &&
    modeloDados.marca === marca &&
    obterConsumoKmL(modelo) !== undefined &&
    Number.isFinite(kmAtual) &&
    kmAtual > 0
  );
}
