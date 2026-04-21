import React, { useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';
import { useT } from '@/lib/i18nContext';

/**
 * S65_Danger_Zone — Destructive actions with escalating confirmation.
 *
 * Gallery:    <S65_Danger_Zone dark />
 * Production: Settings → Danger zone
 *
 * Three escalating tiers:
 *  1. Export data   (safe — accent-colored, no destruction)
 *  2. Reset data    (destructive — wipes logs, keeps account, two-tap confirm)
 *  3. Delete account (terminal — requires typing email to enable delete)
 *
 * @param {object}   props
 * @param {boolean}  props.dark            — light/dark variant
 * @param {string}   props.userEmail       — current user email for delete confirmation
 * @param {function} props.onExportData    — export handler
 * @param {function} props.onResetData     — reset handler (fires after second confirm tap)
 * @param {function} props.onDeleteAccount — delete handler (fires after email match + tap)
 * @param {function} props.onBack          — back navigation
 */
function S65_Danger_Zone({
  dark = false,
  userEmail = 'marcus@kane.co',
  onExportData,
  onResetData,
  onDeleteAccount,
  onBack,
}) {
  const c = useACT(dark);
  const t = useT();
  const DANGER = '#c2391a';
  const DANGER_FAINT = dark ? 'rgba(194,57,26,0.15)' : 'rgba(194,57,26,0.08)';
  const DANGER_HAIR = dark ? 'rgba(194,57,26,0.30)' : 'rgba(194,57,26,0.20)';

  // Reset: two-tap confirm state
  const [resetConfirm, setResetConfirm] = useState(false);

  // Delete: email typing state
  const [typedEmail, setTypedEmail] = useState('');
  const emailMatch =
    typedEmail.trim().toLowerCase() === (userEmail || '').trim().toLowerCase() &&
    typedEmail.trim().length > 0;

  const handleExport = () => { try { onExportData?.(); } catch { /* safe */ } };
  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    try { onResetData?.(); } catch { /* safe */ }
    setResetConfirm(false);
  };
  const handleDelete = () => {
    if (!emailMatch) return;
    try { onDeleteAccount?.(); } catch { /* safe */ }
  };

  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
      background: c.bg, color: c.fg,
    }}>
      {/* header bar */}
      <div style={{
        padding: '14px 22px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button type="button" onClick={() => { try { onBack?.(); } catch { /* safe */ } }} style={{
          width: 28, height: 28, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ACLabel size={11} color={DANGER} style={{
          fontFamily: ACFonts.mono, letterSpacing: 0.5, fontWeight: 700,
          textTransform: 'uppercase',
        }}>
          {t('dangerZone.header')}
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* title */}
      <div style={{ padding: '14px 22px 6px' }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
          letterSpacing: -0.8, color: c.fg, lineHeight: 1.1,
        }}>
          {t('dangerZone.title')}
        </div>
        <div style={{
          marginTop: 6, fontSize: 13.5, color: c.dim, lineHeight: 1.5,
        }}>
          {t('dangerZone.subtitle')}
        </div>
      </div>

      {/* scrollable content */}
      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto',
        WebkitOverflowScrolling: 'touch', padding: '14px 22px 32px',
      }}>

        {/* ── 1. Export data (SAFE) ─────────────────── */}
        <ACLabel size={10} color={c.dim} style={{
          fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3,
          textTransform: 'uppercase', marginLeft: 2,
        }}>
          {t('dangerZone.sections.safe')}
        </ACLabel>
        <div style={{
          marginTop: 10, background: c.card, borderRadius: ACRadii.card,
          overflow: 'hidden',
        }}>
          <button type="button" onClick={handleExport} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 16px', width: '100%', textAlign: 'left',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}>
            {/* download icon */}
            <div style={{
              width: 32, height: 32, borderRadius: ACRadii.chip,
              background: dark ? 'rgba(232,181,0,0.12)' : 'rgba(232,181,0,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v9M4 8l4 4 4-4" stroke={c.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" stroke={c.accent} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 15, fontWeight: 500, color: c.fg,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {t('dangerZone.export.title')}
              </div>
              <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>
                {t('dangerZone.export.description')}
              </ACLabel>
            </div>
            <svg width="10" height="12" viewBox="0 0 10 12" style={{ flexShrink: 0 }}>
              <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── 2. Reset data (DESTRUCTIVE) ───────────── */}
        <div style={{ marginTop: 28 }}>
          <ACLabel size={10} color={DANGER} style={{
            fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7,
            textTransform: 'uppercase', marginLeft: 2,
          }}>
            {t('dangerZone.sections.destructive')}
          </ACLabel>
          <div style={{
            marginTop: 10, background: DANGER_FAINT,
            border: `1px solid ${DANGER_HAIR}`,
            borderRadius: ACRadii.card, padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* warning icon */}
              <div style={{
                width: 28, height: 28, borderRadius: ACRadii.chip,
                background: dark ? 'rgba(194,57,26,0.20)' : 'rgba(194,57,26,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 12H1L7 1Z" stroke={DANGER} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                  <path d="M7 5.5v3" stroke={DANGER} strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="7" cy="10.2" r="0.7" fill={DANGER} />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: DANGER,
                  letterSpacing: -0.1,
                }}>
                  {t('dangerZone.reset.title')}
                </div>
                <div style={{
                  marginTop: 4, fontSize: 13, color: c.dim, lineHeight: 1.5,
                }}>
                  {t('dangerZone.reset.description')}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <ACBtn
                dark={dark}
                size="md"
                block
                onClick={handleReset}
                style={{
                  background: resetConfirm
                    ? DANGER
                    : (dark ? 'rgba(194,57,26,0.18)' : 'rgba(194,57,26,0.12)'),
                  color: resetConfirm ? '#fff' : DANGER,
                  border: resetConfirm ? 'none' : `1px solid ${DANGER_HAIR}`,
                  fontWeight: 700,
                }}
              >
                {resetConfirm ? t('dangerZone.reset.confirm') : t('dangerZone.reset.action')}
              </ACBtn>
            </div>
            {resetConfirm && (
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <button type="button" onClick={() => setResetConfirm(false)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '4px 8px',
                }}>
                  <ACLabel size={11} color={c.dim} style={{
                    fontFamily: ACFonts.mono, letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}>
                    {t('common.cancel')}
                  </ACLabel>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Delete account (TERMINAL) ──────────── */}
        <div style={{ marginTop: 28 }}>
          <ACLabel size={10} color={DANGER} style={{
            fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7,
            textTransform: 'uppercase', marginLeft: 2,
          }}>
            {t('dangerZone.sections.terminal')}
          </ACLabel>
          <div style={{
            marginTop: 10,
            background: dark ? 'rgba(194,57,26,0.10)' : 'rgba(194,57,26,0.05)',
            border: `1px solid ${DANGER}`,
            borderRadius: ACRadii.card, padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* skull/x icon */}
              <div style={{
                width: 28, height: 28, borderRadius: ACRadii.chip,
                background: DANGER,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: DANGER,
                  letterSpacing: -0.1,
                }}>
                  Delete account permanently
                </div>
                <div style={{
                  marginTop: 4, fontSize: 13, color: c.dim, lineHeight: 1.5,
                }}>
                  Removes your account, all data, cancels subscriptions. Your email becomes available to sign up again. Permanent. No recovery.
                </div>
              </div>
            </div>

            {/* email confirmation input */}
            <div style={{ marginTop: 14 }}>
              <ACLabel size={10} color={c.mute} style={{
                fontFamily: ACFonts.mono, letterSpacing: 0.5,
                textTransform: 'uppercase', display: 'block', marginBottom: 6,
              }}>
                Type your email to confirm
              </ACLabel>
              <input
                type="email"
                value={typedEmail}
                onChange={(e) => setTypedEmail(e.target.value)}
                placeholder={userEmail}
                autoComplete="off"
                style={{
                  width: '100%', height: 46, borderRadius: ACRadii.input,
                  background: dark ? 'rgba(194,57,26,0.08)' : 'rgba(194,57,26,0.04)',
                  border: `1px solid ${typedEmail.length > 0 && !emailMatch ? DANGER_HAIR : DANGER_HAIR}`,
                  color: c.fg, padding: '0 14px',
                  fontFamily: ACFonts.mono, fontSize: 14,
                  letterSpacing: 0.2, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {typedEmail.length > 0 && !emailMatch && (
                <ACMono size={10} color={DANGER} style={{ marginTop: 4, display: 'block' }}>
                  Email does not match
                </ACMono>
              )}
            </div>

            <div style={{ marginTop: 14 }}>
              <ACBtn
                dark={dark}
                size="md"
                block
                onClick={handleDelete}
                style={{
                  background: emailMatch ? DANGER : (dark ? 'rgba(194,57,26,0.12)' : 'rgba(194,57,26,0.08)'),
                  color: emailMatch ? '#fff' : (dark ? 'rgba(194,57,26,0.40)' : 'rgba(194,57,26,0.35)'),
                  border: emailMatch ? 'none' : `1px solid ${DANGER_HAIR}`,
                  fontWeight: 700,
                  cursor: emailMatch ? 'pointer' : 'not-allowed',
                  opacity: emailMatch ? 1 : 0.6,
                }}
              >
                Delete my account permanently
              </ACBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S65_Danger_Zone;
