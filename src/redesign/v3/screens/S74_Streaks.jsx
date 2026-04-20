/**
 * S74_Streaks -- adherence streaks with 3-stage gift reveal.
 *
 * Replaces v2 StreaksDetail.jsx. Uses the v3 paper design system exclusively.
 * Pattern: S2_Today_A (dashboard modules) + S30_Weekly_Recap (editorial feel).
 *
 * This is a GIFT MOMENT per CLAUDE.md S12: streak/adherence update.
 * 3-stage reveal:
 *   1. Anticipation: "Counting your days..." spinner
 *   2. Reveal: hero flame card + heatmap fade in
 *   3. Celebration: per-track streaks + rules appear
 *
 * Gallery:    <S74_Streaks dark />
 * Production: <S74_Streaks dark={false} streaks={{current, longest, heatmap, tracks}}
 *               onLogSomething={fn} onBack={fn} />
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=false]
 * @param {object}   [props.streaks] - {current, longest, heatmap: [{date, level}], tracks: [{id, label, current, best}]}
 * @param {function} [props.onLogSomething]
 * @param {function} [props.onBack]
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACNum, ACBtn, ACChip,
} from '../lib/paper.jsx';

/* ── DEMO data (gallery fallback) ──────────────────────────── */
const DEMO_STREAKS = {
  current: 14,
  longest: 31,
  heatmap: (() => {
    const cells = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 41; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Simulate activity: recent days active, older days mixed
      let level = 0;
      if (i < 14) level = Math.min(4, Math.floor(Math.random() * 3) + 2);
      else if (i < 28) level = Math.floor(Math.random() * 4);
      else level = Math.floor(Math.random() * 2);
      cells.push({ date: d.toISOString().slice(0, 10), level });
    }
    return cells;
  })(),
  tracks: [
    { id: 'training',  label: 'Training',  current: 14, best: 31 },
    { id: 'nutrition', label: 'Nutrition',  current: 11, best: 22 },
    { id: 'logging',   label: 'Logging',    current: 14, best: 31 },
    { id: 'sleep',     label: 'Sleep',      current: 9,  best: 18 },
  ],
};

/* ── heatmap level colors (theme-aware) ────────────────────── */
function levelColor(level, c) {
  // Using accent (amber) for intensity ramp
  switch (level) {
    case 0: return c.hair;
    case 1: return `${c.accent}30`;
    case 2: return `${c.accent}55`;
    case 3: return `${c.accent}88`;
    case 4: return c.accent;
    default: return c.hair;
  }
}

/* ── safe handler wrapper ──────────────────────────────────── */
const safe = (fn, ...args) => { if (typeof fn === 'function') fn(...args); };

/* ── flame icon SVG ────────────────────────────────────────── */
function FlameIcon({ size = 36, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <path
        d="M18 4c0 0-8 8-8 16a8 8 0 0 0 16 0c0-4-2-7-4-9 0 0 0 4-2 6-1-3-2-8-2-13z"
        fill={color}
        fillOpacity="0.9"
      />
      <path
        d="M18 32a6 6 0 0 0 6-6c0-3-2-5.5-4-7 0 0 .5 3-1 4.5C18 21 17 18 17 18s-5 5-5 8a6 6 0 0 0 6 6z"
        fill={color}
        fillOpacity="0.5"
      />
    </svg>
  );
}

/* ── track icon helper ─────────────────────────────────────── */
function TrackIcon({ id, size = 18, color, accent }) {
  const sw = 1.8;
  if (id === 'training') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <rect x="2" y="6" width="3" height="6" rx="1" stroke={color} strokeWidth={sw} />
        <rect x="13" y="6" width="3" height="6" rx="1" stroke={color} strokeWidth={sw} />
        <line x1="5" y1="9" x2="13" y2="9" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'nutrition') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="6" stroke={color} strokeWidth={sw} />
        <circle cx="9" cy="9" r="2" fill={accent} opacity="0.4" />
      </svg>
    );
  }
  if (id === 'logging') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2" width="12" height="14" rx="2" stroke={color} strokeWidth={sw} />
        <line x1="6" y1="6" x2="12" y2="6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1="6" y1="9" x2="10" y2="9" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'sleep') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <path d="M12 4a6 6 0 1 0 0 10 5 5 0 0 1 0-10z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      </svg>
    );
  }
  // fallback
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6" stroke={color} strokeWidth={sw} />
      <circle cx="9" cy="9" r="2" fill={accent} />
    </svg>
  );
}

