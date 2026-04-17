import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, MessageSquareMore, Sparkles, X } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

/**
 * AICoachBriefing — proactive coach insight card.
 * This is the "why now" surface, not the chat launcher.
 */
export function AICoachBriefing({
  briefing,
  focus,
  reason,
  context,
  freshness,
  primaryAction,
  secondaryAction,
  onOpenChat,
  onDismiss,
  loading = false,
}) {
  const { t } = useI18n();
  const detailChips = [reason, context, freshness].filter(Boolean);

  return (
    <section className="overflow-hidden rounded-[24px] border border-[hsl(var(--brand-ai)/0.22)] bg-[radial-gradient(circle_at_top_left,hsl(var(--brand-ai)/0.16),transparent_42%),linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.26)_100%)] shadow-[0_2px_24px_hsl(var(--brand-ai)/0.06)]">
      <div className="h-[2px] bg-gradient-to-r from-[hsl(var(--brand-ai))] via-[hsl(var(--brand))] to-transparent" />

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[hsl(var(--brand-ai)/0.12)] text-[hsl(var(--brand-ai))]">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ai))]">
                {t('today.aiCoach')}
              </p>
              <p className="text-[12px] text-[hsl(var(--fg-3))]">
                Proactive insight
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {freshness ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.45)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
                <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                {freshness}
              </span>
            ) : null}
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--fg-3))] transition-colors hover:bg-[hsl(var(--fill)/0.55)] hover:text-[hsl(var(--fg-2))]"
                aria-label="Dismiss coach insight"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            ) : null}
          </div>
        </div>

        {focus ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[hsl(var(--brand-ai)/0.14)] bg-[hsl(var(--brand-ai)/0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ai))]">
              {focus}
            </span>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-2.5">
            <div className="h-5 w-4/5 rounded-full bg-[hsl(var(--fill))] animate-pulse" />
            <div className="h-5 w-full rounded-full bg-[hsl(var(--fill))] animate-pulse" />
            <div className="h-5 w-3/5 rounded-full bg-[hsl(var(--fill))] animate-pulse" />
          </div>
        ) : (
          <p className="text-[17px] font-semibold leading-[1.45] tracking-[-0.02em] text-[hsl(var(--fg))]">
            {briefing}
          </p>
        )}

        {detailChips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {detailChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--fill)/0.45)] px-3 py-1 text-[11px] font-medium text-[hsl(var(--fg-2))]"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}

        {!loading && (primaryAction?.path || onOpenChat || secondaryAction?.path) ? (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {primaryAction?.path ? (
              <Link
                to={primaryAction.path}
                className="inline-flex items-center gap-2 rounded-[14px] bg-[hsl(var(--brand-ai))] px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-70"
              >
                <span>{primaryAction.label}</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
            ) : null}

            {onOpenChat ? (
              <button
                type="button"
                onClick={onOpenChat}
                className={cn(
                  'inline-flex items-center gap-2 rounded-[14px] border border-[hsl(var(--border)/0.75)] px-4 py-2.5 text-[13px] font-semibold text-[hsl(var(--fg-2))] transition-colors',
                  'bg-[hsl(var(--card)/0.7)] hover:bg-[hsl(var(--fill)/0.55)] active:bg-[hsl(var(--fill)/0.75)]'
                )}
              >
                <MessageSquareMore className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span>Ask coach</span>
              </button>
            ) : secondaryAction?.path ? (
              <Link
                to={secondaryAction.path}
                className="text-[13px] font-semibold text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default AICoachBriefing;
