/**
 * Centralized analytics — PostHog + Meta Pixel + Vercel Analytics bridge.
 *
 * All tracking calls go through this module so the rest of the codebase
 * never imports vendor SDKs directly.
 *
 * Environment variables:
 *   VITE_POSTHOG_KEY          — PostHog project API key
 *   VITE_POSTHOG_HOST         — PostHog instance host (default: https://us.i.posthog.com)
 *   VITE_META_PIXEL_ID        — Meta / Facebook Pixel ID
 *   VITE_GA_MEASUREMENT_ID    — GA4 measurement ID (optional, only if running Google Ads)
 */

import { Capacitor } from '@capacitor/core';

// ─── Feature flags ───────────────────────────────────────────────────────────
const IS_PRODUCTION = import.meta.env.PROD;
const IS_WEB = !Capacitor.isNativePlatform();

// Only load marketing pixels on web — native apps use RevenueCat attribution.
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
export const ANALYTICS_CONSENT_KEY = 'atlas.analytics.consent.v1';

// posthog-js is loaded dynamically — this holds the instance once ready.
let _posthog = null;
let _posthogReady = false;
let _pixelReady = false;
let _gaReady = false;

function hasWindow() {
  return typeof window !== 'undefined';
}

export function getAnalyticsConsent() {
  if (!hasWindow()) return false;
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

function emitAnalyticsConsentChanged(allowed) {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent('atlas:analytics-consent', { detail: { allowed } }));
}

export function setAnalyticsConsent(allowed) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, allowed ? 'granted' : 'denied');
  } catch {
    // Storage failures keep analytics disabled by the guards below.
  }

  if (GA_ID) {
    window[`ga-disable-${GA_ID}`] = !allowed;
  }

  if (!allowed) {
    if (_posthogReady && _posthog) {
      try {
        _posthog.opt_out_capturing?.();
        _posthog.reset?.();
      } catch {}
    }
    if (typeof window.fbq === 'function') {
      try { window.fbq('consent', 'revoke'); } catch {}
    }
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      } catch {}
    }
    _pixelReady = false;
    _gaReady = false;
  } else {
    if (_posthogReady && _posthog) {
      try { _posthog.opt_in_capturing?.(); } catch {}
    }
    if (typeof window.fbq === 'function') {
      try { window.fbq('consent', 'grant'); } catch {}
    }
    initAnalytics();
  }

  emitAnalyticsConsentChanged(allowed);
}

export function subscribeAnalyticsConsent(listener) {
  if (!hasWindow()) return () => {};
  const handler = (event) => listener(Boolean(event.detail?.allowed));
  window.addEventListener('atlas:analytics-consent', handler);
  return () => window.removeEventListener('atlas:analytics-consent', handler);
}

// ─── PostHog ─────────────────────────────────────────────────────────────────

export function initPostHog() {
  if (!getAnalyticsConsent()) return;
  if (!POSTHOG_KEY || !IS_WEB) return;
  // Allow explicit dev opt-in via VITE_POSTHOG_DEV=true
  if (!IS_PRODUCTION && import.meta.env.VITE_POSTHOG_DEV !== 'true') return;

  // Dynamic import keeps posthog-js out of the initial bundle.
  import('posthog-js').then(({ default: posthog }) => {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        capture_pageview: false,   // we fire manually on route change
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        loaded: () => {
          _posthog = posthog;
          _posthogReady = true;
        },
      });
    } catch (e) {
      console.warn('[analytics] PostHog init failed', e);
    }
  }).catch((e) => {
    console.warn('[analytics] PostHog load failed', e);
  });
}

export function identifyPostHog(userId, traits) {
  if (!getAnalyticsConsent()) return;
  if (!_posthogReady || !_posthog) return;
  _posthog.identify(userId, traits);
}

export function resetPostHog() {
  if (!_posthogReady || !_posthog) return;
  _posthog.reset();
}

// ─── Meta Pixel ──────────────────────────────────────────────────────────────

export function initMetaPixel() {
  if (!getAnalyticsConsent()) return;
  if (!META_PIXEL_ID || !IS_WEB || !IS_PRODUCTION) return;
  if (typeof window === 'undefined') return;

  // Standard Meta Pixel snippet (no-script fallback handled by noscript tag)
   
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
   

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
  _pixelReady = true;
}

