/**
 * usePaywallAnalytics — Paywall funnel analytics events.
 *
 * Thin wrappers around the centralized `track()` function so every paywall
 * event goes through one place and naming stays consistent.
 */

import { useCallback } from 'react';
import { track } from '@/lib/analytics';

export function trackPaywallViewed(props = {}) {
  track('paywall_viewed', props);
}

export function trackTierSelected(props = {}) {
  track('paywall_tier_selected', props);
}

export function trackTrialStarted(props = {}) {
  track('trial_started', props);
}

export function trackTrialConverted(props = {}) {
  track('trial_converted', props);
}

export function trackTrialCancelled(props = {}) {
  track('trial_cancelled', props);
}

export function trackSubscriptionRenewed(props = {}) {
  track('subscription_renewed', props);
}

export function usePaywallAnalytics() {
  return {
    trackPaywallViewed: useCallback((props = {}) => trackPaywallViewed(props), []),
    trackTierSelected: useCallback((props = {}) => trackTierSelected(props), []),
    trackTrialStarted: useCallback((props = {}) => trackTrialStarted(props), []),
    trackTrialConverted: useCallback((props = {}) => trackTrialConverted(props), []),
    trackTrialCancelled: useCallback((props = {}) => trackTrialCancelled(props), []),
    trackSubscriptionRenewed: useCallback((props = {}) => trackSubscriptionRenewed(props), []),
  };
}
