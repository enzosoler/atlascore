import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function NotifMark({ kind, c }) {
  const maps = {
    brief:   { bg: c.accent, fg: c.ink,  g: 'B' },
    pr:      { bg: c.fg,     fg: c.bg,   g: 'PR' },
    labs:    { bg: c.accent, fg: c.ink,  g: 'Lb' },
    protein: { bg: c.fg,     fg: c.bg,   g: 'F' },
  };
  const m = maps[kind] || maps.brief;
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 6,
      background: m.bg, color: m.fg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700,
      letterSpacing: -0.2,
    }}>
      {m.g}
    </div>
  );
}

function Toggle({ on, c, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: 44, height: 26, borderRadius: 999,
      background: on ? c.accent : c.faint,
      position: 'relative', cursor: 'pointer',
      transition: 'background 160ms ease',
      flexShrink: 0, border: 'none', padding: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: 999,
        background: on ? c.ink : c.bg,
        transition: 'left 160ms ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

/**
 * S22_Notifications — notification preferences + recent list.
 *
 * Gallery:    <S22_Notifications dark />
 * Production: <S22_Notifications dark prefs={obj} notifications={[...]} onToggle={fn} onMarkAllRead={fn} onOpen={fn} />
 *
 * onToggle(key: string, newValue: boolean) — called on each pref toggle
 * onMarkAllRead() — called when "Mark all read" is tapped
 * onOpen(notification) — called when a notification row is tapped
 * prefs — controlled prefs object; falls back to local state if omitted
 */
function S22_Notifications({
  dark = false,
  showTabBar = false,
  prefs: prefsProp,
  notifications,
  onToggle,
  onMarkAllRead,
  onOpen,
}) {
  const [localPrefs, setLocalPrefs] = React.useState({
    brief: true, pr: true, protein: true, labs: true, sleep: false, social: false,
  });
  // Controlled if prefsProp provided, local otherwise
  const prefs = prefsProp ?? localPrefs;

  function handleToggle(key) {
    const newValue = !prefs[key];
    if (!prefsProp) setLocalPrefs((p) => ({ ...p, [key]: newValue }));
    onToggle?.(key, newValue);
  }

  const c = useACT(dark);
  const recent = notifications || [
    { t: 'Daily brief · ready',       d: 'Readiness 87 · three moves queued',              ago: '7m',  kind: 'brief',   fresh: true },
    { t: 'Lab panel in',              d: 'Function Q2 · 3 flags need attention',           ago: '2h',  kind: 'labs',    fresh: true },
    { t: 'PR window open',            d: 'Deadlift +10 projected · your bar is warm',      ago: '4h',  kind: 'pr' },
    { t: 'Protein below pace',        d: '92g / 186g · 10h left in day',                    ago: 'Yest', kind: 'protein' },
    { t: 'Bench press PR · 275 lb',   d: 'You moved 10 lb over last ceiling',               ago: '7d',  kind: 'pr' },
  ];
  const _recent = notifications || recent;
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Notifications</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Only what moves you
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 999, background: c.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: 999, background: c.accent,
          }} />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Recent list */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>Recent · 7 days</ACLabel>
            <button type="button" onClick={onMarkAllRead} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>Mark all read</ACLabel>
            </button>
          </div>
          <div style={{ background: c.card, borderRadius: ACRadii.card, overflow: 'hidden' }}>
            {_recent.map((n, i) => (
              <button key={i} type="button" onClick={() => onOpen?.(n)} style={{
                display: 'block', width: '100%', background: 'none', border: 'none',
                borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
                padding: 0, cursor: onOpen ? 'pointer' : 'default', textAlign: 'left',
              }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px',
              }}>
                <NotifMark kind={n.kind} c={c} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 8,
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.1 }}>
                      {n.t}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {n.fresh && <div style={{ width: 6, height: 6, borderRadius: 999, background: c.accent }} />}
                      <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, letterSpacing: 0.3 }}>{n.ago}</span>
                    </div>
                  </div>
                  <ACLabel size={12} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{n.d}</ACLabel>
                </div>
              </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>Preferences</ACLabel>
          <div style={{
            marginTop: 10, background: c.card, borderRadius: ACRadii.card, overflow: 'hidden',
          }}>
            {[
              { k: 'brief',   t: 'Morning brief',    d: '7:30 AM · your daily plan' },
              { k: 'pr',      t: 'PR windows',       d: 'When your lifts look primed' },
              { k: 'protein', t: 'Fuel nudges',      d: 'If you fall behind target pace' },
              { k: 'labs',    t: 'Lab results',      d: 'New biomarkers in your inbox' },
              { k: 'sleep',   t: 'Sleep reminder',   d: 'Wind-down 30 min before bedtime' },
              { k: 'social',  t: 'Friends\' PRs',    d: 'When your crew hits a record' },
            ].map((r, i) => (
              <div key={r.k} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 500, color: c.fg }}>{r.t}</div>
                  <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>{r.d}</ACLabel>
                </div>
                <Toggle on={prefs[r.k]} c={c} onClick={() => handleToggle(r.k)} />
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 16, padding: 14, borderRadius: ACRadii.card,
          border: `1px dashed ${c.faint}`, textAlign: 'center',
        }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.6 }}>
            We only ping you for signals worth acting on. No streaks. No guilt. No badges.
          </ACLabel>
        </div>
      </div>

      {showTabBar ? <ACTabBar active="today" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}

export default S22_Notifications;