function fbqTrack(eventName, params) {
  if (!getAnalyticsConsent()) return;
  if (!_pixelReady || typeof window.fbq !== 'function') return;
  if (params) {
    window.fbq('track', eventName, params);
  } else {
    window.fbq('track', eventName);
  }
}

// ─── GA4 (optional) ──────────────────────────────────────────────────────────

export function initGA4() {
  if (!getAnalyticsConsent()) return;
  if (!GA_ID || !IS_WEB || !IS_PRODUCTION) return;
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
  _gaReady = true;
}

function gtagEvent(name, params) {
  if (!getAnalyticsConsent()) return;
  if (!_gaReady || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

// ─── Unified API ─────────────────────────────────────────────────────────────

/**
 * Initialize all analytics providers. Call once at app boot.
 */
export function initAnalytics() {
  if (!getAnalyticsConsent()) return;
  initPostHog();
  initMetaPixel();
  initGA4();
}

/**
 * Track a page view across all providers. Call on every route change.
 */
export function trackPageView(path) {
  if (!getAnalyticsConsent()) return;
  if (_posthogReady && _posthog) {
    _posthog.capture('$pageview', { $current_url: window.location.href });
  }
  if (_pixelReady) {
    window.fbq('track', 'PageView');
  }
  if (_gaReady) {
    window.gtag('event', 'page_view', { page_path: path });
  }
}

/**
 * Identify a user across all providers.
 */
export function identifyUser(userId, traits = {}) {
  if (!getAnalyticsConsent()) return;
  identifyPostHog(userId, traits);
}

/**
 * Reset identity on logout.
 */
export function resetAnalyticsUser() {
  resetPostHog();
}

/**
 * Track a custom event across PostHog + GA4.
 * Meta Pixel events use specific standard names and are mapped separately.
 *
 * @param {string} event   — event name (snake_case)
 * @param {object} props   — optional properties
 */
export function track(event, props = {}) {
  if (!getAnalyticsConsent()) return;
  if (_posthogReady && _posthog) {
    _posthog.capture(event, props);
  }
  if (_gaReady) {
    gtagEvent(event, props);
  }
}

// ─── Conversion helpers (fire both PostHog + Meta standard events) ───────────

export function trackSignupCompleted(props = {}) {
  track('signup_completed', props);
  fbqTrack('CompleteRegistration', props);
  gtagEvent('sign_up', props);
}

export function trackOnboardingCompleted(props = {}) {
  track('onboarding_completed', props);
}

export function trackPaywallViewed(props = {}) {
  track('paywall_viewed', props);
  fbqTrack('ViewContent', { content_name: 'paywall', ...props });
}

export function trackTrialStarted(props = {}) {
  track('trial_started', props);
  fbqTrack('StartTrial', props);
}

export function trackCheckoutStarted(props = {}) {
  track('checkout_started', props);
  fbqTrack('InitiateCheckout', props);
}

export function trackPurchaseCompleted(props = {}) {
  track('subscription_started', props);
  fbqTrack('Purchase', props);
  gtagEvent('purchase', props);
}

export function trackWaitlistSignup(props = {}) {
  track('waitlist_signup', props);
  fbqTrack('Lead', props);
}

export function trackCtaClick(props = {}) {
  track('cta_click', props);
}

export function trackLandingPageView() {
  track('landing_page_view');
  fbqTrack('ViewContent', { content_name: 'landing' });
}

export function trackAppDownloadClicked(props = {}) {
  track('app_download_clicked', props);
}

export function trackReferralLinkClicked(props = {}) {
  track('referral_link_clicked', props);
}

// ─── Welcome / Demo funnel events ───────────────────────────────────────────

export function trackAppOpened(props = {}) {
  track('app_opened', props);
}

export function trackOnboardingStarted(props = {}) {
  track('onboarding_started', props);
}

export function trackOnboardingSkipped(props = {}) {
  track('onboarding_skipped', props);
}

export function trackDemoHomeViewed(props = {}) {
  track('demo_home_viewed', props);
}

export function trackDemoCardTapped(props = {}) {
  track('demo_card_tapped', props);
}

export function trackAuthGateShown(props = {}) {
  track('auth_gate_shown', props);
}

export function trackProtectedActionAttempted(props = {}) {
  track('protected_action_attempted', props);
}
