/**
 * useWatchConnectivity — Listens for actions sent from the Apple Watch.
 *
 * The native WatchConnectivityHandler dispatches custom events to the window
 * when the Watch sends a workout completion, weight log, or check-in.
 *
 * Mount this hook once in the authenticated app to handle Watch actions.
 */

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

const IS_IOS = Capacitor.getPlatform() === 'ios';

export function useWatchConnectivity({ onWorkoutCompleted, onWeightLogged, onCheckinCompleted } = {}) {
  useEffect(() => {
    if (!IS_IOS) return;

    const handleWorkout = (e) => {
      const detail = e.detail || {};
      toast.success(`Workout synced from Watch (${detail.durationMinutes || 0} min)`);
      onWorkoutCompleted?.(detail);
    };

    const handleWeight = (e) => {
      const detail = e.detail || {};
      const kg = detail.weightKg;
      if (kg) toast.success(`Weight ${kg.toFixed(1)} kg logged from Watch`);
      onWeightLogged?.(detail);
    };

    const handleCheckin = (e) => {
      const detail = e.detail || {};
      toast.success('Check-in synced from Watch');
      onCheckinCompleted?.(detail);
    };

    window.addEventListener('watchWorkoutCompleted', handleWorkout);
    window.addEventListener('watchWeightLogged', handleWeight);
    window.addEventListener('watchCheckinCompleted', handleCheckin);

    return () => {
      window.removeEventListener('watchWorkoutCompleted', handleWorkout);
      window.removeEventListener('watchWeightLogged', handleWeight);
      window.removeEventListener('watchCheckinCompleted', handleCheckin);
    };
  }, [onWorkoutCompleted, onWeightLogged, onCheckinCompleted]);
}
