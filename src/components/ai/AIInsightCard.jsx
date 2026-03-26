/**
 * AIInsightCard — Renders a single AI insight with tier-based display.
 *
 * Free users: See the title + icon, but body + action are blurred with upgrade CTA.
 * Pro users:  See everything except clinical insights.
 * Performance: Full access including lab/protocol insights.
 *
 * All copy is driven by the i18n system via the `t` function.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  Dumbbell,
  Utensils,
  Moon,
  FlaskConical,
  Pill,
  AlertTriangle,
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  Zap,
  Lock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';

// ── Icon Map ─────────────────────────────────────────────────────────────────

const ICON_MAP = {
  brain: Brain,
  dumbbell: Dumbbell,
  utensils: Utensils,
  moon: Moon,
  flask: FlaskConical,
  pill: Pill,
  'alert-triangle': AlertTriangle,
  target: Target,
  trophy: Trophy,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  zap: Zap,
};

// ── Severity Styles (aligned with atlas design tokens) ──────────────────────

const SEVERITY_STYLES = {
  positive: {
    border: 'border-[hsl(var(--ok)/0.18)]',
    bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--ok)/0.06),transparent_50%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
    iconBg: 'bg-[hsl(var(--ok)/0.1)]',
    iconColor: 'text-[hsl(var(--ok))]',
    badge: 'border border-[hsl(var(--ok)/0.16)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]',
  },
  neutral: {
    border: 'border-[hsl(var(--border)/0.92)]',
    bg: 'bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
    iconBg: 'bg-[hsl(var(--fill)/0.7)]',
    iconColor: 'text-[hsl(var(--fg-2))]',
    badge: 'border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]',
  },
  attention: {
    border: 'border-[hsl(var(--warn)/0.18)]',
    bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--warn)/0.06),transparent_50%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
    iconBg: 'bg-[hsl(var(--warn)/0.1)]',
    iconColor: 'text-[hsl(var(--warn))]',
    badge: 'border border-[hsl(var(--warn)/0.16)] bg-[hsl(var(--warn)/0.1)] text-[hsl(var(--warn))]',
  },
  warning: {
    border: 'border-[hsl(var(--err)/0.18)]',
    bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--err)/0.06),transparent_50%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
    iconBg: 'bg-[hsl(var(--err)/0.1)]',
    iconColor: 'text-[hsl(var(--err))]',
    badge: 'border border-[hsl(var(--err)/0.16)] bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]',
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function AIInsightCard({ insight, locked = false, tierLabel = 'Pro' }) {
  const { t } = useI18n();

  const {
    category = 'headline',
    icon = 'brain',
    title = '',
    body = '',
    action = '',
    severity = 'neutral',
  } = insight || {};

  const Icon = ICON_MAP[icon] || Brain;
  const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.neutral;
  const categoryLabel = t(`ai_insights.categories.${category}`) || category;

  return (
    <article
      className={cn(
        'relative rounded-[20px] border px-5 py-5 shadow-[var(--shadow-xs)] transition-all',
        styles.border,
        styles.bg,
      )}
    >
      {/* Header: Icon + Category + Title */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px]',
            styles.iconBg,
          )}
        >
          <Icon className={cn('h-4.5 w-4.5', styles.iconColor)} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]',
                styles.badge,
              )}
            >
              {categoryLabel}
            </span>
          </div>

          <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))] leading-snug">
            {title}
          </p>
        </div>
      </div>

      {/* Body + Action — blurred for locked users */}
      <div className="mt-3 ml-14 space-y-2.5">
        {locked ? (
          /* ── Blurred Teaser ── */
          <div className="relative min-h-[72px]">
            {/* Blurred content preview */}
            <div className="select-none pointer-events-none" aria-hidden="true">
              <p className="text-[13px] text-[hsl(var(--fg-2))] leading-6 blur-[6px]">
                {body || t('ai_insights.blur_placeholder')}
              </p>
              <div className="mt-2 blur-[6px]">
                <p className="text-[12px] font-medium text-[hsl(var(--brand-ai))]">
                  {action || t('ai_insights.blur_action_placeholder')}
                </p>
              </div>
            </div>

            {/* Upgrade overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Lock className="h-3.5 w-3.5 text-[hsl(var(--fg-3))]" strokeWidth={2} />
                <span className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                  {t('ai_insights.locked_label')}
                </span>
              </div>
              <Link
                to={ROUTES.pricing}
                className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--brand))] px-4 py-2 text-[11px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:bg-[hsl(var(--brand)/0.88)] hover:shadow-[var(--shadow-md)]"
              >
                <Sparkles className="h-3 w-3" />
                {t('ai_insights.unlock_cta').replace('{tier}', tierLabel)}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ) : (
          /* ── Full Content ── */
          <>
            <p className="text-[13px] text-[hsl(var(--fg-2))] leading-6">
              {body}
            </p>
            {action && (
              <div className="flex items-start gap-2.5 rounded-[14px] border border-[hsl(var(--brand-ai)/0.12)] bg-[hsl(var(--brand-ai)/0.04)] px-3.5 py-2.5">
                <Target className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
                <p className="text-[12px] font-medium text-[hsl(var(--brand-ai))] leading-snug">
                  {action}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

// ── Teaser Banner (shown below AI insights for free users) ───────────────────

export function AIInsightsUpgradeBanner({ insightCount = 5 }) {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[hsl(var(--brand)/0.18)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.08),transparent_50%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] px-5 py-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--brand)/0.08)]">
          <Sparkles className="h-5 w-5 text-[hsl(var(--brand))]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {t('ai_insights.upgrade_title')}
          </p>
          <p className="mt-1.5 text-[13px] text-[hsl(var(--fg-2))] leading-6">
            {t('ai_insights.upgrade_body').replace('{count}', String(insightCount))}
          </p>
          <Link
            to={ROUTES.pricing}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--brand))] px-5 py-2 text-[12px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:bg-[hsl(var(--brand)/0.88)] hover:shadow-[var(--shadow-md)]"
          >
            <Zap className="h-3.5 w-3.5" />
            {t('ai_insights.see_plans')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Loader ──────────────────────────────────────────────────────────

export function AIInsightCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-[hsl(var(--border)/0.5)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] px-5 py-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-[18px] bg-[hsl(var(--fill))]" />
        <div className="flex-1 space-y-2.5">
          <div className="h-3 w-16 rounded-full bg-[hsl(var(--fill))]" />
          <div className="h-4 w-3/4 rounded bg-[hsl(var(--fill))]" />
        </div>
      </div>
      <div className="mt-3 ml-14 space-y-2">
        <div className="h-3 w-full rounded bg-[hsl(var(--fill))]" />
        <div className="h-3 w-5/6 rounded bg-[hsl(var(--fill))]" />
        <div className="h-10 w-2/3 rounded-[14px] bg-[hsl(var(--fill))]" />
      </div>
    </div>
  );
}
