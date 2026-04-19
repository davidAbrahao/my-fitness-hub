/**
 * Hooks para carregar dados do Supabase (com fallback para localStorage).
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';
import { load, save } from './storage';
import { todayISO } from './date-utils';
import { enqueue } from './offline-queue';
import type { BodyLog, DailyCheck } from './storage';

export interface CloudBodyMetric {
  date: string;
  weight: number | null;
  waist: number | null;
  chest: number | null;
  arm: number | null;
  thigh: number | null;
  hip: number | null;
  body_fat: number | null;
}

export interface CloudHabit {
  date: string;
  workout_done: boolean;
  diet_ok: boolean;
  water: boolean;
  cardio: boolean;
  supplements: boolean;
  creatine: boolean;
  sleep_hours: number | null;
}

export interface CloudPR {
  exercise_name: string;
  exercise_id: string;
  weight: number;
  reps: number;
  estimated_1rm: number;
  date: string;
}

export interface NutritionMealEntry {
  food_id: string;
  food_name: string;
  brand?: string | null;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_index: number;
  meal_name?: string;
  added_at: string;
}

export interface CloudNutritionLog {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: NutritionMealEntry[];
}

export function useBodyMetrics() {
  const { user } = useAuth();
  const [data, setData] = useState<CloudBodyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!user) {
        const local = load<BodyLog[]>('body_logs', []);
        if (active) {
          setData(
            local.map((b) => ({
              date: b.date,
              weight: b.weight ?? null,
              waist: b.waist ?? null,
              chest: b.chest ?? null,
              arm: b.arm ?? null,
              thigh: b.thigh ?? null,
              hip: b.hip ?? null,
              body_fat: b.bf ?? null,
            }))
          );
          setLoading(false);
        }
        return;
      }
      const { data: rows, error } = await supabase
        .from('body_metrics')
        .select('date, weight, waist, chest, arm, thigh, hip, body_fat')
        .order('date', { ascending: true });
      if (!active) return;
      if (error) console.error('body_metrics fetch:', error);
      setData((rows ?? []) as CloudBodyMetric[]);
      setLoading(false);
    }
    fetchData();
    return () => {
      active = false;
    };
  }, [user]);

  return { data, loading };
}

export function useHabits() {
  const { user } = useAuth();
  const [data, setData] = useState<CloudHabit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!user) {
        const local = load<DailyCheck[]>('daily_checks', []);
        if (active) {
          setData(
            local.map((c) => ({
              date: c.date,
              workout_done: !!c.treino,
              diet_ok: !!c.dieta,
              water: !!c.agua,
              cardio: !!c.cardio,
              supplements: !!c.suplementos,
              creatine: false,
              sleep_hours: c.sono ? 7 : null,
            }))
          );
          setLoading(false);
        }
        return;
      }
      const { data: rows, error } = await supabase
        .from('habits_logs')
        .select('date, workout_done, diet_ok, water, cardio, supplements, creatine, sleep_hours')
        .order('date', { ascending: true });
      if (!active) return;
      if (error) console.error('habits fetch:', error);
      setData((rows ?? []) as CloudHabit[]);
      setLoading(false);
    }
    fetchData();
    return () => {
      active = false;
    };
  }, [user]);

  return { data, loading };
}

export function usePersonalRecords() {
  const { user } = useAuth();
  const [data, setData] = useState<CloudPR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!user) {
        const local = load<any[]>('personal_records', []);
        if (active) {
          setData(
            local.map((p) => ({
              exercise_id: p.exerciseId ?? p.exercise_id ?? '',
              exercise_name: p.exerciseName ?? p.exercise_name ?? '',
              weight: p.weight,
              reps: p.reps,
              estimated_1rm: p.estimated1RM ?? p.estimated_1rm ?? 0,
              date: p.date,
            }))
          );
          setLoading(false);
        }
        return;
      }
      const { data: rows, error } = await supabase
        .from('personal_records')
        .select('exercise_id, exercise_name, weight, reps, estimated_1rm, date')
        .order('date', { ascending: true });
      if (!active) return;
      if (error) console.error('PR fetch:', error);
      setData((rows ?? []) as CloudPR[]);
      setLoading(false);
    }
    fetchData();
    return () => {
      active = false;
    };
  }, [user]);

  return { data, loading };
}

/**
 * Hook para a nutrição do dia atual.
 * - Carrega o registro de hoje
 * - addMeal() adiciona uma entrada e faz upsert no Supabase
 */
