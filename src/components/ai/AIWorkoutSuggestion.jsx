/**
 * AIWorkoutSuggestion — suggest next exercise based on current workout
 * Shows in /Workouts page
 */
import React, { useState } from 'react';
import { invokeLLM } from '@/lib/llm';
import { Sparkles, Loader2 } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';

export default function AIWorkoutSuggestion({ loggedExercises, profile }) {
  const { can } = useSubscription();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestion = async () => {
    if (!can('atlas_ai')) return;

    try {
      setLoading(true);
      const doneExercises = loggedExercises?.map(ex => ex.name).join(', ') || 'none';

      const text = await invokeLLM(`Suggest ONE practical next exercise to continue this workout, based on:

- Exercises already completed: ${doneExercises}
- Training goal: ${profile?.training_goal || 'strength gain'}

Reply with ONLY the exercise name plus one line of guidance (example: "Dumbbell bench press - 3x8, focus on control").`);

      setSuggestion(text);
    } finally {
      setLoading(false);
    }
  };

  if (!can('atlas_ai')) return null;

  return (
    <div className="surface p-4 border-[hsl(var(--brand-ai)/0.2)] bg-[hsl(var(--brand-ai)/0.02)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
          <span className="text-[12px] font-semibold text-[hsl(var(--brand-ai))]">Next exercise</span>
        </div>
      </div>
      {suggestion ? (
        <p className="text-[12px] text-foreground mt-2 leading-relaxed">{suggestion}</p>
      ) : (
        <button
          onClick={generateSuggestion}
          disabled={loading}
          className="mt-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))] text-[11px] font-medium hover:bg-[hsl(var(--brand-ai)/0.2)] transition-colors flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {loading ? 'Generating...' : 'Suggest exercise'}
        </button>
      )}
    </div>
  );
}
