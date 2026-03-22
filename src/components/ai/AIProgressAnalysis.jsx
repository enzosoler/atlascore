/**
 * AIProgressAnalysis — analyze weight/body fat trends
 * Shows in /Progress page
 */
import React, { useState } from 'react';
import { invokeLLM } from '@/lib/llm';
import { Brain, Loader2 } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';

export default function AIProgressAnalysis({ measurements, profile }) {
  const { can } = useSubscription();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async () => {
    if (!can('atlas_ai') || measurements.length < 2) return;
    
    try {
      setLoading(true);
      const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
      const latest = sorted[sorted.length - 1];
      const oldest = sorted[0];
      
      const weightChange = latest.weight - oldest.weight;
      const bfChange = latest.body_fat - oldest.body_fat;
      const days = (new Date(latest.date) - new Date(oldest.date)) / (1000 * 60 * 60 * 24);
      
      const text = await invokeLLM(`Analyze these ${Math.round(days)}-day trends:

- Weight: ${oldest.weight}kg -> ${latest.weight}kg (${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg)
- Body fat: ${oldest.body_fat}% -> ${latest.body_fat}% (${bfChange > 0 ? '+' : ''}${bfChange.toFixed(1)}%)
- Goal: ${profile?.target_weight}kg, ${profile?.body_fat_goal}% body fat
- Objective: ${profile?.training_goal}

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
            <Brain className="w-4 h-4 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
          )}
        </div>
        <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-semibold text-[hsl(var(--brand-ai))]">Atlas AI - Trend analysis</span>
          </div>
          {analysis ? (
            <p className="text-[12px] text-foreground leading-relaxed">{analysis}</p>
          ) : (
            <button
              onClick={generateAnalysis}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))] text-[11px] font-medium hover:bg-[hsl(var(--brand-ai)/0.2)] transition-colors flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
              {loading ? 'Analyzing...' : 'Analyze trends'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
