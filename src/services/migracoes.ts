import type {
  PerfilUsuario,
  ServicoIndependente,
  FiltrosManutencaoDisplay,
  KmUltimaTrocas,
} from '../types/perfil';
import {
  SERVICOS_INDEPENDENTES_PADRAO,
  SERVICO_RETIFICA_CABECOTE_PADRAO,
  SERVICO_RETIFICA_COMPLETA_PADRAO,
  PRESETS_GASTOS_PADRAO,
  KM_ULTIMA_TROCAS_PADRAO,
} from '../context/perfilDefaults';

// ──────────────────────────────────────────────
// Cadeia de migração de schema do perfil (v5 → v23), extraída de
// PerfilContext pela TASK-REF-28. Cada passo assume o shape produzido pelo
// anterior; a validação do resultado final mora em schemas/perfilSchema (ADR-010).
// ──────────────────────────────────────────────

export function migrarPerfil(perfil: PerfilUsuario): PerfilUsuario {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dados = perfil as any;

  if (dados.schemaVersion < 6) {
    // v5 → v6: descarta servicosMaoDeObra (orphan), inicializa servicosIndependentes
    const resto = { ...dados };
    delete resto.servicosMaoDeObra;
    dados = { ...resto, schemaVersion: 6, servicosIndependentes: SERVICOS_INDEPENDENTES_PADRAO };
  }

  if (dados.schemaVersion === 6) {
    // v6 → v7: adiciona kmUltimaTrocas e kmMotorRefeito em moto
    dados = {
      ...dados,
      schemaVersion: 7,
      moto: {
        ...dados.moto,
        kmUltimaTrocas: {
          oleo: dados.moto.kmUltimaRevisao ?? 0,
          pneuDianteiro: 0,
          pneuTraseiro: 0,
          kitRelacao: 0,
        },
        kmMotorRefeito: null,
      },
    };
  }

  if (dados.schemaVersion === 7) {
    // v7 → v8: remove configuracaoDisplay.modoExibicao (ADR-003 / REF-18)
    const configDisplaySemModo = { ...(dados.configuracaoDisplay ?? {}) };
    delete configDisplaySemModo.modoExibicao;
    dados = { ...dados, schemaVersion: 8, configuracaoDisplay: configDisplaySemModo };
  }

  if (dados.schemaVersion === 8) {
    // v8 → v9: remove campos mortos consolidados pela REF-19 (ADR-003 / ADR-006)
    // - configuracaoDisplay.modoOficinDisplay (nunca lido)
    // - perfilManutencao.precoMaoDeObraIndependente, .frequenciaRevisaoKm (aposentados por ADR-004)
    // - historicoManutencao, diarioTrabalho (Registros adiados por ADR-003)
    const novoConfigDisplay = { ...(dados.configuracaoDisplay ?? {}) };
    delete novoConfigDisplay.modoOficinDisplay;
    const novoPerfilManutencao = { ...(dados.perfilManutencao ?? {}) };
    delete novoPerfilManutencao.precoMaoDeObraIndependente;
    delete novoPerfilManutencao.frequenciaRevisaoKm;
    const novoPerfil = { ...dados, schemaVersion: 9 };
    delete novoPerfil.historicoManutencao;
    delete novoPerfil.diarioTrabalho;
    novoPerfil.configuracaoDisplay = novoConfigDisplay;
    novoPerfil.perfilManutencao = novoPerfilManutencao;
    dados = novoPerfil;
  }

  if (dados.schemaVersion === 9) {
    // v9 → v10: remove seguro.tem (ADR-005 / REF-21).
    // Custo de seguro passa a ser derivado de valorAnual > 0.
    // Preserva a intenção do usuário: se tem===false, força valorAnual: 0
    // antes de deletar tem (perfis com tem=false mantinham valorAnual antigo
    // "esquecido"; pós-migração ingênua passariam a contar seguro).
    const novoSeguro = { ...(dados.financeiro?.seguro ?? {}) };
    if (novoSeguro.tem === false) {
      novoSeguro.valorAnual = 0;
    }
    delete novoSeguro.tem;
    dados = {
      ...dados,
      schemaVersion: 10,
      financeiro: { ...dados.financeiro, seguro: novoSeguro },
    };
  }

  if (dados.schemaVersion === 10) {
    // v10 → v11: substitui "fazer motor" por duas retíficas (ADR-006 / RF-6.10).
    // Se o usuário já tinha editado o item legado, a retífica completa herda
    // preço, ativação e intervalo customizado (exceto o intervalo padrão antigo).
    // Dados v10 ainda tinham o campo legado `precoMaoDeObra` (renomeado para
    // `precoIndependente` apenas na v14→v15) — daí o cast estendido.
    type ServicoLegadoV10 = { id: string; precoMaoDeObra?: number; intervalKm: number };
    const servicos = Array.isArray(dados.servicosIndependentes)
      ? (dados.servicosIndependentes as ServicoLegadoV10[])
      : (SERVICOS_INDEPENDENTES_PADRAO as unknown as ServicoLegadoV10[]);
    const fazerMotorLegado = servicos.find((s) => s.id === 'fazer-motor');
    const cabecoteExistente = servicos.find((s) => s.id === 'retifica-cabecote');
    const completaExistente = servicos.find((s) => s.id === 'retifica-completa');
    const servicosSemMotorERetificas = servicos.filter(
      (s) => s.id !== 'fazer-motor' && s.id !== 'retifica-cabecote' && s.id !== 'retifica-completa',
    );

    const retificaCompletaMigrada =
      completaExistente ??
      (fazerMotorLegado
        ? {
            ...(SERVICO_RETIFICA_COMPLETA_PADRAO as unknown as ServicoLegadoV10),
            precoMaoDeObra:
              fazerMotorLegado.precoMaoDeObra ?? SERVICO_RETIFICA_COMPLETA_PADRAO.precoIndependente,
            intervalKm:
              fazerMotorLegado.intervalKm === 70000
                ? SERVICO_RETIFICA_COMPLETA_PADRAO.intervalKm
                : fazerMotorLegado.intervalKm,
          }
        : (SERVICO_RETIFICA_COMPLETA_PADRAO as unknown as ServicoLegadoV10));

    dados = {
      ...dados,
      schemaVersion: 11,
      servicosIndependentes: [
        ...servicosSemMotorERetificas,
        cabecoteExistente ?? SERVICO_RETIFICA_CABECOTE_PADRAO,
        retificaCompletaMigrada,
      ],
    };
  }

  if (dados.schemaVersion === 11) {
    // v11 → v12: retíficas deixam de entrar em Revisão/Manutenção e passam
    // a aparecer em Imprevistos como sugestões desligadas por padrão.
    const servicos = Array.isArray(dados.servicosIndependentes)
      ? (dados.servicosIndependentes as ServicoIndependente[])
      : SERVICOS_INDEPENDENTES_PADRAO;
    dados = {
      ...dados,
      schemaVersion: 12,
      servicosIndependentes: servicos.map((servico) =>
        servico.ehExcepcional ? { ...servico, ativo: false } : servico,
      ),
    };
  }

  if (dados.schemaVersion === 12) {
    // v12 → v13: gastosCustom vira lista fechada de presets (Multa, Sinistros,
    // Outros). Gastos livres pré-existentes são descartados — não há usuários
    // em produção e a Decisão 2 da TASK-RF-6.9 fechou o modelo de cadastro
    // avulso. Campo valorMensal eliminado em favor de valorAnual (padrão único
    // acumulado, ver ADR-003/ADR-006).
    dados = {
      ...dados,
      schemaVersion: 13,
      financeiro: {
        ...dados.financeiro,
        gastosCustom: PRESETS_GASTOS_PADRAO,
      },
    };
  }

  if (dados.schemaVersion === 13) {
    // v13 → v14: toggles de imprevistos persistem no perfil (TASK-RF-6.11 cleanup).
    // - Nova chave `categoriasAtivas.imprevistos` (default true — categoria
    //   sempre apareceu sem toggle; mantém comportamento anterior).
    // - Novo mapa `imprevistosSugeridosAtivos` (default vazio = retíficas
    //   continuam desligadas, como na v12).
    const configDisplay = { ...(dados.configuracaoDisplay ?? { categoriasAtivas: {} }) };
    const categoriasAtivas = {
      ...(configDisplay.categoriasAtivas ?? {}),
      imprevistos:
        typeof configDisplay.categoriasAtivas?.imprevistos === 'boolean'
          ? configDisplay.categoriasAtivas.imprevistos
          : true,
    };
    const imprevistosSugeridosAtivos =
      configDisplay.imprevistosSugeridosAtivos &&
      typeof configDisplay.imprevistosSugeridosAtivos === 'object'
        ? configDisplay.imprevistosSugeridosAtivos
        : {};
    dados = {
      ...dados,
      schemaVersion: 14,
      configuracaoDisplay: {
        ...configDisplay,
        categoriasAtivas,
        imprevistosSugeridosAtivos,
      },
    };
  }

  if (dados.schemaVersion === 14) {
    // v14 → v15: ServicoIndependente ganha precoIndependente (rename
    // de precoMaoDeObra), precoTotalAutorizada e incluidoNaRevisaoAutorizada
    // (ADR-007). Além disso, mescla defaults novos que apareceram após v14
    // (sapatas dianteira/traseira) — perfis salvos em v14 não os tinham.
    // Preserva edições do usuário no campo legado migrando para o novo nome;
    // popula campos novos pelos defaults por id em SERVICOS_INDEPENDENTES_PADRAO.
    // Ids desconhecidos (custom no futuro) recebem precoTotalAutorizada=0,
    // incluidoNaRevisaoAutorizada=false.
    type ServicoLegadoV14 = {
      id: string;
      nome: string;
      intervalKm: number;
      precoMaoDeObra?: number;
      ativo: boolean;
      ehExcepcional: boolean;
    };
    const servicosLegados = Array.isArray(dados.servicosIndependentes)
      ? (dados.servicosIndependentes as ServicoLegadoV14[])
      : (SERVICOS_INDEPENDENTES_PADRAO as ServicoIndependente[]).map((s) => ({
          ...s,
          precoMaoDeObra: s.precoIndependente,
        }));
    const servicosMigrados: ServicoIndependente[] = servicosLegados.map((s) => {
      const padrao = SERVICOS_INDEPENDENTES_PADRAO.find((p) => p.id === s.id);
      return {
        id: s.id,
        nome: s.nome,
        intervalKm: s.intervalKm,
        precoIndependente: s.precoMaoDeObra ?? padrao?.precoIndependente ?? 0,
        precoTotalAutorizada: padrao?.precoTotalAutorizada ?? 0,
        incluidoNaRevisaoAutorizada: padrao?.incluidoNaRevisaoAutorizada ?? false,
        ativo: s.ativo,
        ehExcepcional: s.ehExcepcional,
      };
    });
    const idsExistentes = new Set(servicosMigrados.map((s) => s.id));
    const defaultsFaltantes = SERVICOS_INDEPENDENTES_PADRAO.filter((p) => !idsExistentes.has(p.id));
    dados = {
      ...dados,
      schemaVersion: 15,
      servicosIndependentes: [...servicosMigrados, ...defaultsFaltantes],
    };
  }

  if (dados.schemaVersion === 15) {
    // v15 → v16: adiciona ServicoIndependente defaults novos que apareceram
    // após o bump da v15 (sapatas dianteira/traseira). Necessário porque
    // perfis já em v15 não re-executam a migration v14→v15 e ficariam sem
    // os ids novos. Idempotente: só adiciona ids ainda ausentes.
    const servicos = Array.isArray(dados.servicosIndependentes)
      ? (dados.servicosIndependentes as ServicoIndependente[])
      : SERVICOS_INDEPENDENTES_PADRAO;
    const idsExistentes = new Set(servicos.map((s) => s.id));
    const defaultsFaltantes = SERVICOS_INDEPENDENTES_PADRAO.filter((p) => !idsExistentes.has(p.id));
    dados = {
      ...dados,
      schemaVersion: 16,
      servicosIndependentes: [...servicos, ...defaultsFaltantes],
    };
  }

  if (dados.schemaVersion === 16) {
    // v16 → v17: filtros finos de Manutenção deixam de ser estado local do
    // Detalhamento e passam a persistir no perfil (TASK-BG-014).
    const configDisplay = dados.configuracaoDisplay;
    const filtrosExistentes = (
      configDisplay as { filtrosManutencao?: Partial<FiltrosManutencaoDisplay> }
    ).filtrosManutencao;
    dados = {
      ...dados,
      schemaVersion: 17,
      configuracaoDisplay: {
        ...configDisplay,
        filtrosManutencao: {
          revisao:
            typeof filtrosExistentes?.revisao === 'boolean' ? filtrosExistentes.revisao : true,
          manutencaoPorPeca: filtrosExistentes?.manutencaoPorPeca ?? {},
          revisaoPorServico: filtrosExistentes?.revisaoPorServico ?? {},
        },
      },
    };
  }

  if (dados.schemaVersion === 17) {
    // v17 → v18: TASK-RF-6.14 adiciona 3 novos ServicoIndependente defaults
    // (troca-bateria, troca-kit-embreagem, troca-kit-cilindro). Idempotente:
    // só inclui ids ainda ausentes para preservar edições do usuário.
    const servicos = Array.isArray(dados.servicosIndependentes)
      ? (dados.servicosIndependentes as ServicoIndependente[])
      : SERVICOS_INDEPENDENTES_PADRAO;
    const idsExistentes = new Set(servicos.map((s) => s.id));
    const defaultsFaltantes = SERVICOS_INDEPENDENTES_PADRAO.filter((p) => !idsExistentes.has(p.id));
    dados = {
      ...dados,
      schemaVersion: 18,
      servicosIndependentes: [...servicos, ...defaultsFaltantes],
    };
  }

  if (dados.schemaVersion === 18) {
    // v18 → v19: TASK-RF-6.13 amplia o histórico de km da última troca para
    // peças de vida útil longa e retíficas. Preserva os 4 campos existentes.
    const kmUltimaTrocasExistente = (dados.moto?.kmUltimaTrocas ?? {}) as Partial<KmUltimaTrocas>;
    dados = {
      ...dados,
      schemaVersion: 19,
      moto: {
        ...dados.moto,
        kmUltimaTrocas: {
          ...KM_ULTIMA_TROCAS_PADRAO,
          ...kmUltimaTrocasExistente,
        },
      },
    };
  }

  if (dados.schemaVersion === 19) {
    // v19 → v20: TASK-RF-6.24 remove kitRevisao do histórico editável. O item
    // continua automático no cálculo independente e incluso no pacote Honda.
    const kmUltimaTrocasLegado = (dados.moto?.kmUltimaTrocas ?? {}) as Partial<KmUltimaTrocas> & {
      kitRevisao?: number;
    };
    const kmUltimaTrocasSemKitRevisao = { ...kmUltimaTrocasLegado };
    delete kmUltimaTrocasSemKitRevisao.kitRevisao;
    dados = {
      ...dados,
      schemaVersion: 20,
      moto: {
        ...dados.moto,
        kmUltimaTrocas: {
          ...KM_ULTIMA_TROCAS_PADRAO,
          ...kmUltimaTrocasSemKitRevisao,
        },
      },
    };
  }

  if (dados.schemaVersion === 20) {
    // v20 → v21: TASK-BG-011 — renomeia precoMaoDeObraIndependente → precoIndependente.
    // O campo era sobrecarregado (M.O. p/ serviços normais, peças+M.O. p/
    // excepcionais); o novo nome neutro evita a confusão. Preserva o valor.
    const servicos = Array.isArray(dados.servicosIndependentes)
      ? dados.servicosIndependentes
      : SERVICOS_INDEPENDENTES_PADRAO;
    dados = {
      ...dados,
      schemaVersion: 21,
      servicosIndependentes: servicos.map((s: Record<string, unknown>) => {
        const { precoMaoDeObraIndependente, precoIndependente, ...resto } = s;
        return {
          ...resto,
          precoIndependente: precoIndependente ?? precoMaoDeObraIndependente ?? 0,
        };
      }),
    };
  }

  if (dados.schemaVersion === 21) {
    // v21 → v22: TASK-BG-012 — sobe o default da Revisão Geral Independente de
    // R$80 para R$400 (R$80 estava muito abaixo do mercado RJ; caso real: 12k
    // custou R$400). Bumpa apenas perfis que ainda têm o default antigo (80),
    // preservando qualquer edição do usuário.
    const servicos = Array.isArray(dados.servicosIndependentes)
      ? dados.servicosIndependentes
      : SERVICOS_INDEPENDENTES_PADRAO;
    dados = {
      ...dados,
      schemaVersion: 22,
      servicosIndependentes: servicos.map((s: Record<string, unknown>) =>
        s.id === 'revisao-geral' && s.precoIndependente === 80
          ? { ...s, precoIndependente: 400 }
          : s,
      ),
    };
  }

  if (dados.schemaVersion === 22) {
    // v22 → v23: TASK-RF-6.18 — financiamento passa a decrementar pelo tempo.
    // Adiciona financeiro.dataReferenciaParcelas (modelagem Snapshot). Para perfis
    // financiados com parcelas informadas, ancora a referência na data da migração
    // (hoje): preserva o valor atual e começa a decrementar a partir daqui. Demais
    // casos ficam null. Idempotente.
    const financeiro = dados.financeiro ?? {};
    const ehFinanciadaComParcelas =
      financeiro.situacaoMoto === 'financiada' && financeiro.parcelasRestantes != null;
    dados = {
      ...dados,
      schemaVersion: 23,
      financeiro: {
        ...financeiro,
        dataReferenciaParcelas:
          financeiro.dataReferenciaParcelas ??
          (ehFinanciadaComParcelas ? new Date().toISOString() : null),
      },
    };
  }

  return dados as PerfilUsuario;
}
