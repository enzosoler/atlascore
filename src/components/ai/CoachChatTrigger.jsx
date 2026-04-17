/**
 * CoachChatTrigger — reactive chat launcher.
 *
 * This is intentionally separate from the proactive insight card.
 * Use it for follow-up, clarifications, or asking for an adjustment.
 */

import React from 'react';
import { MessageCircle, MessagesSquare, Sparkles } from 'lucide-react';
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
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'group relative flex w-full items-start gap-3 overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.62)]',
          'bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.3)_100%)] px-4 py-4 text-left shadow-[var(--shadow-xs)]',
          'transition-all active:scale-[0.985] active:bg-[hsl(var(--fill)/0.5)]'
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))]">
          <MessageCircle className="h-4.5 w-4.5" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {t('coach.chat.triggerBar')}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--fill)/0.4)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
              Reactive
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
            Use chat for follow-up, swaps, explanations, or a quick adjustment.
          </p>

          <div className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[hsl(var(--brand-ai))]">
            <MessagesSquare className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span>Open conversation</span>
          </div>
        </div>

        <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--brand-ai)/0.4)]" />
      </button>

      <div className="space-y-2">
        <p className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
          Try asking
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {Array.isArray(suggestions) && suggestions.map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSuggestion?.(suggestion)}
              className="shrink-0 rounded-full border border-[hsl(var(--border)/0.45)] bg-[hsl(var(--fill)/0.36)] px-4 py-2 text-[12px] font-medium text-[hsl(var(--fg-2))] whitespace-nowrap transition-all active:scale-95 active:bg-[hsl(var(--fill)/0.72)]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
