// Portão de lançamento (TASK-CHORE-024).
//
// Especificação: docs/analise-melhorias-agente.md §5.
//
// Responde a UMA pergunta: **este projeto pode ir a público?** Publicar deixa de
// ser ato de vontade e passa a ser consequência de um gate verde.
//
// Existe porque, entre a criação do checklists/43-performance.md e o primeiro
// Lighthouse do projeto, passaram 197 tarefas. Regra que não vira comando não
// acontece — e as conquistas do bloco de lançamento (headers, notas do
// Lighthouse, orçamento de bundle, auditoria) se degradariam do mesmo jeito
// silencioso se nada as medisse a cada release.
//
// Cada item recebe um dos três vereditos da norma do projeto:
//   APROVADO       - verificado, passou
//   REPROVADO      - verificado, falhou
//   NÃO EXECUTADO  - não deu para verificar -> **também reprova o portão**
//
// "NÃO EXECUTADO" reprovar é deliberado: gate que não rodou não é gate verde.
//
// Uso:
//   node scripts/gate-lancamento.mjs [--url <url>] [--relatorio-lighthouse <arquivo>]
//   npm run gate:lancamento
//
// Sem dependências externas (convenção do projeto).

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditarProducao, relatarProducao } from './audit-prod.mjs';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');

// ── Orçamentos ───────────────────────────────────────────────────────────────
// Os números vêm de medição, não de gosto. Ver TASK-REF-47 (bundle) e
// TASK-RNF-9.1 (Lighthouse). As metas ficam ABAIXO do medido para absorver
// variação entre execuções, exceto acessibilidade: as auditorias dela são
// binárias (passa/não passa), então 100 é piso, não aspiração.
const ORCAMENTO = {
  chunkMaximoKB: 500, // limiar do próprio Vite. Medido em 29/07: 313 kB.
  lighthouse: {
    performance: 90, // medido: 96
    accessibility: 100, // medido: 100 - auditorias binárias, sem margem
    'best-practices': 95, // medido: 100
    seo: 95, // medido: 100
  },
  // O limiar "bom" dos Core Web Vitals é 2500 ms, mas ele descreve o campo
  // (usuários reais, percentil 75) — não uma execução de laboratório. Duas
  // medições do MESMO build deram 2300 ms e 2592 ms: ruído de ±300 ms é normal
  // num run único. Fixar o orçamento em 2500 fazia o portão alternar entre
  // passar e reprovar sem nada mudar no código, e portão que reprova por motivo
  // irreal é abandonado. 3000 ms pega regressão de verdade (bundle dobrar,
  // recurso bloqueante novo) sem perseguir ruído.
  lcpMs: 3000,
  idadeMaximaRelatorioDias: 7,
};

// Prazo da conferência da configuração de plataforma (TASK-CHORE-027). Mesmo
// número dos riscos aceitos: 90 dias é curto o bastante para não virar carimbo
// e longo o bastante para não virar burocracia semanal.
const PRAZO_PLATAFORMA_DIAS = 90;

const HEADERS_OBRIGATORIOS = [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
];

// Padrões de alta confiança. Deliberadamente conservadores: falso positivo aqui
// bloqueia release e ensina a ignorar o portão.
const PADROES_SEGREDO = [
  { nome: 'chave AWS', re: /AKIA[0-9A-Z]{16}/ },
  { nome: 'chave privada PEM', re: /-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----/ },
  { nome: 'chave Stripe ao vivo', re: /sk_live_[0-9a-zA-Z]{20,}/ },
  { nome: 'token GitHub', re: /gh[pousr]_[0-9a-zA-Z]{36}/ },
  { nome: 'chave Google API', re: /AIza[0-9A-Za-z_-]{35}/ },
];

const args = process.argv.slice(2);
function arg(nome, padrao) {
  const i = args.indexOf(nome);
  return i >= 0 && args[i + 1] ? args[i + 1] : padrao;
}

const URL_ALVO = arg('--url', 'https://motocustorj.vercel.app/');
const RELATORIO_LH = join(RAIZ, arg('--relatorio-lighthouse', 'relatorios/lighthouse.json'));

const APROVADO = 'APROVADO';
const REPROVADO = 'REPROVADO';
const NAO_EXECUTADO = 'NÃO EXECUTADO';

// ── Itens do portão ──────────────────────────────────────────────────────────

function item1Verify() {
  try {
    execSync('npm run verify', { cwd: RAIZ, encoding: 'utf8', stdio: 'pipe' });
    return { veredito: APROVADO, detalhe: 'typecheck + lint + testes verdes' };
  } catch (erro) {
    const saida = String(erro.stdout ?? erro.message)
      .trim()
      .split('\n')
      .slice(-3)
      .join(' | ');
    return { veredito: REPROVADO, detalhe: `npm run verify falhou: ${saida}` };
  }
}

