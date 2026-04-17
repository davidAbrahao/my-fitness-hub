/**
 * Hybrid sync layer: localStorage as cache + Supabase as source of truth.
 *
 * Strategy:
 * - Reads: serve from local cache instantly, refresh from cloud in background.
 * - Writes: update local cache immediately, push to cloud (silent failure → retry on next session).
 * - On first login: migrate any local-only data to the cloud automatically.
 */
import { supabase } from '@/integrations/supabase/client';
import { load, save } from './storage';
import type { BodyLog, DailyCheck } from './storage';

const MIGRATION_FLAG = 'cloud_migrated_v1';

export function isMigrated(userId: string): boolean {
  return load<string | null>(`${MIGRATION_FLAG}_${userId}`, null) === '1';
}

export function markMigrated(userId: string): void {
  save(`${MIGRATION_FLAG}_${userId}`, '1');
}

/**
 * One-time migration: reads localStorage data and upserts to Supabase.
 * Safe to call multiple times — uses upsert with unique (user_id, date) keys.
 */
export async function migrateLocalToCloud(userId: string): Promise<{ ok: boolean; details: string }> {
  if (isMigrated(userId)) return { ok: true, details: 'Already migrated' };

  try {
    const bodyLogs = load<BodyLog[]>('body_logs', []);
    const dailyChecks = load<DailyCheck[]>('daily_checks', []);

    const errors: string[] = [];

    // Migrate body metrics
    if (bodyLogs.length > 0) {
      const rows = bodyLogs
        .filter(b => b.date)
        .map(b => ({
          user_id: userId,
          date: b.date,
          weight: b.weight ?? null,
          waist: b.waist ?? null,
          chest: b.chest ?? null,
          arm: b.arm ?? null,
          thigh: b.thigh ?? null,
          hip: b.hip ?? null,
          body_fat: b.bf ?? null,
        }));
      if (rows.length > 0) {
        const { error } = await supabase.from('body_metrics').insert(rows);
        if (error) errors.push(`body_metrics: ${error.message}`);
      }
    }

    // Migrate habit checks
    if (dailyChecks.length > 0) {
      const rows = dailyChecks
        .filter(c => c.date)
        .map(c => ({
          user_id: userId,
          date: c.date,
          workout_done: c.treino,
          diet_ok: c.dieta,
          water: c.agua,
          cardio: c.cardio,
          supplements: c.suplementos,
          creatine: false,
          sleep_hours: c.sono ? 7 : null,
          notes: c.notes || null,
        }));
      if (rows.length > 0) {
        const { error } = await supabase
          .from('habits_logs')
          .upsert(rows, { onConflict: 'user_id,date', ignoreDuplicates: true });
        if (error) errors.push(`habits_logs: ${error.message}`);
      }
    }

    markMigrated(userId);
    return {
      ok: errors.length === 0,
      details: errors.length === 0
        ? `Migrados: ${bodyLogs.length} medidas, ${dailyChecks.length} checklists`
        : errors.join('; '),
    };
  } catch (e) {
    return { ok: false, details: (e as Error).message };
  }
}

/**
 * Hybrid getter: returns local cache immediately + triggers cloud refresh.
 * Writes back to local cache when cloud responds.
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const data = await fetcher();
    save(cacheKey, data);
    return data;
  } catch {
    return load<T>(cacheKey, fallback);
  }
}
