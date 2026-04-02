/**
 * Atlas Core — Smart Reminder Service
 *
 * Schedules context-aware local notifications. Not generic spam.
 * Fires only when relevant based on actual user state.
 *
 * Philosophy: a coach that intervenes only when necessary,
 * always at the right moment. Max 2-4 per day.
 *
 * Notification IDs:
 *   1001 = morning check-in
 *   2001 = evening closure
 *   3001 = streak warning
 *   4001 = nutrition alert (dynamic)
 */

import { notificationService } from './notificationService';

const STORAGE_KEY = 'atlas_reminder_prefs';

const DEFAULT_PREFS = {
  morningTime: '07:30',
  eveningTime: '20:30',
  enabled: true,
};

export function loadPrefs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function nextTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d <= new Date()) d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Cancel all atlas reminders.
 */
async function cancelAll() {
  for (const id of [1001, 2001, 3001, 4001]) {
    await notificationService.cancelLocal(id);
  }
}

/**
 * Schedule the daily notification loop.
 * Called once on app launch + after each meaningful action.
 *
 * @param {object} state - Current user state from useDailyStateV2
 * @param {object} state.daily - Today's data
 */
export async function scheduleSmartReminders(state = {}) {
  const prefs = loadPrefs();
  if (!prefs.enabled) { await cancelAll(); return; }

  await cancelAll();

  const daily = state.daily || {};
  const now = new Date();
  const hour = now.getHours();

  // ── 1. Morning — Identity + Intent ──────────────────────────────────────
  // "Log your day." / "New day. Stay inside target."
  // Only schedule if it's before morning time
  if (hour < parseInt(prefs.morningTime)) {
    await notificationService.scheduleLocal({
      id: 1001,
      title: 'Log your weight.',
      body: 'New day. Stay inside target.',
      scheduleAt: nextTime(prefs.morningTime),
      extra: { route: '/Today' },
    });
  }

  // ── 2. Evening — Closure Trigger ────────────────────────────────────────
  // Highest ROI notification. "Finish your day."
  // Only if user hasn't completed their check-in yet
  if (hour < parseInt(prefs.eveningTime) && !daily.checkinDone) {
    await notificationService.scheduleLocal({
      id: 2001,
      title: 'Finish your day.',
      body: 'Log meals and check in before closing.',
      scheduleAt: nextTime(prefs.eveningTime),
      extra: { route: '/Today' },
    });
  }

  // ── 3. Streak Warning ──────────────────────────────────────────────────
  // Only if user has a streak > 1 and hasn't checked in today
  // Fire at 9pm
  const hasStreak = (daily.checkInStreak || 0) > 1;
  if (hour < 21 && hasStreak && !daily.checkinDone) {
    const at = new Date();
    at.setHours(21, 0, 0, 0);
    if (at > now) {
      await notificationService.scheduleLocal({
        id: 3001,
        title: "Don't break the streak.",
        body: `${daily.checkInStreak} days. You're one action away.`,
        scheduleAt: at,
        extra: { route: '/Today' },
      });
    }
  }

  // ── 4. Dynamic Nutrition Alert ──────────────────────────────────────────
  // Only fire if user is significantly behind on protein or calories by 2pm
  if (hour >= 12 && hour < 15) {
    const target = daily.caloriesTarget || 0;
    const consumed = daily.caloriesConsumed || 0;
    const proteinTarget = daily.proteinTarget || 0;
    const proteinConsumed = daily.proteinConsumed || 0;

    if (target > 0 && consumed < target * 0.3) {
      // Less than 30% of calories by afternoon
      await notificationService.scheduleLocal({
        id: 4001,
        title: 'Calories critically low.',
        body: `${Math.round(target - consumed)} kcal remaining.`,
        scheduleAt: new Date(now.getTime() + 60000), // 1 min from now
        extra: { route: '/Nutrition' },
      });
    } else if (proteinTarget > 0 && proteinConsumed < proteinTarget * 0.3) {
      await notificationService.scheduleLocal({
        id: 4001,
        title: 'Protein is low.',
        body: `${Math.round(proteinTarget - proteinConsumed)}g remaining today.`,
        scheduleAt: new Date(now.getTime() + 60000),
        extra: { route: '/Nutrition' },
      });
    }
  }
}
