/**
 * Meal suggestion — suggest next meal based on current intake
 * Shows in /Nutrition page
 */
import React, { useState } from 'react';
import { invokeLLM } from '@/lib/llm';
import { Sparkles, Loader2 } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';

export default function AIMealSuggestion({ loggedMeals, profile, remaining }) {
  const { can } = useSubscription();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestion = async () => {
    if (!can('atlas_ai')) return;

    try {
      setLoading(true);
      const meals = loggedMeals?.map(m => m.meal_type).join(', ') || 'none';

      const text = await invokeLLM(`Suggest ONE practical next meal based on:

- Meals already logged: ${meals}
- Remaining calories: ${remaining?.cal ?? 0} kcal
- Remaining protein target: ${remaining?.pro ?? 0}g
- Goal: ${profile?.training_goal || 'general health'}

      Reply with: "Next meal: [name] - [simple ingredients, ~cal kcal]".`);

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
          <span className="text-[12px] font-semibold text-[hsl(var(--brand-ai))]">Next meal</span>
        </div>
        <span className="text-[10px] font-medium text-[hsl(var(--fg-3))]">
          Based on logged meals and remaining targets
        </span>
      </div>
      {suggestion ? (
        <div className="mt-2 space-y-2">
          <p className="text-[12px] text-foreground leading-relaxed">{suggestion}</p>
          <p className="text-[11px] text-[hsl(var(--fg-3))]">
            Estimated from the meals already logged. Review portions before adding.
          </p>
        </div>
      ) : (
        <button
          onClick={generateSuggestion}
          disabled={loading}
          className="mt-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))] text-[11px] font-medium hover:bg-[hsl(var(--brand-ai)/0.2)] transition-colors flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {loading ? 'Reading...' : 'Suggest meal'}
        </button>
      )}
    </div>
  );
}
