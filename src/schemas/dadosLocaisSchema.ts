import { z } from 'zod';

const numeroFinito = z.number().finite();
const numeroPositivo = numeroFinito.positive();
const inteiroNaoNegativo = numeroFinito.int().min(0);

export const dadosLocaisSchema = z.object({
  ipva: z.object({
    aliquotaMotos: numeroPositivo,
    isencaoIdadeMinimaMeses: inteiroNaoNegativo,
  }),
  licenciamento: z.object({
    tabela: z.record(z.string(), numeroFinito),
  }),
  autonomiaEtanolFatorReducao: numeroPositivo,
});
