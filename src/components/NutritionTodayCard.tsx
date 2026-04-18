import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trash2, UtensilsCrossed } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { useTodayNutrition, useNutritionHistory } from '../lib/cloud-hooks';
import { defaultDietPlan } from '../lib/training-data';

const tooltipStyle = {
  background: 'oklch(0.16 0.015 260)',
  border: '1px solid oklch(0.30 0.015 260)',
  borderRadius: '8px',
  fontSize: '11px',
};
const axisTick = { fontSize: 10, fill: 'oklch(0.65 0.02 260)' };
const grid = 'oklch(0.25 0.015 260)';

export function NutritionTodayCard() {
  const { log, loading, removeMeal } = useTodayNutrition();
  const { data: history } = useNutritionHistory(14);

  const target = defaultDietPlan.targetCalories;
  const targetP = defaultDietPlan.macros.protein.grams;
  const targetC = defaultDietPlan.macros.carbs.grams;
  const targetF = defaultDietPlan.macros.fat.grams;

  const pct = Math.min(100, Math.round((log.calories / target) * 100));
  const remaining = Math.max(0, target - log.calories);
  const over = log.calories > target;

  const chart = useMemo(
    () =>
      history.map((h) => ({
        date: h.date.slice(5),
        kcal: h.calories,
      })),
    [history]
  );

  const macroBars = [
    { label: 'P', value: log.protein, target: targetP, color: 'bg-primary', text: 'text-primary' },
    { label: 'C', value: log.carbs, target: targetC, color: 'bg-warning', text: 'text-warning' },
    { label: 'G', value: log.fat, target: targetF, color: 'bg-destructive', text: 'text-destructive' },
  ];

  return (
    <div className="px-4 space-y-3">
      {/* Calories vs target */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-destructive" />
            <h3 className="text-sm font-bold text-foreground">Calorias Hoje</h3>
          </div>
          <span className={`text-[10px] font-bold ${over ? 'text-destructive' : 'text-muted-foreground'}`}>
            {over ? `+${log.calories - target}` : `${remaining}`} kcal {over ? 'acima' : 'restantes'}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black text-foreground">{log.calories}</span>
          <span className="text-sm text-muted-foreground">/ {target} kcal</span>
          <span className={`ml-auto text-xl font-black ${over ? 'text-destructive' : 'text-primary'} neon-text`}>
            {pct}%
          </span>
        </div>
        <div className="progress-bar-bg h-2 mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${over ? 'bg-destructive' : 'progress-bar-fill'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2">
          {macroBars.map((m) => {
            const p = Math.min(100, Math.round((m.value / m.target) * 100));
            return (
              <div key={m.label} className="bg-secondary rounded-lg p-2">
                <div className="flex items-baseline justify-between mb-1">
                  <span className={`text-xs font-black ${m.text}`}>{m.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {Math.round(m.value)}/{m.target}g
                  </span>
                </div>
                <div className="progress-bar-bg h-1">
                  <div className={`${m.color} h-full rounded-full`} style={{ width: `${p}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="text-center text-[10px] text-muted-foreground mt-2">Carregando…</div>
        )}
      </motion.div>

      {/* Today's meals list */}
      {log.meals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <UtensilsCrossed size={12} className="text-primary" />
            <h3 className="text-xs font-bold text-foreground">Consumido Hoje</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {log.meals.length} {log.meals.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <ul className="space-y-1.5 max-h-40 overflow-y-auto">
            {log.meals.map((m) => (
              <li
                key={m.added_at}
                className="flex items-center gap-2 text-xs bg-secondary/50 rounded px-2 py-1.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground truncate">{m.food_name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {m.grams}g · {m.calories} kcal · P:{m.protein.toFixed(0)}g
                  </div>
                </div>
                <button
                  onClick={() => removeMeal(m.added_at)}
                  className="text-destructive p-1 hover:bg-destructive/10 rounded"
                  aria-label="Remover"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* History chart */}
      {chart.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3"
        >
          <div className="mb-2">
            <h3 className="text-sm font-bold text-foreground">📊 Calorias (14 dias)</h3>
            <p className="text-[10px] text-muted-foreground">Linha = meta de {target} kcal</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="date" tick={{ ...axisTick, fontSize: 8 }} />
              <YAxis tick={axisTick} width={32} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={target} stroke="oklch(0.78 0.19 135)" strokeDasharray="3 3" />
              <Bar dataKey="kcal" fill="oklch(0.65 0.20 25)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
