/**
 * healthKitService.js
 *
 * Bridge between atlas.core and Apple HealthKit via @perfood/capacitor-healthkit.
 * Handles permission requests, reading health data, and writing atlas.core data back.
 *
 * All methods are no-ops on non-iOS platforms.
 */

import { Capacitor } from '@capacitor/core';

const IS_IOS = Capacitor.getPlatform() === 'ios';

// Lazy-load the plugin to avoid import errors on non-iOS
let _hk = null;
async function getHK() {
  if (!IS_IOS) return null;
  if (!_hk) {
    try {
      const mod = await import('@perfood/capacitor-healthkit');
      _hk = mod.CapacitorHealthkit;
    } catch (e) {
      console.warn('[HealthKit] Failed to load plugin:', e?.message);
      return null;
    }
  }
  return _hk;
}

// ─── Data type identifiers ───────────────────────────────────────────────────

const READ_TYPES = [
  'HKQuantityTypeIdentifierBodyMass',
  'HKQuantityTypeIdentifierBodyFatPercentage',
  'HKQuantityTypeIdentifierHeight',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierBasalEnergyBurned',
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
  'HKQuantityTypeIdentifierHeartRate',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKWorkoutTypeIdentifier',
];

const WRITE_TYPES = [
  'HKQuantityTypeIdentifierBodyMass',
  'HKQuantityTypeIdentifierBodyFatPercentage',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKWorkoutTypeIdentifier',
];

// ─── Permission ──────────────────────────────────────────────────────────────

/**
 * Check if HealthKit is available on this device.
 */
