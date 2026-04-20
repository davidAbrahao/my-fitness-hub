import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { defaultTrainingPlan, progressionTips } from "../lib/training-data";
import type { TrainingDay, Exercise } from "../lib/training-data";
import { load, save, todayKey } from "../lib/storage";
import type { WorkoutLog } from "../lib/storage";
import { ChevronDown, ChevronUp, RefreshCw, Plus, Minus, Check, Timer, Edit3, ExternalLink, Flame } from "lucide-react";
import { RestTimer } from "../components/RestTimer";
import { EditExerciseDialog } from "../components/EditExerciseDialog";
import { getExerciseGifUrl, workoutCalories } from "../lib/exercise-utils";
import { useTodayWorkout } from "../lib/cloud-hooks";
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
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [editMode, setEditMode] = useState(false);
  const [editingExercise, setEditingExercise] = useState<{ exercise: Exercise | null; index: number; isNew: boolean } | null>(null);

  // Load custom plan or default
  const [plan, setPlan] = useState<TrainingDay[]>(defaultTrainingPlan);

  const day = plan[selectedDay];
  const today = todayKey();
  const { upsertExercise } = useTodayWorkout(day?.id ?? 'unknown');

  useEffect(() => {
    const custom = load<TrainingDay[] | null>('custom_training_plan', null);
    if (custom) setPlan(custom);
    setLogs(load<WorkoutLog[]>('workout_logs', []));
  }, []);

  function savePlan(newPlan: TrainingDay[]) {
    setPlan(newPlan);
    save('custom_training_plan', newPlan);
  }

  function getExerciseLogs(exerciseId: string): WorkoutLog | undefined {
    return logs.find(l => l.date === today && l.exerciseId === exerciseId);
  }

  /** Sincroniza um exercício específico com o cloud (fila offline). */
  function syncExercise(exerciseId: string, updatedLogs: WorkoutLog[]) {
    const log = updatedLogs.find(l => l.date === today && l.exerciseId === exerciseId);
    const ex = day?.exercises.find(e => e.id === exerciseId);
    if (!ex) return;
    void upsertExercise({
      exercise_id: exerciseId,
      exercise_name: ex.name,
      sets: log?.sets ?? [],
    });
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
    syncExercise(exerciseId, updated);
  }

  function updateSet(exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) {
    const updated = [...logs];
    const existing = updated.find(l => l.date === today && l.exerciseId === exerciseId);
    if (existing && existing.sets[setIndex]) {
      existing.sets[setIndex][field] = value;
      setLogs(updated);
      save('workout_logs', updated);
      syncExercise(exerciseId, updated);
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
      syncExercise(exerciseId, updated);
    }
  }

  function startTimer(restStr: string) {
    const match = restStr.match(/(\d+)/);
    const secs = match ? parseInt(match[1]) : 60;
    setTimerSeconds(secs);
    setShowTimer(true);
  }

  function handleSaveExercise(exercise: Exercise) {
    const newPlan = [...plan];
    const dayData = { ...newPlan[selectedDay], exercises: [...newPlan[selectedDay].exercises] };
    if (editingExercise!.isNew) {
      dayData.exercises.push(exercise);
    } else {
      dayData.exercises[editingExercise!.index] = exercise;
    }
    newPlan[selectedDay] = dayData;
    savePlan(newPlan);
    setEditingExercise(null);
  }

  function handleDeleteExercise(index: number) {
    const newPlan = [...plan];
    const dayData = { ...newPlan[selectedDay], exercises: [...newPlan[selectedDay].exercises] };
    dayData.exercises.splice(index, 1);
    newPlan[selectedDay] = dayData;
    savePlan(newPlan);
    setEditingExercise(null);
  }

  function resetPlan() {
    setPlan(defaultTrainingPlan);
    save('custom_training_plan', null);
    setEditMode(false);
  }

  if (!day) return null;

  return (
    <div>
      <PageHeader title="TREINO" subtitle={`${day.name} — ${day.focus}`} emoji="🏋️" />

      {/* Day selector */}
      <div className="px-4 mb-3 flex gap-2 overflow-x-auto pb-2">
        {plan.map((d: TrainingDay, i: number) => (
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

      {/* Edit mode toggle */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
            editMode ? 'bg-warning/20 text-warning' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <Edit3 size={12} /> {editMode ? 'Editando...' : 'Editar Treino'}
        </button>
        {editMode && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditingExercise({ exercise: null, index: -1, isNew: true })}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground"
            >
              <Plus size={12} /> Exercício
            </button>
            <button onClick={resetPlan} className="text-xs text-destructive font-bold px-2 py-1.5">
              Resetar
            </button>
          </div>
        )}
      </div>

      {/* Calorie estimate + Cardio note */}
      <div className="px-4 mb-3">
        {workoutCalories[day.id] && (
          <div className="glass-card p-3 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-destructive" />
              <span className="text-xs font-bold text-foreground">Gasto estimado</span>
            </div>
            <span className="text-xs font-bold text-primary">
              ~{workoutCalories[day.id].min}–{workoutCalories[day.id].max} kcal
            </span>
          </div>
        )}
        {day.cardioNote && (
          <div className="bg-primary/10 tactical-border rounded-lg p-3 text-xs font-bold text-primary">
            {day.cardioNote}
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="px-4 space-y-3 mb-4">
        {day.exercises.map((exercise: Exercise, exIdx: number) => {
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
                    {editMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingExercise({ exercise, index: exIdx, isNew: false }); }}
                        className="text-warning ml-1"
                      >
                        <Edit3 size={12} />
                      </button>
                    )}
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

                      {/* GIF link */}
                      {(() => {
                        const gifUrl = getExerciseGifUrl(exercise.name);
                        return gifUrl ? (
                          <a
                            href={gifUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs bg-chart-3/10 text-chart-3 font-bold px-3 py-2 rounded-lg w-full justify-center border border-chart-3/20"
                          >
                            <ExternalLink size={14} /> Ver Execução (GIF/Vídeo)
                          </a>
                        ) : null;
                      })()}

                      {/* Rest timer button */}
                      <button
                        onClick={() => startTimer(exercise.rest)}
                        className="flex items-center gap-2 text-xs bg-primary/10 text-primary font-bold px-3 py-2 rounded-lg w-full justify-center"
                      >
                        <Timer size={14} /> Iniciar Timer ({exercise.rest})
                      </button>

                      {/* Substitutes */}
                      <button
                        onClick={() => setShowSubstitute(showSubs ? null : exercise.id)}
                        className="flex items-center gap-1 text-xs text-primary font-semibold"
                      >
                        <RefreshCw size={12} /> Substituições
                      </button>
                      {showSubs && (
                        <div className="space-y-1">
                          {exercise.substitutes.map((sub: string) => (
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

      {/* Progression tips */}
      <div className="px-4 mb-6">
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">{progressionTips.title}</h3>
          <div className="space-y-3">
            {progressionTips.items.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <span className="text-xs font-bold text-foreground">{item.title}</span>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rest Timer */}
      <AnimatePresence>
        {showTimer && (
          <RestTimer defaultSeconds={timerSeconds} onClose={() => setShowTimer(false)} />
        )}
      </AnimatePresence>

      {/* Edit Exercise Dialog */}
      <AnimatePresence>
        {editingExercise && (
          <EditExerciseDialog
            exercise={editingExercise.exercise}
            isNew={editingExercise.isNew}
            onSave={handleSaveExercise}
            onDelete={editingExercise.isNew ? undefined : () => handleDeleteExercise(editingExercise.index)}
            onClose={() => setEditingExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
