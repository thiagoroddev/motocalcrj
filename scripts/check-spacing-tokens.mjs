// Guard-rail da TASK-REF-26 / ADR-008.
//
// Impede a volta da colisão que causou a TASK-BG-009: tokens de spacing
// nomeados (--spacing-sm/md/lg/xl...) sequestram a escala `max-w-*` do
// Tailwind v4 (max-w-lg vira 24px). A regra do projeto é usar a escala
// numérica padrão do Tailwind/shadcn (p-4, gap-2, ...) e nunca redefinir
// --spacing-<chave-nomeada> em CSS.
//
// Falha (exit 1) se encontrar:
//   1. utilities de spacing com sufixo nomeado: (p|m|gap|space...)-(xs|sm|md|lg|xl)
//   2. redefinição de --spacing-(xs|sm|md|lg|xl) em CSS
//
// Sem dependências externas — roda no `npm run lint` e no CI.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DIR_SRC = join(RAIZ, 'src');

// Prefixos das utilities que resolvem pela escala de SPACING do Tailwind — as
// únicas onde uma chave nomeada (xs/sm/md/lg/xl) é não-canônica e indica o token
// customizado que causou a TASK-BG-009. Sizing/position (max-w, min-h, w, h,
// inset, top...) usam a escala de container e aceitam chaves nomeadas
// legitimamente (ex.: `max-w-lg` = 32rem) — por isso NÃO entram aqui.
const PREFIXOS_SPACING = [
  'p',
  'px',
  'py',
  'pt',
  'pb',
  'pl',
  'pr',
  'ps',
  'pe',
  'm',
  'mx',
  'my',
  'mt',
  'mb',
  'ml',
  'mr',
  'ms',
  'me',
  'gap',
  'gap-x',
  'gap-y',
  'space-x',
  'space-y',
  'scroll-m',
  'scroll-p',
];
const CHAVES_NOMEADAS = ['xs', 'sm', 'md', 'lg', 'xl'];

// (^|separador) (prefixo)-(chave) (fim|separador) — separadores: aspas, espaço, crase, backtick.
const REGEX_UTILITY = new RegExp(
  `(?<![\\w-])(?:${PREFIXOS_SPACING.join('|')})-(?:${CHAVES_NOMEADAS.join('|')})(?![\\w-])`,
  'g',
);
const REGEX_TOKEN_CSS = new RegExp(`--spacing-(?:${CHAVES_NOMEADAS.join('|')})\\b`, 'g');

const EXTENSOES = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);

function listarArquivos(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      saida.push(...listarArquivos(caminho));
    } else if (EXTENSOES.has(extname(caminho))) {
      saida.push(caminho);
    }
  }
  return saida;
}

const violacoes = [];

for (const arquivo of listarArquivos(DIR_SRC)) {
  const conteudo = readFileSync(arquivo, 'utf8');
  const linhas = conteudo.split('\n');
  const regexArquivo = extname(arquivo) === '.css' ? REGEX_TOKEN_CSS : REGEX_UTILITY;
  linhas.forEach((linha, i) => {
    const achados = linha.match(regexArquivo);
    if (achados) {
      const rel = arquivo.slice(RAIZ.length + 1).replace(/\\/g, '/');
      violacoes.push(`  ${rel}:${i + 1}  →  ${[...new Set(achados)].join(', ')}`);
    }
  });
}

if (violacoes.length > 0) {
  console.error(
    '\n✗ check-spacing-tokens: uso de chaves de spacing nomeadas (xs/sm/md/lg/xl) detectado.\n' +
      '  Use a escala numérica padrão do Tailwind (p-4, gap-2, ...). Ver ADR-008.\n',
  );
  console.error(violacoes.join('\n'));
  console.error('');
  process.exit(1);
}

console.info('✓ check-spacing-tokens: nenhuma chave de spacing nomeada encontrada.');
