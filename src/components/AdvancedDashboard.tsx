import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingDown, TrendingUp, Trophy, Flame, Activity } from 'lucide-react';
import { useBodyMetrics, useHabits, usePersonalRecords } from '../lib/cloud-hooks';

const tooltipStyle = {
  background: 'oklch(0.16 0.015 260)',
  border: '1px solid oklch(0.30 0.015 260)',
  borderRadius: '8px',
  fontSize: '11px',
};
const axisTick = { fontSize: 10, fill: 'oklch(0.65 0.02 260)' };
const grid = 'oklch(0.25 0.015 260)';

export function AdvancedDashboard() {
  const { data: body, loading: lb } = useBodyMetrics();
  const { data: habits, loading: lh } = useHabits();
  const { data: prs, loading: lp } = usePersonalRecords();

  // Body chart data (last 12 entries)
  const bodyChart = useMemo(
    () =>
      body.slice(-12).map((b) => ({
        date: b.date.slice(5),
        peso: b.weight,
        cintura: b.waist,
        bf: b.body_fat,
      })),
    [body]
  );

  // Consistency score (last 30 days)
  const score = useMemo(() => {
    const last30 = habits.slice(-30);
    if (last30.length === 0) return { workout: 0, diet: 0, sleep: 0, total: 0, days: 0 };
    const w = last30.filter((h) => h.workout_done).length;
    const d = last30.filter((h) => h.diet_ok).length;
    const s = last30.filter((h) => (h.sleep_hours ?? 0) >= 6).length;
    const n = last30.length;
    return {
      workout: Math.round((w / n) * 100),
      diet: Math.round((d / n) * 100),
      sleep: Math.round((s / n) * 100),
      total: Math.round(((w + d + s) / (n * 3)) * 100),
      days: n,
    };
  }, [habits]);

  // PRs by exercise — best 1RM evolution
  const prByExercise = useMemo(() => {
    const map = new Map<string, typeof prs>();
    prs.forEach((p) => {
      if (!map.has(p.exercise_name)) map.set(p.exercise_name, []);
      map.get(p.exercise_name)!.push(p);
    });
    return Array.from(map.entries())
      .map(([name, records]) => ({
        name,
        best: records.reduce((a, b) => (a.estimated_1rm > b.estimated_1rm ? a : b)),
        chart: records.map((r) => ({ date: r.date.slice(5), oneRM: r.estimated_1rm })),
      }))
      .sort((a, b) => b.best.estimated_1rm - a.best.estimated_1rm)
      .slice(0, 4);
  }, [prs]);

  // Habits stacked bar (last 14 days)
  const habitsChart = useMemo(
    () =>
      habits.slice(-14).map((h) => ({
        date: h.date.slice(5),
        treino: h.workout_done ? 1 : 0,
        dieta: h.diet_ok ? 1 : 0,
        agua: h.water ? 1 : 0,
        cardio: h.cardio ? 1 : 0,
      })),
    [habits]
  );

  const loading = lb || lh || lp;
  const last = body[body.length - 1];
  const prev = body.length >= 2 ? body[body.length - 2] : null;
  const weightDiff = last?.weight && prev?.weight ? last.weight - prev.weight : 0;
  const waistDiff = last?.waist && prev?.waist ? last.waist - prev.waist : 0;

  return (
    <div className="space-y-4 pb-4">
      {/* Stats row */}
      <div className="px-4 grid grid-cols-3 gap-2">
        <StatCard
          label="Peso"
          value={last?.weight ?? '—'}
          unit="kg"
          diff={weightDiff}
          icon={TrendingDown}
        />
        <StatCard
          label="Cintura"
          value={last?.waist ?? '—'}
          unit="cm"
          diff={waistDiff}
          icon={TrendingDown}
        />
        <StatCard
          label="BF"
          value={last?.body_fat ?? '—'}
          unit="%"
          diff={0}
          icon={Activity}
        />
      </div>

      {/* Score card */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 neon-glow"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Score de Consistência
              </div>
              <div className="text-[10px] text-muted-foreground">
                Últimos {score.days || 30} dias
              </div>
            </div>
            <div className="text-3xl font-black text-primary neon-text">{score.total}%</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ScoreBar label="Treino" value={score.workout} color="primary" />
            <ScoreBar label="Dieta" value={score.diet} color="warning" />
            <ScoreBar label="Sono" value={score.sleep} color="chart-3" />
          </div>
        </motion.div>
      </div>

      {/* Body evolution */}
      <div className="px-4">
        <ChartCard title="📉 Evolução Corporal" subtitle="Peso (kg) & Cintura (cm)">
          {bodyChart.length < 2 ? (
            <EmptyChart text="Registre 2+ medidas para ver evolução" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={bodyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis yAxisId="left" tick={axisTick} domain={['auto', 'auto']} width={32} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={axisTick}
                  domain={['auto', 'auto']}
                  width={32}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="peso"
                  stroke="oklch(0.78 0.19 135)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cintura"
                  stroke="oklch(0.75 0.18 60)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* BF chart */}
      {bodyChart.some((b) => b.bf != null) && (
        <div className="px-4">
          <ChartCard title="🔥 % Gordura Corporal" subtitle="Evolução do BF">
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={bodyChart}>
                <defs>
                  <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.20 25)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.65 0.20 25)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis tick={axisTick} domain={['auto', 'auto']} width={32} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="bf"
                  stroke="oklch(0.65 0.20 25)"
                  fill="url(#bfGrad)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* PRs */}
      <div className="px-4">
        <ChartCard title="🏆 PRs Principais" subtitle="Top 4 — evolução do 1RM estimado">
          {prByExercise.length === 0 ? (
            <EmptyChart text="Registre PRs em Ferramentas → PRs" />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {prByExercise.map((p) => (
                <div key={p.name} className="bg-secondary rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Trophy size={10} className="text-warning" />
                    <span className="text-[10px] font-bold text-foreground truncate">
                      {p.name}
                    </span>
                  </div>
                  <div className="text-sm font-black text-primary">
                    {p.best.estimated_1rm}kg
                  </div>
                  {p.chart.length >= 2 && (
                    <ResponsiveContainer width="100%" height={50}>
                      <LineChart data={p.chart}>
                        <Line
                          type="monotone"
                          dataKey="oneRM"
                          stroke="oklch(0.78 0.19 135)"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Habits last 14 days */}
      <div className="px-4">
        <ChartCard title="✅ Hábitos (14 dias)" subtitle="Treino, dieta, água, cardio">
          {habitsChart.length === 0 ? (
            <EmptyChart text="Marque seu checklist diário" />
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={habitsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={{ ...axisTick, fontSize: 8 }} />
                <YAxis tick={axisTick} width={20} domain={[0, 4]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="treino" stackId="a" fill="oklch(0.78 0.19 135)" />
                <Bar dataKey="dieta" stackId="a" fill="oklch(0.75 0.18 60)" />
                <Bar dataKey="agua" stackId="a" fill="oklch(0.70 0.18 230)" />
                <Bar dataKey="cardio" stackId="a" fill="oklch(0.65 0.20 25)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {loading && (
        <div className="px-4 text-center text-xs text-muted-foreground">Carregando dados…</div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  diff,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  unit: string;
  diff: number;
  icon: typeof TrendingDown;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className="flex items-center gap-1 mb-1">
        <Icon size={12} className="text-primary" />
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-lg font-black text-foreground">
        {value}
        <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </div>
      {diff !== 0 && (
        <span
          className={`text-[10px] font-bold ${diff < 0 ? 'text-success' : 'text-destructive'}`}
        >
          {diff > 0 ? '+' : ''}
          {diff.toFixed(1)}
          {unit}
        </span>
      )}
    </motion.div>
  );
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'primary' | 'warning' | 'chart-3';
}) {
  const colorMap = {
    primary: 'bg-primary',
    warning: 'bg-warning',
    'chart-3': 'bg-chart-3',
  };
  const textMap = {
    primary: 'text-primary',
    warning: 'text-warning',
    'chart-3': 'text-chart-3',
  };
  return (
    <div className="text-center">
      <div className={`text-lg font-black ${textMap[color]}`}>{value}%</div>
      <div className="text-[10px] text-muted-foreground font-medium mb-1">{label}</div>
      <div className="progress-bar-bg h-1.5">
        <div
          className={`${colorMap[color]} h-full rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-3"
    >
      <div className="mb-2">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="text-center py-8 text-xs text-muted-foreground">
      <Flame size={20} className="mx-auto mb-2 opacity-40" />
      {text}
    </div>
  );
}
