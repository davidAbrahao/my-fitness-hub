/**
 * Score de risco do dia/semana (0–100, maior = mais risco de furar).
 * Sinais considerados:
 *  - Calorias acima da meta (peso 30)
 *  - Vontade de doce >= 2 (peso 25)
 *  - Sem treino hoje + ontem (peso 20)
 *  - Sono < 6h (peso 15)
 *  - Fim de semana (peso 10)
 */
import type { CloudHabit } from './cloud-hooks';

export interface RiskInputs {
  todayCalories: number;
  calorieTarget: number;
  todayHabit?: CloudHabit;
  yesterdayHabit?: CloudHabit;
  isWeekend: boolean;
}

export interface RiskResult {
  score: number; // 0..100
  level: 'baixo' | 'médio' | 'alto';
  reasons: string[];
}

export function computeRisk(i: RiskInputs): RiskResult {
  let score = 0;
  const reasons: string[] = [];

  if (i.todayCalories > i.calorieTarget) {
    score += 30;
    reasons.push(`+${i.todayCalories - i.calorieTarget} kcal acima da meta`);
  }

  const sugar = (i.todayHabit as { sugar_urge?: number } | undefined)?.sugar_urge ?? 0;
  if (sugar >= 2) {
    score += 25;
    reasons.push('Vontade de doce alta');
  }

  const noToday = !i.todayHabit?.workout_done;
  const noYesterday = !i.yesterdayHabit?.workout_done;
  if (noToday && noYesterday) {
    score += 20;
    reasons.push('2 dias sem treino');
  }

  const sleep = i.todayHabit?.sleep_hours ?? null;
  if (sleep != null && sleep < 6) {
    score += 15;
    reasons.push('Pouco sono');
  }

  if (i.isWeekend) {
    score += 10;
    reasons.push('Fim de semana');
  }

  score = Math.min(100, score);
  const level: RiskResult['level'] = score >= 60 ? 'alto' : score >= 30 ? 'médio' : 'baixo';
  return { score, level, reasons };
}

export function isWeekendNow(): boolean {
  const d = new Date().getDay();
  return d === 0 || d === 5 || d === 6; // sex / sáb / dom
}