export async function isAvailable() {
  if (!IS_IOS) return false;
  const hk = await getHK();
  if (!hk) return false;
  try {
    const result = await hk.isAvailable();
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
  const hk = await getHK();
  if (!hk) return false;
  try {
    await hk.requestAuthorization({
      all: [],
      read: READ_TYPES,
      write: WRITE_TYPES,
    });
    return true;
  } catch (e) {
    console.warn('[HealthKit] Authorization failed:', e?.message);
    return false;
  }
}

// ─── Read helpers ────────────────────────────────────────────────────────────

/**
 * Query samples of a given type within a date range.
 * @param {string} sampleType - HK type identifier
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} limit - max results (0 = no limit)
 * @returns {Array} samples
 */
async function querySamples(sampleType, startDate, endDate, limit = 0) {
  const hk = await getHK();
  if (!hk) return [];
  try {
    const result = await hk.queryHKitSampleType({
      sampleName: sampleType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit,
    });
    return result?.resultData || [];
  } catch (e) {
    console.warn(`[HealthKit] Query ${sampleType} failed:`, e?.message);
    return [];
  }
}

/**
 * Get the most recent sample of a given type.
 */
async function getLatestSample(sampleType) {
  const samples = await querySamples(
    sampleType,
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // last year
    new Date(),
    1
  );
  return samples[0] || null;
}

// ─── Read: Body ──────────────────────────────────────────────────────────────

/**
 * Get weight history for a date range.
 * Returns [{ value: kg, date: ISO string }]
 */
export async function getWeightHistory(startDate, endDate) {
  const samples = await querySamples(
    'HKQuantityTypeIdentifierBodyMass',
    startDate,
    endDate
  );
  return samples.map(s => ({
    value: parseFloat(s.value),
    unit: s.unit || 'kg',
    date: s.startDate || s.date,
    source: s.sourceName || 'Apple Health',
  }));
}

/**
 * Get the latest weight reading.
 */
export async function getLatestWeight() {
  const s = await getLatestSample('HKQuantityTypeIdentifierBodyMass');
  if (!s) return null;
  return { value: parseFloat(s.value), unit: s.unit || 'kg', date: s.startDate || s.date };
}

/**
 * Get body fat percentage history.
 */
export async function getBodyFatHistory(startDate, endDate) {
  const samples = await querySamples(
    'HKQuantityTypeIdentifierBodyFatPercentage',
    startDate,
    endDate
  );
  return samples.map(s => ({
    value: parseFloat(s.value) * 100, // HK stores as 0.0–1.0
    date: s.startDate || s.date,
    source: s.sourceName || 'Apple Health',
  }));
}

/**
 * Get latest body fat percentage.
 */
export async function getLatestBodyFat() {
  const s = await getLatestSample('HKQuantityTypeIdentifierBodyFatPercentage');
  if (!s) return null;
  return { value: parseFloat(s.value) * 100, date: s.startDate || s.date };
}

/**
 * Get height.
 */
export async function getHeight() {
  const s = await getLatestSample('HKQuantityTypeIdentifierHeight');
  if (!s) return null;
  return { value: parseFloat(s.value), unit: s.unit || 'cm', date: s.startDate || s.date };
}

// ─── Read: Activity ──────────────────────────────────────────────────────────

/**
 * Get step count for a date range.
 */
export async function getSteps(startDate, endDate) {
  const samples = await querySamples(
    'HKQuantityTypeIdentifierStepCount',
    startDate,
    endDate
  );
  const total = samples.reduce((sum, s) => sum + parseFloat(s.value || 0), 0);
  return { total: Math.round(total), samples: samples.length };
}

/**
 * Get active calories burned for a date range.
 */
export async function getActiveCalories(startDate, endDate) {
  const samples = await querySamples(
    'HKQuantityTypeIdentifierActiveEnergyBurned',
    startDate,
    endDate
  );
  const total = samples.reduce((sum, s) => sum + parseFloat(s.value || 0), 0);
  return { total: Math.round(total), unit: 'kcal' };
}

/**
 * Get resting calories burned for a date range.
 */
export async function getRestingCalories(startDate, endDate) {
  const samples = await querySamples(
    'HKQuantityTypeIdentifierBasalEnergyBurned',
    startDate,
    endDate
  );
  const total = samples.reduce((sum, s) => sum + parseFloat(s.value || 0), 0);
  return { total: Math.round(total), unit: 'kcal' };
}

/**
 * Get walking/running distance for a date range (meters).
 */
export async function getDistance(startDate, endDate) {
  const samples = await querySamples(
    'HKQuantityTypeIdentifierDistanceWalkingRunning',
    startDate,
    endDate
  );
  const total = samples.reduce((sum, s) => sum + parseFloat(s.value || 0), 0);
  return { total: Math.round(total), unit: 'm' };
}

// ─── Read: Heart Rate ────────────────────────────────────────────────────────

/**
 * Get heart rate samples for a date range.
 */
export async function getHeartRate(startDate, endDate) {
  const samples = await querySamples(
    'HKQuantityTypeIdentifierHeartRate',
    startDate,
    endDate
  );
  return samples.map(s => ({
    value: parseFloat(s.value),
    date: s.startDate || s.date,
  }));
}

// ─── Read: Sleep ─────────────────────────────────────────────────────────────

/**
 * Get sleep analysis for a date range.
 * Returns total hours and breakdown.
 */
export async function getSleep(startDate, endDate) {
  const samples = await querySamples(
    'HKCategoryTypeIdentifierSleepAnalysis',
    startDate,
    endDate
  );
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
      value: s.value, // 0=InBed, 1=Asleep, etc.
    };
  });
  return { totalHours: +(totalMinutes / 60).toFixed(1), entries };
}

// ─── Read: Workouts ──────────────────────────────────────────────────────────

/**
 * Get workouts from Apple Health for a date range.
 */
