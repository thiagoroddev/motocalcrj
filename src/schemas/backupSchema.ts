import { z } from 'zod';
import { presetEntryPersistidoSchema } from './perfilSchema';
import { VERSAO_SCHEMA_ATUAL } from '../types/perfil';

// ──────────────────────────────────────────────
// Backup completo (TASK-RF-7.2): envelope com TODAS as predefinições + o
// preset ativo. Diferente da exportação individual (RF-7.1, uma PresetEntry por
// arquivo), aqui é o snapshot integral do app.
//
// App pré-lançamento: a versão é fixa em VERSAO_SCHEMA_ATUAL (0). NÃO há
// migração — um arquivo de outra versão (ou `tipo` diferente) é rejeitado na
// fronteira, exatamente como dado de storage corrompido cai no onboarding.
// ──────────────────────────────────────────────

export const TIPO_BACKUP = 'motocusto-backup' as const;

export const backupSchema = z.object({
  tipo: z.literal(TIPO_BACKUP),
  versao: z.literal(VERSAO_SCHEMA_ATUAL),
  exportadoEm: z.string(),
  presetAtivoId: z.string().nullable(),
  presets: z.array(presetEntryPersistidoSchema).min(1),
});

export type Backup = z.infer<typeof backupSchema>;
