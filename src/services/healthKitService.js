/**
 * healthKitService.js
 *
 * Bridge between atlas.core and Apple HealthKit via @capgo/capacitor-health.
 * Handles permission requests, reading health data, and writing atlas.core data back.
 *
 * All methods are no-ops on non-iOS platforms (web returns empty/false).
 */

import { Capacitor } from '@capacitor/core';
import { Health } from '@capgo/capacitor-health';

const IS_IOS = Capacitor.getPlatform() === 'ios';

// ─── Data types we request ──────────────────────────────────────────────────

const READ_TYPES = [
  'weight', 'bodyFat', 'height',
  'calories', 'basalCalories', 'steps',
  'distance', 'heartRate', 'sleep', 'workouts',
];

const WRITE_TYPES = [
  'weight', 'bodyFat', 'calories', 'workouts',
];

// ─── Permission ──────────────────────────────────────────────────────────────

/**
 * Check if HealthKit / Health Connect is available on this device.
 */
export async function isAvailable() {
  if (!IS_IOS) return false;
  try {
    const result = await Health.isAvailable();
    return result?.available === true;
  } catch {
    return false;
  }
}

/**
 * Request HealthKit authorization for all atlas.core data types.
 * Returns true if granted (at least partially), false otherwise.
 */
export async function requestAuthorization() {
  if (!IS_IOS) return false;
  try {
    await Health.requestAuthorization({
      read: READ_TYPES,
      write: WRITE_TYPES,
    });
    return true;
  } catch (e) {
    console.warn('[HealthKit] Authorization failed:', e?.message);
    return false;
  }
}

/**
 * Check current authorization status without prompting.
 */
export async function checkAuthorization() {
  if (!IS_IOS) return null;
  try {
    return await Health.checkAuthorization({ read: READ_TYPES, write: WRITE_TYPES });
  } catch {
    return null;
  }
}

// ─── Read helpers ────────────────────────────────────────────────────────────

async function querySamples(dataType, startDate, endDate, limit = 100) {
  if (!IS_IOS) return [];
  try {
    const result = await Health.readSamples({
      dataType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit,
    });
    return result?.samples || [];
  } catch (e) {
    console.warn(`[HealthKit] Query ${dataType} failed:`, e?.message);
    return [];
  }
}

async function getLatestSample(dataType) {
  const samples = await querySamples(
    dataType,
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    new Date(),
    1
  );
  return samples[0] || null;
}

// ─── Read: Body ──────────────────────────────────────────────────────────────

export async function getWeightHistory(startDate, endDate) {
  const samples = await querySamples('weight', startDate, endDate, 0);
  return samples.map(s => ({
    value: s.value,
    unit: s.unit || 'kilogram',
    date: s.startDate,
    source: s.sourceName || 'Apple Health',
  }));
}

export async function getLatestWeight() {
  const s = await getLatestSample('weight');
  if (!s) return null;
  return { value: s.value, unit: s.unit || 'kilogram', date: s.startDate };
}

export async function getBodyFatHistory(startDate, endDate) {
  const samples = await querySamples('bodyFat', startDate, endDate, 0);
  return samples.map(s => ({
    value: s.value, // @capgo returns percentage directly
    date: s.startDate,
    source: s.sourceName || 'Apple Health',
  }));
}

export async function getLatestBodyFat() {
  const s = await getLatestSample('bodyFat');
  if (!s) return null;
  return { value: s.value, date: s.startDate };
}

export async function getHeight() {
  const s = await getLatestSample('height');
  if (!s) return null;
  return { value: s.value, unit: s.unit || 'centimeter', date: s.startDate };
}

// ─── Read: Activity ──────────────────────────────────────────────────────────

export async function getSteps(startDate, endDate) {
  const samples = await querySamples('steps', startDate, endDate, 0);
  const total = samples.reduce((sum, s) => sum + (s.value || 0), 0);
  return { total: Math.round(total), samples: samples.length };
}

export async function getActiveCalories(startDate, endDate) {
  const samples = await querySamples('calories', startDate, endDate, 0);
  const total = samples.reduce((sum, s) => sum + (s.value || 0), 0);
  return { total: Math.round(total), unit: 'kcal' };
}

export async function getRestingCalories(startDate, endDate) {
  const samples = await querySamples('basalCalories', startDate, endDate, 0);
  const total = samples.reduce((sum, s) => sum + (s.value || 0), 0);
  return { total: Math.round(total), unit: 'kcal' };
}

export async function getDistance(startDate, endDate) {
  const samples = await querySamples('distance', startDate, endDate, 0);
  const total = samples.reduce((sum, s) => sum + (s.value || 0), 0);
  return { total: Math.round(total), unit: 'm' };
}

