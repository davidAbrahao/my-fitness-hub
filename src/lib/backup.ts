/**
 * Backup/restore utilities for P0 — exports cloud + local data as JSON.
 * Restoration uses upsert to avoid duplicates.
 */
import { supabase } from '@/integrations/supabase/client';

export interface BackupPayload {
  version: 1;
  exported_at: string;
  user_id: string;
  body_metrics: unknown[];
  workouts: unknown[];
  exercises_logs: unknown[];
  nutrition_logs: unknown[];
  habits_logs: unknown[];
  personal_records: unknown[];
}

export async function exportAllData(userId: string): Promise<BackupPayload> {
  const tables = [
    'body_metrics', 'workouts', 'exercises_logs',
    'nutrition_logs', 'habits_logs', 'personal_records',
  ] as const;

  const result: Record<string, unknown[]> = {};
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId);
    if (error) throw new Error(`Falha ao exportar ${table}: ${error.message}`);
    result[table] = data ?? [];
  }

  return {
    version: 1,
    exported_at: new Date().toISOString(),
    user_id: userId,
    body_metrics: result.body_metrics,
    workouts: result.workouts,
    exercises_logs: result.exercises_logs,
    nutrition_logs: result.nutrition_logs,
    habits_logs: result.habits_logs,
    personal_records: result.personal_records,
  };
}

export function downloadJSON(data: BackupPayload, filename = `barriga-zero-backup-${data.exported_at.slice(0, 10)}.json`) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCSV(data: BackupPayload) {
  // Simple CSV with body metrics + habits — most useful for spreadsheets
  const rows: string[] = ['type,date,field,value'];
  for (const m of data.body_metrics as Array<Record<string, unknown>>) {
    for (const [k, v] of Object.entries(m)) {
      if (['weight', 'waist', 'chest', 'arm', 'thigh', 'hip', 'body_fat'].includes(k) && v != null) {
        rows.push(`body,${m.date},${k},${v}`);
      }
    }
  }
  for (const h of data.habits_logs as Array<Record<string, unknown>>) {
    rows.push(`habits,${h.date},workout_done,${h.workout_done}`);
    rows.push(`habits,${h.date},diet_ok,${h.diet_ok}`);
    rows.push(`habits,${h.date},water,${h.water}`);
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `barriga-zero-${data.exported_at.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(payload: BackupPayload, userId: string): Promise<{ ok: boolean; details: string }> {
  if (payload.version !== 1) return { ok: false, details: 'Versão de backup não suportada' };

  // Strip ids & override user_id, then upsert by natural keys where possible
  const stripIds = (rows: unknown[]) =>
    (rows as Array<Record<string, unknown>>).map(r => {
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = r;
      return { ...rest, user_id: userId };
    });

  const errors: string[] = [];

  const bm = stripIds(payload.body_metrics);
  if (bm.length) {
    const { error } = await supabase.from('body_metrics').insert(bm);
    if (error) errors.push(`body_metrics: ${error.message}`);
  }

  const hl = stripIds(payload.habits_logs);
  if (hl.length) {
    const { error } = await supabase.from('habits_logs').upsert(hl, { onConflict: 'user_id,date', ignoreDuplicates: true });
    if (error) errors.push(`habits_logs: ${error.message}`);
  }

  const nl = stripIds(payload.nutrition_logs);
  if (nl.length) {
    const { error } = await supabase.from('nutrition_logs').upsert(nl, { onConflict: 'user_id,date', ignoreDuplicates: true });
    if (error) errors.push(`nutrition_logs: ${error.message}`);
  }

  const pr = stripIds(payload.personal_records);
  if (pr.length) {
    const { error } = await supabase.from('personal_records').insert(pr);
    if (error) errors.push(`personal_records: ${error.message}`);
  }

  return {
    ok: errors.length === 0,
    details: errors.length === 0 ? `Importação concluída.` : errors.join('; '),
  };
}
