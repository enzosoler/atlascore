import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACChip,
} from '../lib/paper.jsx';

/**
 * S41_Errors — system error/edge states (sync conflict, 500, rate limit, offline queue).
 *
 * Gallery:    <S41_Errors dark />
 * Production: Used per-tab — each sub-component can be imported individually,
 *             or the full tabbed view shown for diagnostics.
 *
 * Props:
 *   dark           — light/dark variant
 *   initialTab     — 'conflict' | 'server' | 'limit' | 'offline'
 *   conflicts      — [{src, t, reps, w, rpe}] conflicting sets; falls back to demo
 *   offlineQueue   — [{t, at}] items waiting to sync; falls back to demo
 *   onBack         — back navigation
 *   onRetry({tab}) — retry action; tab = 'server' | 'offline'
 *   onResolve(item)— resolve conflict with the selected conflict item
 *   onKeepBoth()   — keep both conflicting sets
 *   onNotifyReady()— rate limit: notify when ready
 */
function S41_Errors({
  dark = false,
  initialTab = 'conflict',
  conflicts,
  offlineQueue,
  onBack,
  onRetry,
  onResolve,
  onKeepBoth,
  onNotifyReady,
}) {
  const [tab, setTab] = React.useState(initialTab);
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onBack} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>EDGES · ERRORS</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* state switcher */}
      <div style={{ padding: '14px 22px 8px' }}>
        <div style={{ padding: 4, display: 'flex', gap: 2, background: c.card, borderRadius: 999 }}>
          {[
            { k: 'conflict', l: 'Conflict' },
            { k: 'server',   l: '500' },
            { k: 'limit',    l: 'Rate' },
            { k: 'offline',  l: 'Queue' },
          ].map(t => (
            <button key={t.k} type="button" onClick={() => setTab(t.k)} style={{
              flex: 1, padding: '8px 0', textAlign: 'center',
              background: t.k === tab ? c.fg : 'transparent',
              color: t.k === tab ? c.bg : c.dim,
              fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
              letterSpacing: 0.5, borderRadius: 999, cursor: 'pointer',
              textTransform: 'uppercase', border: 'none',
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 22px' }}>
        {tab === 'conflict' && <ErrConflict c={c} dark={dark} conflicts={conflicts} onResolve={onResolve} onKeepBoth={onKeepBoth} />}
        {tab === 'server'   && <ErrServer c={c} dark={dark} onRetry={() => onRetry?.({ tab: 'server' })} />}
        {tab === 'limit'    && <ErrLimit c={c} dark={dark} onNotifyReady={onNotifyReady} />}
        {tab === 'offline'  && <ErrOffline c={c} dark={dark} offlineQueue={offlineQueue} onRetry={() => onRetry?.({ tab: 'offline' })} />}
      </div>
    </div>
  );
}

const DEMO_CONFLICTS = [
  { src: 'Watch', t: '15:42', reps: 1, w: 415, rpe: 9.0 },
  { src: 'Phone', t: '15:43', reps: 2, w: 415, rpe: 8.5 },
];

function ErrConflict({ c, dark, conflicts, onResolve, onKeepBoth }) {
  const items = conflicts || DEMO_CONFLICTS;
  const [selected, setSelected] = React.useState(items[0]?.src ?? null);
  const selectedItem = items.find((r) => r.src === selected) ?? items[0];

  return (
    <div>
      <ACLabel size={10} color="#c2391a" style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
        Sync conflict
      </ACLabel>
      <div style={{
        marginTop: 8, fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
        letterSpacing: -1, lineHeight: 1.05, color: c.fg,
      }}>
        Same set, two devices.
      </div>
      <div style={{ marginTop: 8, fontSize: 13.5, color: c.dim, lineHeight: 1.5 }}>
        You logged set 4 of deadlift on your watch and again on phone. Pick which to keep — we won't guess on lift data.
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((r) => {
          const isSelected = r.src === selected;
          return (
            <button key={r.src} type="button" onClick={() => setSelected(r.src)} style={{
              padding: 16, borderRadius: ACRadii.card,
              border: isSelected ? `2px solid ${c.accent}` : `1px solid ${c.hair}`,
              background: c.card, width: '100%', textAlign: 'left', cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                  {r.src} · logged {r.t}
                </ACLabel>
                {isSelected && <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.5 }}>KEEP</ACLabel>}
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <div>
                  <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>REPS × WEIGHT</ACLabel>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700,
                    letterSpacing: -0.7, color: c.fg, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {r.reps} × {r.w}<span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, marginLeft: 3 }}>lb</span>
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>RPE</ACLabel>
                  <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, color: c.fg, letterSpacing: -0.5 }}>{r.rpe}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 22 }}>
        <ACBtn primary dark={dark} size="lg" pill block onClick={() => onResolve?.(selectedItem)}>
          Keep {selected?.toLowerCase()} · discard other
        </ACBtn>
      </div>
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <button type="button" onClick={() => onKeepBoth?.(items)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            Keep both as separate sets
          </ACLabel>
        </button>
      </div>
    </div>
  );
}

function ErrServer({ c, dark, onRetry }) {
  return (
    <div style={{ padding: '30px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <svg width="220" height="46" viewBox="0 0 220 46" style={{ marginBottom: 26 }}>
        <line x1="0" x2="70" y1="23" y2="23" stroke={c.dim} strokeWidth="1.4"/>
        <path d="M70 23 L82 23 L88 6 L96 40 L104 14 L112 23 L130 23" stroke={c.mute} strokeWidth="1.4" fill="none" opacity="0.4"/>
        <line x1="130" x2="220" y1="23" y2="23" stroke="#c2391a" strokeWidth="1.4" strokeDasharray="3 3"/>
      </svg>
      <ACLabel size={10} color="#c2391a" style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
        Error · 500
      </ACLabel>
      <div style={{
        marginTop: 12, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
        letterSpacing: -1.2, lineHeight: 1.02, color: c.fg, textAlign: 'center',
      }}>
        Our side<br/>went <span style={{ color: '#c2391a' }}>flat.</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 13.5, color: c.dim, lineHeight: 1.55, maxWidth: 260 }}>
        We failed to reach the server. Your log is safe on this device — we'll retry the moment we're back.
      </div>

      <div style={{
        marginTop: 26, padding: 14, background: c.card, borderRadius: ACRadii.card, width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6 }}>REQ ID</ACLabel>
          <ACLabel size={9} color={c.fg} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6 }}>r-87b-41d2-c0a9</ACLabel>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6 }}>TIME</ACLabel>
          <ACLabel size={9} color={c.fg} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6 }}>15:42:08 UTC</ACLabel>
        </div>
      </div>

      <div style={{ marginTop: 22, width: '100%' }}>
        <ACBtn primary dark={dark} size="lg" pill block onClick={onRetry}>Retry</ACBtn>
      </div>
      <div style={{ marginTop: 10 }}>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Copy ID · contact support
        </ACLabel>
      </div>
    </div>
  );
}

