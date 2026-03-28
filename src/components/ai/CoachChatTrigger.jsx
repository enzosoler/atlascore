/**
 * CoachChatTrigger — inline entry point for the AI coach chat.
 *
 * Shows a "Ask your coach..." bar + suggestion pills.
 * Tapping the bar or any pill opens CoachChatSheet.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

const PAGE_SUGGESTIONS = {
  today: [
    'What should I focus on today?',
    'Summarize my day',
    'Log a meal',
  ],
  training: [
    'Swap an exercise',
    "Explain today's workout",
    'Make it shorter',
  ],
  nutrition: [
    'Log a meal',
    'Suggest a high-protein meal',
    'Adjust my calories',
  ],
  progress: [
    'Why has my weight stalled?',
    'Summarize my trends',
    'Am I in a deficit?',
  ],
};

export default function CoachChatTrigger({ pageContext = 'today', onOpen, onSuggestion }) {
  const suggestions = PAGE_SUGGESTIONS[pageContext] ?? PAGE_SUGGESTIONS.today;

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
        <span className="flex-1 text-[14px] text-[hsl(var(--fg-3))]">Ask your coach...</span>
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
