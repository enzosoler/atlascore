/**
 * Progress analysis — analyze weight/body fat trends
 * Shows in /Progress page
 */
import React, { useState } from 'react';
import { invokeLLM } from '@/lib/llm';
import { BarChart3, Loader2 } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { getMeasurementFieldValue } from '@/lib/measurementModel';

export default function AIProgressAnalysis({ measurements, profile }) {
  const { can } = useSubscription();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatValue = (value, digits = 1) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '--';
    }

    return Number(value).toFixed(digits);
  };

  const generateAnalysis = async () => {
    if (!can('atlas_ai') || measurements.length < 2) return;

    try {
      setLoading(true);
      const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
      const latest = sorted[sorted.length - 1];
      const oldest = sorted[0];

      const latestWeight = getMeasurementFieldValue(latest, 'weight');
      const oldestWeight = getMeasurementFieldValue(oldest, 'weight');
      const latestBodyFat = getMeasurementFieldValue(latest, 'body_fat_percent');
      const oldestBodyFat = getMeasurementFieldValue(oldest, 'body_fat_percent');
      const weightChange = latestWeight !== null && oldestWeight !== null ? latestWeight - oldestWeight : 0;
      const bfChange = latestBodyFat !== null && oldestBodyFat !== null ? latestBodyFat - oldestBodyFat : 0;
      const days = Math.max(0, Math.round((new Date(latest.date) - new Date(oldest.date)) / (1000 * 60 * 60 * 24)));

      const targetWeightText = profile?.target_weight != null ? `${formatValue(profile.target_weight)}kg` : '--';
      const bodyFatGoalText = profile?.body_fat_goal != null ? `${formatValue(profile.body_fat_goal)}%` : '--';
      const objectiveText = profile?.training_goal || '--';

      const text = await invokeLLM(`Analyze these ${days}-day trends:

- Weight: ${formatValue(oldestWeight)}kg -> ${formatValue(latestWeight)}kg (${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg)
- Body fat: ${formatValue(oldestBodyFat)}% -> ${formatValue(latestBodyFat)}% (${bfChange > 0 ? '+' : ''}${bfChange.toFixed(1)}%)
- Goal: ${targetWeightText}, ${bodyFatGoalText} body fat
- Objective: ${objectiveText}

Reply in 2-3 lines: pace of change, whether it is on track, and one actionable recommendation.`);

      setAnalysis(text);
    } finally {
      setLoading(false);
    }
  };

  if (!can('atlas_ai') || measurements.length < 2) return null;

  return (
    <div className="surface p-5 border-[hsl(var(--brand-ai)/0.2)] bg-[hsl(var(--brand-ai)/0.02)]">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand-ai)/0.1)] flex items-center justify-center shrink-0 mt-0.5">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[hsl(var(--brand-ai))] animate-spin" strokeWidth={2} />
          ) : (
            <BarChart3 className="w-4 h-4 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-semibold text-[hsl(var(--brand-ai))]">Trend analysis</span>
          </div>
          {analysis ? (
            <p className="text-[12px] text-foreground leading-relaxed">{analysis}</p>
          ) : (
            <button
              onClick={generateAnalysis}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))] text-[11px] font-medium hover:bg-[hsl(var(--brand-ai)/0.2)] transition-colors flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <BarChart3 className="w-3 h-3" />}
              {loading ? 'Reading...' : 'Review trends'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
