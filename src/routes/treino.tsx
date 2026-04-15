import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { trainingPlan } from "../lib/training-data";
import { load, save, todayKey } from "../lib/storage";
import type { WorkoutLog } from "../lib/storage";
import { ChevronDown, ChevronUp, RefreshCw, Plus, Minus, Check } from "lucide-react";

export const Route = createFileRoute("/treino")({
  component: TreinoPage,
  head: () => ({
    meta: [{ title: "Treino — Barriga Zero" }],
  }),
});

function TreinoPage() {
  const dayOfWeek = new Date().getDay();
  const dayIndex = dayOfWeek >= 1 && dayOfWeek <= 5 ? dayOfWeek - 1 : 0;
  const [selectedDay, setSelectedDay] = useState(dayIndex);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showSubstitute, setShowSubstitute] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    setLogs(load<WorkoutLog[]>('workout_logs', []));
  }, []);

  const day = trainingPlan[selectedDay];
  const today = todayKey();

  function getExerciseLogs(exerciseId: string): WorkoutLog | undefined {
    return logs.find(l => l.date === today && l.exerciseId === exerciseId);
  }

  function addSet(exerciseId: string) {
    const updated = [...logs];
    const existing = updated.find(l => l.date === today && l.exerciseId === exerciseId);
    if (existing) {
      existing.sets.push({ reps: 0, weight: 0 });
    } else {
      updated.push({ date: today, exerciseId, sets: [{ reps: 0, weight: 0 }] });
    }
    setLogs(updated);
    save('workout_logs', updated);
  }

  function updateSet(exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) {
    const updated = [...logs];
    const existing = updated.find(l => l.date === today && l.exerciseId === exerciseId);
    if (existing && existing.sets[setIndex]) {
      existing.sets[setIndex][field] = value;
      setLogs(updated);
      save('workout_logs', updated);
    }
  }

  function removeSet(exerciseId: string, setIndex: number) {
    const updated = [...logs];
    const existing = updated.find(l => l.date === today && l.exerciseId === exerciseId);
    if (existing) {
      existing.sets.splice(setIndex, 1);
      if (existing.sets.length === 0) {
        const idx = updated.indexOf(existing);
        updated.splice(idx, 1);
      }
      setLogs(updated);
      save('workout_logs', updated);
    }
  }

  return (
    <div>
      <PageHeader title="TREINO" subtitle={`${day.name} — ${day.focus}`} emoji="🏋️" />

      {/* Day selector */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-2">
        {trainingPlan.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setSelectedDay(i)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              i === selectedDay
                ? 'bg-primary text-primary-foreground neon-glow'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            <div>{d.name}</div>
            <div className="text-[10px] font-normal opacity-75">{d.label}</div>
          </button>
        ))}
      </div>

      {/* Exercises */}
      <div className="px-4 space-y-3 mb-6">
        {day.exercises.map((exercise, exIdx) => {
          const isExpanded = expandedExercise === exercise.id;
          const showSubs = showSubstitute === exercise.id;
          const exerciseLog = getExerciseLogs(exercise.id);
          const setsCompleted = exerciseLog?.sets.length ?? 0;

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: exIdx * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">{exIdx + 1}</span>
                    <span className="text-sm font-bold text-foreground">{exercise.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{exercise.sets}x{exercise.reps}</span>
                    <span className="text-xs text-muted-foreground">⏱ {exercise.rest}</span>
                    {setsCompleted > 0 && (
                      <span className="text-xs text-success font-bold flex items-center gap-1">
                        <Check size={10} /> {setsCompleted} séries
                      </span>
                    )}
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {/* Tip */}
                      <div className="bg-primary/10 tactical-border rounded-lg p-3">
                        <span className="text-xs font-bold text-primary">💡 Dica de Execução</span>
                        <p className="text-xs text-foreground mt-1">{exercise.tip}</p>
                      </div>

                      {/* Muscle group */}
                      <div className="text-xs text-muted-foreground">
                        Músculo: <span className="text-foreground font-semibold">{exercise.muscleGroup}</span>
                      </div>

                      {/* Substitutes */}
                      <button
                        onClick={() => setShowSubstitute(showSubs ? null : exercise.id)}
                        className="flex items-center gap-1 text-xs text-primary font-semibold"
                      >
                        <RefreshCw size={12} /> Substituições
                      </button>
                      {showSubs && (
                        <div className="space-y-1">
                          {exercise.substitutes.map(sub => (
                            <div key={sub} className="text-xs text-secondary-foreground bg-secondary rounded-md px-3 py-2">
                              → {sub}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Log sets */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-foreground">Registrar Séries</span>
                          <button
                            onClick={() => addSet(exercise.id)}
                            className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md font-bold"
                          >
                            <Plus size={12} /> Série
                          </button>
                        </div>

                        {exerciseLog?.sets.map((set, si) => (
                          <div key={si} className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground w-6 font-bold">{si + 1}.</span>
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Reps"
                                value={set.reps || ''}
                                onChange={e => updateSet(exercise.id, si, 'reps', Number(e.target.value))}
                                className="w-16 bg-input text-foreground text-xs px-2 py-1.5 rounded-md border-0 outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-xs text-muted-foreground">x</span>
                              <input
                                type="number"
                                placeholder="Kg"
                                value={set.weight || ''}
                                onChange={e => updateSet(exercise.id, si, 'weight', Number(e.target.value))}
                                className="w-16 bg-input text-foreground text-xs px-2 py-1.5 rounded-md border-0 outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-xs text-muted-foreground">kg</span>
                            </div>
                            <button onClick={() => removeSet(exercise.id, si)} className="text-destructive">
                              <Minus size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
