// Local storage helpers for the fitness app
const PREFIX = 'bz_';

export function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function remove(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

// Date helpers — use America/Sao_Paulo timezone (avoids UTC midnight bug)
import { todayISO, weekStartISO } from './date-utils';

export function todayKey(): string {
  return todayISO();
}

export function weekKey(): string {
  return weekStartISO();
}

// Types
export interface WorkoutLog {
  date: string;
  exerciseId: string;
  sets: { reps: number; weight: number }[];
}

export interface BodyLog {
  date: string;
  weight?: number;
  waist?: number;
  chest?: number;
  arm?: number;
  thigh?: number;
  hip?: number;
  bf?: number;
  photoUrl?: string;
}

export interface DailyCheck {
  date: string;
  treino: boolean;
  dieta: boolean;
  sono: boolean;
  agua: boolean;
  cardio: boolean;
  suplementos: boolean;
  notes: string;
}

export interface WeeklyData {
  week: string;
  weight: number;
  waist: number;
  trainDays: number;
  dietScore: number;
  sleepScore: number;
}
