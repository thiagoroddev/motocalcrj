// Integridade dos documentos em markdown (TASK-CHORE-023).
//
// Por que existe: o `.github/agents/` tinha 33 arquivos com extensão dupla
// `.md.md` e 504 links apontando para `https://claude.ai/...` — nenhum
// resolvia. E o README e o `docs/uso-de-ia.md` apresentam essa pasta
// publicamente como prova do processo de engenharia do projeto. Doc que promete
// e não entrega é pior que doc ausente.
//
// Falha (exit 1) quando encontra:
//   - arquivo com extensão dupla `.md.md`
//   - link para `claude.ai` (resquício de documento colado de conversa)
//   - link relativo que não resolve para arquivo ou diretório existente
//
// CASE-SENSITIVE DE PROPÓSITO. O Windows tem sistema de arquivos insensível a
// maiúsculas, então um link para `32-adr.md` apontando para o arquivo
// `32-ADR.md` funciona na máquina do autor e quebra no GitHub e no Linux. Este
// verificador compara byte a byte para pegar exatamente esse caso.
//
// Uso:
//   node scripts/check-docs.mjs [pasta...]     (padrão: .github/agents e docs)
//   npm run lint:docs
//
// Sem dependências externas (convenção do projeto).

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const PASTAS_PADRAO = ['.github/agents', 'docs'];

// Exclusões de verificação de LINK (a checagem de `claude.ai` e de extensão
// dupla continua valendo em toda a árvore). Cada uma tem motivo — exclusão sem
// motivo é silenciamento, e isso está catalogado como anti-padrão do projeto.
const SEM_CHECAGEM_DE_LINK = [
  // Templates são MODELOS copiados para outros projetos: seus links descrevem a
  // estrutura do projeto ALVO (`./arquitetura/ADR/ADR-001.md`), não deste.
  // Resolvê-los aqui seria corromper o material.
  '.github/agents/geral-robusto/templates/',
  // Registros históricos: tarefa concluída é IMUTÁVEL por regra do ciclo
  // (`20-ciclo-tarefa.md` §5.5) e ADR descreve a decisão como ela foi tomada.
  // Corrigir link neles reescreveria história — o ADR-006, por exemplo, cita um
  // documento que existia à época e foi removido depois.
  'docs/tarefas/concluidas/',
  'docs/arquitetura/ADR/',
  // O nome diz.
  'trash-drafts-ignore',
];

/** Lista recursiva de arquivos markdown. */
function listarMarkdown(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) listarMarkdown(caminho, acc);
    else if (entrada.name.endsWith('.md')) acc.push(caminho);
  }
  return acc;
}

/**
 * Confere existência respeitando maiúsculas/minúsculas, mesmo em sistema de
 * arquivos insensível. `existsSync` sozinho diria que `32-adr.md` existe quando
 * o arquivo é `32-ADR.md` — que é justamente o defeito que este verificador
 * precisa pegar.
 */
function existeExato(caminho) {
  if (!existsSync(caminho)) return false;
  const pai = dirname(caminho);
  const nome = basename(caminho);
  try {
    return readdirSync(pai).includes(nome);
  } catch {
    return false;
  }
}

/**
 * Apaga o código do conteúdo, preservando a estrutura de linhas.
 *
 * Bloco cercado (```) e trecho inline (`assim`) são **exemplo**, não link — o
 * GitHub não os renderiza como link. Verificá-los é falso positivo, e falso
 * positivo em gate ensina a ignorar gate.
 *
 * O caso inline foi encontrado pelo próprio verificador na TASK-DOC-022: o
 * arquivo da TASK-CHORE-023 escreve `](https://claude.ai/...` entre crases para
 * documentar o padrão procurado, e a checagem de `claude.ai` — que rodava sobre
 * o conteúdo cru — acusou o documento que descreve a correção.
 */
