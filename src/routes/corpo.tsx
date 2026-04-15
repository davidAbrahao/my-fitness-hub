import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { load, save, todayKey } from "../lib/storage";
import type { BodyLog } from "../lib/storage";
import { Save, Camera, TrendingDown, Ruler } from "lucide-react";

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
  { key: 'bf' as const, label: 'BF (%)', icon: '📊' },
];

function CorpoPage() {
  const today = todayKey();
  const [logs, setLogs] = useState<BodyLog[]>([]);
  const [form, setForm] = useState<Partial<BodyLog>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const loaded = load<BodyLog[]>('body_logs', []);
    setLogs(loaded);
    const todayLog = loaded.find(l => l.date === today);
    if (todayLog) {
      setForm(todayLog);
      if (todayLog.photoUrl) setPhotoPreview(todayLog.photoUrl);
    }
  }, [today]);

  function handleSave() {
    const updated = logs.filter(l => l.date !== today);
    const entry: BodyLog = {
      date: today,
      ...form,
      photoUrl: photoPreview ?? undefined,
    };
    updated.push(entry);
    updated.sort((a, b) => a.date.localeCompare(b.date));
    setLogs(updated);
    save('body_logs', updated);
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

  function getChange(key: keyof BodyLog): { value: number; diff: number } | null {
    if (logs.length < 2) return null;
    const latest = logs[logs.length - 1];
    const prev = logs[logs.length - 2];
    const latestVal = latest[key] as number | undefined;
    const prevVal = prev[key] as number | undefined;
    if (latestVal == null || prevVal == null) return null;
    return { value: latestVal, diff: latestVal - prevVal };
  }

  return (
    <div>
      <PageHeader title="CORPO" subtitle="Medidas e Registro Corporal" emoji="📐" />

      {/* Form */}
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
                  value={(form[m.key] as number) || ''}
                  onChange={e => setForm({ ...form, [m.key]: Number(e.target.value) })}
                  className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>

          {/* Photo */}
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

      {/* History */}
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
                  {log.photoUrl && <span className="text-[10px] text-muted-foreground">📸 com foto</span>}
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  {log.weight && <span className="text-muted-foreground">⚖️ <span className="text-foreground font-semibold">{log.weight}kg</span></span>}
                  {log.waist && <span className="text-muted-foreground">📏 <span className="text-foreground font-semibold">{log.waist}cm</span></span>}
                  {log.chest && <span className="text-muted-foreground">📐 <span className="text-foreground font-semibold">{log.chest}cm</span></span>}
                  {log.arm && <span className="text-muted-foreground">💪 <span className="text-foreground font-semibold">{log.arm}cm</span></span>}
                  {log.bf && <span className="text-muted-foreground">📊 <span className="text-foreground font-semibold">{log.bf}%</span></span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
