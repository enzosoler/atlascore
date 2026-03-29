/**
 * CoachChatTrigger — inline entry point for the AI coach chat.
 *
 * Shows a "Ask your coach..." bar + suggestion pills.
 * Tapping the bar or any pill opens CoachChatSheet.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18nContext';

function getPageSuggestions(t) {
  return {
    today: [
      t('coach.chat.suggestions.today.focus'),
      t('coach.chat.suggestions.today.summarize'),
      t('coach.chat.suggestions.today.logMeal'),
    ],
    training: [
      t('coach.chat.suggestions.training.swap'),
      t('coach.chat.suggestions.training.explain'),
      t('coach.chat.suggestions.training.shorter'),
    ],
    nutrition: [
      t('coach.chat.suggestions.nutrition.logMeal'),
      t('coach.chat.suggestions.nutrition.highProtein'),
      t('coach.chat.suggestions.nutrition.calories'),
    ],
    progress: [
      t('coach.chat.suggestions.progress.stalled'),
      t('coach.chat.suggestions.progress.trends'),
      t('coach.chat.suggestions.progress.deficit'),
    ],
  };
}

export default function CoachChatTrigger({ pageContext = 'today', onOpen, onSuggestion }) {
  const t = useT();
  const allSuggestions = getPageSuggestions(t);
  const suggestions = allSuggestions[pageContext] ?? allSuggestions.today;

  return (
    <div className="space-y-2">
      {/* Bar */}
      <button
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-[16px] border border-[hsl(var(--brand-ai)/0.25)] bg-[hsl(var(--brand-ai)/0.05)] px-4 py-3 text-left transition-colors active:bg-[hsl(var(--brand-ai)/0.1)]"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-ai)/0.15)] border border-[hsl(var(--brand-ai)/0.2)]">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
        </div>
        <span className="flex-1 text-[14px] text-[hsl(var(--fg-3))]">{t('coach.chat.triggerBar')}</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--brand-ai))]">
          AI
        </span>
      </button>

      {/* Suggestion pills */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion?.(s)}
            className="shrink-0 rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.4)] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] whitespace-nowrap active:bg-[hsl(var(--fill)/0.7)] transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
