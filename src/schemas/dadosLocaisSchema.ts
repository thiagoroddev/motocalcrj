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
    // Composição da GRT (Guia de Regularização de Taxas) do DETRAN-RJ por ano,
    // para o Detalhamento exibir as partes separadas. O total (`tabela[ano]`)
    // continua sendo a fonte do cálculo. Opcional: sem ela, exibe só o total.
    composicaoGrt: z
      .record(
        z.string(),
        z.object({ licenciamentoAnual: numeroFinito, emissaoCrlve: numeroFinito }),
      )
      .optional(),
  }),
  autonomiaEtanolFatorReducao: numeroPositivo,
});
