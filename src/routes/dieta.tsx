import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { defaultDietPlan } from "../lib/training-data";
import { load, save } from "../lib/storage";
import { Clock, Flame, Lightbulb, Edit3, Plus } from "lucide-react";
import { EditMealDialog } from "../components/EditMealDialog";
import type { MealData } from "../components/EditMealDialog";

export const Route = createFileRoute("/dieta")({
  component: DietaPage,
  head: () => ({
    meta: [{ title: "Dieta — Barriga Zero" }],
  }),
});

function DietaPage() {
  const [diet, setDiet] = useState(defaultDietPlan);
  const [editMode, setEditMode] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ meal: MealData | null; index: number; isNew: boolean } | null>(null);

  useEffect(() => {
    const custom = load<typeof defaultDietPlan | null>('custom_diet_plan', null);
    if (custom) setDiet(custom);
  }, []);

  function saveDiet(newDiet: typeof defaultDietPlan) {
    setDiet(newDiet);
    save('custom_diet_plan', newDiet);
  }

  function handleSaveMeal(meal: MealData) {
    const newDiet = { ...diet, meals: [...diet.meals] };
    if (editingMeal!.isNew) {
      newDiet.meals.push(meal);
    } else {
      newDiet.meals[editingMeal!.index] = meal;
    }
    saveDiet(newDiet);
    setEditingMeal(null);
  }

  function handleDeleteMeal(index: number) {
    const newDiet = { ...diet, meals: diet.meals.filter((_: MealData, i: number) => i !== index) };
    saveDiet(newDiet);
    setEditingMeal(null);
  }

  function resetDiet() {
    setDiet(defaultDietPlan);
    save('custom_diet_plan', null);
    setEditMode(false);
  }

  return (
    <div>
      <PageHeader title="DIETA" subtitle={`Meta: ${diet.targetCalories} kcal/dia`} emoji="🍽️" />

      {/* Macros */}
      <div className="px-4 mb-4">
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Macros Diários</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-black text-primary">{diet.macros.protein.grams}g</div>
              <div className="text-[10px] text-muted-foreground font-medium">Proteína ({diet.macros.protein.pct}%)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-warning">{diet.macros.carbs.grams}g</div>
              <div className="text-[10px] text-muted-foreground font-medium">Carbos ({diet.macros.carbs.pct}%)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-destructive">{diet.macros.fat.grams}g</div>
              <div className="text-[10px] text-muted-foreground font-medium">Gordura ({diet.macros.fat.pct}%)</div>
            </div>
          </div>
          <div className="progress-bar-bg h-2 mt-3 flex overflow-hidden rounded-full">
            <div className="h-full bg-primary" style={{ width: `${diet.macros.protein.pct}%` }} />
            <div className="h-full bg-warning" style={{ width: `${diet.macros.carbs.pct}%` }} />
            <div className="h-full bg-destructive" style={{ width: `${diet.macros.fat.pct}%` }} />
          </div>
          <div className="mt-2 text-center">
            <span className="text-xs text-muted-foreground">Total das refeições: </span>
            <span className="text-xs font-bold text-primary">
              {diet.meals.reduce((s: number, m: MealData) => s + (m.calories ?? 0), 0)} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Edit mode toggle */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
            editMode ? 'bg-warning/20 text-warning' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <Edit3 size={12} /> {editMode ? 'Editando...' : 'Editar Dieta'}
        </button>
        {editMode && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditingMeal({ meal: null, index: -1, isNew: true })}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground"
            >
              <Plus size={12} /> Refeição
            </button>
            <button onClick={resetDiet} className="text-xs text-destructive font-bold px-2 py-1.5">
              Resetar
            </button>
          </div>
        )}
      </div>

      {/* Meals */}
      <div className="px-4 space-y-3 mb-6">
        {diet.meals.map((meal: MealData, i: number) => (
          <motion.div
            key={meal.id ?? meal.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-primary" />
                <span className="text-xs text-primary font-bold">{meal.time}</span>
                <span className="text-sm font-bold text-foreground">{meal.name}</span>
                {editMode && (
                  <button
                    onClick={() => setEditingMeal({ meal, index: i, isNew: false })}
                    className="text-warning ml-1"
                  >
                    <Edit3 size={12} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-destructive" />
                <span className="text-xs font-bold text-foreground">{meal.calories} kcal</span>
              </div>
            </div>
            
            {/* Macro estimate per meal */}
            <div className="flex gap-2 mb-2">
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                P: ~{Math.round(meal.calories * (diet.macros.protein.pct / 100) / 4)}g
              </span>
              <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded font-bold">
                C: ~{Math.round(meal.calories * (diet.macros.carbs.pct / 100) / 4)}g
              </span>
              <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">
                G: ~{Math.round(meal.calories * (diet.macros.fat.pct / 100) / 9)}g
              </span>
            </div>
            <ul className="space-y-1">
              {meal.items.map((item: string) => (
                <li key={item} className="text-xs text-secondary-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <div className="px-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-warning" />
            <h3 className="text-sm font-bold text-foreground">Dicas Importantes</h3>
          </div>
          <ul className="space-y-2">
            {diet.tips.map((tip: string) => (
              <li key={tip} className="text-xs text-secondary-foreground flex items-start gap-2">
                <span className="text-warning mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Edit Meal Dialog */}
      <AnimatePresence>
        {editingMeal && (
          <EditMealDialog
            meal={editingMeal.meal}
            isNew={editingMeal.isNew}
            onSave={handleSaveMeal}
            onDelete={editingMeal.isNew ? undefined : () => handleDeleteMeal(editingMeal.index)}
            onClose={() => setEditingMeal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
