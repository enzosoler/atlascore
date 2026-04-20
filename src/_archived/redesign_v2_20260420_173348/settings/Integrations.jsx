/**
 * Integrations — /app/settings/integrations.
 * Ref: Linear integrations + Notion integrations + Strava connections.
 *
 * Lists every data source Atlas can talk to, with connection status.
 * Groups:
 *  - Health data (Apple Health, Google Fit, Whoop, Oura, Garmin)
 *  - Nutrition (MyFitnessPal, Cronometer)
 *  - Training (Strava, Hevy)
 *
 * Each row shows: logo box + name + status + action (connect / disconnect).
 * Permissions breakdown expands inline when connected.
 */
import React, { useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';

const CATALOGUE = [
  {
    group: 'Health data',
    items: [
      { id: 'apple_health',  name: 'Apple Health', hint: 'HRV · sleep · resting HR · workouts', platform: 'ios' },
      { id: 'google_fit',    name: 'Google Fit',   hint: 'Activity · heart rate · sleep',      platform: 'android' },
      { id: 'whoop',         name: 'Whoop',        hint: 'Strain · recovery · sleep score' },
      { id: 'oura',          name: 'Oura',         hint: 'Sleep stages · readiness · temp' },
      { id: 'garmin',        name: 'Garmin',       hint: 'Activity · HR · training load' },
    ],
  },
  {
    group: 'Nutrition',
    items: [
      { id: 'mfp',           name: 'MyFitnessPal', hint: 'Import food log history' },
      { id: 'cronometer',    name: 'Cronometer',   hint: 'Micronutrient depth' },
    ],
  },
  {
    group: 'Training',
    items: [
      { id: 'strava',        name: 'Strava',       hint: 'Runs · rides · swims' },
      { id: 'hevy',          name: 'Hevy',         hint: 'Strength workouts import' },
    ],
  },
];

export default function Integrations({
  connections = {},        // { [providerId]: { status: 'connected'|'pending'|null, lastSyncAt, scopes[] } }
  platform = 'web',        // 'ios' | 'android' | 'web'
  onBack,
  onConnect,               // (providerId) => void
  onDisconnect,            // (providerId) => void
  onRefresh,               // (providerId) => void
}) {
  const [expanded, setExpanded] = useState(null);

  const connectedCount = Object.values(connections).filter((c) => c?.status === 'connected').length;

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)' }}>
      <BackButton onClick={onBack} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 560, margin: '0 auto' }}>
        <SpringReveal delay={20}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Integrations
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.4 }}>
            Plug Atlas into the services that already have your data. We only pull what we need,
            and you can disconnect anytime.
          </p>
          <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 9999, background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)' }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 99, background: '#34D399', boxShadow: '0 0 6px rgba(52,211,153,.6)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#34D399', fontVariantNumeric: 'tabular-nums' }}>
              {connectedCount} connected
            </span>
          </div>
        </SpringReveal>

        {CATALOGUE.map((group, gIdx) => (
          <SpringReveal key={group.group} delay={60 + gIdx * 40}>
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', marginBottom: 8, paddingInline: 2 }}>
                {group.group}
              </div>
              <Glass radius="xl" style={{ padding: 4, overflow: 'hidden' }}>
                {group.items.map((item, i) => {
                  const conn = connections[item.id];
                  const unsupported =
                    (item.platform === 'ios' && platform === 'android') ||
                    (item.platform === 'android' && platform === 'ios');
                  return (
                    <ProviderRow
                      key={item.id}
                      item={item}
                      connection={conn}
                      unsupported={unsupported}
                      expanded={expanded === item.id}
                      onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
                      onConnect={() => onConnect?.(item.id)}
                      onDisconnect={() => onDisconnect?.(item.id)}
                      onRefresh={() => onRefresh?.(item.id)}
                      last={i === group.items.length - 1}
                    />
                  );
                })}
              </Glass>
            </div>
          </SpringReveal>
        ))}
      </div>
    </SafeScreen>
  );
}
export { Integrations };

