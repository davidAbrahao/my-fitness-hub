import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { load, save, todayKey } from "../lib/storage";
import type { DailyCheck } from "../lib/storage";
import { antiFailProtocol } from "../lib/training-data";
import { useHabits, type CloudHabit } from "../lib/cloud-hooks";
import { Dumbbell, Flame, Moon, Droplets, Activity, Pill, Save, Shield, Bell, BellOff } from "lucide-react";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  scheduleNotifications,
  type NotificationSettings,
} from "../lib/notifications";

export const Route = createFileRoute("/checklist")({
  component: ChecklistPage,
  head: () => ({
    meta: [{ title: "Checklist — Barriga Zero" }],
  }),
});

const checkItems = [
  { key: 'treino' as const, label: 'Treinou hoje', icon: Dumbbell, habitField: 'workout_done' as const },
  { key: 'dieta' as const, label: 'Seguiu a dieta', icon: Flame, habitField: 'diet_ok' as const },
  { key: 'sono' as const, label: 'Dormiu bem (7h+)', icon: Moon, habitField: 'sleep_hours' as const },
  { key: 'agua' as const, label: 'Bebeu 3L+ de água', icon: Droplets, habitField: 'water' as const },
  { key: 'cardio' as const, label: 'Fez cardio', icon: Activity, habitField: 'cardio' as const },
  { key: 'suplementos' as const, label: 'Tomou suplementos', icon: Pill, habitField: 'supplements' as const },
];

function ChecklistPage() {
  const today = todayKey();
  const { data: habits, upsertHabit } = useHabits();
  const [notes, setNotes] = useState('');
  const [showProtocol, setShowProtocol] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Notas continuam locais (não há coluna no schema cloud por hábito)
  useEffect(() => {
    const localChecks = load<DailyCheck[]>('daily_checks', []);
    const todayCheck = localChecks.find(c => c.date === today);
    if (todayCheck) setNotes(todayCheck.notes);
    scheduleNotifications(notifSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const todayHabit: CloudHabit = useMemo(() => {
    return (
      habits.find(h => h.date === today) ?? {
        date: today,
        workout_done: false,
        diet_ok: false,
        water: false,
        cardio: false,
        supplements: false,
        creatine: false,
        sleep_hours: null,
      }
    );
  }, [habits, today]);

  // Mapeia para o formato legado (UI usa keys PT-BR)
  const todayCheck = {
    date: today,
    treino: todayHabit.workout_done,
    dieta: todayHabit.diet_ok,
    sono: !!todayHabit.sleep_hours && todayHabit.sleep_hours >= 7,
    agua: todayHabit.water,
    cardio: todayHabit.cardio,
    suplementos: todayHabit.supplements,
    notes,
  };

  function toggle(key: keyof Omit<DailyCheck, 'date' | 'notes'>) {
    const item = checkItems.find(i => i.key === key)!;
    const next: CloudHabit = { ...todayHabit };
    if (item.habitField === 'sleep_hours') {
      next.sleep_hours = todayCheck.sono ? null : 7;
    } else {
      next[item.habitField] = !todayCheck[key];
    }
    void upsertHabit(next);
  }

  function saveNotes() {
    const localChecks = load<DailyCheck[]>('daily_checks', []).filter(c => c.date !== today);
    localChecks.push({ ...todayCheck, notes });
    save('daily_checks', localChecks);
  }

  const completedCount = checkItems.filter(item => todayCheck[item.key]).length;

  return (
    <div>
      <PageHeader title="CHECK DIÁRIO" subtitle={`${today} — ${completedCount}/${checkItems.length} completos`} emoji="✅" />

      {/* Checklist */}
      <div className="px-4 space-y-2 mb-6">
        {checkItems.map((item, i) => {
          const checked = todayCheck[item.key];
          const Icon = item.icon;
          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggle(item.key)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                checked ? 'check-done' : 'glass-card'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                checked ? 'bg-success' : 'bg-muted'
              }`}>
                {checked && <span className="text-success-foreground text-xs font-bold">✓</span>}
              </div>
              <Icon size={16} className={checked ? 'text-success' : 'text-muted-foreground'} />
              <span className={`text-sm font-medium ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Notes */}
      <div className="px-4 mb-6">
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-2">📝 Notas do Dia</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="O que fez, o que deixou de fazer, como se sentiu..."
            className="w-full bg-input text-foreground text-sm p-3 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary resize-none h-24"
          />
          <button
            onClick={saveNotes}
            className="mt-2 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold"
          >
            <Save size={14} /> Salvar Notas
          </button>
        </div>
      </div>

      {/* Anti-Fail Protocol */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setShowProtocol(!showProtocol)}
          className="w-full glass-card tactical-border neon-glow p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <span className="text-sm font-bold text-primary">{antiFailProtocol.title}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{antiFailProtocol.subtitle}</p>
        </button>

        {showProtocol && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            {antiFailProtocol.rules.map((rule, i) => (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{rule.icon}</span>
                  <span className="text-xs font-bold text-foreground">{rule.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Notifications */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setShowNotifPanel(!showNotifPanel)}
          className="w-full glass-card p-4 text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {notifSettings.enabled ? <Bell size={16} className="text-primary" /> : <BellOff size={16} className="text-muted-foreground" />}
            <span className="text-sm font-bold text-foreground">🔔 Notificações</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${notifSettings.enabled ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
            {notifSettings.enabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {showNotifPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 glass-card p-4 space-y-3"
          >
            {/* Master toggle */}
            <button
              onClick={async () => {
                if (!notifSettings.enabled) {
                  const granted = await requestNotificationPermission();
                  if (!granted) return;
                }
                const updated = { ...notifSettings, enabled: !notifSettings.enabled };
                setNotifSettings(updated);
                saveNotificationSettings(updated);
                scheduleNotifications(updated);
              }}
              className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${
                notifSettings.enabled ? 'bg-destructive/10 text-destructive' : 'bg-primary text-primary-foreground'
              }`}
            >
              {notifSettings.enabled ? 'Desativar Notificações' : 'Ativar Notificações'}
            </button>

            {notifSettings.enabled && (
              <>
                {/* Training time */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">🏋️ Lembrete Treino</span>
                  <input
                    type="time"
                    value={notifSettings.treinoTime}
                    onChange={e => {
                      const updated = { ...notifSettings, treinoTime: e.target.value };
                      setNotifSettings(updated);
                      saveNotificationSettings(updated);
                      scheduleNotifications(updated);
                    }}
                    className="bg-input text-foreground text-xs px-2 py-1 rounded-md border-0 outline-none"
                  />
                </div>

                {/* Toggles */}
                {([
                  { key: 'refeicoes' as const, label: '🍽️ Lembretes de Refeição' },
                  { key: 'pesagem' as const, label: '⚖️ Pesagem Semanal (Seg 8h)' },
                ] as const).map(item => (
                  <button
                    key={item.key}
                    onClick={() => {
                      const updated = { ...notifSettings, [item.key]: !notifSettings[item.key] };
                      setNotifSettings(updated);
                      saveNotificationSettings(updated);
                      scheduleNotifications(updated);
                    }}
                    className="w-full flex items-center justify-between py-1"
                  >
                    <span className="text-xs font-bold text-foreground">{item.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      notifSettings[item.key] ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {notifSettings[item.key] ? 'ON' : 'OFF'}
                    </span>
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
