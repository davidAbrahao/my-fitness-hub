import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { load, save, todayKey } from "../lib/storage";
import type { DailyCheck } from "../lib/storage";
import { antiFailProtocol } from "../lib/training-data";
import { Dumbbell, Flame, Moon, Droplets, Activity, Pill, Save, Shield } from "lucide-react";

export const Route = createFileRoute("/checklist")({
  component: ChecklistPage,
  head: () => ({
    meta: [{ title: "Checklist — Barriga Zero" }],
  }),
});

const checkItems = [
  { key: 'treino' as const, label: 'Treinou hoje', icon: Dumbbell },
  { key: 'dieta' as const, label: 'Seguiu a dieta', icon: Flame },
  { key: 'sono' as const, label: 'Dormiu bem (7h+)', icon: Moon },
  { key: 'agua' as const, label: 'Bebeu 3L+ de água', icon: Droplets },
  { key: 'cardio' as const, label: 'Fez cardio', icon: Activity },
  { key: 'suplementos' as const, label: 'Tomou suplementos', icon: Pill },
];

function ChecklistPage() {
  const today = todayKey();
  const [checks, setChecks] = useState<DailyCheck[]>([]);
  const [notes, setNotes] = useState('');
  const [showProtocol, setShowProtocol] = useState(false);

  useEffect(() => {
    const loaded = load<DailyCheck[]>('daily_checks', []);
    setChecks(loaded);
    const todayCheck = loaded.find(c => c.date === today);
    if (todayCheck) {
      setNotes(todayCheck.notes);
    }
  }, [today]);

  const todayCheck = checks.find(c => c.date === today) || {
    date: today,
    treino: false,
    dieta: false,
    sono: false,
    agua: false,
    cardio: false,
    suplementos: false,
    notes: '',
  };

  function toggle(key: keyof Omit<DailyCheck, 'date' | 'notes'>) {
    const updated = checks.filter(c => c.date !== today);
    const newCheck = { ...todayCheck, [key]: !todayCheck[key] };
    updated.push(newCheck);
    setChecks(updated);
    save('daily_checks', updated);
  }

  function saveNotes() {
    const updated = checks.filter(c => c.date !== today);
    updated.push({ ...todayCheck, notes });
    setChecks(updated);
    save('daily_checks', updated);
  }

  const completedCount = checkItems.filter(item => todayCheck[item.key]).length;

  return (
    <div>
      <PageHeader title="CHECK DIÁRIO" subtitle={`${today} — ${completedCount}/${checkItems.length} completos`} emoji="✅" />

      {/* Checklist */}
      <div className="px-4 space-y-2 mb-6">
        {checkItems.map((item, i) => {
          const checked = todayCheck[item.key];
          const Icon = item.icon;
          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggle(item.key)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                checked ? 'check-done' : 'glass-card'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                checked ? 'bg-success' : 'bg-muted'
              }`}>
                {checked && <span className="text-success-foreground text-xs font-bold">✓</span>}
              </div>
              <Icon size={16} className={checked ? 'text-success' : 'text-muted-foreground'} />
              <span className={`text-sm font-medium ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Notes */}
      <div className="px-4 mb-6">
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-2">📝 Notas do Dia</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="O que fez, o que deixou de fazer, como se sentiu..."
            className="w-full bg-input text-foreground text-sm p-3 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary resize-none h-24"
          />
          <button
            onClick={saveNotes}
            className="mt-2 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold"
          >
            <Save size={14} /> Salvar Notas
          </button>
        </div>
      </div>

      {/* Anti-Fail Protocol */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setShowProtocol(!showProtocol)}
          className="w-full glass-card tactical-border neon-glow p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <span className="text-sm font-bold text-primary">{antiFailProtocol.title}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{antiFailProtocol.subtitle}</p>
        </button>

        {showProtocol && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            {antiFailProtocol.rules.map((rule, i) => (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{rule.icon}</span>
                  <span className="text-xs font-bold text-foreground">{rule.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