function ErrLimit({ c, dark, onNotifyReady }) {
  return (
    <div>
      <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
        Coach · rate limit
      </ACLabel>
      <div style={{
        marginTop: 8, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
        letterSpacing: -1.2, lineHeight: 1.02, color: c.fg,
      }}>
        Take the rest.
      </div>
      <div style={{ marginTop: 10, fontSize: 13.5, color: c.dim, lineHeight: 1.55, maxWidth: 280 }}>
        You've asked the coach twelve questions in the last hour. That's plenty. New question in 00:14:22.
      </div>

      <div style={{
        marginTop: 22, padding: 22, background: c.fg, color: c.bg,
        borderRadius: ACRadii.card, textAlign: 'center',
      }}>
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          Resets in
        </ACLabel>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.display, fontSize: 58, fontWeight: 700,
          letterSpacing: -2.6, lineHeight: 1, color: c.bg,
          fontVariantNumeric: 'tabular-nums',
        }}>
          14<span style={{ color: c.accent }}>:</span>22
        </div>
        <ACLabel size={10} color={dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)'} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, marginTop: 8, display: 'block', textTransform: 'uppercase' }}>
          MM : SS
        </ACLabel>
      </div>

      <div style={{ marginTop: 22 }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          Still available
        </ACLabel>
        <div style={{ marginTop: 10 }}>
          {[
            'Log workouts and nutrition',
            'Read the daily brief',
            'Browse your labs + history',
            'Search the library',
          ].map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6L4 9L11 2" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ flex: 1, fontSize: 13, color: c.fg }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <ACBtn dark={dark} size="lg" pill block onClick={onNotifyReady}>Notify me when ready</ACBtn>
      </div>
    </div>
  );
}

const DEMO_QUEUE = [
  { t: 'Deadlift · set 4 · 415×1', at: '15:42' },
  { t: 'Deadlift · set 5 · 415×1', at: '15:47' },
  { t: 'Nutrition · chicken · 6 oz',    at: '12:41' },
  { t: 'Bodyweight · 182.4 lb',     at: '08:02' },
  { t: 'Sleep sync · 7:42',         at: '07:00' },
];

function ErrOffline({ c, dark, offlineQueue, onRetry }) {
  const queue = offlineQueue || DEMO_QUEUE;
  return (
    <div>
      <style>{`@keyframes ac-spin { to { transform: rotate(360deg); } }`}</style>
      <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
        Offline · queue
      </ACLabel>
      <div style={{
        marginTop: 8, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
        letterSpacing: -1.2, lineHeight: 1.02, color: c.fg,
      }}>
        Five things<br/>waiting.
      </div>
      <div style={{ marginTop: 10, fontSize: 13.5, color: c.dim, lineHeight: 1.55, maxWidth: 280 }}>
        You're offline — all data still saves locally. The moment we reconnect, this queue flushes.
      </div>

      <div style={{
        marginTop: 22, padding: 16, background: c.card, borderRadius: ACRadii.card,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 18 }}>
          {[3, 6, 9, 12].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: c.faint }} />
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>No connection</div>
          <ACLabel size={11} color={c.dim} style={{ marginTop: 1, display: 'block', fontFamily: ACFonts.mono, letterSpacing: 0.3 }}>
            Retrying every 30s
          </ACLabel>
        </div>
        <div style={{
          width: 14, height: 14, borderRadius: 999,
          border: `2px solid ${c.accent}`, borderTopColor: 'transparent',
          animation: 'ac-spin 1.2s linear infinite',
        }} />
      </div>

      <div style={{ marginTop: 22 }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          Queue · {queue.length} item{queue.length !== 1 ? 's' : ''}
        </ACLabel>
        <div style={{ marginTop: 10 }}>
          {queue.map((q, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <div style={{ width: 8, height: 8, background: c.accent, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: c.fg, fontWeight: 500, letterSpacing: -0.1 }}>{q.t}</div>
              </div>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4 }}>{q.at}</ACLabel>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <ACBtn dark={dark} size="lg" pill block onClick={onRetry}>Retry now</ACBtn>
      </div>
    </div>
  );
}

export default S41_Errors;
