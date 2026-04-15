import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { dietPlan } from "../lib/training-data";
import { Clock, Flame, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/dieta")({
  component: DietaPage,
  head: () => ({
    meta: [{ title: "Dieta — Barriga Zero" }],
  }),
});

function DietaPage() {
  return (
    <div>
      <PageHeader title="DIETA" subtitle={`Meta: ${dietPlan.targetCalories} kcal/dia`} emoji="🍽️" />

      {/* Macros */}
      <div className="px-4 mb-4">
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Macros Diários</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-black text-primary">{dietPlan.macros.protein.grams}g</div>
              <div className="text-[10px] text-muted-foreground font-medium">Proteína ({dietPlan.macros.protein.pct}%)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-warning">{dietPlan.macros.carbs.grams}g</div>
              <div className="text-[10px] text-muted-foreground font-medium">Carbos ({dietPlan.macros.carbs.pct}%)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-destructive">{dietPlan.macros.fat.grams}g</div>
              <div className="text-[10px] text-muted-foreground font-medium">Gordura ({dietPlan.macros.fat.pct}%)</div>
            </div>
          </div>
          <div className="progress-bar-bg h-2 mt-3 flex overflow-hidden rounded-full">
            <div className="h-full bg-primary" style={{ width: `${dietPlan.macros.protein.pct}%` }} />
            <div className="h-full bg-warning" style={{ width: `${dietPlan.macros.carbs.pct}%` }} />
            <div className="h-full bg-destructive" style={{ width: `${dietPlan.macros.fat.pct}%` }} />
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="px-4 space-y-3 mb-6">
        {dietPlan.meals.map((meal, i) => (
          <motion.div
            key={meal.name}
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
              </div>
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-destructive" />
                <span className="text-xs font-bold text-foreground">{meal.calories} kcal</span>
              </div>
            </div>
            <ul className="space-y-1">
              {meal.items.map(item => (
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
            {dietPlan.tips.map(tip => (
              <li key={tip} className="text-xs text-secondary-foreground flex items-start gap-2">
                <span className="text-warning mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
