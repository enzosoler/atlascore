/**
 * S63_Account_Settings — Account & Security sub-screen.
 * Replaces v2 AccountSettings.jsx with v3 paper design system.
 *
 * Pattern: S19_Settings row-based card sections.
 *
 * Sections:
 *  1. Email — current address + Change action
 *  2. Password — masked + Change action
 *  3. Two-factor authentication — status badge + toggle
 *  4. Linked accounts — Apple/Google with connect/disconnect
 *  5. Active sessions — device count + Manage action
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=false]
 * @param {string}   [props.email]
 * @param {boolean}  [props.twoFactorEnabled]
 * @param {Array<{id:string, name:string, connected:boolean}>} [props.providers]
 * @param {number}   [props.sessionsCount]
 * @param {function} [props.onChangeEmail]
 * @param {function} [props.onChangePassword]
 * @param {function} [props.onToggle2FA]
 * @param {function} [props.onLinkProvider]   — (id) => void
 * @param {function} [props.onUnlinkProvider] — (id) => void
 * @param {function} [props.onManageSessions]
 * @param {function} [props.onBack]
 */
import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACChip,
} from '../lib/paper.jsx';

/* ── safe handler wrapper ───────────────────────────────────── */
const safe = (fn, ...args) => () => { try { fn?.(...args); } catch (_) { /* noop */ } };

/* ── DEMO fallback data ─────────────────────────────────────── */
const DEMO_EMAIL = 'marcus@kane.co';
const DEMO_PROVIDERS = [
  { id: 'apple',  name: 'Apple',  connected: true },
  { id: 'google', name: 'Google', connected: false },
];
const DEMO_SESSIONS = 3;

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