/* ── main component ────────────────────────────────────────── */
export default function S74_Streaks({
  dark = false,
  streaks,
  onLogSomething,
  onBack,
}) {
  const c = useACT(dark);
  const data = streaks || DEMO_STREAKS;

  const hasData = data &&
    typeof data === 'object' &&
    (typeof data.current === 'number' || typeof data.longest === 'number');

  /* ── 3-stage gift reveal ─────────────────────────────────── */
  const [phase, setPhase] = useState(0); // 0=anticipation, 1=reveal, 2=celebration
  const timerRef = useRef(null);

  useEffect(() => {
    if (!hasData) { setPhase(2); return; }
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [hasData]);

  const cur = typeof data?.current === 'number' ? data.current : 0;
  const best = typeof data?.longest === 'number' ? data.longest : 0;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* top bar */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={() => safe(onBack)} style={{
          width: 28, height: 28, borderRadius: 999,
          background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Streaks</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* scroll area */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 28px', position: 'relative' }}>

        {/* ── PHASE 0: Anticipation overlay ── */}
        {phase === 0 && hasData && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: dark ? 'rgba(10,10,10,0.92)' : 'rgba(239,233,218,0.92)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 999,
              border: `2px solid ${c.faint}`,
              borderTopColor: c.accent,
              animation: 's74-spin 0.9s linear infinite',
            }} />
            <div style={{
              marginTop: 16, fontFamily: ACFonts.mono, fontSize: 11,
              color: c.mute, letterSpacing: 0.8, textTransform: 'uppercase',
            }}>
              Counting your days...
            </div>
            <style>{`@keyframes s74-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {hasData ? (
          <>
            {/* ── PHASE 1: Reveal — hero flame card + heatmap ── */}
            <div style={{
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}>
              {/* Hero flame card (inverted bg) */}
              <div style={{
                padding: 22, borderRadius: ACRadii.card,
                background: c.fg, color: c.bg,
                display: 'flex', alignItems: 'center', gap: 18,
              }}>
                {/* Flame circle */}
                <div className="s74-flame" style={{
                  width: 72, height: 72, borderRadius: 9999, flexShrink: 0,
                  background: `radial-gradient(circle at 50% 55%, ${c.accent}44 0%, ${c.accent}0A 70%)`,
                  border: `1px solid ${c.accent}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FlameIcon size={36} color={c.accent} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ACLabel size={10} color={dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)'} style={{
                    fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase', fontWeight: 700,
                  }}>
                    Current streak
                  </ACLabel>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <ACNum size={48} color={c.bg} weight={700}>{cur}</ACNum>
                    <span style={{
                      fontFamily: ACFonts.body, fontSize: 16, fontWeight: 600,
                      color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)',
                    }}>
                      {cur === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <ACMono size={11} color={dark ? 'rgba(10,10,10,0.50)' : 'rgba(239,233,218,0.50)'}>
                      Longest ever:{' '}
                      <span style={{ color: c.bg, fontWeight: 700 }}>
                        {best} {best === 1 ? 'day' : 'days'}
                      </span>
                    </ACMono>
                  </div>
                </div>
              </div>

              {/* 6-week heatmap */}
              <div style={{ marginTop: 16 }}>
                <ACLabel size={10} color={c.mute} style={{
                  fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase', fontWeight: 700,
                }}>
                  Activity · last 6 weeks
                </ACLabel>
                <HeatmapGrid heatmap={data.heatmap || []} c={c} />
              </div>
            </div>

            {/* ── PHASE 2: Celebration — per-track streaks + rules ── */}
            <div style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}>
              {/* Per-track streaks */}
              <div style={{ marginTop: 20 }}>
                <ACLabel size={10} color={c.mute} style={{
                  fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase', fontWeight: 700,
                }}>
                  Tracked streaks
                </ACLabel>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(data.tracks || []).map((track) => (
                    <div key={track.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px', borderRadius: ACRadii.card,
                      background: c.card,
                    }}>
                      {/* Icon badge */}
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: dark ? `${c.accent}14` : `${c.accent}0C`,
                        border: `1px solid ${c.accent}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <TrackIcon id={track.id} size={18} color={c.accent} accent={c.accent} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
                          letterSpacing: -0.2, color: c.fg,
                        }}>
                          {track.label}
                        </div>
                        <div style={{ marginTop: 2 }}>
                          <ACMono size={11} color={c.mute}>
                            Current{' '}
                            <span style={{ color: c.fg, fontWeight: 700 }}>
                              {typeof track.current === 'number' ? track.current : '\u2014'}
                            </span>
                            {'  \u00b7  '}Best{' '}
                            <span style={{ color: c.fg, fontWeight: 700 }}>
                              {typeof track.best === 'number' ? track.best : '\u2014'}
                            </span>
                          </ACMono>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules callout card */}
              <div style={{
                marginTop: 20, padding: 18, borderRadius: ACRadii.card,
                background: c.card, borderLeft: `3px solid ${c.accent}`,
              }}>
                <ACLabel size={10} color={c.accent} style={{
                  fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
                }}>
                  How streaks work
                </ACLabel>
                <div style={{
                  marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  {[
                    'A day counts if you log at least 1 workout or 1 meal entry.',
                    'Rest days preserve your streak if your plan prescribes rest.',
                    'Missing a full day resets the current streak, but your longest stays on record.',
                    'Streaks are calculated in your local timezone.',
                  ].map((rule, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10 }}>
                      <ACMono size={10} color={c.mute} style={{ flexShrink: 0, marginTop: 2 }}>
                        {String(i + 1).padStart(2, '0')}
                      </ACMono>
                      <div style={{
                        fontSize: 13, fontFamily: ACFonts.body,
                        color: c.dim, lineHeight: 1.5,
                      }}>
                        {rule}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ── Empty state ─────────────────────────────────── */
          <div style={{
            marginTop: 24, padding: 24, borderRadius: ACRadii.card,
            background: c.card, textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 9999,
              background: `${c.accent}14`,
              border: `1px solid ${c.accent}33`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
            }}>
              <FlameIcon size={28} color={c.accent} />
            </div>
            <div style={{
              marginTop: 14, fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
              letterSpacing: -0.5, color: c.fg,
            }}>
              Your first streak starts today.
            </div>
            <div style={{
              marginTop: 6, fontSize: 13, color: c.dim, lineHeight: 1.5, maxWidth: 280, margin: '6px auto 0',
            }}>
              Log a workout or a meal to light the flame. One honest day is enough to start the count.
            </div>
            <div style={{ marginTop: 16 }}>
              <ACBtn primary dark={dark} size="md" pill onClick={() => safe(onLogSomething)}>
                Log something
              </ACBtn>
            </div>

            {/* Rules card — always visible, even in empty state */}
            <div style={{
              marginTop: 20, padding: 18, borderRadius: ACRadii.card,
              background: dark ? 'rgba(239,233,218,0.04)' : 'rgba(10,10,10,0.03)',
              textAlign: 'left',
            }}>
              <ACLabel size={10} color={c.accent} style={{
                fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
              }}>
                How streaks work
              </ACLabel>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'A day counts if you log at least 1 workout or 1 meal entry.',
                  'Rest days preserve your streak if your plan prescribes rest.',
                  'Missing a full day resets the current streak, but your longest stays on record.',
                  'Streaks are calculated in your local timezone.',
                ].map((rule, i) => (
                  <div key={i} style={{
                    fontSize: 13, fontFamily: ACFonts.body,
                    color: c.dim, lineHeight: 1.5,
                  }}>
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flame animation */}
      <style>{`
        @keyframes s74-flicker {
          0%, 100% { transform: scale(1);    }
          50%      { transform: scale(1.04); }
        }
        .s74-flame { animation: s74-flicker 2600ms ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .s74-flame { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Heatmap subcomponent ──────────────────────────────────── */

function HeatmapGrid({ heatmap, c }) {
  const WEEKS = 6;
  const DAYS = WEEKS * 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build 42-day grid ending today
  const gridDates = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    gridDates.push(d);
  }

  const levelMap = new Map();
  (heatmap || []).forEach((cell) => {
    if (cell && cell.date) {
      levelMap.set(cell.date, Math.max(0, Math.min(4, Number(cell.level) || 0)));
    }
  });

  // Layout as 6 columns (weeks) x 7 rows (days)
  const columns = Array.from({ length: WEEKS }, (_, col) =>
    Array.from({ length: 7 }, (_, row) => gridDates[col * 7 + row])
  );

  return (
    <div style={{
      marginTop: 10, padding: 14, borderRadius: ACRadii.card, background: c.card,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${WEEKS}, 1fr)`,
        gap: 5,
      }}>
        {columns.map((col, ci) => (
          <div key={ci} style={{
            display: 'grid',
            gridTemplateRows: 'repeat(7, 1fr)',
            gap: 4,
          }}>
            {col.map((d, ri) => {
              const iso = d.toISOString().slice(0, 10);
              const level = levelMap.get(iso) ?? 0;
              return (
                <span
                  key={ri}
                  aria-label={`${iso} \u2014 level ${level}`}
                  title={`${iso} \u2014 level ${level}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: 4,
                    background: levelColor(level, c),
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{
        marginTop: 10, display: 'flex', alignItems: 'center', gap: 5,
        justifyContent: 'flex-end',
      }}>
        <ACMono size={9} color={c.mute}>Less</ACMono>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} aria-hidden style={{
            width: 10, height: 10, borderRadius: 3,
            background: levelColor(l, c),
          }} />
        ))}
        <ACMono size={9} color={c.mute}>More</ACMono>
      </div>
    </div>
  );
}
