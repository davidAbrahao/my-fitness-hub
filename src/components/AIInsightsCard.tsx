import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useBodyMetrics, useHabits, usePersonalRecords, useNutritionHistory } from "../lib/cloud-hooks";
import { generateWeeklyInsights } from "../server/insights";
import { weekStartISO, todayISO } from "../lib/date-utils";
import { getCachedInsight, setCachedInsight, cacheRemainingHours } from "../lib/insights-cache";
import { toast } from "sonner";

export function AIInsightsCard() {
  const { data: body } = useBodyMetrics();
  const { data: habits } = useHabits();
  const { data: prs } = usePersonalRecords();
  const { data: nutrition } = useNutritionHistory(7);

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  // Hidrata do cache no mount
  useEffect(() => {
    const c = getCachedInsight();
    if (c) {
      setContent(c.content);
      setGeneratedAt(c.generatedAt);
      setFromCache(true);
    }
  }, []);

  async function handleAnalyze(force = false) {
    if (!force) {
      const c = getCachedInsight();
      if (c) {
        setContent(c.content);
        setGeneratedAt(c.generatedAt);
        setFromCache(true);
        toast.info(`💡 Usando análise em cache (válida por mais ${cacheRemainingHours(c)}h)`);
        return;
      }
    }
    setLoading(true);
    try {
      const weekStart = weekStartISO();
      const weekEnd = todayISO();
      const snapshot = {
        weekStart,
        weekEnd,
        body: body.slice(-14).map((b) => ({
          date: b.date,
          weight: b.weight,
          waist: b.waist,
          body_fat: b.body_fat,
        })),
        habits: habits.slice(-14).map((h) => ({
          date: h.date,
          workout_done: h.workout_done,
          diet_ok: h.diet_ok,
          water: h.water,
          sleep_hours: h.sleep_hours,
        })),
        nutrition: nutrition.map((n) => ({
          date: n.date,
          calories: n.calories,
          protein: n.protein,
          carbs: n.carbs,
          fat: n.fat,
        })),
        prs: prs.slice(-10).map((p) => ({
          exercise_name: p.exercise_name,
          estimated_1rm: p.estimated_1rm,
          date: p.date,
        })),
        profile: {
          age: 33,
          height_cm: 170,
          weight_kg: 93.5,
          bf_pct: 33,
          goal: "Reduzir BF para 15%, manter massa magra",
          calorie_target: 1800,
        },
      };

      const result = await generateWeeklyInsights({ data: { snapshot } });
      setContent(result.content);
      setGeneratedAt(result.generatedAt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar insights";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Coach IA</h3>
              <p className="text-[10px] text-muted-foreground">Análise da sua semana</p>
            </div>
          </div>
          {content && !loading && (
            <button
              onClick={handleAnalyze}
              className="flex items-center gap-1 text-[10px] text-primary font-bold"
            >
              <RefreshCw size={10} /> Atualizar
            </button>
          )}
        </div>

        {!content && !loading && (
          <button
            onClick={handleAnalyze}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles size={14} /> Analisar minha semana
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-xs">
            <Loader2 className="animate-spin" size={14} /> Coach analisando seus dados…
          </div>
        )}

        {content && !loading && (
          <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed prose-headings:text-primary prose-headings:font-bold prose-headings:text-sm prose-headings:mt-3 prose-headings:mb-2 prose-strong:text-foreground prose-p:text-foreground prose-p:my-1.5 prose-ul:my-1.5 prose-li:text-foreground prose-li:my-0.5">
            <ReactMarkdown>{content}</ReactMarkdown>
            {generatedAt && (
              <p className="text-[9px] text-muted-foreground mt-3 italic">
                Gerado em {new Date(generatedAt).toLocaleString("pt-BR")}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
