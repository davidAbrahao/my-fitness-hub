import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dumbbell, Flame, Activity, Droplets, Moon, Plus, Sparkles,
  AlertTriangle, ChevronRight, Cookie, Target,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SyncStatus } from '../components/SyncStatus';
import { QuickCheckinDrawer } from '../components/QuickCheckinDrawer';
import { UrgeRescueDialog } from '../components/UrgeRescueDialog';
import { WeekendModeCard } from '../components/WeekendModeCard';
import { useHabits, useTodayNutrition } from '../lib/cloud-hooks';
import { useUserProfile, todaySplit, splitToPlanId } from '../lib/profile-hooks';
import { defaultTrainingPlan } from '../lib/training-data';
import { computeRisk, isWeekendNow } from '../lib/risk-score';
import { todayISO } from '../lib/date-utils';

export const Route = createFileRoute('/hoje')({
  component: HojePage,
  head: () => ({
    meta: [
      { title: 'Hoje — Barriga Zero' },
      { name: 'description', content: 'Sua central operacional do dia: treino, calorias, check-in e risco.' },
    ],
  }),
});

function HojePage() {
  const { profile } = useUserProfile();
  const { data: habits } = useHabits();
  const { log: nutrition } = useTodayNutrition();

  const [checkinOpen, setCheckinOpen] = useState(false);
  const [urgeOpen, setUrgeOpen] = useState(false);

  const today = todayISO();
  const todayHabit = useMemo(() => habits.find((h) => h.date === today), [habits, today]);
  const yesterdayISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  }, []);
  const yesterdayHabit = useMemo(
    () => habits.find((h) => h.date === yesterdayISO),
    [habits, yesterdayISO]
  );

  // Treino do dia segundo schedule do perfil
  const split = todaySplit(profile.training_schedule);
  const planId = splitToPlanId(split);
  const todayWorkout = planId ? defaultTrainingPlan.find((d) => d.id === planId) : null;
  const isRest = split === 'rest';

  // Progresso do dia (5 pilares principais)
  const pillars = [
    { label: 'Treino', done: !!todayHabit?.workout_done || isRest, Icon: Dumbbell },
    { label: 'Cardio', done: !!todayHabit?.cardio, Icon: Activity },
    { label: 'Dieta', done: !!todayHabit?.diet_ok, Icon: Flame },
    { label: 'Água', done: !!todayHabit?.water, Icon: Droplets },
    { label: 'Sono', done: (todayHabit?.sleep_hours ?? 0) >= 7, Icon: Moon },
  ];
  const doneCount = pillars.filter((p) => p.done).length;
  const pct = Math.round((doneCount / pillars.length) * 100);

  // Calorias
  const target = profile.calorie_target;
  const kcal = nutrition.calories;
  const remaining = Math.max(0, target - kcal);
  const over = kcal > target;
  const kcalPct = Math.min(100, Math.round((kcal / target) * 100));

  // Risco
  const risk = computeRisk({
    todayCalories: kcal,
    calorieTarget: target,
    todayHabit,
    yesterdayHabit,
    isWeekend: isWeekendNow(),
  });

  // Próxima ação
  const nextAction = computeNextAction({
    workoutDone: !!todayHabit?.workout_done,
    isRest,
    cardioDone: !!todayHabit?.cardio,
    waterDone: !!todayHabit?.water,
    kcal, target,
    hasCheckin: !!todayHabit,
  });

  return (
    <div className="pb-2">
      <PageHeader title="HOJE" subtitle={greeting()} emoji="⚡" />

      {/* Sync + data */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
          {prettyDate()}
        </span>
        <SyncStatus />
      </div>

      {/* Próxima ação (CTA principal) */}
      <div className="px-4 mb-4">
        <NextActionCard
          action={nextAction}
          onCheckin={() => setCheckinOpen(true)}
          onUrge={() => setUrgeOpen(true)}
        />
      </div>

      {/* Grid 2 cols: Progresso + Risco */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        {/* Progresso */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-glow p-3"
        >
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Progresso</span>
            <span className="text-2xl font-black text-primary neon-text">{pct}%</span>
          </div>
          <div className="progress-bar-bg h-1.5 mb-2.5">
            <div className="progress-bar-fill h-full" style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-5 gap-1">
            {pillars.map(({ label, done, Icon }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <Icon size={12} className={done ? 'text-success' : 'text-muted-foreground/50'} />
                <span className="text-[8px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risco */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-3 ${risk.level === 'alto' ? 'border-destructive/40' : risk.level === 'médio' ? 'border-warning/40' : ''}`}
        >
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Risco</span>
            <span className={`text-2xl font-black ${
              risk.level === 'alto' ? 'text-destructive' : risk.level === 'médio' ? 'text-warning' : 'text-success'
            }`}>{risk.score}</span>
          </div>
          <div className="text-[10px] font-bold uppercase mb-1.5"
            style={{ color: risk.level === 'alto' ? 'var(--destructive)' : risk.level === 'médio' ? 'var(--warning)' : 'var(--success)' }}
          >
            {risk.level}
          </div>
          {risk.reasons.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">Tudo sob controle 💪</p>
          ) : (
            <ul className="space-y-0.5">
              {risk.reasons.slice(0, 2).map((r) => (
                <li key={r} className="text-[10px] text-muted-foreground truncate">• {r}</li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      {/* Treino do dia */}
      <div className="px-4 mb-4">
        <Link
          to="/treino"
          className="block glass-card p-4 active:scale-[0.99] transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Dumbbell size={14} className="text-primary" />
              <span className="text-xs font-bold text-foreground">TREINO DE HOJE</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
          {isRest ? (
            <div>
              <div className="text-base font-black text-foreground">Dia de descanso</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Recuperação ativa: caminhada leve 20 min · alongamento
              </p>
            </div>
          ) : todayWorkout ? (
            <div>
              <div className="text-base font-black text-foreground">{todayWorkout.name} — {todayWorkout.focus}</div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                <span>{todayWorkout.exercises.length} exercícios</span>
                {profile.training_time && <span>· {profile.training_time.slice(0, 5)}</span>}
                {todayHabit?.workout_done && <span className="text-success font-bold">✓ feito</span>}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Configure seu split em Ferramentas → Perfil</div>
          )}
        </Link>
      </div>

      {/* Calorias */}
      <div className="px-4 mb-4">
        <Link to="/dieta" className="block glass-card p-4 active:scale-[0.99] transition">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-destructive" />
              <span className="text-xs font-bold text-foreground">CALORIAS HOJE</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-foreground">{kcal}</span>
            <span className="text-xs text-muted-foreground">/ {target} kcal</span>
            <span className={`ml-auto text-lg font-black ${over ? 'text-destructive' : 'text-primary'}`}>
              {kcalPct}%
            </span>
          </div>
          <div className="progress-bar-bg h-1.5 mb-1.5">
            <div
              className={`h-full rounded-full transition-all ${over ? 'bg-destructive' : 'progress-bar-fill'}`}
              style={{ width: `${kcalPct}%` }}
            />
          </div>
          <p className={`text-[11px] font-bold ${over ? 'text-destructive' : 'text-muted-foreground'}`}>
            {over ? `+${kcal - target} kcal acima` : `${remaining} kcal restantes`}
          </p>
        </Link>
      </div>

      {/* SOS Doce + Weekend */}
      <div className="px-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setUrgeOpen(true)}
          className="glass-card p-4 text-left active:scale-[0.99] transition border-warning/30"
        >
          <div className="flex items-center gap-2 mb-1">
            <Cookie size={14} className="text-warning" />
            <span className="text-xs font-bold text-foreground">SOS Doce</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Vontade agora? Toca aqui — 5 estratégias rápidas.</p>
        </button>
        <WeekendModeCard />
      </div>

      {/* CTA insights IA */}
      <div className="px-4 mb-4">
        <Link
          to="/"
          className="block glass-card p-3 active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground flex-1">Análise da semana com IA</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </div>
        </Link>
      </div>

      {/* FAB Check-in */}
      <button
        onClick={() => setCheckinOpen(true)}
        className="fixed bottom-20 right-4 z-30 bg-primary text-primary-foreground rounded-full shadow-lg neon-glow flex items-center gap-2 px-4 py-3 font-black text-xs active:scale-95 transition"
      >
        <Plus size={16} /> Check-in
      </button>

      <QuickCheckinDrawer open={checkinOpen} onClose={() => setCheckinOpen(false)} />
      <UrgeRescueDialog open={urgeOpen} onClose={() => setUrgeOpen(false)} />
    </div>
  );
}

/* ─────────────── Helpers de UI ─────────────── */

interface NextAction {
  title: string;
  desc: string;
  cta: string;
  variant: 'primary' | 'warning' | 'success';
  to?: string;
  onClick?: () => void;
}

function NextActionCard({
  action, onCheckin, onUrge,
}: { action: NextAction; onCheckin: () => void; onUrge: () => void }) {
  const handle = action.onClick ?? (
    action.cta === 'Check-in' ? onCheckin :
    action.cta === 'SOS Doce' ? onUrge :
    undefined
  );
  const colorMap = {
    primary: 'bg-primary text-primary-foreground',
    warning: 'bg-warning text-warning-foreground',
    success: 'bg-success text-success-foreground',
  } as const;
  const Icon = action.variant === 'warning' ? AlertTriangle : Target;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card neon-glow p-4 flex items-center gap-3 active:scale-[0.99] transition"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[action.variant]}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Próxima ação</div>
        <div className="text-sm font-black text-foreground truncate">{action.title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{action.desc}</div>
      </div>
      <div className={`text-[10px] font-black px-3 py-2 rounded-lg ${colorMap[action.variant]}`}>
        {action.cta}
      </div>
    </motion.div>
  );

  if (action.to) return <Link to={action.to}>{content}</Link>;
  return <button onClick={handle} className="w-full text-left">{content}</button>;
}

function computeNextAction(s: {
  workoutDone: boolean; isRest: boolean; cardioDone: boolean; waterDone: boolean;
  kcal: number; target: number; hasCheckin: boolean;
}): NextAction {
  const hour = new Date().getHours();
  if (s.kcal > s.target * 1.05) {
    return {
      title: 'Você passou da meta calórica',
      desc: 'Cuidado com lanches noturnos. Toma água.',
      cta: 'SOS Doce', variant: 'warning',
    };
  }
  if (!s.workoutDone && !s.isRest && hour >= 14) {
    return {
      title: 'Treino ainda não feito',
      desc: 'Bora — abre o treino de hoje.',
      cta: 'Treinar', variant: 'primary', to: '/treino',
    };
  }
  if (!s.waterDone && hour >= 12) {
    return {
      title: 'Água atrasada',
      desc: 'Marca no check-in quando bater 3L.',
      cta: 'Check-in', variant: 'primary',
    };
  }
  if (!s.hasCheckin) {
    return {
      title: 'Faça seu check-in',
      desc: 'Menos de 1 minuto. Te ajuda a manter consistência.',
      cta: 'Check-in', variant: 'primary',
    };
  }
  if (s.kcal < s.target * 0.5 && hour >= 18) {
    return {
      title: 'Calorias muito baixas pro horário',
      desc: 'Adiciona uma refeição pra evitar furada à noite.',
      cta: 'Adicionar', variant: 'primary', to: '/dieta',
    };
  }
  return {
    title: 'Você está no caminho ✅',
    desc: 'Mantém a consistência hoje.',
    cta: 'Ver progresso', variant: 'success', to: '/corpo',
  };
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Madrugada';
  if (h < 12) return 'Bom dia, soldado';
  if (h < 18) return 'Foco na missão';
  return 'Reta final do dia';
}

function prettyDate(): string {
  return new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long', day: '2-digit', month: 'short',
  });
}
