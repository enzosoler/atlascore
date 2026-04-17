/**
 * Measurement projection — project goal achievement timeline.
 * Shows in /Measurements page when AI access and a target weight are available.
 */
import React, { useMemo, useState } from 'react';
import { invokeLLM } from '@/lib/llm';
import { AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { cn } from '@/lib/utils';
import { getMeasurementFieldValue } from '@/lib/measurementModel';

export default function AIMeasurementProjection({ latest, measurements, profile }) {
  const { can } = useSubscription();
  const [projection, setProjection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectionError, setProjectionError] = useState(null);

  const weightSeries = useMemo(() => {
    const sorted = [...(measurements || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted
      .map((measurement) => {
        const value = getMeasurementFieldValue(measurement, 'weight');
        return value == null ? null : Number(value);
      })
      .filter((value) => Number.isFinite(value));
  }, [measurements]);

  const currentWeight = useMemo(() => {
    const latestWeight = getMeasurementFieldValue(latest, 'weight');
    if (latestWeight != null && Number.isFinite(Number(latestWeight))) {
      return Number(latestWeight);
    }
    return weightSeries.at(-1) ?? null;
  }, [latest, weightSeries]);

  const targetWeight = profile?.target_weight != null ? Number(profile.target_weight) : null;
  const hasProjectionContext = can('atlas_ai') && targetWeight != null && Number.isFinite(targetWeight) && weightSeries.length >= 3 && currentWeight != null;

  const computedEstimate = useMemo(() => {
    if (!hasProjectionContext) return null;

    const recent = weightSeries.slice(-3);
    const prior = weightSeries.slice(0, 3);
    const recentAvg = recent.reduce((sum, value) => sum + value, 0) / recent.length;
    const priorAvg = prior.reduce((sum, value) => sum + value, 0) / prior.length;
    const trackedWeeks = Math.max(1, (weightSeries.length - 1) / 7);
    const weeklyRate = (recentAvg - priorAvg) / trackedWeeks;

    if (!Number.isFinite(weeklyRate) || Math.abs(weeklyRate) < 0.01) {
      return {
        text: 'Trend is too flat to project confidently yet. Log a few more weigh-ins and the estimate will tighten.',
        weeklyRate,
        weeksToGoal: null,
        targetWeight,
      };
    }

    const delta = currentWeight - targetWeight;
    const weeksToGoal = delta === 0 ? 0 : Math.max(0, Math.abs(delta / weeklyRate));
    const achieved = delta === 0 || (delta > 0 && weeklyRate < 0 && currentWeight <= targetWeight) || (delta < 0 && weeklyRate > 0 && currentWeight >= targetWeight);

    return {
      text: achieved
        ? 'Goal already reached in the current trend window.'
        : `At the current pace of ${Math.abs(weeklyRate).toFixed(2)} kg/week, the goal is roughly ${weeksToGoal.toFixed(1)} weeks away.`,
      weeklyRate,
      weeksToGoal,
      targetWeight,
    };
  }, [currentWeight, hasProjectionContext, targetWeight, weightSeries]);

  const generateProjection = async () => {
    if (!hasProjectionContext) return;
    
    try {
      setLoading(true);
      setProjectionError(null);

      const prompt = `
        Rewrite this weight projection into one clear sentence with a calm, practical tone.

        Current weight: ${currentWeight.toFixed(1)}kg
        Target weight: ${targetWeight.toFixed(1)}kg
        Weekly rate: ${computedEstimate?.weeklyRate?.toFixed(2) ?? '0.00'}kg/week
        Estimated time to goal: ${computedEstimate?.weeksToGoal != null ? `${computedEstimate.weeksToGoal.toFixed(1)} weeks` : 'unknown'}

        Keep it short and actionable. Do not promise exact outcomes.
      `;

      const text = await invokeLLM(prompt);
      setProjection(text || computedEstimate?.text || null);
    } catch (error) {
      setProjection(computedEstimate?.text || null);
      setProjectionError(error?.message || 'Could not calculate a projection right now.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasProjectionContext) return null;

  return (
    <div className="rounded-[26px] border border-[hsl(var(--brand-ai)/0.18)] bg-[linear-gradient(180deg,hsl(var(--brand-ai)/0.05)_0%,hsl(var(--card))_100%)] p-4 shadow-[var(--shadow-xs)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-ai))]">
              Goal projection
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            Uses your recent weight curve, not a single noisy weigh-in.
          </p>
        </div>
        <div className="rounded-full border border-[hsl(var(--brand-ai)/0.18)] bg-[hsl(var(--brand-ai)/0.08)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--brand-ai))]">
          Target {targetWeight.toFixed(1)} kg
        </div>
      </div>

      {projection ? (
        <div className="mt-4 rounded-[22px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.78)] px-4 py-4">
          <p className="text-[13px] leading-6 text-[hsl(var(--fg))]">{projection}</p>
          {projectionError ? (
            <p className="mt-2 flex items-start gap-2 text-[12px] leading-5 text-[hsl(var(--fg-3))]">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--warn))]" strokeWidth={2} />
              <span>{projectionError}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={generateProjection}
            disabled={loading}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-colors',
              'bg-[hsl(var(--brand-ai)/0.12)] text-[hsl(var(--brand-ai))] hover:bg-[hsl(var(--brand-ai)/0.18)] disabled:opacity-60'
            )}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {loading ? 'Calculating' : 'Show projection'}
          </button>
          <p className="text-[12px] leading-5 text-[hsl(var(--fg-3))]">
            Based on {weightSeries.length} logged weight checkpoints.
          </p>
        </div>
      )}
    </div>
  );
}
