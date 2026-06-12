import { z } from 'zod';
import { SERVICOS_INDEPENDENTES_PADRAO } from '../context/perfilDefaults';
import { VERSAO_SCHEMA_ATUAL } from '../types/perfil';

// ──────────────────────────────────────────────
// Schema de validação de runtime do PerfilUsuario (ADR-010).
//
// Espelha fielmente `src/types/perfil.ts`. A fidelidade é amarrada por um
// teste de compatibilidade `z.infer<typeof perfilSchema>` ↔ `PerfilUsuario`
// (ver perfilSchema.test.ts) - se o tipo e o schema divergirem, o tsc quebra.
//
// É deliberadamente tolerante onde o tipo permite (`.nullable()`), para não
// gerar falso-positivo que rejeite dado bom. Validar é a fronteira de carga:
// carregar → validar; dado desconhecido/corrompido volta para o onboarding.
// ──────────────────────────────────────────────

// Enums / literais
const modoRevisao = z.enum(['autorizadas', 'independentes']);
const tipoCombustivel = z.enum(['comum', 'aditivada', 'etanol']);
const perfilPecas = z.enum(['original', 'paralela']);
const situacaoMoto = z.enum(['quitada', 'financiada', 'alugada']);
const periodicidadeSeguro = z.enum(['anual', 'mensal']);
const periodicidadeAluguel = z.enum(['mensal', 'semanal']);
const responsabilidadeCusto = z.enum(['eu', 'locador', 'dividido']);
const statusPrecoAutorizada = z.enum(['informado', 'nao_informado', 'informado_usuario']);

const numeroFinito = z.number().finite();
const dinheiroNaoNegativo = numeroFinito.min(0);
const numeroPositivo = numeroFinito.positive();
const inteiroNaoNegativo = numeroFinito.int().min(0);
const inteiroPositivo = numeroFinito.int().positive();
const idsServicosTemporais = new Set(
  SERVICOS_INDEPENDENTES_PADRAO.filter((servico) => servico.intervalKm === 0).map(
    (servico) => servico.id,
  ),
);

// Interfaces auxiliares
const configuracaoCombustivel = z.object({
  preco: numeroPositivo,
  autonomia: numeroPositivo,
});

const seguroConfig = z.object({
  valorAnual: dinheiroNaoNegativo,
  empresa: z.string().nullable(),
  periodicidade: periodicidadeSeguro,
});

const gastoCustom = z.object({
  id: z.string(),
  nome: z.string(),
  valorAnual: dinheiroNaoNegativo,
  ativo: z.boolean(),
  ehPreset: z.boolean(),
});

const responsabilidadeAluguel = z.object({
  documentos: responsabilidadeCusto,
  manutencao: responsabilidadeCusto,
  seguro: responsabilidadeCusto,
});

const categoriaDisplay = z.object({
  combustivel: z.boolean(),
  alimentacao: z.boolean(),
  manutencao: z.boolean(),
  documentacao: z.boolean(),
  internet: z.boolean(),
  seguro: z.boolean(),
  financiamento: z.boolean(),
  imprevistos: z.boolean(),
});

const filtrosManutencaoDisplay = z.object({
  revisao: z.boolean(),
  manutencaoPorPeca: z.record(z.string(), z.boolean()),
  revisaoPorServico: z.record(z.string(), z.boolean()),
});

const pecaOverride = z.object({
  id: z.string(),
  precoEditadoOriginal: dinheiroNaoNegativo.nullable(),
  precoEditadaParalela: dinheiroNaoNegativo.nullable(),
  intervaloKmEditado: inteiroPositivo.nullable(),
});

export const servicoIndependente = z
  .object({
    id: z.string(),
    nome: z.string(),
    intervalKm: inteiroNaoNegativo,
    intervaloKmInformadoUsuario: z.boolean().optional(),
    precoIndependente: dinheiroNaoNegativo,
    precoTotalAutorizada: dinheiroNaoNegativo,
    statusPrecoAutorizada: statusPrecoAutorizada.optional(),
    concessionariaIncluiPeca: z.boolean().optional(),
    incluidoNaRevisaoAutorizada: z.boolean(),
    ativo: z.boolean(),
    ehExcepcional: z.boolean(),
  })
  .superRefine((servico, ctx) => {
    if (servico.intervalKm > 0 || idsServicosTemporais.has(servico.id)) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['intervalKm'],
      message: 'Serviço km-driven precisa ter intervalKm > 0',
    });
  });