/* ── Provider icon glyph ────────────────────────────────────── */
function ProviderIcon({ id, c }) {
  const size = 30;
  const r = 8;
  if (id === 'apple') {
    return (
      <div style={{
        width: size, height: size, borderRadius: r, flexShrink: 0,
        background: c.fg, color: c.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12.5 11.8c-.5 1.1-1.1 2-2 2-.8 0-1.1-.5-2.1-.5s-1.3.5-2.1.5c-.9 0-1.6-1-2.1-2C3.2 9.5 3 7.6 4.1 6.2c.7-.9 1.7-1.4 2.6-1.4.9 0 1.5.5 2.2.5.7 0 1.2-.5 2.2-.5.8 0 1.7.4 2.4 1.2-2 1.1-1.7 4 .4 4.8-.3.6-.5 1-.4 1zM10 4.3c-.4.5-1 .9-1.7.8-.1-.7.2-1.4.6-1.9.4-.5 1.1-.8 1.6-.8.1.7-.2 1.4-.5 1.9z"
            fill="currentColor" />
        </svg>
      </div>
    );
  }
  /* Google */
  return (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0,
      background: c.card2, color: c.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M14.4 8.2c0-.5 0-1-.1-1.4H8v2.7h3.6c-.2.9-.7 1.6-1.4 2.1v1.7h2.3c1.3-1.2 2-3 2-5.1z" fill="#4285F4" />
        <path d="M8 15c1.9 0 3.5-.6 4.7-1.7l-2.3-1.7c-.6.4-1.4.7-2.4.7-1.8 0-3.4-1.2-3.9-2.9H1.7v1.8C2.9 13.5 5.3 15 8 15z" fill="#34A853" />
        <path d="M4.1 9.4c-.3-.8-.3-1.6 0-2.4V5.2H1.7C.6 7.3.6 9.7 1.7 11.8l2.4-2.4z" fill="#FBBC05" />
        <path d="M8 3.6c1 0 2 .4 2.7 1l2-2C11.5 1.4 9.9.8 8 .8 5.3.8 2.9 2.3 1.7 4.6l2.4 1.8c.5-1.7 2.1-2.8 3.9-2.8z" fill="#EA4335" />
      </svg>
    </div>
  );
}

/* ── Toggle switch ──────────────────────────────────────────── */
function Toggle({ on, accent, track, thumb }) {
  return (
    <div style={{
      width: 44, height: 26, borderRadius: 13, flexShrink: 0,
      background: on ? accent : track,
      padding: 3, cursor: 'pointer',
      display: 'flex', alignItems: on ? 'center' : 'center',
      justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'background 0.2s',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10,
        background: thumb,
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
      }} />
    </div>
  );
}

function S63_Account_Settings({
  dark = false,
  email,
  twoFactorEnabled,
  providers,
  sessionsCount,
  onChangeEmail,
  onChangePassword,
  onToggle2FA,
  onLinkProvider,
  onUnlinkProvider,
  onManageSessions,
  onBack,
}) {
  const c = useACT(dark);

  /* resolve with DEMO fallbacks */
  const resolvedEmail = email ?? DEMO_EMAIL;
  const resolved2FA = twoFactorEnabled ?? false;
  const resolvedProviders = providers ?? DEMO_PROVIDERS;
  const resolvedSessions = sessionsCount ?? DEMO_SESSIONS;

  /* ── section builder (matches S19 exactly) ─────────────────── */
  const Section = ({ label, children }) => (
    <div style={{ marginBottom: 26 }}>
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
        {label}
      </ACLabel>
      <div style={{
        marginTop: 10,
        background: c.card,
        borderRadius: ACRadii.card,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );

  /* ── generic row (matches S19 button rows) ─────────────────── */
  const Row = ({ title, desc, onClick, first, right, left }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        borderTop: first ? 'none' : `1px solid ${c.hair}`,
        width: '100%', textAlign: 'left',
        background: 'transparent',
        borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: c.fg }}>{title}</div>
        {desc && <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>{desc}</ACLabel>}
      </div>
      {right}
    </button>
  );

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
              Account
            </div>
          </div>
        </div>
      </div>

      {/* ── scrollable content ─────────────────────────────────── */}
      <div style={{
        flex: 1, minHeight: 0,
        overflow: 'auto', WebkitOverflowScrolling: 'touch',
        padding: '14px 22px 20px',
      }}>
        {/* ── 1. Email ────────────────────────────────────────── */}
        <Section label="Email">
          <Row
            first
            title={resolvedEmail}
            desc="Primary email address"
            onClick={safe(onChangeEmail)}
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ACChip dark={dark}>Change</ACChip>
                <Chevron color={c.mute} />
              </div>
            }
          />
        </Section>

        {/* ── 2. Password ─────────────────────────────────────── */}
        <Section label="Password">
          <Row
            first
            title="Change password"
            desc="Last changed 90+ days ago"
            onClick={safe(onChangePassword)}
            right={<Chevron color={c.mute} />}
          />
        </Section>

        {/* ── 3. Two-factor authentication ────────────────────── */}
        <Section label="Two-factor authentication">
          <Row
            first
            title="Two-factor authentication"
            desc={resolved2FA ? 'App + backup codes' : 'Not enabled · recommended'}
            onClick={safe(onToggle2FA)}
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ACChip accent={resolved2FA} dark={dark} dot>
                  {resolved2FA ? 'Enabled' : 'Disabled'}
                </ACChip>
                <Toggle
                  on={resolved2FA}
                  accent={c.accent}
                  track={c.faint}
                  thumb={dark ? c.paper : c.ink}
                />
              </div>
            }
          />
        </Section>

        {/* ── 4. Linked accounts ──────────────────────────────── */}
        <Section label="Linked accounts">
          {resolvedProviders.map((p, i) => {
            const connected = !!p.connected;
            return (
              <Row
                key={p.id}
                first={i === 0}
                title={p.name}
                desc={connected ? 'Connected' : 'Not connected'}
                onClick={connected ? safe(onUnlinkProvider, p.id) : safe(onLinkProvider, p.id)}
                left={<ProviderIcon id={p.id} c={c} />}
                right={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: connected ? c.accent : c.mute,
                      flexShrink: 0,
                    }} />
                    <ACChip accent={connected} dark={dark}>
                      {connected ? 'Unlink' : 'Link'}
                    </ACChip>
                    <Chevron color={c.mute} />
                  </div>
                }
              />
            );
          })}
        </Section>

        {/* ── 5. Active sessions ──────────────────────────────── */}
        <Section label="Active sessions">
          <Row
            first
            title={`${resolvedSessions} active ${resolvedSessions === 1 ? 'device' : 'devices'}`}
            desc="Manage signed-in devices"
            onClick={safe(onManageSessions)}
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ACChip dark={dark}>{resolvedSessions}</ACChip>
                <Chevron color={c.mute} />
              </div>
            }
          />
        </Section>
      </div>
    </div>
  );
}

export default S63_Account_Settings;
