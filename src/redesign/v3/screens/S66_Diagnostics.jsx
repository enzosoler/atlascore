import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';

/**
 * S66_Diagnostics — Support/debug screen showing app + device info.
 *
 * Gallery:    <S66_Diagnostics dark />
 * Production: Settings → Diagnostics (hidden / support-directed)
 *
 * Sections: App info, Device, Connection, Error log, Actions.
 * All technical values rendered in ACFonts.mono.
 *
 * @param {object}   props
 * @param {boolean}  props.dark              — light/dark variant
 * @param {string}   props.appVersion        — e.g. "2.4.1"
 * @param {string}   props.buildCommit       — full or partial commit hash
 * @param {string}   props.platform          — "ios" | "android" | "web"
 * @param {string}   props.userId            — Supabase user ID (last 8 shown)
 * @param {Array}    props.errors            — [{timestamp, message}] recent session errors
 * @param {function} props.onCopyDiagnostics — assembles all info + copies to clipboard
 * @param {function} props.onContactSupport  — opens support channel
 * @param {function} props.onBack            — back navigation
 */
function S66_Diagnostics({
  dark = false,
  appVersion = '2.4.1',
  buildCommit = 'a1b2c3d4e5f6',
  platform = 'ios',
  userId = '00000000-0000-0000-0000-00000000abcd',
  errors,
  onCopyDiagnostics,
  onContactSupport,
  onBack,
}) {
  const c = useACT(dark);

  // Demo fallback errors
  const errorList = errors || [];

  // Derive device info from browser environment, with safe fallbacks
  const screenSize = (() => {
    try { return `${window.innerWidth} x ${window.innerHeight} @${window.devicePixelRatio || 1}x`; } catch { return 'Unknown'; }
  })();
  const userAgent = (() => {
    try { return navigator.userAgent || 'Unknown'; } catch { return 'Unknown'; }
  })();
  const language = (() => {
    try { return navigator.language || 'Unknown'; } catch { return 'Unknown'; }
  })();
  const timezone = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'Unknown'; }
  })();
  const isOnline = (() => {
    try { return navigator.onLine; } catch { return true; }
  })();

  // Truncate helpers
  const truncate = (str, len) => {
    if (!str || str.length <= len) return str || 'Unknown';
    return str.slice(0, len) + '\u2026';
  };
  const tailId = (id) => {
    if (!id || typeof id !== 'string') return 'Unknown';
    return id.length > 8 ? '\u2026' + id.slice(-8) : id;
  };

  const handleCopy = () => { try { onCopyDiagnostics?.(); } catch { /* safe */ } };
  const handleSupport = () => { try { onContactSupport?.(); } catch { /* safe */ } };

  // Section data
  const sections = [
    {
      label: 'App',
      rows: [
        { k: 'Version',  v: appVersion },
        { k: 'Commit',   v: truncate(buildCommit, 8) },
        { k: 'Platform', v: platform },
      ],
    },
    {
      label: 'Device',
      rows: [
        { k: 'Screen',   v: screenSize },
        { k: 'Agent',    v: truncate(userAgent, 48) },
        { k: 'Language',  v: language },
        { k: 'Timezone',  v: timezone },
      ],
    },
    {
      label: 'Connection',
      rows: [
        { k: 'Status',   v: isOnline ? 'Online' : 'Offline', dot: isOnline ? '#34c759' : '#c2391a' },
        { k: 'Auth',     v: tailId(userId) },
      ],
    },
  ];

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
        <ACLabel size={11} color={c.dim} style={{
          fontFamily: ACFonts.mono, letterSpacing: 0.5, fontWeight: 700,
          textTransform: 'uppercase',
        }}>
          DIAGNOSTICS
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* title */}
      <div style={{ padding: '14px 22px 6px' }}>
        <ACLabel size={11} color={c.dim} style={{
          fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25,
          textTransform: 'uppercase',
        }}>
          Support tools
        </ACLabel>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
          letterSpacing: -0.8, color: c.fg, marginTop: 4, lineHeight: 1.1,
        }}>
          System info
        </div>
        <div style={{
          marginTop: 6, fontSize: 13.5, color: c.dim, lineHeight: 1.5,
        }}>
          Tap "Copy diagnostics" and paste into your support message.
        </div>
      </div>

      {/* scrollable content */}
      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto',
        WebkitOverflowScrolling: 'touch', padding: '14px 22px 32px',
      }}>

        {/* info sections */}
        {sections.map((section, si) => (
          <div key={si} style={{ marginBottom: 26 }}>
            <ACLabel size={10} color={c.dim} style={{
              fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3,
              textTransform: 'uppercase', marginLeft: 2,
            }}>
              {section.label}
            </ACLabel>
            <div style={{
              marginTop: 10, background: c.card, borderRadius: ACRadii.card,
              overflow: 'hidden',
            }}>
              {section.rows.map((row, i) => (
                <div key={row.k} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
                }}>
                  {row.dot && (
                    <div style={{
                      width: 8, height: 8, borderRadius: 999,
                      background: row.dot, flexShrink: 0,
                    }} />
                  )}
                  <div style={{
                    flex: '0 0 auto', minWidth: 80,
                    fontSize: 13, fontWeight: 500, color: c.fg,
                  }}>
                    {row.k}
                  </div>
                  <div style={{
                    flex: 1, minWidth: 0, textAlign: 'right',
                  }}>
                    <ACMono size={12} color={c.dim} style={{
                      wordBreak: 'break-all', lineHeight: 1.4,
                    }}>
                      {row.v || 'Unknown'}
                    </ACMono>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* error log section */}
        <div style={{ marginBottom: 26 }}>
          <ACLabel size={10} color={c.dim} style={{
            fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.3,
            textTransform: 'uppercase', marginLeft: 2,
          }}>
            Error log
          </ACLabel>
          <div style={{
            marginTop: 10, background: c.card, borderRadius: ACRadii.card,
            overflow: 'hidden',
          }}>
            {errorList.length === 0 ? (
              <div style={{
                padding: '18px 16px', textAlign: 'center',
              }}>
                <ACMono size={12} color={c.mute}>
                  No errors this session
                </ACMono>
              </div>
            ) : (
              errorList.slice(0, 10).map((err, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
                }}>
                  <ACMono size={10} color={c.mute} style={{ display: 'block', marginBottom: 3 }}>
                    {err.timestamp || 'Unknown time'}
                  </ACMono>
                  <ACMono size={12} color={'#c2391a'} style={{
                    display: 'block', lineHeight: 1.4, wordBreak: 'break-word',
                  }}>
                    {err.message || 'Unknown error'}
                  </ACMono>
                </div>
              ))
            )}
          </div>
        </div>

        {/* actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ACBtn primary dark={dark} size="lg" pill block onClick={handleCopy}>
            Copy diagnostics
          </ACBtn>
          <ACBtn dark={dark} size="lg" pill block onClick={handleSupport}>
            Contact support
          </ACBtn>
        </div>
      </div>
    </div>
  );
}

export default S66_Diagnostics;
