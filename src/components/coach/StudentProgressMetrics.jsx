import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Scale, Zap, Moon } from 'lucide-react';
import { getMeasurementFieldValue } from '@/lib/measurementModel';

/**
 * StudentProgressMetrics — consolidated progress view for coach
 * Shows weight delta, avg energy, sleep, latest measurements
 * 
 * Usage:
 * <StudentProgressMetrics
 *   measurements={[]}
 *   checkins={[]}
 *   workouts={[]}
 * />
 */
export default function StudentProgressMetrics({ measurements = [], checkins = [], workouts = [] }) {
  const metrics = useMemo(() => {
    // Weight progress
    const weights = measurements
      .map((measurement) => ({
        ...measurement,
        value: getMeasurementFieldValue(measurement, 'weight'),
      }))
      .filter((measurement) => measurement.value !== null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const weightDelta = weights.length >= 2 ? weights[weights.length - 1].value - weights[0].value : null;
    const latestWeight = weights.length > 0 ? weights[weights.length - 1].value : null;

    // Body composition
    const bodyFats = measurements
      .map((measurement) => ({
        ...measurement,
        value: getMeasurementFieldValue(measurement, 'body_fat_percent'),
      }))
      .filter((measurement) => measurement.value !== null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const bodyFatDelta = bodyFats.length >= 2 ? bodyFats[bodyFats.length - 1].value - bodyFats[0].value : null;
    const latestBodyFat = bodyFats.length > 0 ? bodyFats[bodyFats.length - 1].value : null;

    // Check-in metrics
    const recentCheckins = checkins.slice(0, 7);
    const avgEnergy = recentCheckins.length ? (recentCheckins.reduce((s, c) => s + (c.energy || 0), 0) / recentCheckins.length).toFixed(1) : null;
    const avgMood = recentCheckins.length ? (recentCheckins.reduce((s, c) => s + (c.mood || 0), 0) / recentCheckins.length).toFixed(1) : null;
    const avgSleep = recentCheckins.length ? (recentCheckins.reduce((s, c) => s + (c.sleep_hours || 0), 0) / recentCheckins.length).toFixed(1) : null;

    // Workout metrics
    const completedWorkouts = workouts.filter(w => w.completed).length;
    const totalVolume = workouts.reduce((s, w) => s + (w.volume_load || 0), 0);

    // Latest measurements
    const latest = measurements.length > 0 ? measurements[measurements.length - 1] : null;

    return {
      weight: { current: latestWeight, delta: weightDelta },
      bodyFat: { current: latestBodyFat, delta: bodyFatDelta },
      energy: avgEnergy,
      mood: avgMood,
      sleep: avgSleep,
      completedWorkouts,
      totalVolume,
      latest,
      recentCheckins: recentCheckins.length,
    };
  }, [measurements, checkins, workouts]);

  const TrendIcon = ({ delta, reverse = false }) => {
    if (!delta || Math.abs(delta) < 0.1) return <Minus className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.5} />;
    const isPositive = delta > 0;
    const shouldShow = reverse ? !isPositive : isPositive;
    return shouldShow ? (
      <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--ok))]" strokeWidth={2.5} />
    ) : (
      <TrendingDown className="w-3.5 h-3.5 text-[hsl(var(--err))]" strokeWidth={2.5} />
    );
  };

  return (
    <div className="space-y-4">
      {/* Primary metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Weight */}
        <div className="surface p-4 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <p className="t-label">Weight</p>
            <Scale className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
          </div>
          {metrics.weight.current ? (
            <>
              <p className="text-[20px] font-bold mb-1">{metrics.weight.current.toFixed(1)} kg</p>
              {metrics.weight.delta !== null && (
                <div className="flex items-center gap-1.5">
                  <TrendIcon delta={metrics.weight.delta} reverse={true} />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {metrics.weight.delta > 0 ? '+' : ''}{metrics.weight.delta.toFixed(1)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-[12px] text-muted-foreground">—</p>
          )}
        </div>

        {/* Body Fat */}
        <div className="surface p-4 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <p className="t-label">Body fat</p>
            <Scale className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
          </div>
          {metrics.bodyFat.current ? (
            <>
              <p className="text-[20px] font-bold mb-1">{metrics.bodyFat.current.toFixed(1)}%</p>
              {metrics.bodyFat.delta !== null && (
                <div className="flex items-center gap-1.5">
                  <TrendIcon delta={metrics.bodyFat.delta} reverse={true} />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {metrics.bodyFat.delta > 0 ? '+' : ''}{metrics.bodyFat.delta.toFixed(2)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-[12px] text-muted-foreground">—</p>
          )}
        </div>

        {/* Energy */}
        <div className="surface p-4 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <p className="t-label">Energy</p>
            <Zap className="w-3.5 h-3.5 text-[hsl(var(--warn))]" strokeWidth={2} />
          </div>
          {metrics.energy ? (
            <p className="text-[20px] font-bold">{metrics.energy}/5</p>
          ) : (
            <p className="text-[12px] text-muted-foreground">—</p>
          )}
        </div>

        {/* Sleep */}
        <div className="surface p-4 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <p className="t-label">Sleep</p>
            <Moon className="w-3.5 h-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
          </div>
          {metrics.sleep ? (
            <p className="text-[20px] font-bold">{metrics.sleep}h</p>
          ) : (
            <p className="text-[12px] text-muted-foreground">—</p>
          )}
        </div>

        {/* Completed Workouts */}
        <div className="surface p-4 rounded-xl">
          <p className="t-label mb-1.5">Workouts</p>
          <p className="text-[20px] font-bold">{metrics.completedWorkouts}</p>
        </div>

        {/* Total Volume */}
        <div className="surface p-4 rounded-xl">
          <p className="t-label mb-1.5">Volume</p>
          <p className="text-[20px] font-bold">{Math.round(metrics.totalVolume)} kg</p>
        </div>
      </div>

      {/* Latest measurements detail */}
      {metrics.latest && (
        <div className="surface p-5 rounded-xl">
          <p className="t-label mb-3">Latest measurements</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            {getMeasurementFieldValue(metrics.latest, 'weight') != null && (
              <div className="text-center p-2 rounded bg-[hsl(var(--card-hi))]">
                <p className="text-muted-foreground mb-1">Weight</p>
                <p className="font-bold">{getMeasurementFieldValue(metrics.latest, 'weight')} kg</p>
              </div>
            )}
            {getMeasurementFieldValue(metrics.latest, 'body_fat_percent') != null && (
              <div className="text-center p-2 rounded bg-[hsl(var(--card-hi))]">
                <p className="text-muted-foreground mb-1">Body fat</p>
                <p className="font-bold">{getMeasurementFieldValue(metrics.latest, 'body_fat_percent')}%</p>
              </div>
            )}
            {getMeasurementFieldValue(metrics.latest, 'waist') != null && (
              <div className="text-center p-2 rounded bg-[hsl(var(--card-hi))]">
                <p className="text-muted-foreground mb-1">Waist</p>
                <p className="font-bold">{getMeasurementFieldValue(metrics.latest, 'waist')} cm</p>
              </div>
            )}
            {getMeasurementFieldValue(metrics.latest, 'thorax') != null && (
              <div className="text-center p-2 rounded bg-[hsl(var(--card-hi))]">
                <p className="text-muted-foreground mb-1">Chest</p>
                <p className="font-bold">{getMeasurementFieldValue(metrics.latest, 'thorax')} cm</p>
              </div>
            )}
            {getMeasurementFieldValue(metrics.latest, 'arms') != null && (
              <div className="text-center p-2 rounded bg-[hsl(var(--card-hi))]">
                <p className="text-muted-foreground mb-1">Arms</p>
                <p className="font-bold">{getMeasurementFieldValue(metrics.latest, 'arms')} cm</p>
              </div>
            )}
            {getMeasurementFieldValue(metrics.latest, 'thighs') != null && (
              <div className="text-center p-2 rounded bg-[hsl(var(--card-hi))]">
                <p className="text-muted-foreground mb-1">Thighs</p>
                <p className="font-bold">{getMeasurementFieldValue(metrics.latest, 'thighs')} cm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Check-in status */}
      <div className="surface p-4 rounded-xl text-[12px]">
        <p className="t-label mb-1.5">Check-ins (7d)</p>
        <p className="text-[16px] font-bold mb-1">{metrics.recentCheckins}/7</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--shell))] overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--brand))]"
              style={{ width: `${(metrics.recentCheckins / 7) * 100}%` }}
            />
          </div>
          <span className="text-muted-foreground text-[10px]">{Math.round((metrics.recentCheckins / 7) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
