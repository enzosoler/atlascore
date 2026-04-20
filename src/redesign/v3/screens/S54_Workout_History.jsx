import React, { useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACNum, ACChip, ACBtn,
} from '../lib/paper.jsx';

/* ── demo data (gallery fallback) ─────────────────────────────── */

const DEMO_SESSIONS = [
  { id: 'w-001', name: 'Heavy Lower',         date: '2026-04-18T09:30:00', duration: 58, volume: 18420, exerciseCount: 5, prCount: 1 },
  { id: 'w-002', name: 'Upper Push · Moderate', date: '2026-04-16T10:00:00', duration: 52, volume: 14200, exerciseCount: 6, prCount: 0 },
  { id: 'w-003', name: 'Pull + Arms',          date: '2026-04-14T08:45:00', duration: 61, volume: 16800, exerciseCount: 7, prCount: 2 },
  { id: 'w-004', name: 'Heavy Upper',          date: '2026-04-11T09:00:00', duration: 55, volume: 15100, exerciseCount: 5, prCount: 1 },
  { id: 'w-005', name: 'Lower Hypertrophy',    date: '2026-04-09T10:15:00', duration: 48, volume: 20300, exerciseCount: 6, prCount: 0 },
  { id: 'w-006', name: 'Heavy Lower',          date: '2026-04-07T09:30:00', duration: 56, volume: 17900, exerciseCount: 5, prCount: 0 },
  { id: 'w-007', name: 'Upper Push · Moderate', date: '2026-03-28T10:00:00', duration: 50, volume: 13800, exerciseCount: 6, prCount: 1 },
  { id: 'w-008', name: 'Pull + Arms',          date: '2026-03-26T08:45:00', duration: 59, volume: 16200, exerciseCount: 7, prCount: 0 },
  { id: 'w-009', name: 'Heavy Lower',          date: '2026-03-21T09:30:00', duration: 54, volume: 17100, exerciseCount: 5, prCount: 0 },
  { id: 'w-010', name: 'Upper Push · Moderate', date: '2026-03-19T10:00:00', duration: 51, volume: 13500, exerciseCount: 6, prCount: 0 },
];

const DEMO_HEATMAP = (() => {
  // 84 cells (12 weeks x 7 days), 0-3 intensity
  const h = new Array(84).fill(0);
  // scatter workouts across the grid — recent weeks are denser
  [2,4,6, 9,11,13, 16,18,20, 23,25,27, 30,32,34, 37,39, 44,46, 51,53, 58,60, 65, 72, 79].forEach((i) => { h[i] = 2; });
  [4,13,20,32,46].forEach((i) => { h[i] = 3; });
  [1,8,15,22,29,36,43,50,57,64,71,78].forEach((i) => { if (h[i] === 0) h[i] = 1; });
  return h;
})();

const DEMO_STATS = { totalSessions: 87, totalVolumeKg: 142600, avgPerWeek: 4.2 };

/**
 * S54_Workout_History — chronological session log with 12-week heatmap.
 *
 * Gallery:    <S54_Workout_History dark />
 * Production: <S54_Workout_History dark sessions={[...]} heatmap={[...84]}
 *               stats={{totalSessions, totalVolumeKg, avgPerWeek}}
 *               onOpenSession={fn} onBack={fn} />
 *
 * onOpenSession(id) — tap a session row
 * onBack()         — back navigation
 */
