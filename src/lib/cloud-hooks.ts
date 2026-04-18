/**
 * Hooks para carregar dados do Supabase (com fallback para localStorage).
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth-context';
import { load } from './storage';
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

export function useBodyMetrics() {
  const { user } = useAuth();
  const [data, setData] = useState<CloudBodyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (!user) {
        // fallback local
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
