import { config } from 'zod';

/**
 * Desliga a compilação JIT do Zod (TASK-RNF-015, corrigido na TASK-RNF-9.1).
 *
 * Por padrão o Zod v4 compila cada schema numa função otimizada usando o
 * construtor `Function` — que é `eval` para efeito de CSP. Como a política do
 * app usa `script-src 'self'` sem `'unsafe-eval'` (justamente a diretiva que
 * contém XSS e dependência comprometida), a tentativa é bloqueada e o navegador
 * registra uma violação a cada carregamento.
 *
 * **Este módulo existe por causa da ordem de avaliação.** Em ES modules, todos
 * os imports de um arquivo são avaliados antes do corpo dele. A primeira versão
 * chamava `config({ jitless: true })` no corpo do `main.tsx`, o que rodava tarde
 * demais: `main.tsx` importa `App` → `PerfilProvider` → `reconstruirEstado` →
 * `repositorioPresets`, e este último **valida os 16 presets com Zod já no
 * import**. O Zod portanto tentava o `eval` antes de a configuração existir.
 * O app continuava funcionando (o Zod tem fallback quando a sonda falha), mas a
 * violação de CSP aparecia no painel Issues e derrubava a nota de Best
 * Practices do Lighthouse.
 *
 * Por isso a configuração virou um módulo de efeito colateral: importado como a
 * **primeira** linha do entry, ele roda antes de qualquer schema ser tocado.
 *
 * ⚠️ Não transformar em função exportada nem mover para dentro de outro módulo:
 * o valor está em ser o primeiro import do `main.tsx`.
 */
config({ jitless: true });
