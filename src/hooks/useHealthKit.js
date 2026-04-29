/**
 * useHealthKit — React hook for Apple Health integration.
 *
 * Manages connection state, permissions, and provides read/write methods.
 * Persists connection state in localStorage so the UI remembers across sessions.
 */

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import * as hk from '@/services/healthKitService';

const IS_IOS = Capacitor.getPlatform() === 'ios';
const STORAGE_KEY = 'atlas_healthkit_connected';
const LAST_SYNC_KEY = 'atlas_healthkit_last_sync';

export function useHealthKit() {
  const [available, setAvailable] = useState(false);
  const [connected, setConnected] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });
  const [lastSync, setLastSync] = useState(() => {
    try { return localStorage.getItem(LAST_SYNC_KEY); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // Check availability on mount
  useEffect(() => {
    if (!IS_IOS) return;
    hk.isAvailable().then(setAvailable);
  }, []);

  /**
   * Request HealthKit permissions and mark as connected.
   */
  const connect = useCallback(async () => {
    if (!IS_IOS) return false;
    setLoading(true);
    try {
      const result = await hk.requestAuthorization();
      const granted = result?.granted ?? result;
      if (granted) {
        setConnected(true);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
      return granted;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Disconnect (just clears local state — Apple doesn't allow revoking programmatically).
   */
  const disconnect = useCallback(() => {
    setConnected(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    setLastSync(null);
  }, []);

  const markSynced = useCallback((date = new Date()) => {
    const value = typeof date === 'string' ? date : date.toISOString();
    setLastSync(value);
    localStorage.setItem(LAST_SYNC_KEY, value);
  }, []);

  /**
   * Import a full health snapshot for a date range.
   */
  const importSnapshot = useCallback(async (startDate, endDate) => {
    if (!connected) return null;
    return hk.importHealthSnapshot(startDate, endDate);
  }, [connected]);

  /**
   * Get today's activity (steps, active calories, distance).
   */
  const getTodayActivity = useCallback(async () => {
    if (!connected) return null;
    return hk.getTodayActivity();
  }, [connected]);

  return {
    // State
    available: IS_IOS && available,
    connected,
    loading,
    isIOS: IS_IOS,
    lastSync,
    status: !IS_IOS ? 'unsupported' : connected ? 'connected' : available ? 'permission_needed' : 'unavailable',

    // Actions
    connect,
    disconnect,
    markSynced,
    importSnapshot,
    getTodayActivity,

    // Direct access to service methods (for specific pages)
    getWeightHistory: hk.getWeightHistory,
    getLatestWeight: hk.getLatestWeight,
    getBodyFatHistory: hk.getBodyFatHistory,
    getLatestBodyFat: hk.getLatestBodyFat,
    getHeight: hk.getHeight,
    getSteps: hk.getSteps,
    getActiveCalories: hk.getActiveCalories,
    getRestingCalories: hk.getRestingCalories,
    getSleep: hk.getSleep,
    getHeartRate: hk.getHeartRate,
    getWorkouts: hk.getWorkouts,

    // Write methods
    saveWeight: hk.saveWeight,
    saveBodyFat: hk.saveBodyFat,
    saveNutrition: hk.saveNutrition,
    saveWorkout: hk.saveWorkout,
  };
}
