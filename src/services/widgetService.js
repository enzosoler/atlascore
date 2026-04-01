/**
 * widgetService.js
 *
 * Writes compact snapshots to the App Group shared container via the native
 * WidgetDataBridge plugin. WidgetKit extensions read this data to render widgets.
 *
 * Call updateWidgetSnapshot() after any significant data change:
 * - Daily check-in
 * - Workout completion
 * - Food logged
 * - Body measurement saved
 * - Weight/body fat updated
 */

import { Capacitor, registerPlugin } from '@capacitor/core';

const IS_IOS = Capacitor.getPlatform() === 'ios';

// Register the native plugin
const WidgetDataBridge = IS_IOS ? registerPlugin('WidgetDataBridge') : null;

/**
 * Write a complete widget snapshot to the App Group container.
 * Called from the main app whenever key data changes.
 *
 * @param {object} data - Widget snapshot data
 * @param {object} data.today - Today's summary
 * @param {number} data.today.caloriesRemaining
 * @param {number} data.today.caloriesTarget
 * @param {number} data.today.proteinCurrent
 * @param {number} data.today.proteinTarget
 * @param {number} data.today.carbsCurrent
 * @param {number} data.today.carbsTarget
 * @param {number} data.today.fatCurrent
 * @param {number} data.today.fatTarget
 * @param {boolean} data.today.workoutDone
 * @param {string} data.today.workoutName
 * @param {boolean} data.today.checkinDone
 * @param {object} data.weight - Weight data
 * @param {number} data.weight.current
 * @param {number} data.weight.weekDelta
 * @param {string} data.weight.unit
 * @param {object} data.streak - Streak data
 * @param {number} data.streak.count
 * @param {boolean} data.streak.todayDone
 * @param {string} data.userName - First name for personalization
 */
export async function updateWidgetSnapshot(data) {
  if (!IS_IOS || !WidgetDataBridge) return;
  try {
    await WidgetDataBridge.writeSnapshot({
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[Widget] Failed to update snapshot:', e?.message);
  }
}

/**
 * Read the current widget snapshot (for debugging).
 */
export async function readWidgetSnapshot() {
  if (!IS_IOS || !WidgetDataBridge) return null;
  try {
    const result = await WidgetDataBridge.readSnapshot();
    return result?.snapshot || null;
  } catch (e) {
    console.warn('[Widget] Failed to read snapshot:', e?.message);
    return null;
  }
}
