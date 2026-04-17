import React from 'react';
import { Sparkles, Flame, Target } from 'lucide-react';

/**
 * NutritionHeroCard — dominant above-fold card.
 * Shows calories remaining, protein remaining, and 1 AI directive.
 */
export default function NutritionHeroCard({ dailyTotals, profile, mealCount, aiDirective }) {
  const kcalTarget = profile.calories_target || 0;
  const proteinTarget = profile.protein_target || 0;
  const kcalRemaining = Math.max(0, kcalTarget - dailyTotals.calories);
  const proteinRemaining = Math.max(0, proteinTarget - dailyTotals.protein);
  const kcalPct = kcalTarget > 0 ? Math.min((dailyTotals.calories / kcalTarget) * 100, 100) : 0;
  const proteinPct = proteinTarget > 0 ? Math.min((dailyTotals.protein / proteinTarget) * 100, 100) : 0;

  // AI directive — engine-driven when available, rules-based fallback
  let directive = aiDirective || null;
  if (!directive) {
  if (kcalTarget === 0) {
    directive = 'Set your calorie target in Plan to start tracking.';
  } else if (mealCount === 0) {
    directive = 'Log your first meal to start the day.';
  } else if (proteinPct < 40 && kcalPct > 50) {
    directive = `Protein is low. Prioritize ${Math.round(proteinRemaining)}g in your next meal.`;
  } else if (kcalPct >= 95 && proteinPct >= 80) {
    directive = 'You hit your targets today.';
  } else if (kcalRemaining < 400 && kcalRemaining > 0) {
    directive = `Almost there — ${Math.round(kcalRemaining)} kcal left.`;
  } else if (kcalRemaining >= 400) {
    directive = `${Math.round(kcalRemaining)} kcal remaining. Plan your next meal.`;
  }
  } // end rules-based fallback

  return (
    <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] overflow-hidden">
      {/* 2px accent stripe */}
      <div className="h-[2px] bg-gradient-to-r from-[hsl(var(--brand))] via-[hsl(var(--brand-ai))] to-transparent" />

      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
              Goal, actual, remaining
            </p>
            <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">
              This card mirrors the daily comparison logic used on Nutrition.
            </p>
          </div>
          <span className="rounded-full bg-[hsl(var(--fill)/0.6)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
            {mealCount} meals
          </span>
        </div>
        {/* Two big numbers */}
        <div className="grid grid-cols-2 gap-4">
          {/* Calories */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Flame className="w-3.5 h-3.5 text-[hsl(var(--fg-3))]" strokeWidth={2} />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
                Calories left
              </span>
            </div>
            <p className="text-[28px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] leading-none">
              {kcalTarget > 0 ? Math.round(kcalRemaining) : '—'}
            </p>
            <p className="text-[11px] text-[hsl(var(--fg-3))] mt-1">
              {kcalTarget > 0 ? `of ${kcalTarget} kcal` : 'no target set'}
            </p>
            {kcalTarget > 0 && (
              <div className="mt-2 h-1.5 rounded-full bg-[hsl(var(--fill)/0.8)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${kcalPct}%`,
                    backgroundColor: kcalPct >= 95 ? 'hsl(var(--ok))' : kcalPct >= 70 ? 'hsl(var(--brand))' : 'hsl(var(--warn))',
                  }}
                />
              </div>
            )}
          </div>

          {/* Protein */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-[hsl(var(--fg-3))]" strokeWidth={2} />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
                Protein left
              </span>
            </div>
            <p className="text-[28px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] leading-none">
              {proteinTarget > 0 ? `${Math.round(proteinRemaining)}g` : '—'}
            </p>
            <p className="text-[11px] text-[hsl(var(--fg-3))] mt-1">
              {proteinTarget > 0 ? `of ${proteinTarget}g` : 'no target set'}
            </p>
            {proteinTarget > 0 && (
              <div className="mt-2 h-1.5 rounded-full bg-[hsl(var(--fill)/0.8)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${proteinPct}%`,
                    backgroundColor: proteinPct >= 80 ? 'hsl(var(--ok))' : proteinPct >= 50 ? 'hsl(var(--brand))' : 'hsl(var(--warn))',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* AI directive */}
        {directive && (
          <div className="flex items-start gap-2 rounded-[12px] bg-[hsl(var(--brand-ai)/0.08)] border border-[hsl(var(--brand-ai)/0.15)] px-3 py-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-ai))] shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12px] font-medium text-[hsl(var(--fg))] leading-[1.5]">{directive}</p>
          </div>
        )}
      </div>
    </div>
  );
}
