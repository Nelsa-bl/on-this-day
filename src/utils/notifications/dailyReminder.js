const LAST_REMINDER_DATE_KEY = 'onThisDayLastReminderDate';

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

export function startDailyReminder(language = 'en') {
  sendDailyReminder(language);
  const intervalId = window.setInterval(
    () => sendDailyReminder(language),
    60 * 60 * 1000,
  );

  return () => window.clearInterval(intervalId);
}
