import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { AdvancedDashboard } from "../components/AdvancedDashboard";
import { NutritionTodayCard } from "../components/NutritionTodayCard";
import { load, todayKey } from "../lib/storage";
import type { DailyCheck } from "../lib/storage";
import { Dumbbell, Flame, Moon, Droplets, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [todayCheck, setTodayCheck] = useState<DailyCheck | undefined>();

  useEffect(() => {
    const checks = load<DailyCheck[]>("daily_checks", []);
    setTodayCheck(checks.find((c) => c.date === todayKey()));
  }, []);

  const todayChecks = [
    { label: "Treino", done: todayCheck?.treino, icon: Dumbbell },
    { label: "Dieta", done: todayCheck?.dieta, icon: Flame },
    { label: "Sono", done: todayCheck?.sono, icon: Moon },
    { label: "Água", done: todayCheck?.agua, icon: Droplets },
    { label: "Cardio", done: todayCheck?.cardio, icon: Activity },
  ];
  const completed = todayChecks.filter((c) => c.done).length;
  const pct = Math.round((completed / todayChecks.length) * 100);

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
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Hoje
            </span>
            <span className="text-2xl font-black text-primary neon-text">{pct}%</span>
          </div>
          <div className="progress-bar-bg h-2.5 mb-4">
            <div
              className="progress-bar-fill h-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {todayChecks.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center ${
                    item.done ? "check-done" : "check-pending"
                  }`}
                >
                  <Icon
                    size={16}
                    className={item.done ? "text-success" : "text-muted-foreground"}
                  />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Today's nutrition (cloud) */}
      <div className="mb-4">
        <NutritionTodayCard />
      </div>

      {/* Advanced Dashboard with charts + cloud data */}
      <AdvancedDashboard />

    </div>
  );
}
