import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { cardioProtocol } from "../lib/training-data";
import { Heart, Clock, Zap, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/cardio")({
  component: CardioPage,
  head: () => ({
    meta: [{ title: "Cardio — Barriga Zero" }],
  }),
});

function CardioPage() {
  const typeColors: Record<string, string> = {
    LISS: 'text-success',
    HIIT: 'text-destructive',
    MISS: 'text-warning',
  };

  const typeBg: Record<string, string> = {
    LISS: 'bg-success/10 tactical-border',
    HIIT: 'bg-destructive/10 border border-destructive/20',
    MISS: 'bg-warning/10 border border-warning/20',
  };

  return (
    <div>
      <PageHeader title="CARDIO" subtitle={cardioProtocol.description} emoji="❤️‍🔥" />

      {/* Sessions */}
      <div className="px-4 space-y-3 mb-6">
        {cardioProtocol.sessions.map((session, i) => (
          <motion.div
            key={session.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 ${typeBg[session.type]}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground">{session.day}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${typeColors[session.type]} bg-background/50`}>
                {session.type}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-primary" />
                <span className="text-sm font-bold text-foreground">{session.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={12} className="text-destructive" />
                <span className="text-xs text-muted-foreground">{session.intensity}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <Zap size={12} className="text-warning" />
              <span className="text-sm font-semibold text-foreground">{session.activity}</span>
            </div>
            <p className="text-xs text-muted-foreground italic">💡 {session.tip}</p>
          </motion.div>
        ))}
      </div>

      {/* Rules */}
      <div className="px-4 mb-6">
        <div className="glass-card p-4 border border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-destructive" />
            <h3 className="text-sm font-bold text-foreground">Regras do Cardio</h3>
          </div>
          <ul className="space-y-2">
            {cardioProtocol.rules.map((rule, i) => (
              <li key={i} className="text-xs text-secondary-foreground flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 mb-6">
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Legenda</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-success px-2 py-0.5 rounded-full bg-success/10">LISS</span>
              <span className="text-xs text-muted-foreground">Low Intensity Steady State — Queima gordura, preserva músculo</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-warning px-2 py-0.5 rounded-full bg-warning/10">MISS</span>
              <span className="text-xs text-muted-foreground">Moderate Intensity — Trote moderado, equilíbrio</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-destructive px-2 py-0.5 rounded-full bg-destructive/10">HIIT</span>
              <span className="text-xs text-muted-foreground">High Intensity Interval — Máxima queima calórica pós-treino</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
