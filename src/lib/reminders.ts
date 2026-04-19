/**
 * Lembretes locais configuráveis.
 *
 * Estratégia:
 *  - Cada lembrete é {id, label, time HH:mm, days[], enabled}
 *  - Roda um interval que checa a cada 60s contra o relógio local (TZ do dispositivo)
 *  - Usa Notification API quando permitida; cai pra toast se não.
 *  - Persiste em localStorage com escopo por usuário.
 *  - Persiste "lastTriggered" pra não disparar 2x no mesmo minuto.
 */
import { load, save } from "./storage";
import { toast } from "sonner";

export interface Reminder {
  id: string;
  label: string;
  emoji: string;
  time: string; // "HH:mm"
  days: number[]; // 0=Dom .. 6=Sáb
  enabled: boolean;
  body?: string;
}

const KEY = "reminders_v2";
const FIRED_KEY = "reminders_fired_v2";

const DEFAULTS: Reminder[] = [
  { id: "agua-1", label: "Beber água", emoji: "💧", time: "09:00", days: [0, 1, 2, 3, 4, 5, 6], enabled: true, body: "500ml — meta diária 3L" },
  { id: "agua-2", label: "Beber água", emoji: "💧", time: "12:00", days: [0, 1, 2, 3, 4, 5, 6], enabled: true, body: "Hidrata!" },
  { id: "agua-3", label: "Beber água", emoji: "💧", time: "15:00", days: [0, 1, 2, 3, 4, 5, 6], enabled: true, body: "Hidrata!" },
  { id: "agua-4", label: "Beber água", emoji: "💧", time: "18:00", days: [0, 1, 2, 3, 4, 5, 6], enabled: true, body: "Última dose forte do dia" },
  { id: "creatina", label: "Creatina", emoji: "💊", time: "09:30", days: [0, 1, 2, 3, 4, 5, 6], enabled: true, body: "5g — não pode esquecer" },
  { id: "treino", label: "Treino", emoji: "🏋️", time: "18:00", days: [1, 2, 3, 4, 5], enabled: true, body: "Hora de pegar pesado!" },
];

export function getReminders(): Reminder[] {
  return load<Reminder[]>(KEY, DEFAULTS);
}
export function saveReminders(r: Reminder[]): void {
  save(KEY, r);
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

function fire(r: Reminder) {
  const title = `${r.emoji} ${r.label}`;
  const body = r.body ?? "Lembrete Barriga Zero";

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      // Tenta via SW (suporta ações em background); se não, fallback
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) {
            reg.showNotification(title, {
              body,
              icon: "/icon-512.png",
              badge: "/icon-512.png",
              tag: r.id,
              vibrate: [200, 100, 200],
            } as NotificationOptions);
          } else {
            new Notification(title, { body, icon: "/icon-512.png" });
          }
        });
      } else {
        new Notification(title, { body, icon: "/icon-512.png" });
      }
      return;
    } catch {
      /* fallback abaixo */
    }
  }
  toast(title, { description: body });
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startReminderLoop(): void {
  if (typeof window === "undefined") return;
  if (intervalId) return;
  const tick = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const time = `${hh}:${mm}`;
    const day = now.getDay();
    const stamp = `${now.toDateString()}-${time}`;
    const fired = load<Record<string, string>>(FIRED_KEY, {});
    const reminders = getReminders();

    let dirty = false;
    for (const r of reminders) {
      if (!r.enabled) continue;
      if (!r.days.includes(day)) continue;
      if (r.time !== time) continue;
      if (fired[r.id] === stamp) continue;
      fire(r);
      fired[r.id] = stamp;
      dirty = true;
    }
    if (dirty) save(FIRED_KEY, fired);
  };
  tick();
  intervalId = setInterval(tick, 30000);
}

export function stopReminderLoop(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