const revisaoAutorizadaOverride = z.object({
  index: inteiroNaoNegativo,
  precoPecas: dinheiroNaoNegativo,
  precoMaoDeObra: dinheiroNaoNegativo,
  precoTotal: dinheiroNaoNegativo,
});

function arredondarCentavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

const fipeCache = z.object({
  valor: dinheiroNaoNegativo,
  dataConsulta: z.string(),
  codigoFipe: z.string(),
  anoModelo: inteiroPositivo,
  marca: z.string(),
  modelo: z.string(),
});

const kmUltimaTrocas = z.object({
  oleo: inteiroNaoNegativo,
  pneuDianteiro: inteiroNaoNegativo,
  pneuTraseiro: inteiroNaoNegativo,
  kitRelacao: inteiroNaoNegativo,
  velaIgnicao: inteiroNaoNegativo,
  filtroAr: inteiroNaoNegativo,
  sapataFreioDianteiro: inteiroNaoNegativo,
  sapataFreioTraseiro: inteiroNaoNegativo,
  bateria: inteiroNaoNegativo,
  kitEmbreagem: inteiroNaoNegativo,
  kitCilindro: inteiroNaoNegativo,
  retificaCabecote: inteiroNaoNegativo,
  retificaCompleta: inteiroNaoNegativo,
});

// Perfil principal
export const perfilSchema = z
  .object({
    schemaVersion: z.literal(VERSAO_SCHEMA_ATUAL),
    userId: z.string().nullable(),
    onboardingConcluido: z.boolean(),
    apelido: z.string().nullable(),
    aplicativos: z.array(z.string()),

    moto: z.object({
      marca: z.string(),
      modelo: z.string(),
      ano: inteiroPositivo,
      kmAtual: inteiroNaoNegativo,
      kmUltimaRevisao: inteiroNaoNegativo.nullable(),
      kmUltimaTrocas,
      kmMotorRefeito: inteiroNaoNegativo.nullable(),
    }),

    perfilManutencao: z.object({
      perfilPecasGlobal: perfilPecas,
      modoRevisao,
      incluirEstimativaMaoDeObra: z.boolean().optional(),
      estimativaMaoDeObraPorServico: z.record(z.string(), z.boolean()).optional(),
    }),

    trabalho: z.object({
      kmPorDia: inteiroPositivo,
      diasPorSemana: inteiroPositivo.min(1).max(7),
      horasPorDia: numeroPositivo.max(24),
    }),

    financeiro: z.object({
      tipoGasolinaPreferida: tipoCombustivel,
      combustiveis: z.object({
        comum: configuracaoCombustivel,
        aditivada: configuracaoCombustivel,
        etanol: configuracaoCombustivel,
      }),
      internet: dinheiroNaoNegativo,
      seguro: seguroConfig,
      situacaoMoto,
      parcelaMensal: dinheiroNaoNegativo.nullable(),
      parcelasRestantes: inteiroNaoNegativo.nullable(),
      dataReferenciaParcelas: z.string().nullable(),
      aluguelValor: dinheiroNaoNegativo.nullable(),
      aluguelPeriodicidade: periodicidadeAluguel.nullable(),
      alimentacaoDia: dinheiroNaoNegativo,
      gastosCustom: z.array(gastoCustom),
      responsabilidadeAluguel,
    }),

    configuracaoDisplay: z.object({
      categoriasAtivas: categoriaDisplay,
      imprevistosSugeridosAtivos: z.record(z.string(), z.boolean()),
      filtrosManutencao: filtrosManutencaoDisplay,
    }),

    pecasOverrides: z.array(pecaOverride),
    servicosIndependentes: z.array(servicoIndependente),
    revisaoAutorizadaOverrides: z.array(revisaoAutorizadaOverride),

    fipeCache: fipeCache.nullable(),
  })
  .superRefine((perfil, ctx) => {
    perfil.revisaoAutorizadaOverrides.forEach((override, index) => {
      const totalEsperado = arredondarCentavos(override.precoPecas + override.precoMaoDeObra);
      const totalInformado = arredondarCentavos(override.precoTotal);

      if (totalInformado === totalEsperado) {
        return;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['revisaoAutorizadaOverrides', index, 'precoTotal'],
        message: 'precoTotal deve ser igual a precoPecas + precoMaoDeObra',
      });
    });
  });

// Envelope do localStorage
export const presetEntrySchema = z.object({
  presetId: z.string(),
  nome: z.string(),
  sufixo: z.string(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
  perfil: perfilSchema,
});

export const presetEntryPersistidoSchema = presetEntrySchema.extend({
  sufixo: z.string().optional(),
});
