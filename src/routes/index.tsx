import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { load, todayKey } from "../lib/storage";
import type { DailyCheck, BodyLog } from "../lib/storage";
import { TrendingDown, Flame, Dumbbell, Moon, Droplets, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [checks, setChecks] = useState<DailyCheck[]>([]);
  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>([]);
  
  useEffect(() => {
    setChecks(load<DailyCheck[]>('daily_checks', []));
    setBodyLogs(load<BodyLog[]>('body_logs', []));
  }, []);

  const today = todayKey();
  const todayCheck = checks.find(c => c.date === today);
  
  // Last 7 days stats
  const last7 = checks.slice(-7);
  const trainDays = last7.filter(c => c.treino).length;
  const dietDays = last7.filter(c => c.dieta).length;
  const sleepDays = last7.filter(c => c.sono).length;
  
  const latestBody = bodyLogs[bodyLogs.length - 1];
  const currentWeight = latestBody?.weight ?? 93.5;
  const currentWaist = latestBody?.waist ?? 116;
  
  // Weight change
  const prevBody = bodyLogs.length >= 2 ? bodyLogs[bodyLogs.length - 2] : null;
  const weightDiff = prevBody?.weight ? currentWeight - prevBody.weight : 0;

  const todayChecks = [
    { label: 'Treino', done: todayCheck?.treino, icon: Dumbbell },
    { label: 'Dieta', done: todayCheck?.dieta, icon: Flame },
    { label: 'Sono', done: todayCheck?.sono, icon: Moon },
    { label: 'Água', done: todayCheck?.agua, icon: Droplets },
    { label: 'Cardio', done: todayCheck?.cardio, icon: Activity },
  ];

  const completedCount = todayChecks.filter(c => c.done).length;
  const completionPct = Math.round((completedCount / todayChecks.length) * 100);

  return (
    <div>
      <PageHeader title="BARRIGA ZERO" subtitle="Projeto de Transformação" emoji="🔥" />
      
      {/* Today's Progress */}
      <div className="px-4 mb-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card neon-glow p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hoje</span>
            <span className="text-2xl font-black text-primary neon-text">{completionPct}%</span>
          </div>
          <div className="progress-bar-bg h-2.5 mb-4">
            <div className="progress-bar-fill h-full" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {todayChecks.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center ${
                    item.done ? 'check-done' : 'check-pending'
                  }`}
                >
                  <Icon size={16} className={item.done ? 'text-success' : 'text-muted-foreground'} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Peso Atual</span>
          </div>
          <div className="text-2xl font-black text-foreground">{currentWeight}<span className="text-sm font-normal text-muted-foreground">kg</span></div>
          {weightDiff !== 0 && (
            <span className={`text-xs font-bold ${weightDiff < 0 ? 'text-success' : 'text-destructive'}`}>
              {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}kg
            </span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-warning" />
            <span className="text-xs font-medium text-muted-foreground">Cintura</span>
          </div>
          <div className="text-2xl font-black text-foreground">{currentWaist}<span className="text-sm font-normal text-muted-foreground">cm</span></div>
          <span className="text-xs text-muted-foreground">Meta: &lt;100cm</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell size={14} className="text-chart-3" />
            <span className="text-xs font-medium text-muted-foreground">Treinos (7d)</span>
          </div>
          <div className="text-2xl font-black text-foreground">{trainDays}<span className="text-sm font-normal text-muted-foreground">/5</span></div>
          <div className="progress-bar-bg h-1.5 mt-1">
            <div className="progress-bar-fill h-full" style={{ width: `${(trainDays / 5) * 100}%` }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <Flame size={14} className="text-destructive" />
            <span className="text-xs font-medium text-muted-foreground">Dieta (7d)</span>
          </div>
          <div className="text-2xl font-black text-foreground">{dietDays}<span className="text-sm font-normal text-muted-foreground">/7</span></div>
          <div className="progress-bar-bg h-1.5 mt-1">
            <div className="progress-bar-fill h-full" style={{ width: `${(dietDays / 7) * 100}%` }} />
          </div>
        </motion.div>
      </div>

      {/* Weekly Evolution Mini Chart */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <h3 className="text-sm font-bold text-foreground mb-3">📈 Evolução do Peso</h3>
          {bodyLogs.length < 2 ? (
            <p className="text-xs text-muted-foreground">Registre seu peso semanalmente para ver o gráfico de evolução aqui.</p>
          ) : (
            <div className="flex items-end gap-1 h-20">
              {bodyLogs.slice(-8).map((log, i) => {
                const min = Math.min(...bodyLogs.slice(-8).map(l => l.weight ?? 90));
                const max = Math.max(...bodyLogs.slice(-8).map(l => l.weight ?? 95));
                const range = max - min || 1;
                const height = ((log.weight ?? 93.5) - min) / range * 60 + 10;
                return (
                  <div key={log.date + i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] text-muted-foreground">{log.weight}</span>
                    <div
                      className="w-full rounded-t bg-primary/70"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[7px] text-muted-foreground">{log.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Info */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-4"
        >
          <h3 className="text-sm font-bold text-foreground mb-2">📋 Seus Dados</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-muted-foreground">Idade: <span className="text-foreground font-semibold">33 anos</span></div>
            <div className="text-muted-foreground">Altura: <span className="text-foreground font-semibold">1.70m</span></div>
            <div className="text-muted-foreground">BF: <span className="text-foreground font-semibold">33%</span></div>
            <div className="text-muted-foreground">TMB: <span className="text-foreground font-semibold">1946 kcal</span></div>
            <div className="text-muted-foreground">Meta Kcal: <span className="text-primary font-bold">1800 kcal</span></div>
            <div className="text-muted-foreground">Treino: <span className="text-foreground font-semibold">5x/sem</span></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Target({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
