/**
 * PaywallTrigger — contextual upgrade prompts at peak motivation moments.
 *
 * 4 trigger types:
 *  1. ai_coach   — after second AI message (Free)
 *  2. workout    — after first completed workout
 *  3. photo      — after first progress photo upload
 *  4. streak     — at 3-day check-in streak
 *
 * Each fires once per session (sessionStorage). Dismiss hides until next app open.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Crown, X } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useI18n } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';

const TRIGGER_KEYS = ['ai_coach', 'workout', 'photo', 'streak'];

function sessionKey(trigger) {
  return `atlas_paywall_${trigger}_dismissed`;
}

/**
 * Inline paywall card — appears in context, dismissable once per session.
 *
 * @param {{ trigger: 'ai_coach'|'workout'|'photo'|'streak', show: boolean }} props
 */
export default function PaywallTrigger({ trigger, show }) {
  const { can } = useSubscription();
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey(trigger))) {
      setDismissed(true);
    }
  }, [trigger]);

  // Already subscribed — never show
  if (can('atlas_ai')) return null;
  if (!show || dismissed) return null;

  const key = TRIGGER_KEYS.includes(trigger) ? trigger : 'workout';

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(sessionKey(trigger), '1'); } catch { /* quota */ }
  };

  return (
    <div className="rounded-[18px] bg-[hsl(var(--warn)/0.06)] border border-[hsl(var(--warn)/0.15)] p-4">
      <div className="flex items-start gap-3">
        <Crown className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))] leading-[1.4]">
            {t(`paywall.triggers.${key}.headline`)}
          </p>
          <Link
            to={ROUTES.pricing}
            className="inline-flex items-center gap-1.5 mt-2.5 text-[13px] font-semibold text-[hsl(var(--brand))] active:opacity-70"
          >
            {t('paywall.seePlans')}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-[hsl(var(--fg-3))] p-0.5 active:opacity-70"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * PaywallSheet — slides up from bottom after a success moment (e.g. first workout).
 */
export function PaywallSheet({ trigger, show, onClose }) {
  const { can } = useSubscription();
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey(trigger))) {
      setDismissed(true);
    }
  }, [trigger]);

  if (can('atlas_ai') || !show || dismissed) return null;

  const key = TRIGGER_KEYS.includes(trigger) ? trigger : 'workout';

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(sessionKey(trigger), '1'); } catch { /* quota */ }
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-t-[24px] sm:rounded-[24px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.7)] overflow-hidden atlas-sheet-enter" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="p-6 text-center space-y-4">
          <Crown className="w-10 h-10 text-[#F59E0B] mx-auto" strokeWidth={1.5} />
          <p className="text-[18px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {t(`paywall.triggers.${key}.headline`)}
          </p>
          <Link
            to={ROUTES.pricing}
            onClick={handleDismiss}
            className="flex items-center justify-center gap-2 h-12 rounded-[12px] bg-[hsl(var(--brand))] text-white font-semibold text-[15px] w-full"
          >
            {t('paywall.seePlans')}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          <button
            onClick={handleDismiss}
            className="text-[13px] text-[hsl(var(--fg-3))] active:opacity-70"
          >
            {t('paywall.maybeLater')}
          </button>
        </div>
      </div>
    </div>
  );
}
