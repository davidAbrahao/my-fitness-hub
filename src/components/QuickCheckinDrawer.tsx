/**
 * Drawer de check-in rápido (<1min): treino, cardio, dieta, água, sono,
 * vontade de doce, fome, energia, humor, observação.
 * Persiste em habits_logs via fila offline.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Dumbbell, Activity, UtensilsCrossed, Droplets, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useHabits, type CloudHabit } from '@/lib/cloud-hooks';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { enqueue } from '@/lib/offline-queue';
import { todayISO } from '@/lib/date-utils';

interface ExtendedHabit extends CloudHabit {
  sugar_urge?: number | null;
  hunger_level?: number | null;
  energy_level?: number | null;
  mood_level?: number | null;
  notes?: string | null;
}

interface Props { open: boolean; onClose: () => void }

export function QuickCheckinDrawer({ open, onClose }: Props) {
  const { user } = useAuth();
  const { data: habits, upsertHabit } = useHabits();
  const today = todayISO();

  const todayHabit = habits.find((h) => h.date === today);
  const [form, setForm] = useState<ExtendedHabit>({
    date: today,
    workout_done: false, diet_ok: false, water: false, cardio: false,
    supplements: false, creatine: false, sleep_hours: null,
    sugar_urge: 0, hunger_level: 0, energy_level: 2, mood_level: 2, notes: '',
  });

  // hidrata ao abrir
  useEffect(() => {
    if (!open) return;
    if (todayHabit) {
      setForm((f) => ({ ...f, ...todayHabit }));
    }
    // busca campos extras direto se logado
    if (user) {
      supabase
        .from('habits_logs')
        .select('sugar_urge, hunger_level, energy_level, mood_level, notes')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setForm((f) => ({ ...f, ...data }));
        });
    }
  }, [open, todayHabit, user, today]);

  async function save() {
    // 1) hábitos básicos via hook (cuida do cache local + fila)
    await upsertHabit({
      date: form.date,
      workout_done: form.workout_done,
      diet_ok: form.diet_ok,
      water: form.water,
      cardio: form.cardio,
      supplements: form.supplements,
      creatine: form.creatine,
      sleep_hours: form.sleep_hours,
    });
    // 2) campos extras via fila (mesma row, upsert)
    if (user) {
      await enqueue({
        table: 'habits_logs',
        payload: {
          user_id: user.id,
          date: form.date,
          workout_done: form.workout_done,
          diet_ok: form.diet_ok,
          water: form.water,
          cardio: form.cardio,
          supplements: form.supplements,
          creatine: form.creatine,
          sleep_hours: form.sleep_hours,
          sugar_urge: form.sugar_urge ?? null,
          hunger_level: form.hunger_level ?? null,
          energy_level: form.energy_level ?? null,
          mood_level: form.mood_level ?? null,
          notes: form.notes ?? null,
        },
        onConflict: 'user_id,date',
      });
    }
    toast.success('✅ Check-in salvo');
    onClose();
  }

  const toggles: { key: keyof ExtendedHabit; label: string; Icon: typeof Dumbbell }[] = [
    { key: 'workout_done', label: 'Treino', Icon: Dumbbell },
    { key: 'cardio', label: 'Cardio', Icon: Activity },
    { key: 'diet_ok', label: 'Dieta', Icon: UtensilsCrossed },
    { key: 'water', label: 'Água 3L+', Icon: Droplets },
  ];

  const scales: { key: keyof ExtendedHabit; label: string; emojis: string[] }[] = [
    { key: 'sugar_urge', label: 'Vontade de doce', emojis: ['😌','🙂','😣','🥵'] },
    { key: 'hunger_level', label: 'Fome', emojis: ['😌','🙂','😋','🍴'] },
    { key: 'energy_level', label: 'Energia', emojis: ['🪫','🔋','⚡','🚀'] },
    { key: 'mood_level', label: 'Humor', emojis: ['😞','😐','🙂','😄'] },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-black text-foreground">Check-in de hoje</h3>
                <p className="text-[11px] text-muted-foreground">{today} · &lt;1 min</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Toggles binários */}
              <div className="grid grid-cols-2 gap-2">
                {toggles.map(({ key, label, Icon }) => {
                  const v = !!form[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setForm({ ...form, [key]: !v })}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                        v ? 'check-done' : 'glass-card'
                      }`}
                    >
                      <Icon size={16} className={v ? 'text-success' : 'text-muted-foreground'} />
                      <span className="text-xs font-bold">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sono */}
              <div className="glass-card p-3">
                <label className="text-xs font-bold text-foreground flex items-center gap-2 mb-2">
                  <Moon size={14} className="text-primary" /> Sono (h)
                </label>
                <div className="flex gap-1.5">
                  {[5, 6, 7, 8, 9].map((h) => (
                    <button
                      key={h}
                      onClick={() => setForm({ ...form, sleep_hours: h })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                        form.sleep_hours === h ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Escalas 0-3 */}
              {scales.map(({ key, label, emojis }) => {
                const v = (form[key] as number | null) ?? 0;
                return (
                  <div key={key} className="glass-card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground">{label}</span>
                      <span className="text-base">{emojis[v]}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {emojis.map((e, i) => (
                        <button
                          key={i}
                          onClick={() => setForm({ ...form, [key]: i })}
                          className={`flex-1 py-2 rounded-lg text-base ${
                            v === i ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Notas */}
              <div className="glass-card p-3">
                <label className="text-xs font-bold text-foreground block mb-2">Observação (opcional)</label>
                <textarea
                  value={form.notes ?? ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Como tá hoje? O que aconteceu?"
                  className="w-full bg-input text-foreground text-xs p-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary resize-none h-16"
                />
              </div>

              <button
                onClick={save}
                className="sticky bottom-0 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-3.5 rounded-xl text-sm"
              >
                <Save size={16} /> Salvar Check-in
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
