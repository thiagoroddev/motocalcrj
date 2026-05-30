import { z } from 'zod';

// ──────────────────────────────────────────────
// Schema de validação de runtime do PerfilUsuario (ADR-010).
//
// Espelha fielmente `src/types/perfil.ts`. A fidelidade é amarrada por um
// teste de compatibilidade `z.infer<typeof perfilSchema>` ↔ `PerfilUsuario`
// (ver perfilSchema.test.ts) — se o tipo e o schema divergirem, o tsc quebra.
//
// É deliberadamente tolerante onde o tipo permite (`.nullable()`), para não
// gerar falso-positivo que rejeite dado bom. Validar é a saída da migração:
// carregar → migrar → validar (ADR-010, decisão 3).
// ──────────────────────────────────────────────

// Enums / literais
const perfilUso = z.enum(['entrega', 'passageiro']);
const modoRevisao = z.enum(['autorizadas', 'independentes']);
const tipoCombustivel = z.enum(['comum', 'aditivada', 'etanol']);
const perfilPecas = z.enum(['original', 'paralela']);
const situacaoMoto = z.enum(['quitada', 'financiada', 'alugada']);
const periodicidadeSeguro = z.enum(['anual', 'mensal']);
const periodicidadeAluguel = z.enum(['mensal', 'semanal']);
const responsabilidadeCusto = z.enum(['eu', 'locador', 'dividido']);

// Interfaces auxiliares
const configuracaoCombustivel = z.object({
  preco: z.number(),
  autonomia: z.number(),
});

const seguroConfig = z.object({
  valorAnual: z.number(),
  empresa: z.string().nullable(),
  periodicidade: periodicidadeSeguro,
});

const gastoCustom = z.object({
  id: z.string(),
  nome: z.string(),
  valorAnual: z.number(),
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
  precoEditadoOriginal: z.number().nullable(),
  precoEditadaParalela: z.number().nullable(),
  intervaloKmEditado: z.number().nullable(),
});

const servicoIndependente = z.object({
  id: z.string(),
  nome: z.string(),
  intervalKm: z.number(),
  precoIndependente: z.number(),
  precoTotalAutorizada: z.number(),
  incluidoNaRevisaoAutorizada: z.boolean(),
  ativo: z.boolean(),
  ehExcepcional: z.boolean(),
});

const revisaoAutorizadaOverride = z.object({
  index: z.number(),
  precoPecas: z.number(),
  precoMaoDeObra: z.number(),
  precoTotal: z.number(),
});

const fipeCache = z.object({
  valor: z.number(),
  dataConsulta: z.string(),
  codigoFipe: z.string(),
  anoModelo: z.number(),
  marca: z.string(),
  modelo: z.string(),
});

const kmUltimaTrocas = z.object({
  oleo: z.number(),
  pneuDianteiro: z.number(),
  pneuTraseiro: z.number(),
  kitRelacao: z.number(),
  velaIgnicao: z.number(),
  filtroAr: z.number(),
  sapataFreioDianteiro: z.number(),
  sapataFreioTraseiro: z.number(),
  bateria: z.number(),
  kitEmbreagem: z.number(),
  kitCilindro: z.number(),
  retificaCabecote: z.number(),
  retificaCompleta: z.number(),
});

// Perfil principal
export const perfilSchema = z.object({
  schemaVersion: z.number(),
  userId: z.string().nullable(),
  onboardingConcluido: z.boolean(),
  apelido: z.string().nullable(),
  aplicativos: z.array(z.string()),

  moto: z.object({
    marca: z.string(),
    modelo: z.string(),
    ano: z.number(),
    perfilUso,
    kmAtual: z.number(),
    kmUltimaRevisao: z.number().nullable(),
    kmUltimaTrocas,
    kmMotorRefeito: z.number().nullable(),
  }),

  perfilManutencao: z.object({
    perfilPecasGlobal: perfilPecas,
    modoRevisao,
  }),

  trabalho: z.object({
    kmPorDia: z.number(),
    diasPorSemana: z.number(),
    horasPorDia: z.number(),
  }),

  financeiro: z.object({
    tipoGasolinaPreferida: tipoCombustivel,
    combustiveis: z.object({
      comum: configuracaoCombustivel,
      aditivada: configuracaoCombustivel,
      etanol: configuracaoCombustivel,
    }),
    internet: z.number(),
    seguro: seguroConfig,
    situacaoMoto,
    parcelaMensal: z.number().nullable(),
    parcelasRestantes: z.number().nullable(),
    dataReferenciaParcelas: z.string().nullable(),
    aluguelMensal: z.number().nullable(),
    aluguelPeriodicidade: periodicidadeAluguel.nullable(),
    alimentacaoDia: z.number(),
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
});

// Envelope do localStorage
export const presetEntrySchema = z.object({
  presetId: z.string(),
  nome: z.string(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
  perfil: perfilSchema,
});
