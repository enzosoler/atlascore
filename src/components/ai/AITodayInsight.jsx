/**
 * Today summary — contextual recommendation for today
 * Shows on /Today page
 */
import React, { useState, useEffect } from 'react';
import { invokeLLM } from '@/lib/llm';
import { BarChart3, Loader2 } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';

export default function AITodayInsight({ checkin, meals, workouts, profile }) {
  const { can } = useSubscription();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasSummaryAccess = can('atlas_ai');

  useEffect(() => {
    if (!hasSummaryAccess) return;
    
    const fetchInsight = async () => {
      try {
        setLoading(true);
        const mealsCount = meals?.length || 0;
        const workoutLogged = workouts?.some(w => w.completed);
        
        const text = await invokeLLM(`Provide a VERY SHORT contextual recommendation (max 2 lines) for the user TODAY based on:

- Meals logged: ${mealsCount}
- Workout completed: ${workoutLogged ? 'yes' : 'no'}
- Calorie target: ${profile?.calories_target || 0} kcal
- Mood/energy (if check-in): ${checkin ? `${checkin.mood}/5 mood, ${checkin.energy}/5 energy` : 'not filled'}

Be motivating, practical, a concrete action for the next few hours.`);

        setInsight(text);
      } catch (err) {
        console.error('AITodayInsight error:', err.message);
        setError('Could not generate summary');
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [hasSummaryAccess, meals?.length, workouts?.length, checkin?.id]);

  if (!can('atlas_ai')) return null;

  return (
    <div className="surface p-4 border-[hsl(var(--brand-ai)/0.2)] bg-[hsl(var(--brand-ai)/0.02)]">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand-ai)/0.1)] flex items-center justify-center shrink-0 mt-0.5">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[hsl(var(--brand-ai))] animate-spin" strokeWidth={2} />
          ) : (
            <BarChart3 className="w-4 h-4 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[hsl(var(--brand-ai))] mb-1">Today summary</p>
          {loading ? (
            <p className="text-[12px] text-muted-foreground">Preparing your summary...</p>
          ) : error ? (
            <p className="text-[12px] text-[hsl(var(--err))]">{error}</p>
          ) : insight ? (
            <p className="text-[12px] text-foreground leading-relaxed">{insight}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