function semCodigo(conteudo) {
  let dentroDeCerca = false;

  return conteudo
    .split(/\r?\n/)
    .map((linha) => {
      if (/^\s*```/.test(linha)) {
        dentroDeCerca = !dentroDeCerca;
        return '';
      }
      if (dentroDeCerca) return '';
      return linha.replace(/`[^`]*`/g, '');
    })
    .join('\n');
}

/** Extrai os destinos de link markdown `[texto](destino)`. */
function extrairLinks(conteudo) {
  const destinos = [];
  for (const m of conteudo.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    destinos.push(m[1]);
  }
  return destinos;
}

export function verificarDocs({ raiz = RAIZ, pastas = PASTAS_PADRAO } = {}) {
  const problemas = [];
  const arquivos = pastas.flatMap((p) => listarMarkdown(join(raiz, p)));

  // Extensão dupla: procurada em toda a árvore das pastas alvo.
  for (const pasta of pastas) {
    const varrer = (dir) => {
      if (!existsSync(dir)) return;
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const c = join(dir, e.name);
        if (e.isDirectory()) varrer(c);
        else if (e.name.endsWith('.md.md')) {
          problemas.push({ arquivo: relative(raiz, c), tipo: 'extensão dupla', detalhe: e.name });
        }
      }
    };
    varrer(join(raiz, pasta));
  }

  for (const arquivo of arquivos) {
    const conteudo = semCodigo(readFileSync(arquivo, 'utf8'));
    const rel = relative(raiz, arquivo).split(sep).join('/');

    // Só conta quando é DESTINO de link — `](https://claude.ai/...)`. Mencionar
    // o domínio em prosa é legítimo: a análise e o backlog descrevem justamente
    // o problema dos 504 links, e flagá-los seria falso positivo.
    const comoDestino = conteudo.match(/\]\(\s*https?:\/\/claude\.ai/g) ?? [];
    if (comoDestino.length > 0) {
      problemas.push({
        arquivo: rel,
        tipo: 'link para claude.ai',
        detalhe: `${comoDestino.length} ocorrência(s)`,
      });
    }

    const relBarras = rel;
    if (SEM_CHECAGEM_DE_LINK.some((p) => relBarras.includes(p))) continue;

    for (const destino of extrairLinks(conteudo)) {
      // Ignora o que não é caminho de arquivo do repositório.
      if (/^(https?:|mailto:|#)/.test(destino)) continue;

      const semAncora = destino.split('#')[0];
      if (!semAncora) continue;

      const alvo = resolve(dirname(arquivo), decodeURIComponent(semAncora));
      if (!existeExato(alvo)) {
        const dica = existsSync(alvo) ? ' (existe com outra caixa — quebra no Linux/GitHub)' : '';
        problemas.push({ arquivo: rel, tipo: 'link quebrado', detalhe: destino + dica });
      }
    }
  }

  return { problemas, arquivosVerificados: arquivos.length };
}

// Execução direta (mesma guarda dos outros scripts — ver TASK-BG-040).
const executadoDireto =
  process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;

if (executadoDireto) {
  const pastas = process.argv.slice(2).length ? process.argv.slice(2) : PASTAS_PADRAO;
  const { problemas, arquivosVerificados } = verificarDocs({ pastas });

  console.info(
    `\nIntegridade de documentos — ${arquivosVerificados} arquivos em ${pastas.join(', ')}\n`,
  );

  if (problemas.length === 0) {
    console.info('  ✓ nenhum problema encontrado\n');
  } else {
    const porTipo = {};
    for (const p of problemas) (porTipo[p.tipo] ??= []).push(p);
    for (const [tipo, lista] of Object.entries(porTipo)) {
      console.error(`  ${lista.length} × ${tipo}`);
      for (const p of lista.slice(0, 15)) console.error(`      ${p.arquivo}: ${p.detalhe}`);
      if (lista.length > 15) console.error(`      ... e mais ${lista.length - 15}`);
    }
    console.error('');
  }

  process.exitCode = problemas.length === 0 ? 0 : 1;
}
