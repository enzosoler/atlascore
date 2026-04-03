import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Crown, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/lib/SubscriptionContext';
import { FEATURE_LOCKS, PLAN_LEVELS, PLAN_LABELS } from '@/lib/entitlements';
import { ROUTES } from '@/lib/routes';
import { useT } from '@/lib/i18nContext';

/* Features shown in the plan comparison — excludes role-gated features */
const COMPARISON_FEATURES = [
  'ai_food_text',
  'ai_food_photo',
  'atlas_ai',
  'ai_workout_generation',
  'ai_diet_generation',
  'progress_photos',
  'advanced_analytics',
  'history',
  'standard_exports',
  'lab_exams',
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AccountStatus() {
  const navigate = useNavigate();
  const t = useT();
  const { subscription, can, trialDaysRemaining, isTrialExpired } = useSubscription();

  const tier = subscription?.tier || 'free';
  const status = subscription?.status || 'inactive';
  const tierLabel = PLAN_LABELS[tier] || t('account.planFree');
  const userLevel = PLAN_LEVELS[tier] || 0;

  const isTrialing = status === 'trialing' && !isTrialExpired;
  const isActive = ['active', 'granted'].includes(status);
  const isPaid = userLevel >= 1 && (isActive || isTrialing);
  const isExpired = status === 'expired' || status === 'canceled' || isTrialExpired;

  const expiryDate = subscription?.expires_at || subscription?.trial_ends_at;

  /* Build feature rows with access info */
  const featureRows = useMemo(() => {
    return COMPARISON_FEATURES.map((key) => {
      const lock = FEATURE_LOCKS[key];
      if (!lock) return null;
      const minLevel = PLAN_LEVELS[lock.minPlan] || 0;
      const includedInFree = minLevel === 0;
      const includedInPro = minLevel <= 1;
      const userHas = can(key);
      return { key, label: lock.label, includedInFree, includedInPro, userHas };
    }).filter(Boolean);
  }, [can]);

  /* Status badge color + text */
  const statusBadge = useMemo(() => {
    if (isTrialing) return { text: t('account.statusTrialing', 'Trialing'), color: 'bg-blue-500/20 text-blue-400' };
    if (isActive || isPaid) return { text: t('account.planActive'), color: 'bg-green-500/20 text-green-400' };
    if (isExpired) return { text: t('account.statusExpired', 'Expired'), color: 'bg-red-500/20 text-red-400' };
    return { text: t('account.planFree'), color: 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))]' };
  }, [isTrialing, isActive, isPaid, isExpired, t]);

  /* Hero card gradient vs flat */
  const heroIsPremium = isPaid || isTrialing;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{t('account.planTitle')}</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* ── Hero card ── */}
          <div className={`p-6 rounded-2xl mb-6 ${
            heroIsPremium
              ? 'bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] text-white'
              : 'bg-[hsl(var(--fill))]'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${heroIsPremium ? 'bg-white/20' : 'bg-[hsl(var(--border))]'}`}>
                {heroIsPremium ? <Crown className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm opacity-90">{t('account.currentPlan')}</p>
                <p className="text-2xl font-bold">{tierLabel}</p>
              </div>
              <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${statusBadge.color}`}>
                {statusBadge.text}
              </span>
            </div>

            {/* Trial countdown */}
            {isTrialing && (
              <>
                <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('account.trialEnds', 'Trial ends {date}').replace('{date}', formatDate(expiryDate))}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(100, (trialDaysRemaining / 7) * 100)}%` }}
                  />
                </div>
                <p className="text-xs mt-2 opacity-70">
                  {t('account.daysRemaining', '{n} days remaining').replace('{n}', trialDaysRemaining)}
                </p>
              </>
            )}

            {/* Active subscription — renewal date */}
            {isActive && expiryDate && (
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Clock className="w-4 h-4" />
                <span>{t('account.renewsOn', 'Renews on {date}').replace('{date}', formatDate(expiryDate))}</span>
              </div>
            )}

            {/* Expired notice */}
            {isExpired && (
              <div className="flex items-center gap-2 text-sm mt-2 text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span>{t('account.expiredNotice', 'Your plan expired on {date}').replace('{date}', formatDate(expiryDate))}</span>
              </div>
            )}
          </div>

          {/* ── Feature comparison ── */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-[hsl(var(--fg-3))] uppercase tracking-wider">
                {t('account.featuresTitle', 'Plan Features')}
              </h2>
              <div className="flex gap-4 text-xs text-[hsl(var(--fg-3))]">
                <span>{t('account.planFree')}</span>
                <span>{t('account.planPro')}</span>
              </div>
            </div>

            {featureRows.map((f) => (
              <div
                key={f.key}
                className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
              >
                <span className={`text-sm ${f.userHas ? '' : 'text-[hsl(var(--fg-3))]'}`}>{f.label}</span>
                <div className="flex items-center gap-6">
                  {/* Free column */}
                  {f.includedInFree ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-[hsl(var(--fg-3))] opacity-40" />
                  )}
                  {/* Pro column */}
                  {f.includedInPro ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-[hsl(var(--fg-3))] opacity-40" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          {!isPaid && !isTrialing ? (
            <Button onClick={() => navigate(ROUTES.pricing)} className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              {t('account.upgradeCta')}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => navigate('/billing')}>
                <CreditCard className="w-4 h-4 mr-2" />
                {t('account.manageBilling')}
              </Button>
            </div>
          )}

          {/* Expired users also see an upgrade CTA */}
          {isExpired && (
            <Button onClick={() => navigate(ROUTES.pricing)} className="w-full mt-3">
              <Crown className="w-4 h-4 mr-2" />
              {t('account.upgradeCta')}
            </Button>
          )}

        </motion.div>
      </div>
    </div>
  );
}
