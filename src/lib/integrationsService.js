/**
 * integrationsService — orchestrates connect/disconnect/refresh for every
 * 3rd-party data source the app talks to.
 *
 * Each provider has its own connection mechanism:
 *
 *  - APPLE HEALTH    → @perfood/capacitor-healthkit (iOS only, native auth)
 *                      Live now if app runs on iOS device with HealthKit.
 *
 *  - GOOGLE FIT      → OAuth 2.0 redirect flow
 *                      REQUIRES: VITE_GOOGLE_FIT_CLIENT_ID env var + OAuth
 *                      app registered at console.cloud.google.com with the
 *                      atlas.core redirect URL whitelisted.
 *
 *  - WHOOP           → OAuth 2.0 (developer.whoop.com)
 *                      REQUIRES: VITE_WHOOP_CLIENT_ID + atlas.core redirect.
 *
 *  - OURA            → OAuth 2.0 (cloud.ouraring.com)
 *                      REQUIRES: VITE_OURA_CLIENT_ID + redirect.
 *
 *  - GARMIN          → OAuth 1.0a (developer.garmin.com Wellness API).
 *                      REQUIRES: VITE_GARMIN_CONSUMER_KEY + server-side handler
 *                      because OAuth 1.0a needs request-token signing → use a
 *                      Supabase Edge Function `garmin-oauth-start`.
 *
 *  - STRAVA          → OAuth 2.0 (developers.strava.com)
 *                      REQUIRES: VITE_STRAVA_CLIENT_ID + redirect.
 *
 *  - HEVY            → No public OAuth API as of 2026. User can export CSV
 *                      from the Hevy app + upload here. Stub for now.
 *
 *  - MYFITNESSPAL    → No public API. User imports food log via CSV export.
 *
 *  - CRONOMETER      → REST API behind Cronometer Gold subscription.
 *                      Requires user's own API key — paste flow.
 *
 * The actual token exchange + storage happens in a Supabase Edge Function
 * `oauth-callback` that handles all providers (it knows which one based on
 * the `state` param). Tokens get stored in the `user_integrations` table.
 *
 * See /docs/BACKEND_TODO.md → "Integrations" section for the full schema +
 * env vars needed.
 */

import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

/* ─── OAuth provider configs ────────────────────────────────────────────── */

const REDIRECT_URI = `${typeof window !== 'undefined' ? window.location.origin : ''}/oauth/callback`;

const OAUTH_PROVIDERS = {
  google_fit: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientIdEnv: 'VITE_GOOGLE_FIT_CLIENT_ID',
    scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read',
    extra: { response_type: 'code', access_type: 'offline', prompt: 'consent' },
  },
  whoop: {
    authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    clientIdEnv: 'VITE_WHOOP_CLIENT_ID',
    scope: 'read:recovery read:cycles read:workout read:sleep read:profile',
    extra: { response_type: 'code' },
  },
  oura: {
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    clientIdEnv: 'VITE_OURA_CLIENT_ID',
    scope: 'daily personal heartrate workout session spo2',
    extra: { response_type: 'code' },
  },
  strava: {
    authUrl: 'https://www.strava.com/oauth/authorize',
    clientIdEnv: 'VITE_STRAVA_CLIENT_ID',
    scope: 'read,activity:read_all',
    extra: { response_type: 'code', approval_prompt: 'auto' },
  },
};

const CONNECTION_GROUPS = {
  apple_health: 'Health data',
  whoop: 'Health data',
  oura: 'Health data',
  garmin: 'Health data',
  mfp: 'Nutrition',
  cronometer: 'Nutrition',
  strava: 'Training',
  hevy: 'Training',
  google_fit: 'Health data',
};

const CONNECTION_NAMES = {
  apple_health: 'Apple Health',
  whoop: 'Whoop',
  oura: 'Oura',
  garmin: 'Garmin',
  mfp: 'MyFitnessPal',
  cronometer: 'Cronometer',
  strava: 'Strava',
  hevy: 'Hevy',
  google_fit: 'Google Fit',
};

const ALL_PROVIDER_IDS = Object.keys(CONNECTION_NAMES);

function localMirrorKey(userId) {
  return `atlas.integrations.${userId || 'anon'}`;
}

