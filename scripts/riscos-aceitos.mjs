// Leitor e validador do Registro de Riscos Aceitos (TASK-CHORE-024).
//
// Especificação: docs/analise-melhorias-agente.md §11.
// Registro:      docs/seguranca/riscos-aceitos.md
//
// Este módulo não decide nada sozinho — ele entrega entradas já classificadas
// para o `audit-prod.mjs` e o `gate-lancamento.mjs`. A regra que importa é que
// uma entrada só COBRE um advisory se for válida E estiver no prazo:
//
//   - sem `evidencia`            -> inválida (registro sem prova é opinião)
//   - sem `tarefa_de_saida`      -> inválida (aceitar sem saída é desistir)
//   - sem `aceito_por`           -> inválida (a IA não se concede exceção)
//   - sem/`data_revisao` inválida-> inválida
//   - prazo > 90 dias do aceite  -> inválida (a norma limita a 90)
//   - `data_revisao` no passado  -> VENCIDA
//
// Entrada vencida é tratada como MAIS GRAVE que o advisory original: significa
// que o processo de revisão parou de funcionar. Ela não cobre nada.
//
// Sem dependências externas (convenção do projeto): traz um parser do
// subconjunto de YAML que o formato documentado usa — escalares, blocos `>`
// (dobrado) e `|` (literal).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
export const CAMINHO_REGISTRO = join(RAIZ, 'docs', 'seguranca', 'riscos-aceitos.md');

const PRAZO_MAXIMO_DIAS = 90;
const OBRIGATORIOS = [
  'id',
  'advisory',
  'evidencia',
  'tarefa_de_saida',
  'aceito_por',
  'data_aceite',
  'data_revisao',
];

/** Extrai os blocos ```yaml de um markdown. */
function extrairBlocosYaml(markdown) {
  const blocos = [];
  const linhas = markdown.split(/\r?\n/);
  let dentro = false;
  let atual = [];

  for (const linha of linhas) {
    if (!dentro && /^```ya?ml\s*$/.test(linha.trim())) {
      dentro = true;
      atual = [];
      continue;
    }
    if (dentro && /^```\s*$/.test(linha.trim())) {
      dentro = false;
      blocos.push(atual.join('\n'));
      continue;
    }
    if (dentro) atual.push(linha);
  }
  return blocos;
}

/**
 * Parser do subconjunto de YAML usado no registro. Suporta:
 *   chave: valor            (com ou sem aspas, comentário `#` no fim)
 *   chave: >                (bloco dobrado  - linhas juntadas por espaço)
 *   chave: |                (bloco literal  - linhas juntadas por \n)
 * Não suporta listas nem aninhamento — o formato documentado não usa.
 */
