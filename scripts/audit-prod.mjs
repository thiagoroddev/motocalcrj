// Auditoria de dependências de PRODUÇÃO, ciente do Registro de Riscos Aceitos.
// TASK-CHORE-024. Roda no `npm run verify`, no CI e dentro do gate:lancamento.
//
// Por que não `npm audit --omit=dev --audit-level=high`:
//   1. o `.npmrc` deste projeto força `include=dev` (TASK-CHORE-011) e `include`
//      vence `omit`, então `--omit=dev` não surte efeito — a auditoria acusaria
//      CVE do Vitest como se fosse problema de produção;
//   2. `--audit-level` não sabe distinguir "advisory analisado, inalcançável,
//      com prazo e responsável" de "ninguém olhou". Essa distinção é o que
//      separa gestão de risco de silenciar aviso.
//
// Falha (exit 1) quando:
//   - advisory HIGH/CRITICAL atinge a árvore de produção e NÃO tem RA que o cubra
//   - algum RA está inválido (falta evidência, tarefa de saída, responsável...)
//   - algum RA está VENCIDO (tratado como mais grave que o advisory original)
//
// Reporta sem falhar: advisories de dev/build e severidade moderate/low.

import { execSync } from 'node:child_process';
import { advisoriesDe, lerRiscosAceitos, pacotesDeProducao } from './riscos-aceitos.mjs';

const BLOQUEANTES = new Set(['high', 'critical']);

function rodarAudit() {
  // `npm audit` sai com código != 0 quando encontra vulnerabilidade, o que é
  // esperado aqui: quem decide se reprova é este script, não o npm.
  try {
    return JSON.parse(
      execSync('npm audit --json', { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }),
    );
  } catch (erro) {
    if (erro.stdout) return JSON.parse(erro.stdout);
    throw erro;
  }
}

export function auditarProducao({ hoje = new Date() } = {}) {
  const relatorio = rodarAudit();
  const vulnerabilidades = relatorio.vulnerabilities ?? {};
  const producao = pacotesDeProducao();
  const { entradas, porAdvisory, ausente } = lerRiscosAceitos({ hoje });

  const problemas = [];
  const cobertos = [];
  const emDev = [];
  const naoBloqueantes = [];

  for (const [nome, vuln] of Object.entries(vulnerabilidades)) {
    if (!producao.has(nome)) {
      emDev.push({ nome, severidade: vuln.severity });
      continue;
    }
    if (!BLOQUEANTES.has(vuln.severity)) {
      naoBloqueantes.push({ nome, severidade: vuln.severity });
      continue;
    }

    const ids = [...advisoriesDe(nome, vulnerabilidades)];
    const semCobertura = ids.filter((id) => !porAdvisory.get(id)?.cobre);

    if (semCobertura.length === 0 && ids.length > 0) {
      cobertos.push({
        nome,
        severidade: vuln.severity,
        ids,
        ras: ids.map((id) => porAdvisory.get(id)),
      });
    } else {
      problemas.push({ nome, severidade: vuln.severity, ids, semCobertura });
    }
  }

  // RA inválido ou vencido é problema por si só, mesmo que o advisory tenha sido
  // corrigido no meio do caminho: registro podre corrompe as decisões futuras.
  const rasRuins = entradas.filter((e) => !e.valida || e.vencida);

  return {
    problemas,
    cobertos,
    emDev,
    naoBloqueantes,
    entradas,
    rasRuins,
    registroAusente: ausente,
  };
}

function formatar(n) {
  return String(n).padStart(2);
}

export function relatarProducao(resultado) {
  const { problemas, cobertos, emDev, naoBloqueantes, rasRuins, registroAusente } = resultado;
  const linhas = [];

  linhas.push(
    `  ${formatar(emDev.length)} advisories em dependência de dev/build (não chegam ao usuário)`,
  );
  linhas.push(
    `  ${formatar(naoBloqueantes.length)} advisories moderate/low em produção (informativos)`,
  );
  linhas.push(
    `  ${formatar(cobertos.length)} advisories HIGH/CRITICAL em produção cobertos por risco aceito`,
  );
  for (const c of cobertos) {
    for (const ra of c.ras) {
      linhas.push(
        `       ${c.nome} (${c.severidade}) -> ${ra.id}, vence em ${ra.diasRestantes} dias (saída: ${ra.tarefa_de_saida})`,
      );
    }
  }
  linhas.push(`  ${formatar(problemas.length)} advisories HIGH/CRITICAL em produção SEM cobertura`);
  for (const p of problemas) {
    const ids = p.semCobertura.length ? p.semCobertura.join(', ') : '(sem advisory identificado)';
    linhas.push(`       ${p.nome} (${p.severidade}) -> ${ids}`);
  }
  if (registroAusente) linhas.push('  !! registro de riscos aceitos não encontrado');
  for (const ra of rasRuins) {
    const motivo = ra.vencida ? `VENCIDO em ${ra.data_revisao}` : ra.problemas.join('; ');
    linhas.push(`  !! ${ra.id ?? '(sem id)'} inválido: ${motivo}`);
  }

  return linhas.join('\n');
}

// Execução direta: `node scripts/audit-prod.mjs`
//
// A guarda testa `process.argv[1]` antes de usá-lo (TASK-BG-040): em contexto de
// avaliação (`node -e`) ele é `undefined`, e o `.replace()` direto lançava
// TypeError — quebrando qualquer ferramenta que importasse este módulo.
const executadoDireto =
  process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;

if (executadoDireto) {
  const resultado = auditarProducao();
  console.info('\nAuditoria de dependências de produção\n');
  console.info(relatarProducao(resultado));

  const reprovou =
    resultado.problemas.length > 0 || resultado.rasRuins.length > 0 || resultado.registroAusente;
  console.info(`\n  ${reprovou ? 'REPROVADO' : 'APROVADO'}\n`);
  process.exit(reprovou ? 1 : 0);
}
