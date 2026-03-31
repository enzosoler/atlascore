/**
 * CoachChatTrigger — Redesigned for a high-end feel.
 */

import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
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
  const suggestions = (allSuggestions[pageContext] ?? allSuggestions.today) || [];

  return (
    <div className="space-y-4">
      {/* Bar */}
      <button
        onClick={onOpen}
        className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.6)] px-4 py-3.5 text-left shadow-sm transition-all active:scale-[0.98] active:bg-[hsl(var(--fill)/0.5)]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand-ai)/0.08)] text-[hsl(var(--brand-ai))] group-active:scale-90 transition-transform">
          <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <span className="flex-1 text-[14px] font-medium text-[hsl(var(--fg-2))]">{t('coach.chat.triggerBar')}</span>
        <Sparkles className="h-4 w-4 text-[hsl(var(--brand-ai)/0.4)]" />
      </button>

      {/* Suggestion pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {Array.isArray(suggestions) && suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion?.(s)}
            className="shrink-0 rounded-full bg-[hsl(var(--fill)/0.4)] border border-[hsl(var(--border)/0.3)] px-4 py-2 text-[12px] font-semibold text-[hsl(var(--fg-2))] whitespace-nowrap active:bg-[hsl(var(--fill)/0.8)] active:scale-95 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