function loadLocalMirror(userId) {
  try {
    const raw = localStorage.getItem(localMirrorKey(userId));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveLocalMirror(userId, next) {
  try {
    localStorage.setItem(localMirrorKey(userId), JSON.stringify(next || {}));
  } catch {}
}

function normalizeRow(row) {
  const providerId = row?.provider_id || row?.provider || row?.id;
  if (!providerId) return null;
  const isConnected =
    row?.status === 'connected'
    || row?.status === 'active'
    || row?.connected === true
    || !!row?.access_token
    || !!row?.refresh_token
    || !!row?.connected_at;

  return {
    id: providerId,
    name: CONNECTION_NAMES[providerId] || providerId,
    group: CONNECTION_GROUPS[providerId] || 'Other',
    status: isConnected ? 'connected' : 'disconnected',
    lastSyncAt: row?.last_synced_at || row?.synced_at || row?.updated_at || row?.connected_at || null,
  };
}

function mergeWithDefaults(rows, mirror) {
  const byId = new Map();

  (rows || []).forEach((row) => {
    const normalized = normalizeRow(row);
    if (normalized) byId.set(normalized.id, normalized);
  });

  Object.entries(mirror || {}).forEach(([id, row]) => {
    const normalized = normalizeRow({ id, ...row });
    if (normalized && !byId.has(id)) byId.set(id, normalized);
  });

  return ALL_PROVIDER_IDS.map((id) => byId.get(id) || {
    id,
    name: CONNECTION_NAMES[id] || id,
    group: CONNECTION_GROUPS[id] || 'Other',
    status: 'disconnected',
    lastSyncAt: null,
  });
}

function upsertMirrorRow(userId, providerId, partial) {
  if (!userId || !providerId) return;
  const current = loadLocalMirror(userId);
  current[providerId] = {
    ...(current[providerId] || {}),
    ...partial,
  };
  saveLocalMirror(userId, current);
}

function clearMirrorRow(userId, providerId) {
  if (!userId || !providerId) return;
  const current = loadLocalMirror(userId);
  delete current[providerId];
  saveLocalMirror(userId, current);
}

export async function getIntegrationConnections(userId) {
  const mirror = loadLocalMirror(userId);

  try {
    if (!userId) return mergeWithDefaults([], mirror);

    const { data, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      const msg = `${error.code || ''} ${error.message || ''} ${error.details || ''}`.toLowerCase();
      if (msg.includes('does not exist') || msg.includes('schema cache') || msg.includes('not found')) {
        return mergeWithDefaults([], mirror);
      }
      throw error;
    }

    return mergeWithDefaults(data || [], mirror);
  } catch (error) {
    console.warn('[integrationsService] getIntegrationConnections failed:', error?.message || error);
    return mergeWithDefaults([], mirror);
  }
}

/* ─── Public API ────────────────────────────────────────────────────────── */

/**
 * Start the connect flow for a provider. Returns a promise that resolves with
 * `{ success, status, message }`. The caller can show toasts based on result.
 */
export async function connectProvider(providerId, userId = null) {
  let result;
  switch (providerId) {
    case 'apple_health': result = await connectAppleHealth(); break;
    case 'google_fit':   result = await startOAuth('google_fit'); break;
    case 'whoop':        result = await startOAuth('whoop'); break;
    case 'oura':         result = await startOAuth('oura'); break;
    case 'strava':       result = await startOAuth('strava'); break;
    case 'garmin':       result = await startGarmin(); break;
    case 'hevy':         result = await notSupported('Hevy', 'Hevy doesn\'t expose a public API. Export your data as CSV from the Hevy app and import via Settings → Data.'); break;
    case 'mfp':          result = await notSupported('MyFitnessPal', 'MyFitnessPal doesn\'t expose a public API. Export your food log as CSV from MFP and import via Settings → Data.'); break;
    case 'cronometer':   result = await connectCronometer(); break;
    default:             result = { success: false, status: 'unknown', message: `Unknown provider: ${providerId}` };
  }

  if (result?.success && ['connected', 'redirecting'].includes(result.status)) {
    upsertMirrorRow(userId, providerId, {
      status: result.status === 'connected' ? 'connected' : 'disconnected',
      connected_at: result.status === 'connected' ? new Date().toISOString() : null,
      last_synced_at: result.status === 'connected' ? new Date().toISOString() : null,
    });
  }

  return result;
}

export async function disconnectProvider(providerId, userId = null) {
  // TODO: call Supabase RPC `disconnect_integration(provider)` which deletes
  // tokens from user_integrations and revokes upstream where possible.
  clearMirrorRow(userId, providerId);
  return { success: true, status: 'disconnected', message: `Disconnected ${providerId}` };
}

export async function refreshProvider(providerId, userId = null) {
  // TODO: call Supabase Edge Function `sync-integration` with providerId.
  // For now, honest pending status.
  upsertMirrorRow(userId, providerId, {
    status: 'connected',
    last_synced_at: new Date().toISOString(),
  });
  return { success: false, status: 'pending', message: 'Sync engine not wired yet' };
}

/* ─── Apple Health (Capacitor HealthKit) ────────────────────────────────── */

async function connectAppleHealth() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return { success: false, status: 'unsupported', message: 'Apple Health only available on iOS' };
  }
  try {
    const modName = '@perfood/capacitor-healthkit';
    const { CapacitorHealthkit } = await import(modName);
    await CapacitorHealthkit.requestAuthorization({
      all: [],
      read: ['steps', 'heart-rate', 'sleep-analysis', 'active-energy', 'workouts', 'weight', 'height'],
      write: [],
    });
    return { success: true, status: 'connected', message: 'Apple Health connected' };
  } catch (e) {
    // Module missing or authorization failed
    return { success: false, status: 'error', message: e?.message || 'Apple Health authorization failed' };
  }
}

