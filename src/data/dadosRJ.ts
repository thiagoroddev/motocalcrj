import dadosRJJson from './dados_rj.json';
import { dadosLocaisSchema } from '../schemas/dadosLocaisSchema';

/**
 * Constantes regulatórias do RJ (`dados_rj.json`) parseadas e validadas uma única
 * vez pelo `dadosLocaisSchema`. Fonte canônica única — consumida pelo cálculo
 * (`useCustos`), pelo onboarding (Passo 3, alíquota de IPVA) e pela derivação de
 * autonomia no etanol (`autonomiaEtanolFatorReducao`).
 */
export const dadosRJ = dadosLocaisSchema.parse(dadosRJJson);