// ─── Read: Heart Rate ────────────────────────────────────────────────────────

export async function getHeartRate(startDate, endDate) {
  const samples = await querySamples('heartRate', startDate, endDate, 0);
  return samples.map(s => ({ value: s.value, date: s.startDate }));
}

// ─── Read: Sleep ─────────────────────────────────────────────────────────────

export async function getSleep(startDate, endDate) {
  const samples = await querySamples('sleep', startDate, endDate, 0);
  let totalMinutes = 0;
  const entries = samples.map(s => {
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    const durationMin = (end - start) / 60000;
    totalMinutes += durationMin;
    return {
      startDate: s.startDate,
      endDate: s.endDate,
      durationMinutes: Math.round(durationMin),
      sleepState: s.sleepState,
    };
  });
  return { totalHours: +(totalMinutes / 60).toFixed(1), entries };
}

// ─── Read: Workouts ──────────────────────────────────────────────────────────

export async function getWorkouts(startDate, endDate) {
  if (!IS_IOS) return [];
  try {
    const result = await Health.queryWorkouts({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 100,
    });
    return (result?.workouts || []).map(w => ({
      activityType: w.workoutType,
      duration: w.duration,
      calories: w.totalEnergyBurned || 0,
      distance: w.totalDistance || 0,
      startDate: w.startDate,
      endDate: w.endDate,
      source: w.sourceName || 'Apple Health',
    }));
  } catch (e) {
    console.warn('[HealthKit] Query workouts failed:', e?.message);
    return [];
  }
}

// ─── Write: Body ─────────────────────────────────────────────────────────────

export async function saveWeight(kg, date = new Date()) {
  if (!IS_IOS) return false;
  try {
    await Health.writeSample({
      dataType: 'weight',
      value: kg,
      startDate: date.toISOString(),
      endDate: date.toISOString(),
    });
    return true;
  } catch (e) {
    console.warn('[HealthKit] Save weight failed:', e?.message);
    return false;
  }
}

export async function saveBodyFat(percent, date = new Date()) {
  if (!IS_IOS) return false;
  try {
    await Health.writeSample({
      dataType: 'bodyFat',
      value: percent,
      startDate: date.toISOString(),
      endDate: date.toISOString(),
    });
    return true;
  } catch (e) {
    console.warn('[HealthKit] Save body fat failed:', e?.message);
    return false;
  }
}

// ─── Write: Workout ──────────────────────────────────────────────────────────

export async function saveWorkout({ durationMinutes, caloriesBurned, startDate, endDate }) {
  if (!IS_IOS) return false;
  try {
    await Health.saveWorkout({
      workoutType: 'traditionalStrengthTraining',
      duration: durationMinutes * 60,
      totalEnergyBurned: caloriesBurned || 0,
      startDate: (startDate || new Date()).toISOString(),
      endDate: (endDate || new Date()).toISOString(),
    });
    return true;
  } catch (e) {
    console.warn('[HealthKit] Save workout failed:', e?.message);
    return false;
  }
}

// ─── Sync: Full import from Apple Health ─────────────────────────────────────

export async function importHealthSnapshot(startDate, endDate) {
  const [weight, bodyFat, steps, activeCal, restingCal, distance, sleep, workouts] =
    await Promise.all([
      getWeightHistory(startDate, endDate),
      getBodyFatHistory(startDate, endDate),
      getSteps(startDate, endDate),
      getActiveCalories(startDate, endDate),
      getRestingCalories(startDate, endDate),
      getDistance(startDate, endDate),
      getSleep(startDate, endDate),
      getWorkouts(startDate, endDate),
    ]);

  return {
    weight, bodyFat, steps,
    activeCalories: activeCal,
    restingCalories: restingCal,
    distance, sleep, workouts,
    importedAt: new Date().toISOString(),
  };
}

export async function getTodayActivity() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [steps, activeCal, distance] = await Promise.all([
    getSteps(startOfDay, now),
    getActiveCalories(startOfDay, now),
    getDistance(startOfDay, now),
  ]);
  return { steps: steps.total, activeCalories: activeCal.total, distance: distance.total };
}

// ─── Widget shared data ──────────────────────────────────────────────────────

export async function writeWidgetSnapshot(data) {
  if (!IS_IOS) return;
  try {
    const snapshot = { ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem('atlas_widget_snapshot', JSON.stringify(snapshot));
  } catch (e) {
    console.warn('[HealthKit] Widget snapshot write failed:', e?.message);
  }
}
