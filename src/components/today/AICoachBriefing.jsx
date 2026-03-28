import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

/**
 * AICoachBriefing — the dominant above-the-fold card.
 * Occupies ~35–45% of first viewport. Premium AI gradient styling.
 * Shows: briefing text, focus label, up to 2 actions.
 */
export function AICoachBriefing({
  briefing,
  focus,
  primaryAction,   // { label, path }
  secondaryAction, // { label, path } | null
  loading,
}) {
  return (
    <div className="rounded-[22px] overflow-hidden border border-[hsl(var(--brand)/0.24)] bg-[radial-gradient(ellipse_at_top_left,hsl(var(--brand)/0.13),transparent_52%),linear-gradient(160deg,hsl(217_100%_12%/0.0)_0%,hsl(var(--card))_100%)] shadow-[0_2px_24px_hsl(var(--brand)/0.08)]">
      {/* Top stripe — accent line */}
      <div className="h-[2px] bg-gradient-to-r from-[hsl(var(--brand))] via-[hsl(var(--accent-secondary))] to-transparent" />

      <div className="p-5">
        {/* Label row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[10px] bg-[hsl(var(--brand)/0.16)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--brand))]">
              Atlas Coach
            </span>
          </div>
          {focus && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-[9px] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand)/0.85)] border border-[hsl(var(--brand)/0.15)]">
              {focus}
            </span>
          )}
        </div>

        {/* Briefing text */}
        {loading ? (
          <div className="space-y-2.5 my-1">
            <div className="h-5 w-4/5 rounded-lg bg-[hsl(var(--fill))] animate-pulse" />
            <div className="h-5 w-full rounded-lg bg-[hsl(var(--fill))] animate-pulse" />
            <div className="h-5 w-3/5 rounded-lg bg-[hsl(var(--fill))] animate-pulse" />
          </div>
        ) : (
          <p className="text-[17px] font-semibold leading-[1.45] tracking-[-0.015em] text-[hsl(var(--fg))]">
            {briefing}
          </p>
        )}

        {/* Actions */}
        {!loading && (primaryAction || secondaryAction) && (
          <div className="mt-5 flex items-center gap-3">
            {primaryAction?.path && (
              <Link
                to={primaryAction.path}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[13px] bg-[hsl(var(--brand))] text-white text-[13px] font-semibold tracking-[-0.01em] transition-opacity hover:opacity-85 active:opacity-70"
              >
                {primaryAction.label}
                <ArrowRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
              </Link>
            )}
            {secondaryAction?.path && (
              <Link
                to={secondaryAction.path}
                className="flex items-center gap-1 text-[13px] font-semibold text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
              >
                {secondaryAction.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
