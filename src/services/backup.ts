import type { PresetEntry } from '../types/perfil';
import { VERSAO_SCHEMA_ATUAL } from '../types/perfil';
import { TIPO_BACKUP, backupSchema, type Backup } from '../schemas/backupSchema';

// Funções puras de (de)serialização do backup completo (TASK-RF-7.2). Mantêm a
// UI desacoplada do formato do arquivo e do localStorage: a página só conhece
// `string` (conteúdo do .json) e `Backup` (já validado).

export function serializarBackup(presets: PresetEntry[], presetAtivoId: string | null): string {
  const backup: Backup = {
    tipo: TIPO_BACKUP,
    versao: VERSAO_SCHEMA_ATUAL,
    exportadoEm: new Date().toISOString(),
    presetAtivoId,
    presets,
  };
  return JSON.stringify(backup, null, 2);
}

// Lança se o texto não for JSON ou não passar na validação estrita (tipo/versão
// divergentes, presets inválidos). Quem chama trata o erro como "arquivo
// inválido" — não há migração de versões antigas.
export function parsearBackup(texto: string): Backup {
  return backupSchema.parse(JSON.parse(texto));
}

export function nomeArquivoBackup(agora: Date = new Date()): string {
  const data = agora.toISOString().slice(0, 10);
  return `motocusto-backup-${data}.json`;
}
