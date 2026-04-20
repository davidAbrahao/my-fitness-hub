/**
 * Hook do perfil do usuário (1:1 com user_profiles).
 * Cache local para acesso instantâneo + upsert otimista via fila offline.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';
import { load, save } from './storage';
import { enqueue } from './offline-queue';

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type SplitDay = 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'fullbody' | 'rest';

export interface TrainingSchedule {
  mon: SplitDay; tue: SplitDay; wed: SplitDay; thu: SplitDay;
  fri: SplitDay; sat: SplitDay; sun: SplitDay;
}

export interface UserProfile {
  age: number | null;
  height_cm: number | null;
  start_weight_kg: number | null;
  goal_weight_kg: number | null;
  start_bf_pct: number | null;
  goal_bf_pct: number | null;
  calorie_target: number;
  current_focus: string | null;
  notes: string | null;
  triggers: string[];
  preferences: string[];
  restrictions: string[];
  training_schedule: TrainingSchedule;
  training_time: string | null; // 'HH:MM' or 'HH:MM:SS'
}

export const DEFAULT_SCHEDULE: TrainingSchedule = {
  mon: 'push', tue: 'pull', wed: 'legs',
  thu: 'upper', fri: 'lower', sat: 'rest', sun: 'rest',
};

const DEFAULT_PROFILE: UserProfile = {
  age: 33, height_cm: 170, start_weight_kg: 93.5, goal_weight_kg: 80,
  start_bf_pct: 33, goal_bf_pct: 15, calorie_target: 1800,
  current_focus: 'Reduzir BF para 15%, manter massa magra',
  notes: null, triggers: [], preferences: [], restrictions: [],
  training_schedule: DEFAULT_SCHEDULE, training_time: '18:00',
};

const LOCAL_KEY = 'user_profile_v1';

const WEEKDAYS: WeekDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Retorna o split do dia atual segundo o schedule. */
export function todaySplit(schedule: TrainingSchedule): SplitDay {
  const day = WEEKDAYS[new Date().getDay()];
  return schedule[day];
}

/** Mapeia split → id da TrainingDay no defaultTrainingPlan. */
export function splitToPlanId(split: SplitDay): string | null {
  if (split === 'rest') return null;
  // O training-data atual usa: 'push','pull','legs','upper','lower'
  return split;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() =>
    load<UserProfile>(LOCAL_KEY, DEFAULT_PROFILE)
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data: row, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) console.error('profile fetch:', error);
    if (row) {
      const next: UserProfile = {
        age: row.age,
        height_cm: row.height_cm != null ? Number(row.height_cm) : null,
        start_weight_kg: row.start_weight_kg != null ? Number(row.start_weight_kg) : null,
        goal_weight_kg: row.goal_weight_kg != null ? Number(row.goal_weight_kg) : null,
        start_bf_pct: row.start_bf_pct != null ? Number(row.start_bf_pct) : null,
        goal_bf_pct: row.goal_bf_pct != null ? Number(row.goal_bf_pct) : null,
        calorie_target: row.calorie_target ?? 1800,
        current_focus: row.current_focus,
        notes: row.notes,
        triggers: row.triggers ?? [],
        preferences: row.preferences ?? [],
        restrictions: row.restrictions ?? [],
        training_schedule:
          (row.training_schedule as unknown as TrainingSchedule) ?? DEFAULT_SCHEDULE,
        training_time: row.training_time,
      };
      setProfile(next);
      save(LOCAL_KEY, next);
    } else {
      // primeira vez → cria com defaults
      void supabase
        .from('user_profiles')
        .insert([{ user_id: user.id, ...DEFAULT_PROFILE }])
        .then(({ error: e }) => e && console.error('profile insert:', e));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (patch: Partial<UserProfile>) => {
      const next = { ...profile, ...patch };
      setProfile(next);
      save(LOCAL_KEY, next);
      if (!user) return;
      await enqueue({
        table: 'user_profiles' as never,
        payload: { user_id: user.id, ...next },
        onConflict: 'user_id',
      });
    },
    [user, profile]
  );

  return { profile, loading, update, refresh };
}
