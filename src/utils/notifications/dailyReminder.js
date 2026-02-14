const LAST_REMINDER_DATE_KEY = 'onThisDayLastReminderDate';
const DEFAULT_REMINDER_TIME = '11:00';

const reminderText = {
  en: {
    title: 'On This Day',
    body: "Check today's history highlights.",
  },
  bs: {
    title: 'Na današnji dan',
    body: 'Pogledaj današnje historijske događaje.',
  },
};

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function sendDailyReminder(language = 'en') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const today = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem(LAST_REMINDER_DATE_KEY) === today) return;

  const content = reminderText[language] || reminderText.en;

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker
      .getRegistration()
      .catch(() => null);
    if (registration?.showNotification) {
      await registration.showNotification(content.title, {
        body: content.body,
        icon: '/logo192.png',
        badge: '/favicon.ico',
        tag: 'on-this-day-daily',
      });
      localStorage.setItem(LAST_REMINDER_DATE_KEY, today);
      return;
    }
  }

  // Fallback when no service worker registration is available.
  new Notification(content.title, {
    body: content.body,
    icon: '/logo192.png',
  });
  localStorage.setItem(LAST_REMINDER_DATE_KEY, today);
}

function normalizeReminderTime(time) {
  if (typeof time !== 'string') return DEFAULT_REMINDER_TIME;
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return DEFAULT_REMINDER_TIME;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return DEFAULT_REMINDER_TIME;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function isDueNow() {
  const now = new Date();
  const [targetHour, targetMinute] = normalizeReminderTime(DEFAULT_REMINDER_TIME)
    .split(':')
    .map(Number);

  const nowTotal = now.getHours() * 60 + now.getMinutes();
  const targetTotal = targetHour * 60 + targetMinute;

  return nowTotal >= targetTotal;
}

export function startDailyReminder(language = 'en') {
  const checkAndNotify = () => {
    if (!isDueNow()) return;
    sendDailyReminder(language);
  };

  checkAndNotify();
  const intervalId = window.setInterval(checkAndNotify, 60 * 1000);

  return () => window.clearInterval(intervalId);
}
