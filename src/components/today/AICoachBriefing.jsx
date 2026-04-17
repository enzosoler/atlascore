import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Info, MessageSquareMore, Sparkles, X } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

/**
 * AICoachBriefing — proactive coach insight card.
 *
 * Oura/Whoop-inspired: useful insight, context, freshness, one CTA.
 * Shows "why this is showing" context line and freshness timestamp.
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

  return (
    <section className="overflow-hidden rounded-[24px] border border-[hsl(var(--brand-ai)/0.22)] bg-[radial-gradient(circle_at_top_left,hsl(var(--brand-ai)/0.16),transparent_42%),linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.26)_100%)] shadow-[0_2px_24px_hsl(var(--brand-ai)/0.06)]">
      <div className="h-[2px] bg-gradient-to-r from-[hsl(var(--brand-ai))] via-[hsl(var(--brand))] to-transparent" />

      <div className="space-y-4 p-5 sm:p-6">
        {/* Header row: icon + title + freshness + dismiss */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[hsl(var(--brand-ai)/0.12)] text-[hsl(var(--brand-ai))]">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ai))]">
                {t('today.aiCoach')}
              </p>
              {freshness ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--fg-3))]">
                  <Clock3 className="h-3 w-3" strokeWidth={2} />
                  {freshness}
                </span>
              ) : (
                <p className="text-[12px] text-[hsl(var(--fg-3))]">
                  Proactive insight
                </p>
              )}
            </div>
          </div>

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

        {/* Focus tag */}
        {focus ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[hsl(var(--brand-ai)/0.14)] bg-[hsl(var(--brand-ai)/0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ai))]">
              {focus}
            </span>
          </div>
        ) : null}

        {/* Insight body */}
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

        {/* "Why this is showing" context line */}
        {reason ? (
          <div className="flex items-start gap-2 rounded-[12px] bg-[hsl(var(--fill)/0.35)] border border-[hsl(var(--border)/0.4)] px-3 py-2.5">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2} />
            <p className="text-[12px] leading-[1.5] text-[hsl(var(--fg-3))]">
              {reason}
              {context ? ` \u00b7 ${context}` : ''}
            </p>
          </div>
        ) : null}

        {/* Clear CTA buttons */}
        {!loading && (primaryAction?.path || onOpenChat || secondaryAction?.path) ? (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {primaryAction?.path ? (
              <Link
                to={primaryAction.path}
                className="inline-flex items-center gap-2 rounded-[14px] bg-[hsl(var(--brand-ai))] px-5 py-3 text-[13px] font-bold text-white shadow-[0_4px_12px_hsl(var(--brand-ai)/0.2)] transition-all hover:opacity-90 active:opacity-70 active:scale-[0.98]"
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
                  'inline-flex items-center gap-2 rounded-[14px] border border-[hsl(var(--border)/0.75)] px-5 py-3 text-[13px] font-semibold text-[hsl(var(--fg-2))] transition-colors',
                  'bg-[hsl(var(--card)/0.7)] hover:bg-[hsl(var(--fill)/0.55)] active:bg-[hsl(var(--fill)/0.75)]'
                )}
              >
                <MessageSquareMore className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span>Ask the coach</span>
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
