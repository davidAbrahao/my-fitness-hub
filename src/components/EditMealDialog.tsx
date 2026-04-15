import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Save } from 'lucide-react';

export interface MealData {
  id: string;
  time: string;
  name: string;
  items: string[];
  calories: number;
}

interface EditMealDialogProps {
  meal: MealData | null;
  isNew?: boolean;
  onSave: (meal: MealData) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function EditMealDialog({ meal, isNew, onSave, onDelete, onClose }: EditMealDialogProps) {
  const [form, setForm] = useState<MealData>(
    meal ?? { id: `meal_${Date.now()}`, time: '12:00', name: '', items: [], calories: 0 }
  );
  const [newItem, setNewItem] = useState('');

  function addItem() {
    if (newItem.trim()) {
      setForm(prev => ({ ...prev, items: [...prev.items, newItem.trim()] }));
      setNewItem('');
    }
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
          <h2 className="text-lg font-bold text-foreground">{isNew ? 'Nova Refeição' : 'Editar Refeição'}</h2>
          <button onClick={onClose} className="text-muted-foreground"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Nome</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Horário</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground">Calorias</label>
            <input
              type="number"
              value={form.calories || ''}
              onChange={e => setForm(p => ({ ...p, calories: Number(e.target.value) }))}
              className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Itens</label>
            {form.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <span className="text-xs text-secondary-foreground flex-1 bg-secondary rounded-md px-2 py-1.5">• {item}</span>
                <button onClick={() => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))} className="text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <input
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="Novo item..."
                className="flex-1 bg-input text-foreground text-xs px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={addItem} className="bg-primary text-primary-foreground px-2 py-1 rounded-lg">
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
