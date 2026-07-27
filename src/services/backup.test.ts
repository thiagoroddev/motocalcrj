import { describe, it, expect } from 'vitest';
import { serializarBackup, parsearBackup, nomeArquivoBackup } from './backup';
import { perfilPadrao } from '../context/perfilDefaults';
import { TIPO_BACKUP } from '../schemas/backupSchema';
import { VERSAO_SCHEMA_ATUAL, type PresetEntry } from '../types/perfil';

function presetValido(presetId = 'p1', sufixo = 'a'): PresetEntry {
  return {
    presetId,
    nome: `pop110i_${sufixo}`,
    sufixo,
    criadoEm: '2026-06-15T00:00:00.000Z',
    atualizadoEm: '2026-06-15T00:00:00.000Z',
    perfil: { ...perfilPadrao, moto: { ...perfilPadrao.moto, modelo: 'pop110i' } },
  };
}

describe('backup', () => {
  it('round-trip: serializar → parsear preserva presets e o ativo', () => {
    const texto = serializarBackup([presetValido('p1'), presetValido('p2', 'b')], 'p2');
    const backup = parsearBackup(texto);

    expect(backup.tipo).toBe(TIPO_BACKUP);
    expect(backup.versao).toBe(VERSAO_SCHEMA_ATUAL);
    expect(backup.presets).toHaveLength(2);
    expect(backup.presetAtivoId).toBe('p2');
  });

  it('rejeita tipo divergente', () => {
    const obj = JSON.parse(serializarBackup([presetValido()], 'p1')) as Record<string, unknown>;
    obj.tipo = 'outro-tipo';
    expect(() => parsearBackup(JSON.stringify(obj))).toThrow();
  });

  it('rejeita versão divergente (sem migração)', () => {
    const obj = JSON.parse(serializarBackup([presetValido()], 'p1')) as Record<string, unknown>;
    obj.versao = 99;
    expect(() => parsearBackup(JSON.stringify(obj))).toThrow();
  });

  it('rejeita backup sem predefinições', () => {
    const obj = JSON.parse(serializarBackup([presetValido()], 'p1')) as Record<string, unknown>;
    obj.presets = [];
    expect(() => parsearBackup(JSON.stringify(obj))).toThrow();
  });

  it('rejeita JSON malformado', () => {
    expect(() => parsearBackup('{quebrado')).toThrow();
  });

  it('nomeArquivoBackup usa a data ISO (AAAA-MM-DD)', () => {
    expect(nomeArquivoBackup(new Date('2026-06-15T10:00:00Z'))).toBe(
      'motocusto-backup-2026-06-15.json',
    );
  });
});