export function useTodayNutrition() {
  const { user } = useAuth();
  const date = todayISO();
  const [log, setLog] = useState<CloudNutritionLog>({
    date,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    meals: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data: row, error } = await supabase
      .from('nutrition_logs')
      .select('date, calories, protein, carbs, fat, meals')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();
    if (error) console.error('nutrition fetch:', error);
    if (row) {
      setLog({
        date: row.date,
        calories: row.calories ?? 0,
        protein: Number(row.protein ?? 0),
        carbs: Number(row.carbs ?? 0),
        fat: Number(row.fat ?? 0),
        meals: (row.meals as NutritionMealEntry[] | null) ?? [],
      });
    } else {
      setLog({ date, calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] });
    }
    setLoading(false);
  }, [user, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addMeal = useCallback(
    async (entry: NutritionMealEntry) => {
      if (!user) return;
      const newMeals = [...log.meals, entry];
      const totals = newMeals.reduce(
        (acc, m) => ({
          calories: acc.calories + (m.calories || 0),
          protein: acc.protein + (m.protein || 0),
          carbs: acc.carbs + (m.carbs || 0),
          fat: acc.fat + (m.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      const next: CloudNutritionLog = {
        date,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        meals: newMeals,
      };
      // optimistic
      setLog(next);
      const { error } = await supabase
        .from('nutrition_logs')
        .upsert(
          {
            user_id: user.id,
            date,
            calories: next.calories,
            protein: next.protein,
            carbs: next.carbs,
            fat: next.fat,
            meals: next.meals as any,
          },
          { onConflict: 'user_id,date' }
        );
      if (error) console.error('nutrition upsert:', error);
    },
    [user, log, date]
  );

  const removeMeal = useCallback(
    async (addedAt: string) => {
      if (!user) return;
      const newMeals = log.meals.filter((m) => m.added_at !== addedAt);
      const totals = newMeals.reduce(
        (acc, m) => ({
          calories: acc.calories + (m.calories || 0),
          protein: acc.protein + (m.protein || 0),
          carbs: acc.carbs + (m.carbs || 0),
          fat: acc.fat + (m.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      const next: CloudNutritionLog = {
        date,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        meals: newMeals,
      };
      setLog(next);
      const { error } = await supabase
        .from('nutrition_logs')
        .upsert(
          {
            user_id: user.id,
            date,
            calories: next.calories,
            protein: next.protein,
            carbs: next.carbs,
            fat: next.fat,
            meals: next.meals as any,
          },
          { onConflict: 'user_id,date' }
        );
      if (error) console.error('nutrition remove:', error);
    },
    [user, log, date]
  );

  return { log, loading, addMeal, removeMeal, refresh };
}

/** Histórico (últimos N dias) — para gráficos de evolução de calorias. */
export function useNutritionHistory(days = 14) {
  const { user } = useAuth();
  const [data, setData] = useState<CloudNutritionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceISO = since.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
      const { data: rows, error } = await supabase
        .from('nutrition_logs')
        .select('date, calories, protein, carbs, fat, meals')
        .gte('date', sinceISO)
        .order('date', { ascending: true });
      if (!active) return;
      if (error) console.error('nutrition history:', error);
      setData(
        (rows ?? []).map((r) => ({
          date: r.date,
          calories: r.calories ?? 0,
          protein: Number(r.protein ?? 0),
          carbs: Number(r.carbs ?? 0),
          fat: Number(r.fat ?? 0),
          meals: (r.meals as NutritionMealEntry[] | null) ?? [],
        }))
      );
      setLoading(false);
    }
    fetchData();
    return () => {
      active = false;
    };
  }, [user, days]);

  return { data, loading };
}
