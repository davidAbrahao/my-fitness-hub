import { save, load } from './storage';

export interface NotificationSettings {
  enabled: boolean;
  treino: boolean;
  treinoTime: string;
  refeicoes: boolean;
  pesagem: boolean;
  pesagemDay: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  treino: true,
  treinoTime: '20:00',
  refeicoes: true,
  pesagem: true,
  pesagemDay: 'monday',
};

export function getNotificationSettings(): NotificationSettings {
  return load<NotificationSettings>('notification_settings', DEFAULT_SETTINGS);
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  save('notification_settings', settings);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendNotification(title: string, body: string): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '🏋️',
    badge: '🔥',
    vibrate: [200, 100, 200],
  });
}

let notificationIntervals: ReturnType<typeof setInterval>[] = [];

export function scheduleNotifications(settings: NotificationSettings): void {
  // Clear existing
  notificationIntervals.forEach(clearInterval);
  notificationIntervals = [];

  if (!settings.enabled) return;

  // Check every minute
  const interval = setInterval(() => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dayOfWeek = now.getDay();

    // Training reminder
    if (settings.treino && timeStr === settings.treinoTime && dayOfWeek >= 1 && dayOfWeek <= 5) {
      sendNotification('🏋️ Hora do Treino!', 'Bora pra academia! Projeto Barriga Zero não para.');
    }

    // Meal reminders
    if (settings.refeicoes) {
      const mealTimes = ['08:30', '11:30', '13:30', '16:30', '20:00', '23:00'];
      if (mealTimes.includes(timeStr)) {
        sendNotification('🍽️ Hora de Comer!', 'Refeição no horário. Proteína distribuída ao longo do dia.');
      }
    }

    // Weekly weigh-in (Monday 8am)
    if (settings.pesagem && dayOfWeek === 1 && timeStr === '08:00') {
      sendNotification('⚖️ Pesagem Semanal!', 'Em jejum, após ir ao banheiro. Registre no app!');
    }
  }, 60000);

  notificationIntervals.push(interval);
}
