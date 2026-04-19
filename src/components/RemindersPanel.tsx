import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Plus, Trash2, Save } from "lucide-react";
import {
  getReminders,
  saveReminders,
  requestPermission,
  startReminderLoop,
  type Reminder,
} from "../lib/reminders";
import { toast } from "sonner";

const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function RemindersPanel() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setReminders(getReminders());
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  function persist(next: Reminder[]) {
    setReminders(next);
    saveReminders(next);
  }

  function update(id: string, patch: Partial<Reminder>) {
    persist(reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: string) {
    persist(reminders.filter((r) => r.id !== id));
  }

  function add() {
    const r: Reminder = {
      id: `custom-${Date.now()}`,
      label: "Novo lembrete",
      emoji: "⏰",
      time: "12:00",
      days: [1, 2, 3, 4, 5],
      enabled: true,
    };
    persist([...reminders, r]);
  }

  async function handleEnable() {
    const p = await requestPermission();
    setPermission(p);
    if (p === "granted") {
      startReminderLoop();
      toast.success("✅ Notificações ativadas");
    } else {
      toast.error("Permissão negada — ative no navegador");
    }
  }

  function toggleDay(r: Reminder, day: number) {
    const has = r.days.includes(day);
    update(r.id, {
      days: has ? r.days.filter((d) => d !== day) : [...r.days, day].sort(),
    });
  }

  const supported = typeof window !== "undefined" && "Notification" in window;

  return (
    <div className="space-y-3">
      {/* Permission */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          {permission === "granted" ? (
            <Bell size={14} className="text-success" />
          ) : (
            <BellOff size={14} className="text-warning" />
          )}
          <h3 className="text-sm font-bold text-foreground">Notificações</h3>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          {!supported
            ? "⚠️ Não suportado neste navegador"
            : permission === "granted"
            ? "Ativadas. Você receberá lembretes mesmo com o app fechado (instalado)."
            : "Ative para receber lembretes. Funciona melhor com o app instalado."}
        </p>
        {supported && permission !== "granted" && (
          <button
            onClick={handleEnable}
            className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg text-xs"
          >
            Ativar notificações
          </button>
        )}
      </div>

      {/* List */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">Meus lembretes</h3>
          <button
            onClick={add}
            className="flex items-center gap-1 bg-primary/15 text-primary px-2 py-1 rounded-lg text-[10px] font-bold"
          >
            <Plus size={10} /> Novo
          </button>
        </div>

        <div className="space-y-2">
          {reminders.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  value={r.emoji}
                  onChange={(e) => update(r.id, { emoji: e.target.value.slice(0, 2) })}
                  className="w-10 bg-input text-center text-foreground text-sm py-1.5 rounded-lg outline-none"
                />
                <input
                  value={r.label}
                  onChange={(e) => update(r.id, { label: e.target.value })}
                  className="flex-1 bg-input text-foreground text-xs px-2 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="time"
                  value={r.time}
                  onChange={(e) => update(r.id, { time: e.target.value })}
                  className="bg-input text-foreground text-xs px-2 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => update(r.id, { enabled: !r.enabled })}
                  className={`p-1.5 rounded-lg ${r.enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
                >
                  {r.enabled ? <Bell size={12} /> : <BellOff size={12} />}
                </button>
                <button onClick={() => remove(r.id)} className="text-destructive p-1">
                  <Trash2 size={12} />
                </button>
              </div>
              <input
                value={r.body ?? ""}
                onChange={(e) => update(r.id, { body: e.target.value })}
                placeholder="Mensagem opcional…"
                className="w-full bg-input text-foreground text-[11px] px-2 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-1">
                {DAY_LABELS.map((d, i) => {
                  const active = r.days.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(r, i)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-1 mt-3 text-[10px] text-success">
          <Save size={10} /> Salvo automaticamente
        </div>
      </div>
    </div>
  );
}
