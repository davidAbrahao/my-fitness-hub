import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { Calculator, Trophy, Bone, Shuffle, ChevronDown, ChevronUp, Trash2, TrendingUp, UserCog, Bell } from "lucide-react";
import { RemindersPanel } from "../components/RemindersPanel";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  calculate1RM,
  percentageZones,
  biomechanicsData,
  smartAlternatives,
} from "../lib/rm-calculator";
import { usePersonalRecords, type CloudPR } from "../lib/cloud-hooks";
import { todayISO } from "../lib/date-utils";
import { AccountPanel } from "../components/AccountPanel";
import { toast } from "sonner";

export const Route = createFileRoute("/ferramentas")({
  component: FerramentasPage,
  head: () => ({
    meta: [{ title: "Ferramentas — Barriga Zero" }],
  }),
});

type Tab = "1rm" | "pr" | "bio" | "alt" | "lemb" | "conta";

function FerramentasPage() {
  const [tab, setTab] = useState<Tab>("1rm");

  const tabs: { id: Tab; label: string; icon: typeof Calculator }[] = [
    { id: "1rm", label: "1RM", icon: Calculator },
    { id: "pr", label: "PRs", icon: Trophy },
    { id: "bio", label: "Bio", icon: Bone },
    { id: "alt", label: "Alt.", icon: Shuffle },
    { id: "lemb", label: "Sino", icon: Bell },
    { id: "conta", label: "Conta", icon: UserCog },
  ];

  return (
    <div>
      <PageHeader title="FERRAMENTAS" subtitle="Calculadoras & Guias" emoji="🧮" />

      {/* Tab selector */}
      <div className="px-4 mb-4 flex gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === t.id
                  ? "bg-primary text-primary-foreground neon-glow"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "1rm" && <RMCalculator />}
          {tab === "pr" && <PRTracker />}
          {tab === "bio" && <BiomechanicsGuide />}
          {tab === "alt" && <SmartAlternatives />}
          {tab === "lemb" && <div className="px-4"><RemindersPanel /></div>}
          {tab === "conta" && <div className="px-4"><AccountPanel /></div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────── 1RM Calculator ───────────── */
function RMCalculator() {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const result = useMemo(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (w > 0 && r > 0) return calculate1RM(w, r);
    return null;
  }, [weight, reps]);

  return (
    <div className="px-4 space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">💪 Calcular 1RM</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground">Peso (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="80"
              className="w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Repetições</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="8"
              className="w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-primary/15 rounded-xl p-4 text-center mb-4">
              <div className="text-xs text-primary font-bold mb-1">1RM ESTIMADO</div>
              <div className="text-3xl font-black text-foreground">{result.average} <span className="text-lg text-muted-foreground">kg</span></div>
            </div>

            {/* Formulas breakdown */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {result.results.map((r) => (
                <div key={r.formula} className="bg-secondary rounded-lg px-3 py-2 text-center">
                  <div className="text-[10px] text-muted-foreground">{r.formula}</div>
                  <div className="text-sm font-bold text-foreground">{r.value} kg</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Percentage zones table */}
      {result && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">📊 Tabela de Cargas</h3>
          <div className="space-y-1.5">
            {percentageZones.map((z) => {
              const load = Math.round(result.average * z.percent / 100 * 10) / 10;
              return (
                <div key={z.percent} className="flex items-center gap-2 text-xs">
                  <span className={`font-bold w-10 text-right ${z.color}`}>{z.percent}%</span>
                  <div className="flex-1 bg-secondary rounded-full h-5 relative overflow-hidden">
                    <div
                      className="h-full bg-primary/30 rounded-full"
                      style={{ width: `${z.percent}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center font-bold text-foreground">
                      {load} kg
                    </span>
                  </div>
                  <span className="text-muted-foreground w-16 text-right">{z.reps} reps</span>
                  <span className={`w-24 text-right font-semibold ${z.color}`}>{z.zone}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── PR Tracker ───────────── */
function PRTracker() {
  const { data: prs, addPR, removePR } = usePersonalRecords();
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  async function handleAdd() {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!name.trim() || w <= 0 || r <= 0) {
      toast.error("Preencha nome, peso e reps");
      return;
    }
    const { average } = calculate1RM(w, r);
    const record: CloudPR = {
      exercise_id: name.toLowerCase().replace(/\s+/g, "_"),
      exercise_name: name.trim(),
      weight: w,
      reps: r,
      estimated_1rm: average,
      date: todayISO(),
    };
    await addPR(record);
    toast.success(`🏆 PR salvo: ${record.exercise_name} ${w}kg × ${r}`);
    setName("");
    setWeight("");
    setReps("");
  }

  // Group by exercise, show best 1RM
  const grouped = useMemo(() => {
    const map = new Map<string, CloudPR[]>();
    prs.forEach((pr) => {
      const key = pr.exercise_name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(pr);
    });
    return Array.from(map.entries()).map(([name, records]) => ({
      name,
      best: records.reduce((a, b) => (a.estimated_1rm > b.estimated_1rm ? a : b)),
      records: records.slice().sort((a, b) => b.date.localeCompare(a.date)),
    }));
  }, [prs]);

  return (
    <div className="px-4 space-y-4">
      {/* Add PR */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">🏆 Registrar PR</h3>
        <div className="space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do exercício"
            className="w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Peso (kg)"
              className="w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="Reps"
              className="w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-primary text-primary-foreground font-bold text-sm py-2.5 rounded-lg"
          >
            Salvar PR
          </button>
        </div>
      </div>

      {/* PR List with Charts */}
      {grouped.map(({ name, best, records }) => {
        const chartData = [...records].reverse().map(r => ({
          date: r.date.slice(5),
          '1RM': r.estimated_1rm,
          peso: r.weight,
        }));

        return (
          <div key={name} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-bold text-foreground">{name}</span>
                <div className="text-xs text-primary font-bold">
                  🏅 Melhor 1RM: {best.estimated_1rm} kg
                </div>
              </div>
              <Trophy size={20} className="text-warning" />
            </div>

            {/* Chart */}
            {chartData.length >= 2 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-2">
                  <TrendingUp size={12} className="text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Evolução do 1RM</span>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'oklch(0.60 0.02 260)' }} />
                    <YAxis tick={{ fontSize: 9, fill: 'oklch(0.60 0.02 260)' }} domain={['auto', 'auto']} width={35} />
                    <Tooltip
                      contentStyle={{
                        background: 'oklch(0.16 0.015 260)',
                        border: '1px solid oklch(0.30 0.015 260)',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="1RM"
                      stroke="oklch(0.78 0.19 135)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: 'oklch(0.78 0.19 135)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-1">
              {records.map((r, i) => (
                <div key={`${r.date}-${i}`} className="flex items-center justify-between text-xs bg-secondary rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">{r.date}</span>
                  <span className="text-foreground font-bold">{r.weight}kg × {r.reps} reps</span>
                  <span className="text-primary font-bold">~{r.estimated_1rm}kg</span>
                  <button onClick={() => removePR(r)} className="text-destructive ml-2">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {grouped.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-8">
          Nenhum PR registrado ainda. Adicione acima! 💪
        </div>
      )}
    </div>
  );
}

/* ───────────── Biomechanics Guide ───────────── */
function BiomechanicsGuide() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="px-4 space-y-3">
      <div className="bg-primary/10 tactical-border rounded-lg p-3 text-xs text-primary font-bold mb-2">
        🧠 Entenda a mecânica por trás de cada movimento para treinar com mais eficiência e menos lesão.
      </div>
      {biomechanicsData.map((group) => {
        const isOpen = expanded === group.muscleGroup;
        return (
          <motion.div key={group.muscleGroup} className="glass-card overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : group.muscleGroup)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{group.emoji}</span>
                <span className="text-sm font-bold text-foreground">{group.muscleGroup}</span>
                <span className="text-xs text-muted-foreground">{group.tips.length} dicas</span>
              </div>
              {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {group.tips.map((tip) => (
                      <div key={tip.title} className="bg-secondary rounded-lg p-3">
                        <div className="text-xs font-bold text-primary mb-1">{tip.title}</div>
                        <div className="text-xs text-foreground leading-relaxed">{tip.description}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───────────── Smart Alternatives ───────────── */
function SmartAlternatives() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const difficultyColor = (d: string) =>
    d === "Fácil" ? "text-success" : d === "Médio" ? "text-warning" : "text-destructive";

  return (
    <div className="px-4 space-y-3">
      <div className="bg-primary/10 tactical-border rounded-lg p-3 text-xs text-primary font-bold mb-2">
        🔄 Alternativas inteligentes baseadas em equipamento disponível e nível de dificuldade.
      </div>
      {smartAlternatives.map((item) => {
        const isOpen = expanded === item.originalExercise;
        return (
          <motion.div key={item.originalExercise} className="glass-card overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : item.originalExercise)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div>
                <span className="text-sm font-bold text-foreground">{item.originalExercise}</span>
                <div className="text-xs text-muted-foreground">{item.alternatives.length} alternativas</div>
              </div>
              {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {item.alternatives.map((alt) => (
                      <div key={alt.name} className="bg-secondary rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-foreground">{alt.name}</span>
                          <span className={`text-[10px] font-bold ${difficultyColor(alt.difficulty)}`}>
                            {alt.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {alt.equipment}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {alt.muscleActivation}
                          </span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{alt.why}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
