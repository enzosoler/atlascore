import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * AINutritionSuggestions — 1-2 contextual suggestion cards.
 * Rules-based, not LLM. High-signal only.
 */
export default function AINutritionSuggestions({ dailyTotals, profile, mealCount }) {
  const suggestions = [];
  const kcalTarget = profile.calories_target || 0;
  const proteinTarget = profile.protein_target || 0;

  if (kcalTarget === 0) return null;

  const kcalPct = dailyTotals.calories / kcalTarget;
  const proteinPct = proteinTarget > 0 ? dailyTotals.protein / proteinTarget : 1;
  const hour = new Date().getHours();

  // Protein low + past lunch
  if (proteinPct < 0.5 && hour >= 14 && mealCount > 0) {
    const remaining = Math.round(proteinTarget - dailyTotals.protein);
    suggestions.push({
      id: 'protein-low',
      text: `You need ${remaining}g more protein today. Add chicken, eggs, or a shake.`,
      cta: 'Log protein meal',
      path: null,
    });
  }

  // Calories way under at dinner time
  if (kcalPct < 0.4 && hour >= 18 && mealCount > 0) {
    const remaining = Math.round(kcalTarget - dailyTotals.calories);
    suggestions.push({
      id: 'kcal-under',
      text: `${remaining} kcal remaining and it's evening. Plan a substantial dinner.`,
      cta: null,
      path: null,
    });
  }

  // Overshoot warning
  if (kcalPct > 1.1) {
    const over = Math.round(dailyTotals.calories - kcalTarget);
    suggestions.push({
      id: 'kcal-over',
      text: `You're ${over} kcal over target. Consider lighter meals for the rest of the day.`,
      cta: null,
      path: null,
    });
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-0.5">
        <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
          AI Insight
        </p>
      </div>
      {suggestions.slice(0, 2).map((s) => (
        <div
          key={s.id}
          className="rounded-[14px] border border-[hsl(var(--brand-ai)/0.15)] bg-[hsl(var(--brand-ai)/0.06)] px-3.5 py-3"
        >
          <p className="text-[12px] font-medium text-[hsl(var(--fg))] leading-[1.5]">{s.text}</p>
          {s.cta && s.path && (
            <Link
              to={s.path}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--brand-ai))]"
            >
              {s.cta}
              <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