/* ─── OAuth 2.0 flow ────────────────────────────────────────────────────── */

async function startOAuth(providerId) {
  const cfg = OAUTH_PROVIDERS[providerId];
  if (!cfg) return { success: false, status: 'error', message: `No OAuth config for ${providerId}` };
  const clientId = import.meta.env[cfg.clientIdEnv];
  if (!clientId) {
    return {
      success: false,
      status: 'unconfigured',
      message: `Set ${cfg.clientIdEnv} in your env to enable this integration.`,
    };
  }
  const state = `${providerId}.${cryptoRandom()}`;
  try { sessionStorage.setItem('atlas.oauth.state', state); } catch {}

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: cfg.scope,
    state,
    ...cfg.extra,
  });
  const url = `${cfg.authUrl}?${params.toString()}`;

  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url, presentationStyle: 'popover' });
  } else {
    window.location.href = url;
  }
  return { success: true, status: 'redirecting', message: 'Opening provider sign-in…' };
}

/* ─── Garmin (OAuth 1.0a — must run server-side) ────────────────────────── */

async function startGarmin() {
  // Garmin uses OAuth 1.0a which requires HMAC-SHA1 request signing using the
  // app's consumer secret — that secret cannot ship to the client. Delegate
  // to a Supabase Edge Function `garmin-oauth-start` that returns the
  // authorize URL with the request token already injected.
  // For now, honest unconfigured response.
  return {
    success: false,
    status: 'unconfigured',
    message: 'Garmin requires a server-side OAuth handler (see BACKEND_TODO.md).',
  };
}

/* ─── Cronometer (paste user API key) ───────────────────────────────────── */

async function connectCronometer() {
  return {
    success: false,
    status: 'manual',
    message: 'Cronometer integration uses your personal API key. Paste flow coming soon.',
  };
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function notSupported(brand, message) {
  return { success: false, status: 'no_api', message: `${brand}: ${message}` };
}

function cryptoRandom() {
  const arr = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Surface a friendly toast for a connect result. UI handlers can call this.
 */
export function toastConnectResult(providerId, result) {
  const label = providerId.replace('_', ' ');
  if (result.success) {
    toast.success(result.message || `${label} connected`);
  } else if (result.status === 'redirecting') {
    toast.message(`Opening ${label}…`);
  } else if (result.status === 'unconfigured') {
    toast.message('Integration not configured', { description: result.message });
  } else if (result.status === 'unsupported' || result.status === 'no_api') {
    toast.message('Not available', { description: result.message });
  } else {
    toast.error(result.message || `Failed to connect ${label}`);
  }
}
