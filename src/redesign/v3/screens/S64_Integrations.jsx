/**
 * S64_Integrations — Connected devices & services sub-screen.
 * Replaces v2 Integrations.jsx with v3 paper design system.
 *
 * Pattern: S19_Settings row-based card sections + S11_Onboard_Permissions toggle pattern.
 *
 * Three groups:
 *  1. Health data — Apple Health, Whoop, Oura, Garmin
 *  2. Nutrition   — MyFitnessPal, Cronometer
 *  3. Training    — Strava, Hevy
 *
 * Each row: provider name, status chip (Connected/Not connected),
 * last sync time, chevron.
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=false]
 * @param {Array<{id:string, name:string, group:string, status:string, lastSyncAt:string|null}>} [props.connections]
 * @param {function} [props.onConnect]    — (id) => void
 * @param {function} [props.onDisconnect] — (id) => void
 * @param {function} [props.onRefresh]    — (id) => void
 * @param {function} [props.onBack]
 */
import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACChip, ACMono,
} from '../lib/paper.jsx';

/* ── safe handler wrapper ───────────────────────────────────── */
const safe = (fn, ...args) => () => { try { fn?.(...args); } catch (_) { /* noop */ } };

/* ── DEMO fallback catalogue ────────────────────────────────── */
const DEMO_CONNECTIONS = [
  { id: 'apple_health', name: 'Apple Health', group: 'Health data', status: 'connected', lastSyncAt: '2026-04-20T07:14:00Z' },
  { id: 'whoop',        name: 'Whoop',        group: 'Health data', status: 'connected', lastSyncAt: '2026-04-20T06:30:00Z' },
  { id: 'oura',         name: 'Oura',         group: 'Health data', status: 'disconnected', lastSyncAt: null },
  { id: 'garmin',       name: 'Garmin',       group: 'Health data', status: 'disconnected', lastSyncAt: null },
  { id: 'mfp',          name: 'MyFitnessPal', group: 'Nutrition',   status: 'connected', lastSyncAt: '2026-04-19T22:10:00Z' },
  { id: 'cronometer',   name: 'Cronometer',   group: 'Nutrition',   status: 'disconnected', lastSyncAt: null },
  { id: 'strava',       name: 'Strava',       group: 'Training',    status: 'connected', lastSyncAt: '2026-04-20T08:01:00Z' },
  { id: 'hevy',         name: 'Hevy',         group: 'Training',    status: 'disconnected', lastSyncAt: null },
];

/* ── Group ordering ─────────────────────────────────────────── */
const GROUP_ORDER = ['Health data', 'Nutrition', 'Training'];