function ProviderRow({ item, connection, unsupported, expanded, onToggle, onConnect, onDisconnect, onRefresh, last }) {
  const status = connection?.status || null;
  const isConnected = status === 'connected';
  const isPending = status === 'pending';

  return (
    <div style={{ borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
      <button
        type="button"
        onClick={isConnected ? onToggle : (unsupported ? null : onConnect)}
        disabled={unsupported}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 12px',
          background: 'transparent', border: 'none',
          color: 'hsl(var(--rd-fg-primary))',
          textAlign: 'left',
          cursor: unsupported ? 'not-allowed' : 'pointer',
          WebkitTapHighlightColor: 'transparent',
          opacity: unsupported ? 0.4 : 1,
        }}
      >
        <ProviderLogo id={item.id} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{item.name}</span>
            {isConnected && (
              <span
                style={{
                  padding: '2px 8px', borderRadius: 9999,
                  fontSize: 9, letterSpacing: '0.12em', fontWeight: 700,
                  background: 'rgba(52,211,153,0.14)', border: '1px solid rgba(52,211,153,0.35)', color: '#34D399',
                }}
              >
                CONNECTED
              </span>
            )}
            {isPending && (
              <span
                style={{
                  padding: '2px 8px', borderRadius: 9999,
                  fontSize: 9, letterSpacing: '0.12em', fontWeight: 700,
                  background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.35)', color: '#FBBF24',
                }}
              >
                PENDING
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }} className="truncate">
            {unsupported ? 'Not available on this platform' : item.hint}
          </div>
        </div>
        {isConnected ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))', flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          !unsupported && (
            <span
              style={{
                height: 28, paddingInline: 12, borderRadius: 9999, flexShrink: 0,
                background: 'rgba(0,255,255,0.10)', border: '1px solid rgba(0,255,255,0.3)',
                color: 'hsl(var(--rd-accent))',
                fontSize: 12, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              Connect
            </span>
          )
        )}
      </button>

      {/* Expanded details for connected provider */}
      {isConnected && expanded && (
        <div style={{ padding: '4px 12px 14px 68px', display: 'grid', gap: 8 }}>
          {connection.lastSyncAt && (
            <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
              Last sync: {formatRelative(connection.lastSyncAt)}
            </div>
          )}
          {Array.isArray(connection.scopes) && connection.scopes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {connection.scopes.map((s) => (
                <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--rd-fg-secondary))', letterSpacing: '0.04em', fontWeight: 500 }}>
                  {s}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <LiquidButton intent="neutral" size="sm" onClick={onRefresh}>Refresh</LiquidButton>
            <LiquidButton intent="danger" size="sm" onClick={onDisconnect}>Disconnect</LiquidButton>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ProviderLogo — brand-tinted tile with a conceptual glyph for each provider.
 * These are custom stylized icons (line SVGs in our liquid-glass system),
 * not literal reproductions of trademarked logos. Each tile uses the
 * provider's dominant brand color so users recognize the tile at a glance.
 */
function ProviderLogo({ id }) {
  const cfg = PROVIDER_VISUALS[id] || DEFAULT_PROVIDER_VISUAL;
  return (
    <span
      aria-hidden
      style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: cfg.bg,
        border: `1px solid ${cfg.bd}`,
        color: cfg.c,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <cfg.Glyph />
    </span>
  );
}

/* ─── Per-provider visual config ────────────────────────────────────────── */

const DEFAULT_PROVIDER_VISUAL = {
  bg: 'rgba(0,255,255,0.06)', bd: 'rgba(0,255,255,0.18)', c: 'hsl(var(--rd-accent))',
  Glyph: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  ),
};

const PROVIDER_VISUALS = {
  apple_health: {
    bg: 'rgba(239,68,68,0.10)', bd: 'rgba(239,68,68,0.30)', c: '#F87171',
    Glyph: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M20.8 8.6C20.8 12.2 16 16 12 20c-4-4-8.8-7.8-8.8-11.4C3.2 5.4 5.8 3.4 8.3 3.4c1.5 0 3 .8 3.7 2.2.7-1.4 2.2-2.2 3.7-2.2 2.5 0 5.1 2 5.1 5.2z"
          stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" fill="rgba(239,68,68,0.14)" />
      </svg>
    ),
  },
  google_fit: {
    bg: 'rgba(66,133,244,0.10)', bd: 'rgba(66,133,244,0.30)', c: '#60A5FA',
    Glyph: () => (
      // Four-lobed diamond — evokes Google's activity ring motif
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3l3.5 5.5L12 14 8.5 8.5 12 3z" stroke="#60A5FA" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M12 14l5 3.5L12 21 7 17.5l5-3.5z" stroke="#34D399" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
    ),
  },
  whoop: {
    bg: 'rgba(255,255,255,0.04)', bd: 'rgba(255,255,255,0.16)', c: 'hsl(var(--rd-fg-primary))',
    Glyph: () => (
      // Strap — thick horizontal band
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="9" width="18" height="6" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 9v6M16 9v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  oura: {
    bg: 'rgba(201,169,106,0.10)', bd: 'rgba(201,169,106,0.32)', c: 'hsl(var(--rd-premium))',
    Glyph: () => (
      // Concentric rings — the ring form factor
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.75" opacity="0.7" />
      </svg>
    ),
  },
  garmin: {
    bg: 'rgba(0,165,250,0.10)', bd: 'rgba(0,165,250,0.30)', c: '#60A5FA',
    Glyph: () => (
      // Compass-ish triangle
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3l9 16H3L12 3z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M12 10v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  mfp: {
    bg: 'rgba(14,165,233,0.10)', bd: 'rgba(14,165,233,0.30)', c: '#38BDF8',
    Glyph: () => (
      // Utensils
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M8 3v7a2 2 0 0 0 2 2v9M6 3v5a2 2 0 0 0 2 2M10 3v5a2 2 0 0 1-2 2M16 3c0 4 3 6 3 11v7"
          stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  cronometer: {
    bg: 'rgba(248,113,113,0.10)', bd: 'rgba(248,113,113,0.30)', c: '#F87171',
    Glyph: () => (
      // Stopwatch
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 13V9M10 3h4M12 3v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  strava: {
    bg: 'rgba(251,146,60,0.10)', bd: 'rgba(251,146,60,0.32)', c: '#FB923C',
    Glyph: () => (
      // Chevron/mountain — evokes activity/terrain
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 16l6-11 4 7 2-3 4 7H4z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
    ),
  },
  hevy: {
    bg: 'rgba(139,92,246,0.10)', bd: 'rgba(139,92,246,0.30)', c: '#A78BFA',
    Glyph: () => (
      // Dumbbell
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 9v6M4 10.5v3M10 6v12M18 9v6M20 10.5v3M14 6v12M10 12h4"
          stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
};

function BackButton({ onClick }) {
  return (
    <button
      type="button" onClick={onClick} aria-label="Back"
      style={{
        position: 'fixed', top: 'calc(env(safe-area-inset-top) + 14px)', left: 'max(16px, env(safe-area-inset-left))',
        zIndex: 45,
        width: 36, height: 36, borderRadius: 9999,
        background: 'rgba(10,14,20,0.55)',
        backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

function formatRelative(ts) {
  const d = typeof ts === 'string' ? new Date(ts) : ts;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
