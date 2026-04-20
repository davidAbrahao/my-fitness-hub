/**
 * Editor de perfil — usado dentro de Ferramentas.
 * Edita: dados físicos, meta calórica, foco e schedule semanal de treino.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Save, User as UserIcon, Calendar } from 'lucide-react';
import { useUserProfile, type SplitDay, type WeekDay } from '@/lib/profile-hooks';

const SPLIT_OPTIONS: SplitDay[] = ['push', 'pull', 'legs', 'upper', 'lower', 'fullbody', 'rest'];
const SPLIT_LABEL: Record<SplitDay, string> = {
  push: 'Push', pull: 'Pull', legs: 'Pernas',
  upper: 'Upper', lower: 'Lower', fullbody: 'Full', rest: 'Off',
};
const DAYS: { key: WeekDay; label: string }[] = [
  { key: 'mon', label: 'Seg' }, { key: 'tue', label: 'Ter' },
  { key: 'wed', label: 'Qua' }, { key: 'thu', label: 'Qui' },
  { key: 'fri', label: 'Sex' }, { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
];

export function ProfileEditor() {
  const { profile, update } = useUserProfile();
  const [draft, setDraft] = useState(profile);

  useEffect(() => setDraft(profile), [profile]);

  function set<K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) {
    setDraft({ ...draft, [k]: v });
  }

  async function save() {
    await update(draft);
    toast.success('✅ Perfil salvo');
  }

  return (
    <div className="space-y-3">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <UserIcon size={14} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Dados pessoais</h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Idade" value={draft.age} onChange={(v) => set('age', v)} />
          <Field label="Altura (cm)" value={draft.height_cm} onChange={(v) => set('height_cm', v)} />
          <Field label="Peso inicial (kg)" value={draft.start_weight_kg} onChange={(v) => set('start_weight_kg', v)} />
          <Field label="Meta peso (kg)" value={draft.goal_weight_kg} onChange={(v) => set('goal_weight_kg', v)} />
          <Field label="BF inicial (%)" value={draft.start_bf_pct} onChange={(v) => set('start_bf_pct', v)} />
          <Field label="Meta BF (%)" value={draft.goal_bf_pct} onChange={(v) => set('goal_bf_pct', v)} />
          <Field label="Meta calórica" value={draft.calorie_target} onChange={(v) => set('calorie_target', v ?? 1800)} />
          <div>
            <label className="text-[10px] text-muted-foreground font-bold block mb-1">Hora do treino</label>
            <input
              type="time"
              value={draft.training_time?.slice(0, 5) ?? ''}
              onChange={(e) => set('training_time', e.target.value || null)}
              className="w-full bg-input text-foreground text-sm px-2 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="text-[10px] text-muted-foreground font-bold block mb-1">Foco atual</label>
          <textarea
            value={draft.current_focus ?? ''}
            onChange={(e) => set('current_focus', e.target.value)}
            placeholder="Ex: Reduzir BF para 15% mantendo massa magra"
            className="w-full bg-input text-foreground text-xs p-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary resize-none h-14"
          />
        </div>
      </motion.div>

      {/* Schedule semanal */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Split da semana</h3>
        </div>
        <div className="space-y-1.5">
          {DAYS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground w-9">{label}</span>
              <div className="flex-1 grid grid-cols-7 gap-1">
                {SPLIT_OPTIONS.map((opt) => {
                  const active = draft.training_schedule[key] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => set('training_schedule', { ...draft.training_schedule, [key]: opt })}
                      className={`text-[10px] font-bold py-1.5 rounded-md transition ${
                        active
                          ? opt === 'rest' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground/70'
                      }`}
                    >
                      {SPLIT_LABEL[opt]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <button
        onClick={save}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-3 rounded-xl text-sm"
      >
        <Save size={14} /> Salvar Perfil
      </button>
    </div>
  );
}

function Field({
  label, value, onChange,
}: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground font-bold block mb-1">{label}</label>
      <input
        type="number"
        step="0.1"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full bg-input text-foreground text-sm px-2 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