/* ── Provider glyphs (line SVGs, not trademarked logos) ─────── */
function ProviderGlyph({ id, c }) {
  const box = {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const sw = 1.8;

  if (id === 'apple_health') {
    return (
      <div style={{ ...box, background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' }}>
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
          <path d="M11 18.5s-7-4.3-7-9.4a4.3 4.3 0 0 1 7-3.3 4.3 4.3 0 0 1 7 3.3c0 5.1-7 9.4-7 9.4Z" fill="#FF2D55" />
        </svg>
      </div>
    );
  }
  if (id === 'whoop') {
    return (
      <div style={{ ...box, background: c.card2, borderRadius: 999 }}>
        <span style={{
          fontFamily: '"Archivo Black", sans-serif',
          color: '#fff', fontSize: 14, letterSpacing: -0.5, lineHeight: 1,
        }}>W</span>
      </div>
    );
  }
  if (id === 'oura') {
    return (
      <div style={{ ...box, background: c.card2, color: c.accent }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={sw} />
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth={sw} opacity="0.6" />
        </svg>
      </div>
    );
  }
  if (id === 'garmin') {
    return (
      <div style={{ ...box, background: c.card2, color: c.fg }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l9 16H3L12 3z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
          <path d="M12 10v6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (id === 'mfp') {
    return (
      <div style={{ ...box, background: c.card2, color: c.fg }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 3v7a2 2 0 0 0 2 2v9M6 3v5a2 2 0 0 0 2 2M10 3v5a2 2 0 0 1-2 2M16 3c0 4 3 6 3 11v7"
            stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (id === 'cronometer') {
    return (
      <div style={{ ...box, background: c.card2, color: c.fg }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth={sw} />
          <path d="M12 13V9M10 3h4M12 3v3" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (id === 'strava') {
    return (
      <div style={{ ...box, background: 'rgba(251,146,60,0.12)', color: '#FB923C' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 16l6-11 4 7 2-3 4 7H4z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (id === 'hevy') {
    return (
      <div style={{ ...box, background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 9v6M4 10.5v3M10 6v12M18 9v6M20 10.5v3M14 6v12M10 12h4"
            stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  /* fallback */
  return (
    <div style={{ ...box, background: c.card2, color: c.dim }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={sw} />
      </svg>
    </div>
  );
}

/* ── Chevron (reused from S19) ──────────────────────────────── */
function Chevron({ color }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" style={{ flexShrink: 0 }}>
      <path d="M2 1l5 5-5 5" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Back arrow ─────────────────────────────────────────────── */
function BackArrow({ color, bg, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 28, height: 28, borderRadius: 999,
        background: bg, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path d="M7 1L3 5l4 4" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ── Relative time formatter ────────────────────────────────── */
function formatRelative(ts) {
  if (!ts) return null;
  const d = typeof ts === 'string' ? new Date(ts) : ts;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function S64_Integrations({
  dark = false,
  connections,
  onConnect,
  onDisconnect,
  onRefresh,
  onBack,
}) {
  const c = useACT(dark);

  const resolvedConnections = connections ?? DEMO_CONNECTIONS;

  /* group connections by their group field */
  const grouped = GROUP_ORDER.map((groupName) => ({
    label: groupName,
    items: resolvedConnections.filter((conn) => conn.group === groupName),
  })).filter((g) => g.items.length > 0);

  const connectedCount = resolvedConnections.filter((conn) => conn.status === 'connected').length;

  return (
    <div style={{
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column',
      background: c.bg, color: c.fg,
    }}>
      {/* ── header ─────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 22px 6px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackArrow color={c.fg} bg={c.card} onClick={safe(onBack)} />
          <div>
            <ACLabel
              size={11}
              color={c.dim}
              style={{
                fontFamily: ACFonts.body, fontWeight: 600,
                letterSpacing: 0.25, textTransform: 'uppercase',
              }}
            >
              Settings
            </ACLabel>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
              letterSpacing: -0.8, color: c.fg, marginTop: 4,
            }}>
              Integrations
            </div>
          </div>
        </div>
        {/* connected count badge */}
        <ACChip accent dark={dark} dot>
          {connectedCount} active
        </ACChip>
      </div>

      {/* ── scrollable content ─────────────────────────────────── */}
      <div style={{
        flex: 1, minHeight: 0,
        overflow: 'auto', WebkitOverflowScrolling: 'touch',
        padding: '14px 22px 20px',
      }}>
        {grouped.map((g) => (
          <div key={g.label} style={{ marginBottom: 26 }}>
            <ACLabel
              size={10}
              color={c.dim}
              style={{
                fontFamily: ACFonts.body,
                fontWeight: 600,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
                marginLeft: 2,
              }}
            >
              {g.label}
            </ACLabel>
            <div style={{
              marginTop: 10,
              background: c.card,
              borderRadius: ACRadii.card,
              overflow: 'hidden',
            }}>
              {g.items.map((conn, i) => {
                const isConnected = conn.status === 'connected';
                const syncLabel = formatRelative(conn.lastSyncAt);

                return (
                  <button
                    key={conn.id}
                    type="button"
                    onClick={isConnected ? safe(onDisconnect, conn.id) : safe(onConnect, conn.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px',
                      borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
                      width: '100%', textAlign: 'left',
                      background: 'transparent',
                      borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {/* provider icon */}
                    <ProviderGlyph id={conn.id} c={c} />

                    {/* status dot */}
                    <div style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: isConnected ? c.accent : c.mute,
                      flexShrink: 0,
                    }} />

                    {/* text content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 15, fontWeight: 500, color: c.fg,
                      }}>
                        {conn.name}
                        <ACChip accent={isConnected} dark={dark}>
                          {isConnected ? 'Connected' : 'Not connected'}
                        </ACChip>
                      </div>
                      <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {syncLabel ? (
                          <ACMono size={11} color={c.dim}>
                            Synced {syncLabel}
                          </ACMono>
                        ) : (
                          <ACLabel size={12} color={c.dim}>
                            Tap to connect
                          </ACLabel>
                        )}
                      </div>
                    </div>

                    {/* refresh button for connected providers */}
                    {isConnected && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); safe(onRefresh, conn.id)(); }}
                        style={{
                          width: 28, height: 28, borderRadius: 999,
                          background: c.card2, border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M12 7A5 5 0 1 1 7 2" stroke={c.dim} strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M12 2v3.5H8.5" stroke={c.dim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}

                    <Chevron color={c.mute} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* privacy footer — matches S19 sign-out area tone */}
        <div style={{
          marginTop: 6, padding: '14px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
            Privacy
          </ACLabel>
          <div style={{ marginTop: 4, fontSize: 13, color: c.fg, lineHeight: 1.5, fontFamily: ACFonts.body }}>
            atlas.core reads signal — never writes. All data stays on-device by default. You can disconnect anytime.
          </div>
        </div>
      </div>
    </div>
  );
}

export default S64_Integrations;