function item2Auditoria() {
  try {
    const r = auditarProducao();
    const reprovou = r.problemas.length > 0 || r.rasRuins.length > 0 || r.registroAusente;
    return {
      veredito: reprovou ? REPROVADO : APROVADO,
      detalhe: relatarProducao(r)
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(2, 6)
        .join(' | '),
    };
  } catch (erro) {
    return { veredito: NAO_EXECUTADO, detalhe: `auditoria não rodou: ${erro.message}` };
  }
}

async function item3Headers() {
  try {
    const resposta = await fetch(`${URL_ALVO}?gate=${Date.now()}`, {
      method: 'GET',
      redirect: 'follow',
    });
    const faltando = HEADERS_OBRIGATORIOS.filter((h) => !resposta.headers.get(h));
    // Descarta o corpo de propósito: sem isso o socket keep-alive fica aberto e
    // o `process.exit()` no fim derruba o Node com asserção do libuv no Windows
    // (exit 127 em vez do código do veredito, o que quebraria a leitura no CI).
    await resposta.arrayBuffer();
    return faltando.length === 0
      ? {
          veredito: APROVADO,
          detalhe: `${HEADERS_OBRIGATORIOS.length} de ${HEADERS_OBRIGATORIOS.length} presentes`,
        }
      : { veredito: REPROVADO, detalhe: `faltando: ${faltando.join(', ')}` };
  } catch (erro) {
    return {
      veredito: NAO_EXECUTADO,
      detalhe: `não deu para consultar ${URL_ALVO}: ${erro.message}`,
    };
  }
}

function item4Bundle() {
  const dir = join(RAIZ, 'dist', 'assets');
  if (!existsSync(dir)) {
    return { veredito: NAO_EXECUTADO, detalhe: 'dist/ ausente — rode `npm run build` antes' };
  }
  const jsFiles = readdirSync(dir).filter((f) => extname(f) === '.js');
  if (jsFiles.length === 0)
    return { veredito: NAO_EXECUTADO, detalhe: 'nenhum .js em dist/assets' };

  const acima = jsFiles
    .map((f) => ({ f, kb: statSync(join(dir, f)).size / 1024 }))
    .filter((x) => x.kb > ORCAMENTO.chunkMaximoKB);

  const maior = Math.max(...jsFiles.map((f) => statSync(join(dir, f)).size / 1024));
  return acima.length === 0
    ? {
        veredito: APROVADO,
        detalhe: `maior chunk ${maior.toFixed(0)} kB (orçamento ${ORCAMENTO.chunkMaximoKB} kB)`,
      }
    : {
        veredito: REPROVADO,
        detalhe: `acima do orçamento: ${acima.map((x) => `${x.f} ${x.kb.toFixed(0)} kB`).join(', ')}`,
      };
}

function item5Segredos() {
  const dir = join(RAIZ, 'dist');
  if (!existsSync(dir)) return { veredito: NAO_EXECUTADO, detalhe: 'dist/ ausente' };

  const extensoes = new Set(['.js', '.css', '.html', '.webmanifest', '.json', '.txt']);
  const achados = [];

  (function varrer(atual) {
    for (const entrada of readdirSync(atual, { withFileTypes: true })) {
      const caminho = join(atual, entrada.name);
      if (entrada.isDirectory()) {
        varrer(caminho);
      } else if (extensoes.has(extname(entrada.name))) {
        const conteudo = readFileSync(caminho, 'utf8');
        for (const p of PADROES_SEGREDO) {
          if (p.re.test(conteudo)) achados.push(`${p.nome} em ${entrada.name}`);
        }
      }
    }
  })(dir);

  return achados.length === 0
    ? {
        veredito: APROVADO,
        detalhe: `nenhum dos ${PADROES_SEGREDO.length} padrões encontrado no dist/`,
      }
    : { veredito: REPROVADO, detalhe: achados.join('; ') };
}

