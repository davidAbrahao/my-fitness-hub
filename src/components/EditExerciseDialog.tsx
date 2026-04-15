import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { Exercise } from '../lib/training-data';

interface EditExerciseDialogProps {
  exercise: Exercise | null;
  isNew?: boolean;
  onSave: (exercise: Exercise) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function EditExerciseDialog({ exercise, isNew, onSave, onDelete, onClose }: EditExerciseDialogProps) {
  const [form, setForm] = useState<Exercise>(
    exercise ?? {
      id: `ex_${Date.now()}`,
      name: '',
      sets: 3,
      reps: '10',
      rest: '60s',
      tip: '',
      substitutes: [],
      muscleGroup: '',
    }
  );
  const [newSub, setNewSub] = useState('');

  function update<K extends keyof Exercise>(key: K, value: Exercise[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addSubstitute() {
    if (newSub.trim()) {
      update('substitutes', [...form.substitutes, newSub.trim()]);
      setNewSub('');
    }
  }

  function removeSubstitute(i: number) {
    update('substitutes', form.substitutes.filter((_, idx) => idx !== i));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto glass-card rounded-t-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">{isNew ? 'Novo Exercício' : 'Editar Exercício'}</h2>
          <button onClick={onClose} className="text-muted-foreground"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground">Nome</label>
            <input
              value={form.name}
              onChange={e => update('name', e.target.value)}
              className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Séries</label>
              <input
                type="number"
                value={form.sets}
                onChange={e => update('sets', Number(e.target.value))}
                className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Reps</label>
              <input
                value={form.reps}
                onChange={e => update('reps', e.target.value)}
                className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Descanso</label>
              <input
                value={form.rest}
                onChange={e => update('rest', e.target.value)}
                className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground">Grupo Muscular</label>
            <input
              value={form.muscleGroup}
              onChange={e => update('muscleGroup', e.target.value)}
              className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground">Dica de Execução</label>
            <textarea
              value={form.tip}
              onChange={e => update('tip', e.target.value)}
              rows={2}
              className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Substituições</label>
            {form.substitutes.map((sub, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <span className="text-xs text-secondary-foreground flex-1 bg-secondary rounded-md px-2 py-1.5">→ {sub}</span>
                <button onClick={() => removeSubstitute(i)} className="text-destructive"><Trash2 size={14} /></button>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <input
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubstitute()}
                placeholder="Nova substituição..."
                className="flex-1 bg-input text-foreground text-xs px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={addSubstitute} className="bg-primary text-primary-foreground px-2 py-1 rounded-lg">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          {onDelete && !isNew && (
            <button onClick={onDelete} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-bold">
              <Trash2 size={14} /> Remover
            </button>
          )}
          <button
            onClick={() => { if (form.name.trim()) onSave(form); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
          >
            <Save size={14} /> Salvar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
