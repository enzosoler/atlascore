/**
 * usePaywallAnalytics — Paywall funnel analytics events.
 *
 * Thin wrappers around the centralized `track()` function so every paywall
 * event goes through one place and naming stays consistent.
 */

import { track } from '@/lib/analytics';

export function trackPaywallViewed() {
  track('paywall_viewed');
}

export function trackTierSelected(packageId) {
  track('paywall_tier_selected', { package_id: packageId });
}

export function trackTrialStarted(packageId) {
  track('trial_started', { package_id: packageId });
}

export function trackTrialConverted() {
  track('trial_converted');
}

export function trackTrialCancelled() {
  track('trial_cancelled');
}

export function trackSubscriptionRenewed() {
  track('subscription_renewed');
}
