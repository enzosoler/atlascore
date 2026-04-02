/**
 * Atlas Core — Reminder Service
 *
 * Schedules recurring local notifications for workout reminders,
 * meal logging nudges, and check-in prompts.
 *
 * Notification IDs:
 *   1000-1006  = workout reminders (one per weekday)
 *   2000       = meal logging nudge
 *   3000       = daily check-in
 *   4000       = streak keeper
 */

import { notificationService } from './notificationService';

const STORAGE_KEY = 'atlas_reminders_config';

/** Default reminder config */
const DEFAULT_CONFIG = {
  workoutEnabled: true,
  workoutTime: '08:00',       // HH:mm
  workoutDays: [1, 2, 3, 4, 5], // Mon-Fri

  mealEnabled: true,
  mealTime: '12:30',

  checkinEnabled: true,
  checkinTime: '21:00',

  streakEnabled: true,
  streakTime: '20:00',
};

/** Load saved config or defaults */
export function loadReminderConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/** Save config and reschedule */
export function saveReminderConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Parse "HH:mm" into next occurrence Date */
function nextOccurrence(timeStr, targetDay = null) {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);

  if (targetDay !== null) {
    // Find next occurrence of targetDay (0=Sun, 1=Mon, ...)
    const currentDay = now.getDay();
    let daysAhead = targetDay - currentDay;
    if (daysAhead < 0) daysAhead += 7;
    if (daysAhead === 0 && target <= now) daysAhead = 7;
    target.setDate(target.getDate() + daysAhead);
  } else {
    // Next occurrence of this time (today or tomorrow)
    if (target <= now) target.setDate(target.getDate() + 1);
  }

  return target;
}

/**
 * Schedule all reminders based on current config.
 * Call once at app launch and whenever config changes.
 */
export async function scheduleReminders(t) {
  const config = loadReminderConfig();

  // Cancel all existing reminders first
  for (let id = 1000; id <= 1006; id++) {
    await notificationService.cancelLocal(id);
  }
  await notificationService.cancelLocal(2000);
  await notificationService.cancelLocal(3000);
  await notificationService.cancelLocal(4000);

  // Workout reminders — one per training day
  if (config.workoutEnabled) {
    for (const day of config.workoutDays) {
      const at = nextOccurrence(config.workoutTime, day);
      await notificationService.scheduleLocal({
        id: 1000 + day,
        title: t?.('notifications.workout_title') || 'Time to train',
        body: t?.('notifications.workout_body') || 'Your workout is waiting. Let\'s go!',
        scheduleAt: at,
        extra: { route: '/Workouts' },
      });
    }
  }

  // Meal logging nudge
  if (config.mealEnabled) {
    await notificationService.scheduleLocal({
      id: 2000,
      title: t?.('notifications.meal_title') || 'Log your meal',
      body: t?.('notifications.meal_body') || 'Don\'t forget to track what you ate.',
      scheduleAt: nextOccurrence(config.mealTime),
      extra: { route: '/Nutrition' },
    });
  }

  // Daily check-in
  if (config.checkinEnabled) {
    await notificationService.scheduleLocal({
      id: 3000,
      title: t?.('notifications.checkin_title') || 'Daily check-in',
      body: t?.('notifications.checkin_body') || 'How was your day? Log energy, mood, and sleep.',
      scheduleAt: nextOccurrence(config.checkinTime),
      extra: { route: '/Today' },
    });
  }

  // Streak keeper
  if (config.streakEnabled) {
    await notificationService.scheduleLocal({
      id: 4000,
      title: t?.('notifications.streak_title') || 'Keep your streak alive',
      body: t?.('notifications.streak_body') || 'You haven\'t checked in today. Don\'t break the chain!',
      scheduleAt: nextOccurrence(config.streakTime),
      extra: { route: '/Today' },
    });
  }
}
