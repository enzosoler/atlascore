/**
 * CoachChatTrigger — reactive chat launcher.
 *
 * This is intentionally separate from the proactive insight card.
 * Use it for follow-up, clarifications, or asking for an adjustment.
 */

import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

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
    <section className="space-y-3">
      {/* Composer-style chat input bar */}
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'group flex w-full items-center gap-3 rounded-[16px] border border-[hsl(var(--border)/0.6)]',
          'bg-[hsl(var(--card))] px-4 py-3.5 text-left shadow-[var(--shadow-xs)]',
          'transition-all active:scale-[0.985] active:bg-[hsl(var(--fill)/0.4)]'
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))]">
          <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
        </div>

        <p className="flex-1 text-[14px] text-[hsl(var(--fg-3))]">
          {t('coach.chat.triggerBar')}
        </p>

        <Sparkles className="h-4 w-4 shrink-0 text-[hsl(var(--brand-ai)/0.45)]" />
      </button>

      {/* Suggestion chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {Array.isArray(suggestions) && suggestions.map((suggestion, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSuggestion?.(suggestion)}
            className="shrink-0 rounded-full border border-[hsl(var(--border)/0.45)] bg-[hsl(var(--fill)/0.36)] px-3.5 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] whitespace-nowrap transition-all active:scale-95 active:bg-[hsl(var(--fill)/0.72)]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