export async function getWorkouts(startDate, endDate) {
  const hk = await getHK();
  if (!hk) return [];
  try {
    const result = await hk.queryHKitSampleType({
      sampleName: 'HKWorkoutTypeIdentifier',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 0,
    });
    return (result?.resultData || []).map(w => ({
      activityType: w.workoutActivityType || w.activityType,
      duration: parseFloat(w.duration || 0),
      calories: parseFloat(w.totalEnergyBurned || 0),
      distance: parseFloat(w.totalDistance || 0),
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

/**
 * Save a weight entry to Apple Health.
 * @param {number} kg - weight in kilograms
 * @param {Date} date - when the measurement was taken
 */
export async function saveWeight(kg, date = new Date()) {
  const hk = await getHK();
  if (!hk) return false;
  try {
    await hk.store({
      sampleName: 'HKQuantityTypeIdentifierBodyMass',
      unitName: 'kg',
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

/**
 * Save a body fat percentage entry to Apple Health.
 * @param {number} percent - body fat percentage (e.g. 15.5 for 15.5%)
 * @param {Date} date
 */
export async function saveBodyFat(percent, date = new Date()) {
  const hk = await getHK();
  if (!hk) return false;
  try {
    await hk.store({
      sampleName: 'HKQuantityTypeIdentifierBodyFatPercentage',
      unitName: '%',
      value: percent / 100, // HK expects 0.0–1.0
      startDate: date.toISOString(),
      endDate: date.toISOString(),
    });
    return true;
  } catch (e) {
    console.warn('[HealthKit] Save body fat failed:', e?.message);
    return false;
  }
}

// ─── Write: Nutrition ────────────────────────────────────────────────────────

/**
 * Save nutrition data to Apple Health.
 * @param {{ calories: number, protein: number, carbs: number, fat: number }} macros
 * @param {Date} date
 */
export async function saveNutrition({ calories, protein, carbs, fat }, date = new Date()) {
  const hk = await getHK();
  if (!hk) return false;
  const iso = date.toISOString();
  try {
    const writes = [];
    if (calories > 0) {
      writes.push(hk.store({
        sampleName: 'HKQuantityTypeIdentifierDietaryEnergyConsumed',
        unitName: 'kcal',
        value: calories,
        startDate: iso,
        endDate: iso,
      }));
    }
    if (protein > 0) {
      writes.push(hk.store({
        sampleName: 'HKQuantityTypeIdentifierDietaryProtein',
        unitName: 'g',
        value: protein,
        startDate: iso,
        endDate: iso,
      }));
    }
    if (carbs > 0) {
      writes.push(hk.store({
        sampleName: 'HKQuantityTypeIdentifierDietaryCarbohydrates',
        unitName: 'g',
        value: carbs,
        startDate: iso,
        endDate: iso,
      }));
    }
    if (fat > 0) {
      writes.push(hk.store({
        sampleName: 'HKQuantityTypeIdentifierDietaryFatTotal',
        unitName: 'g',
        value: fat,
        startDate: iso,
        endDate: iso,
      }));
    }
    await Promise.all(writes);
    return true;
  } catch (e) {
    console.warn('[HealthKit] Save nutrition failed:', e?.message);
    return false;
  }
}

// ─── Write: Workout ──────────────────────────────────────────────────────────

/**
 * Save a workout to Apple Health.
 * @param {{ name: string, durationMinutes: number, caloriesBurned: number, startDate: Date, endDate: Date }} workout
 */
export async function saveWorkout({ durationMinutes, caloriesBurned, startDate, endDate }) {
  const hk = await getHK();
  if (!hk) return false;
  try {
    await hk.storeWorkout({
      activityType: 'HKWorkoutActivityTypeTraditionalStrengthTraining',
      duration: durationMinutes * 60, // seconds
      totalEnergyBurned: caloriesBurned || 0,
      totalEnergyBurnedUnit: 'kcal',
      totalDistance: 0,
      totalDistanceUnit: 'm',
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

/**
 * Import a comprehensive health snapshot for the given date range.
 * Used for initial onboarding import and periodic sync.
 */
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
    weight,
    bodyFat,
    steps,
    activeCalories: activeCal,
    restingCalories: restingCal,
    distance,
    sleep,
    workouts,
    importedAt: new Date().toISOString(),
  };
}

/**
 * Get today's activity summary (steps, active cal, distance).
 */
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

/**
 * Write a compact widget snapshot to App Groups shared storage.
 * This is called by the main app after important data changes.
 * The WidgetKit extension reads this JSON to render widgets.
 */
export async function writeWidgetSnapshot(data) {
  if (!IS_IOS) return;
  try {
    // Use Capacitor Preferences or a custom plugin to write to App Group
    // For now, store in localStorage; native widget bridge reads from App Group
    const snapshot = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('atlas_widget_snapshot', JSON.stringify(snapshot));
  } catch (e) {
    console.warn('[HealthKit] Widget snapshot write failed:', e?.message);
  }
}
