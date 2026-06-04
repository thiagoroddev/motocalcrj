import { z } from 'zod';
import { servicoIndependente } from './perfilSchema';

const numeroFinito = z.number().finite();
const numeroPositivo = numeroFinito.positive();
const numeroNaoNegativo = numeroFinito.min(0);
const inteiroPositivo = numeroFinito.int().positive();
const inteiroNaoNegativo = numeroFinito.int().min(0);

export const pecaPresetSchema = z.object({
  id: z.string(),
  nome: z.string(),
  intervaloKm: inteiroPositivo.optional(),
  intervaloKmEntrega: inteiroPositivo.optional(),
  intervaloMeses: inteiroNaoNegativo.optional(),
  precoOriginal: numeroNaoNegativo,
  precoParalela: numeroNaoNegativo,
  incluidoNaRevisaoAutorizada: z.boolean(),
});

export const pneuPresetSchema = z.object({
  id: z.string(),
  posicao: z.enum(['dianteiro', 'traseiro']),
  vidaUtilKm: inteiroPositivo,
  precoOriginal: numeroNaoNegativo,
  precoParalela: numeroNaoNegativo,
});

export const servicosExecutadosRevisaoPresetSchema = z.object({
  categoria: z.string(),
  servicos: z.array(z.string()),
});

export const revisaoAutorizadaPresetSchema = z.object({
  intervaloKm: inteiroPositivo,
  intervaloMeses: inteiroNaoNegativo,
  precoPecas: numeroNaoNegativo,
  precoMaoDeObra: numeroNaoNegativo,
  precoTotal: numeroNaoNegativo,
  itensSubstituidos: z.array(z.string()),
  servicosExecutados: z.array(servicosExecutadosRevisaoPresetSchema),
});

export const presetMotoSchema = z.object({
  marca: z.string().optional(),
  modelo: z.string().optional(),
  nomeCurto: z.string().optional(),
  nomeFipe: z.string().optional(),
  codigoFipe: z.string().optional(),
  tabelaFipe: z.record(z.string(), numeroFinito).optional(),
  aceitaEtanol: z.boolean().optional(),
  consumoKmL: numeroPositivo,
  consumoKmLComBau: numeroPositivo,
  pecas: z.array(pecaPresetSchema),
  pneus: z.array(pneuPresetSchema),
  revisaoAutorizada: z.array(revisaoAutorizadaPresetSchema),
  servicosManutencao: z.array(servicoIndependente).optional(),
  fatorMaoDeObra: numeroPositivo.optional(),
});

export const presetMotoCatalogoSchema = presetMotoSchema.extend({
  marca: z.string(),
  modelo: z.string(),
  nomeCurto: z.string(),
  nomeFipe: z.string(),
  codigoFipe: z.string(),
  tabelaFipe: z.record(z.string(), numeroFinito),
  aceitaEtanol: z.boolean(),
});
