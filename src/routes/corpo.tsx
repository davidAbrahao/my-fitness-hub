import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { todayKey } from "../lib/storage";
import { useBodyMetrics } from "../lib/cloud-hooks";
import { Save, Camera, TrendingDown, Ruler } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/corpo")({
  component: CorpoPage,
  head: () => ({
    meta: [{ title: "Corpo — Barriga Zero" }],
  }),
});

const measurements = [
  { key: 'weight' as const, label: 'Peso (kg)', icon: '⚖️' },
  { key: 'waist' as const, label: 'Cintura (cm)', icon: '📏' },
  { key: 'chest' as const, label: 'Peito (cm)', icon: '📐' },
  { key: 'arm' as const, label: 'Braço (cm)', icon: '💪' },
  { key: 'thigh' as const, label: 'Coxa (cm)', icon: '🦵' },
  { key: 'hip' as const, label: 'Quadril (cm)', icon: '🍑' },
  { key: 'body_fat' as const, label: 'BF (%)', icon: '📊' },
];

type FormState = Partial<Record<typeof measurements[number]['key'], number>>;

function CorpoPage() {
  const today = todayKey();
  const { data: logs, upsertMetric } = useBodyMetrics();
  const [form, setForm] = useState<FormState>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const todayLog = logs.find(l => l.date === today);
    if (todayLog) {
      setForm({
        weight: todayLog.weight ?? undefined,
        waist: todayLog.waist ?? undefined,
        chest: todayLog.chest ?? undefined,
        arm: todayLog.arm ?? undefined,
        thigh: todayLog.thigh ?? undefined,
        hip: todayLog.hip ?? undefined,
        body_fat: todayLog.body_fat ?? undefined,
      });
    }
  }, [logs, today]);

  async function handleSave() {
    await upsertMetric({
      date: today,
      weight: form.weight ?? null,
      waist: form.waist ?? null,
      chest: form.chest ?? null,
      arm: form.arm ?? null,
      thigh: form.thigh ?? null,
      hip: form.hip ?? null,
      body_fat: form.body_fat ?? null,
      photo_url: photoPreview ?? null,
    });
    toast.success("✅ Medidas salvas");
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <PageHeader title="CORPO" subtitle="Medidas e Registro Corporal" emoji="📐" />

      <div className="px-4 mb-6">
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Ruler size={14} className="text-primary" /> Registrar Medidas — {today}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {measurements.map(m => (
              <div key={m.key}>
                <label className="text-[10px] text-muted-foreground font-medium block mb-1">
                  {m.icon} {m.label}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form[m.key] ?? ''}
                  onChange={e => setForm({ ...form, [m.key]: e.target.value === '' ? undefined : Number(e.target.value) })}
                  className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-[10px] text-muted-foreground font-medium block mb-2">
              📸 Foto de Progresso
            </label>
            <label className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-lg cursor-pointer">
              <Camera size={16} />
              <span className="text-xs font-medium">Tirar / Selecionar Foto</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
            </label>
            {photoPreview && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img src={photoPreview} alt="Progresso" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-bold"
          >
            <Save size={16} /> Salvar Registro
          </button>
        </div>
      </div>

      <div className="px-4 mb-6">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingDown size={14} className="text-primary" /> Histórico
        </h3>
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum registro ainda. Faça seu primeiro registro acima!</p>
        ) : (
          <div className="space-y-2">
            {[...logs].reverse().slice(0, 10).map((log, i) => (
              <motion.div
                key={log.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary">{log.date}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  {log.weight != null && <span className="text-muted-foreground">⚖️ <span className="text-foreground font-semibold">{log.weight}kg</span></span>}
                  {log.waist != null && <span className="text-muted-foreground">📏 <span className="text-foreground font-semibold">{log.waist}cm</span></span>}
                  {log.chest != null && <span className="text-muted-foreground">📐 <span className="text-foreground font-semibold">{log.chest}cm</span></span>}
                  {log.arm != null && <span className="text-muted-foreground">💪 <span className="text-foreground font-semibold">{log.arm}cm</span></span>}
                  {log.body_fat != null && <span className="text-muted-foreground">📊 <span className="text-foreground font-semibold">{log.body_fat}%</span></span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