function item6TarefasCriticas() {
  const caminho = join(RAIZ, 'docs', 'tarefas', 'pendentes.md');
  if (!existsSync(caminho)) return { veredito: NAO_EXECUTADO, detalhe: 'pendentes.md ausente' };

  const conteudo = readFileSync(caminho, 'utf8');
  const abertas = [];

  // Formato bloco (§3.2 do ciclo): tarefas Imediata trazem Valor e Urgência em
  // linhas próprias. Riscado (~~) significa concluída na nota de ordem.
  const blocos = conteudo.split(/^## /m).slice(1);
  for (const bloco of blocos) {
    const titulo = bloco.split('\n')[0].trim();
    if (!/^TASK-/.test(titulo)) continue;
    const critico = /\*\*Valor:\*\*\s*Crítico/i.test(bloco);
    const imediata = /\*\*Urgência:\*\*\s*IMEDIATA/i.test(bloco);
    if (critico && imediata) abertas.push(titulo.split(' ')[0]);
  }

  // Formato tabela: | ID | Título | Modo | Valor | Urgência | ...
  for (const linha of conteudo.split('\n')) {
    const m = linha.match(
      /^\|\s*(TASK-[\w.-]+)\s*\|[^|]*\|[^|]*\|\s*Crítico\s*\|\s*Imediata\s*\|/i,
    );
    if (m) abertas.push(m[1]);
  }

  return abertas.length === 0
    ? { veredito: APROVADO, detalhe: 'nenhuma tarefa Crítico + IMEDIATA aberta' }
    : { veredito: REPROVADO, detalhe: `abertas: ${[...new Set(abertas)].join(', ')}` };
}

function item7Lighthouse() {
  if (!existsSync(RELATORIO_LH)) {
    return {
      veredito: NAO_EXECUTADO,
      detalhe:
        `relatório ausente. Gere com: npx lighthouse ${URL_ALVO} --output=json ` +
        `--output-path=relatorios/lighthouse.json --chrome-flags="--headless=new"`,
    };
  }

  let r;
  try {
    r = JSON.parse(readFileSync(RELATORIO_LH, 'utf8'));
  } catch (erro) {
    return { veredito: NAO_EXECUTADO, detalhe: `relatório ilegível: ${erro.message}` };
  }

  // Relatório velho é pior que relatório ausente: passa a impressão de medição
  // quando na verdade descreve um build que já não existe.
  const idadeDias = (Date.now() - new Date(r.fetchTime).getTime()) / 86_400_000;
  if (!Number.isFinite(idadeDias))
    return { veredito: NAO_EXECUTADO, detalhe: 'relatório sem fetchTime' };
  if (idadeDias > ORCAMENTO.idadeMaximaRelatorioDias) {
    return {
      veredito: NAO_EXECUTADO,
      detalhe: `relatório com ${idadeDias.toFixed(0)} dias (máximo ${ORCAMENTO.idadeMaximaRelatorioDias}) — remeça`,
    };
  }

  const falhas = [];
  for (const [categoria, minimo] of Object.entries(ORCAMENTO.lighthouse)) {
    const nota = Math.round((r.categories?.[categoria]?.score ?? 0) * 100);
    if (nota < minimo) falhas.push(`${categoria} ${nota} < ${minimo}`);
  }

  const lcp = r.audits?.['largest-contentful-paint']?.numericValue;
  if (typeof lcp === 'number' && lcp > ORCAMENTO.lcpMs) {
    falhas.push(`LCP ${Math.round(lcp)} ms > ${ORCAMENTO.lcpMs} ms`);
  }

  const notas = Object.keys(ORCAMENTO.lighthouse)
    .map((c) => `${c.slice(0, 4)} ${Math.round((r.categories?.[c]?.score ?? 0) * 100)}`)
    .join(' · ');

  return falhas.length === 0
    ? {
        veredito: APROVADO,
        detalhe: `${notas} · LCP ${Math.round(lcp ?? 0)} ms (relatório de ${idadeDias.toFixed(1)} dia)`,
      }
    : { veredito: REPROVADO, detalhe: falhas.join('; ') };
}

function item8Documentos() {
  const faltando = [];
  for (const arquivo of ['LICENSE.md', 'README.md']) {
    if (!existsSync(join(RAIZ, arquivo))) faltando.push(arquivo);
  }
  // O app precisa expor privacidade ao usuário, não só no repositório.
  const perfil = join(RAIZ, 'src', 'pages', 'PaginaPerfil.tsx');
  if (!existsSync(perfil) || !/Privacidade/i.test(readFileSync(perfil, 'utf8'))) {
    faltando.push('aviso de privacidade acessível no app');
  }
  return faltando.length === 0
    ? { veredito: APROVADO, detalhe: 'LICENSE, README e privacidade no app presentes' }
    : { veredito: REPROVADO, detalhe: `faltando: ${faltando.join(', ')}` };
}

/**
 * Configuração de plataforma (TASK-CHORE-027).
 *
 * Branch protection e os dois toggles do Dependabot vivem no painel do GitHub e
 * a API exige token para consultá-los — este item é o limite da regra "toda
 * regra vira comando". O que dá para verificar por máquina é se **alguém olhou
 * e quando**, e é só isso que este item afirma. Verificação fraca de propósito;
 * a mensagem diz isso em voz alta para ninguém confundir com garantia.
 */
function item9Plataforma() {
  const caminho = join(RAIZ, 'docs', 'contexto-projeto-ai.md');
  if (!existsSync(caminho)) {
    return { veredito: NAO_EXECUTADO, detalhe: 'contexto-projeto-ai.md ausente' };
  }

  const doc = readFileSync(caminho, 'utf8');
  const secao = doc.split(/^##\s+\d+\.\s+Configuração de Plataforma/m)[1];
  if (!secao) {
    return {
      veredito: REPROVADO,
      detalhe: 'seção "Configuração de Plataforma" não encontrada no contexto-projeto-ai.md',
    };
  }
  const corpo = secao.split(/^##\s/m)[0];

  const data = corpo.match(/\*\*Última conferência:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  if (!data) {
    return {
      veredito: REPROVADO,
      detalhe: 'registro sem "Última conferência" em formato AAAA-MM-DD',
    };
  }

  const conferido = new Date(data[1]);
  const dias = Math.round((Date.now() - conferido.getTime()) / 86_400_000);
  if (dias > PRAZO_PLATAFORMA_DIAS) {
    return {
      veredito: REPROVADO,
      detalhe: `conferência de ${data[1]} tem ${dias} dias (máximo ${PRAZO_PLATAFORMA_DIAS})`,
    };
  }

  // Linhas de tabela: | item | onde | status |
  const pendentes = [];
  for (const linha of corpo.split('\n')) {
    const celulas = linha.split('|').map((c) => c.trim());
    if (celulas.length < 5 || /^-+$/.test(celulas[1]) || celulas[1] === 'Item') continue;
    const [, item, , status] = celulas;
    if (!/^ligado$/i.test(status)) pendentes.push(`${item} (${status})`);
  }

  if (pendentes.length > 0) {
    return {
      veredito: REPROVADO,
      detalhe: `${pendentes.length} item(ns) não confirmado(s): ${pendentes.join('; ')}`,
    };
  }

  return {
    veredito: APROVADO,
    detalhe: `registro de ${data[1]} (${dias} dias), todos ligados — atesta que alguém conferiu, não que o toggle esteja ativo`,
  };
}

// ── Execução ─────────────────────────────────────────────────────────────────

const SIMBOLO = { [APROVADO]: 'ok  ', [REPROVADO]: 'FALHA', [NAO_EXECUTADO]: '?   ' };

const itens = [
  ['verify (typecheck + lint + testes)', item1Verify],
  ['auditoria de produção + riscos aceitos', item2Auditoria],
  ['headers de segurança na resposta servida', item3Headers],
  ['orçamento de bundle', item4Bundle],
  ['nenhum segredo no bundle', item5Segredos],
  ['nenhuma tarefa Crítico + IMEDIATA aberta', item6TarefasCriticas],
  ['metas de Lighthouse', item7Lighthouse],
  ['LICENSE, README e privacidade', item8Documentos],
  ['configuração de plataforma registrada', item9Plataforma],
];

console.info(`\nPortão de lançamento — ${URL_ALVO}\n`);

const resultados = [];
for (const [nome, executar] of itens) {
  const r = await executar();
  resultados.push({ nome, ...r });
  console.info(`  [${SIMBOLO[r.veredito]}] ${nome}`);
  console.info(`           ${r.detalhe}`);
}

const reprovados = resultados.filter((r) => r.veredito === REPROVADO);
const naoExecutados = resultados.filter((r) => r.veredito === NAO_EXECUTADO);
const liberado = reprovados.length === 0 && naoExecutados.length === 0;

console.info('');
console.info(`  PRONTO PARA PÚBLICO? ${liberado ? 'SIM' : 'NÃO'}`);
if (!liberado) {
  if (reprovados.length)
    console.info(
      `  ${reprovados.length} reprovado(s): ${reprovados.map((r) => r.nome).join(', ')}`,
    );
  if (naoExecutados.length) {
    console.info(
      `  ${naoExecutados.length} não executado(s): ${naoExecutados.map((r) => r.nome).join(', ')}`,
    );
    console.info(
      '  (gate que não rodou não é gate verde — ver docs/analise-melhorias-agente.md §7.1.1)',
    );
  }
}
console.info('');

// `process.exitCode` em vez de `process.exit()`: o segundo encerra o processo
// com handles ainda abertos e, no Windows, o Node aborta com asserção do libuv
// devolvendo 127 — que o CI leria como erro de execução em vez do veredito.
process.exitCode = liberado ? 0 : 1;
