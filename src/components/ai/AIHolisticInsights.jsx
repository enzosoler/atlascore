/**
 * AIHolisticInsights — Full AI Insights section for the Insights page.
 *
 * Visual hierarchy (redesigned):
 *   1. Section header with AI badge (matches atlas SectionCard pattern)
 *   2. For Free: single teaser card (blurred) + prominent upgrade banner
 *   3. For Pro: full insight cards in a responsive grid
 *   4. For Performance: full grid including clinical cards
 *
 * All copy is driven by the i18n system.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useI18n } from '@/lib/i18nContext';
import {
  generateInsights,
  resolveAITier,
  canRefreshInsights,
} from '@/services/aiInsightsService';
import AIInsightCard, {
  AIInsightsUpgradeBanner,
  AIInsightCardSkeleton,
} from '@/components/ai/AIInsightCard';
import { SectionCard } from '@/components/shared/StablePage';
import { Brain, Loader2, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

export default function AIHolisticInsights({
  profile = {},
  measurements = [],
  workouts = [],
  workoutPlan = null,
  meals = [],
  dietPlan = null,
  checkins = [],
  labExams = [],
  protocols = [],
  protocolLogs = [],
}) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { t, locale } = useI18n();

  const [insights, setInsights] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cached, setCached] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const planCode = subscription?.plan_code || 'free';
  const tier = resolveAITier(planCode);
  const isFree = tier === 'free';
  const isPro = tier === 'pro';
  const isPerformance = tier === 'performance';

  const canRefresh = canRefreshInsights(user?.id, tier);

  const handleGenerate = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const result = await generateInsights({
          userId: user.id,
          tier,
          locale,
          profile,
          measurements,
          workouts,
          workoutPlan,
          meals,
          dietPlan,
          checkins,
          labExams,
          protocols,
          protocolLogs,
          forceRefresh,
        });

        if (result.meta?.rate_limited) {
          setError(
            t('ai_insights.rate_limited').replace('{hours}', String(result.meta.remaining_hours))
          );
          return;
        }

        if (result.meta?.error) {
          setError(t('ai_insights.error_generic'));
          return;
        }

        setInsights(result.insights);
        setMeta(result.meta);
        setCached(result.cached);
        setHasGenerated(true);
      } catch (err) {
        console.error('[AIHolisticInsights] Error:', err);
        setError(t('ai_insights.error_generic'));
      } finally {
        setLoading(false);
      }
    },
    [user?.id, tier, locale, profile, measurements, workouts, workoutPlan, meals, dietPlan, checkins, labExams, protocols, protocolLogs, t]
  );

  // Auto-generate on mount if user has data
  useEffect(() => {
    const hasData = measurements.length > 0 || workouts.length > 0 || checkins.length > 0;
    if (hasData && user?.id && !hasGenerated && !loading) {
      handleGenerate();
    }
  }, [user?.id, measurements.length, workouts.length, checkins.length]);

  // ── No data state ──
  const hasData = measurements.length > 0 || workouts.length > 0 || meals.length > 0 || checkins.length > 0;
  if (!hasData) return null;

  // ── Determine which insights to show and which to lock ──
  const visibleInsights = insights.map((insight) => {
    if (isFree) {
      return { insight, locked: true, tierLabel: 'Pro' };
    }
    if (isPro && ['lab_exams', 'protocols'].includes(insight.category)) {
      return { insight, locked: true, tierLabel: 'Performance' };
    }
    return { insight, locked: false, tierLabel: '' };
  });

  // Tier-specific subtitle
  const subtitle = isPerformance
    ? t('ai_insights.subtitle_performance')
    : isPro
      ? t('ai_insights.subtitle_pro')
      : t('ai_insights.subtitle_free');

  return (
    <SectionCard
      title={t('ai_insights.section_title')}
      subtitle={subtitle}
      className="border-[hsl(var(--brand-ai)/0.12)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand-ai)/0.04),transparent_60%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]"
      actions={
        hasGenerated && !isFree ? (
          <button
            onClick={() => handleGenerate(true)}
            disabled={loading || !canRefresh}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all',
              canRefresh
                ? 'border border-[hsl(var(--brand-ai)/0.16)] bg-[hsl(var(--brand-ai)/0.08)] text-[hsl(var(--brand-ai))] hover:bg-[hsl(var(--brand-ai)/0.14)]'
                : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))] cursor-not-allowed'
            )}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {loading ? t('ai_insights.analyzing') : t('ai_insights.refresh')}
          </button>
        ) : null
      }
    >
      {/* ── Header badge ── */}
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--brand-ai)/0.16)] bg-[hsl(var(--brand-ai)/0.08)] text-[hsl(var(--brand-ai))]">
          <Brain className="h-4 w-4" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ai))]">
            {t('ai_insights.badge_label')}
          </p>
          {cached && (
            <p className="text-[10px] text-[hsl(var(--fg-3))]">
              {t('ai_insights.cached')}
            </p>
          )}
        </div>
      </div>

      {/* ── Loading state ── */}
      {loading && !hasGenerated ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--brand-ai))]" />
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              {t('ai_insights.loading')}
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <AIInsightCardSkeleton />
            <AIInsightCardSkeleton />
          </div>
        </div>
      ) : null}

      {/* ── Error state ── */}
      {error && !loading ? (
        <div className="rounded-[14px] border border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.04)] px-4 py-3">
          <p className="text-[12px] text-[hsl(var(--warn))]">{error}</p>
        </div>
      ) : null}

      {/* ── Generate button (first time, if auto-generate didn't fire) ── */}
      {!hasGenerated && !loading && !error ? (
        <div className="flex flex-col items-center py-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-[hsl(var(--brand-ai)/0.12)] bg-[hsl(var(--brand-ai)/0.06)] mb-4">
            <Sparkles className="h-6 w-6 text-[hsl(var(--brand-ai)/0.5)]" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] text-[hsl(var(--fg-2))] mb-4 text-center max-w-sm leading-6">
            {isFree ? t('ai_insights.cta_free') : t('ai_insights.cta_paid')}
          </p>
          <button
            onClick={() => handleGenerate()}
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-ai))] px-6 py-2.5 text-[13px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:bg-[hsl(var(--brand-ai)/0.88)] hover:shadow-[var(--shadow-md)]"
          >
            <Brain className="h-4 w-4" />
            {t('ai_insights.generate_button')}
          </button>
        </div>
      ) : null}

      {/* ── Insight cards (responsive grid for Pro+, single column for Free) ── */}
      {hasGenerated && !loading && visibleInsights.length > 0 ? (
        <div className={cn(
          'grid gap-3',
          isFree ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2',
        )}>
          {visibleInsights.map(({ insight, locked, tierLabel }, index) => (
            <AIInsightCard
              key={insight.id || index}
              insight={insight}
              locked={locked}
              tierLabel={tierLabel}
            />
          ))}
        </div>
      ) : null}

      {/* ── Upgrade banner for free users ── */}
      {isFree && hasGenerated ? (
        <div className="mt-4">
          <AIInsightsUpgradeBanner insightCount={5} />
        </div>
      ) : null}

      {/* ── Clinical upgrade hint for Pro users ── */}
      {isPro && hasGenerated && visibleInsights.some((v) => v.locked) ? (
        <div className="mt-4 rounded-[16px] border border-[hsl(var(--brand)/0.14)] bg-[hsl(var(--brand)/0.03)] px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
              {t('ai_insights.clinical_title')}
            </p>
            <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">
              {t('ai_insights.clinical_body')}
            </p>
          </div>
          <Link
            to={ROUTES.pricing}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] px-4 py-2 text-[11px] font-semibold text-[hsl(var(--fg))] shadow-[var(--shadow-xs)] transition-all hover:shadow-[var(--shadow-sm)]"
          >
            {t('ai_insights.see_plans')}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}
    </SectionCard>
  );
}