function parsearYamlSimples(texto) {
  const obj = {};
  const linhas = texto.split('\n');

  for (let i = 0; i < linhas.length; i += 1) {
    const linha = linhas[i];
    if (!linha.trim() || linha.trimStart().startsWith('#')) continue;

    const casa = linha.match(/^([a-z_]+):\s*(.*)$/i);
    if (!casa) continue;

    const chave = casa[1];
    let valor = casa[2];

    if (valor === '>' || valor === '|') {
      const dobrado = valor === '>';
      const corpo = [];
      while (i + 1 < linhas.length && (/^\s{2,}\S/.test(linhas[i + 1]) || !linhas[i + 1].trim())) {
        i += 1;
        const conteudo = linhas[i].trim();
        // Comentário dentro de bloco literal é conteúdo (a `evidencia` usa `#`
        // para o resultado esperado do comando), então não é filtrado aqui.
        corpo.push(conteudo);
      }
      const limpo = corpo.filter((l, idx) => l || (idx > 0 && idx < corpo.length - 1));
      obj[chave] = dobrado ? limpo.join(' ').trim() : limpo.join('\n').trim();
      continue;
    }

    // Remove comentário de fim de linha, preservando `#` dentro de aspas.
    if (!/^['"]/.test(valor)) valor = valor.replace(/\s+#.*$/, '');
    obj[chave] = valor.trim().replace(/^['"]|['"]$/g, '');
  }
  return obj;
}

function diasEntre(de, ate) {
  return Math.round((ate.getTime() - de.getTime()) / 86_400_000);
}

/**
 * Lê o registro e classifica cada entrada.
 * @returns {{ entradas: Array, porAdvisory: Map<string, object> }}
 */
export function lerRiscosAceitos({ caminho = CAMINHO_REGISTRO, hoje = new Date() } = {}) {
  let markdown;
  try {
    markdown = readFileSync(caminho, 'utf8');
  } catch {
    return { entradas: [], porAdvisory: new Map(), ausente: true };
  }

  // Só a seção "Ativos" vale; "Encerrados" é histórico e não cobre nada.
  const secaoAtivos = markdown.split(/^##\s+Encerrados\s*$/m)[0];

  const entradas = extrairBlocosYaml(secaoAtivos).map((bloco) => {
    const dados = parsearYamlSimples(bloco);
    const problemas = [];

    for (const campo of OBRIGATORIOS) {
      if (!dados[campo]) problemas.push(`campo obrigatório ausente: ${campo}`);
    }

    const aceite = dados.data_aceite ? new Date(dados.data_aceite) : null;
    const revisao = dados.data_revisao ? new Date(dados.data_revisao) : null;

    if (revisao && Number.isNaN(revisao.getTime()))
      problemas.push('data_revisao não é uma data válida');
    if (aceite && Number.isNaN(aceite.getTime()))
      problemas.push('data_aceite não é uma data válida');

    let prazoDias = null;
    if (aceite && revisao && !Number.isNaN(aceite.getTime()) && !Number.isNaN(revisao.getTime())) {
      prazoDias = diasEntre(aceite, revisao);
      if (prazoDias > PRAZO_MAXIMO_DIAS) {
        problemas.push(`prazo de ${prazoDias} dias excede o máximo de ${PRAZO_MAXIMO_DIAS}`);
      }
    }

    const vencida = revisao && !Number.isNaN(revisao.getTime()) && revisao < hoje;
    const diasRestantes =
      revisao && !Number.isNaN(revisao.getTime()) ? diasEntre(hoje, revisao) : null;

    return {
      ...dados,
      problemas,
      valida: problemas.length === 0,
      vencida: Boolean(vencida),
      diasRestantes,
      cobre: problemas.length === 0 && !vencida,
    };
  });

  const porAdvisory = new Map();
  for (const entrada of entradas) {
    if (entrada.advisory) porAdvisory.set(entrada.advisory, entrada);
  }

  return { entradas, porAdvisory, ausente: false };
}

/**
 * Resolve o campo `via` do `npm audit` até o conjunto de IDs de advisory.
 *
 * Necessário porque um mesmo risco aparece sob dois nomes: `react-router` traz
 * o advisory, e `react-router-dom` entra só como efeito transitivo
 * (`via: ['react-router']`, sem advisory próprio). Exigir cobertura por NOME
 * obrigaria a registrar dois RAs para um risco só; exigir por ADVISORY resolve.
 */
export function advisoriesDe(nome, vulnerabilidades, vistos = new Set()) {
  if (vistos.has(nome)) return new Set();
  vistos.add(nome);

  const vuln = vulnerabilidades[nome];
  if (!vuln) return new Set();

  const ids = new Set();
  for (const via of vuln.via ?? []) {
    if (typeof via === 'object' && via.url) {
      ids.add(via.url.split('/').pop());
    } else if (typeof via === 'string') {
      for (const id of advisoriesDe(via, vulnerabilidades, vistos)) ids.add(id);
    }
  }
  return ids;
}

/** Nomes dos pacotes que estão na árvore de PRODUÇÃO, lidos do lockfile.
 *
 * Por que o lockfile e não `npm ls --omit=dev`: o `.npmrc` deste projeto força
 * `include=dev` (TASK-CHORE-011) e `include` vence `omit`, então o comando
 * devolve a árvore inteira. O lockfile marca `dev: true` por pacote e não
 * depende de precedência de flag.
 */
export function pacotesDeProducao({ raiz = RAIZ } = {}) {
  const lock = JSON.parse(readFileSync(join(raiz, 'package-lock.json'), 'utf8'));
  const nomes = new Set();
  for (const [caminho, meta] of Object.entries(lock.packages ?? {})) {
    if (!caminho.startsWith('node_modules/') || meta.dev) continue;
    nomes.add(caminho.replace(/^node_modules\//, '').replace(/.*node_modules\//, ''));
  }
  return nomes;
}