export default function S54_Workout_History({
  dark = false,
  sessions,
  heatmap,
  stats,
  onOpenSession,
  onBack,
}) {
  const c = useACT(dark);
  const _sessions = sessions || DEMO_SESSIONS;
  const _heatmap  = Array.isArray(heatmap) && heatmap.length === 84 ? heatmap : DEMO_HEATMAP;
  const _stats    = stats || DEMO_STATS;

  const handleOpen = (id) => { if (typeof onOpenSession === 'function') onOpenSession(id); };
  const handleBack = ()   => { if (typeof onBack === 'function') onBack(); };

  /* group sessions by month */
  const grouped = useMemo(() => {
    const by = {};
    for (const s of _sessions) {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!by[key]) by[key] = { label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), items: [] };
      by[key].items.push(s);
    }
    return Object.keys(by).sort().reverse().map((k) => by[k]);
  }, [_sessions]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* ── nav bar ────────────────────────────────────────── */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button" onClick={handleBack}
          style={{
            width: 28, height: 28, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Training log
        </ACLabel>
        <div style={{ width: 28 }} />{/* spacer */}
      </div>

      {/* ── scrollable content ─────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 28px' }}>

        {/* ── title ──────────────────────────────────────── */}
        <div style={{
          fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
          letterSpacing: -0.8, lineHeight: 1.1, color: c.fg,
        }}>
          History
        </div>

        {/* ── 12-week heatmap ────────────────────────────── */}
        <div style={{
          marginTop: 18, padding: 16, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Last 12 weeks
            </ACLabel>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <ACMono size={9} color={c.mute}>Less</ACMono>
              {[0,1,2,3].map((lv) => (
                <div key={lv} style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: heatColor(lv, c),
                }} />
              ))}
              <ACMono size={9} color={c.mute}>More</ACMono>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(12, minmax(0, 1fr))`,
            gap: 3,
          }}>
            {Array.from({ length: 12 }).map((_, col) => (
              <div key={col} style={{ display: 'grid', gap: 3 }}>
                {Array.from({ length: 7 }).map((__, row) => {
                  const idx = col * 7 + row;
                  return (
                    <div key={idx} style={{
                      aspectRatio: '1 / 1',
                      borderRadius: 2,
                      background: heatColor(_heatmap[idx], c),
                    }} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── stat cells ─────────────────────────────────── */}
        <div style={{
          marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        }}>
          <StatCell label="Sessions" value={_stats.totalSessions} dark={dark} c={c} />
          <StatCell label="Volume" value={formatBig(_stats.totalVolumeKg)} unit="kg" dark={dark} c={c} />
          <StatCell label="Avg / week" value={_stats.avgPerWeek} dark={dark} c={c} />
        </div>

        {/* ── session list by month ──────────────────────── */}
        <div style={{ marginTop: 24 }}>
          {_sessions.length === 0 ? (
            <div style={{
              padding: 28, background: c.card, borderRadius: ACRadii.card, textAlign: 'center',
            }}>
              <div style={{ fontFamily: ACFonts.display, fontSize: 17, fontWeight: 700, color: c.fg, letterSpacing: -0.3 }}>
                No sessions yet
              </div>
              <ACLabel size={12} color={c.dim} style={{ marginTop: 6, display: 'block' }}>
                Completed workouts will appear here, newest first.
              </ACLabel>
            </div>
          ) : grouped.map((group) => (
            <div key={group.label} style={{ marginBottom: 22 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 10,
              }}>
                <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                  {group.label}
                </ACLabel>
                <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono }}>
                  {group.items.length} session{group.items.length !== 1 ? 's' : ''}
                </ACLabel>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.items.map((s) => (
                  <SessionRow key={s.id} s={s} c={c} dark={dark} onTap={() => handleOpen(s.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── sub-components ───────────────────────────────────────────── */

function StatCell({ label, value, unit, c }) {
  return (
    <div style={{
      padding: 14, background: c.card, borderRadius: ACRadii.card,
    }}>
      <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </ACLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
        <span style={{
          fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
          letterSpacing: -0.6, color: c.fg, fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
        {unit && <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>{unit}</span>}
      </div>
    </div>
  );
}

function SessionRow({ s, c, dark, onTap }) {
  const d = new Date(s.date);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const day     = d.getDate();
  const month   = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return (
    <button
      type="button" onClick={onTap}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', background: c.card, borderRadius: ACRadii.card,
        border: 'none', cursor: 'pointer', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent', color: c.fg,
      }}
    >
      {/* date chip */}
      <div style={{
        width: 42, textAlign: 'center', flexShrink: 0,
      }}>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.5, color: c.mute, fontWeight: 600 }}>
          {weekday}
        </div>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
          fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4, color: c.fg,
        }}>
          {day}
        </div>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.3, color: c.mute }}>
          {month}
        </div>
      </div>

      {/* separator */}
      <div style={{ width: 1, alignSelf: 'stretch', background: c.hair }} />

      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: ACFonts.display, fontSize: 15, fontWeight: 600,
            letterSpacing: -0.2, color: c.fg,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {s.name}
          </span>
          {s.prCount > 0 && (
            <span style={{
              padding: '2px 7px', fontSize: 9, fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
              background: c.accent, color: c.ink, borderRadius: 4,
              flexShrink: 0,
            }}>
              {s.prCount} PR
            </span>
          )}
        </div>
        <div style={{
          marginTop: 3, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.2, display: 'flex', gap: 6,
        }}>
          {s.duration != null && <span>{s.duration} min</span>}
          {s.volume != null && <><span style={{ color: c.hair }}>|</span><span>{formatBig(s.volume)} kg</span></>}
          {s.exerciseCount != null && <><span style={{ color: c.hair }}>|</span><span>{s.exerciseCount} lifts</span></>}
        </div>
      </div>

      {/* chevron */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
        <path d="M4.5 2.5l3.5 3.5-3.5 3.5" stroke={c.fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function heatColor(v, c) {
  if (v === 3) return c.accent;
  if (v === 2) return c.fg;
  if (v === 1) return c.faint;
  return c.hair;
}

function formatBig(n) {
  if (typeof n !== 'number') return n;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n * 10) / 10);
}
