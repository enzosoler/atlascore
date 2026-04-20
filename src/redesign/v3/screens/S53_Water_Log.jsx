import React, { useState, useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACMono, ACBtn, ACChip, ACRing,
} from '../lib/paper.jsx';

/**
 * S53_Water_Log — water intake tracker with progress ring + quick-add.
 *
 * Replaces v2 WaterLog.jsx with the v3 paper+ink+amber design system.
 * Circular progress ring showing current ml vs target. Quick-add grid
 * (Glass/Cup/Bottle). Today's entry timeline (reverse chronological).
 * Undo last button. Editable daily target.
 *
 * Gallery:    <S53_Water_Log dark />
 * Production: <S53_Water_Log dark
 *               entries={[...]} target={2500}
 *               onAdd={fn} onUndo={fn} onEditTarget={fn} onBack={fn} />
 */

/* ── DEMO data (gallery fallback) ─────────────────────────────── */

const DEMO_ENTRIES = [
  { id: 'w1', ml: 500, createdAt: '2026-04-20T07:15:00' },
  { id: 'w2', ml: 250, createdAt: '2026-04-20T09:30:00' },
  { id: 'w3', ml: 200, createdAt: '2026-04-20T11:45:00' },
  { id: 'w4', ml: 500, createdAt: '2026-04-20T13:20:00' },
  { id: 'w5', ml: 250, createdAt: '2026-04-20T15:40:00' },
];

const DEMO_TARGET = 2500;

const QUICK_ADD = [
  { id: 'glass',  label: 'Glass',  ml: 250 },
  { id: 'cup',    label: 'Cup',    ml: 200 },
  { id: 'bottle', label: 'Bottle', ml: 500 },
];

/* ── Helpers ───────────────────────────────────────────────────── */

function formatTime(ts) {
  if (!ts) return '\u2014';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* ── Water drop icon (inline SVG) ─────────────────────────────── */

function WaterDropIcon({ size = 18, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2 C10 2 4 9 4 13a6 6 0 0 0 12 0c0-4-6-11-6-11Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ── Custom progress ring (water-specific, thicker) ───────────── */

function WaterRing({ size = 180, total, target, dark }) {
  const c = useACT(dark);
  const pct = target > 0 ? Math.min(1, total / target) : 0;
  const thickness = 14;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const fill = pct * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ display: 'block' }}>
        {/* Background track */}
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={dark ? 'rgba(239,233,218,0.10)' : 'rgba(10,10,10,0.08)'}
          strokeWidth={thickness}
        />
        {/* Filled arc */}
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={c.accent}
          strokeWidth={thickness}
          strokeDasharray={`${fill} ${circ}`}
          strokeDashoffset={circ * 0.25}
          transform={`rotate(-90 ${cx} ${cx})`}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dasharray 320ms ease' }}
        />
        {/* Tick marks */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
          const x1 = cx + Math.cos(a) * (r + thickness / 2 + 2);
          const y1 = cx + Math.sin(a) * (r + thickness / 2 + 2);
          const x2 = cx + Math.cos(a) * (r + thickness / 2 + 5);
          const y2 = cx + Math.sin(a) * (r + thickness / 2 + 5);
          return (
            <line
              key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={dark ? 'rgba(239,233,218,0.20)' : 'rgba(10,10,10,0.15)'}
              strokeWidth="1"
            />
          );
        })}
      </svg>
      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <ACNum size={40} color={c.fg} weight={700}>
          {total.toLocaleString()}
        </ACNum>
        <ACLabel size={12} color={c.dim} style={{ marginTop: 4 }}>
          of {target.toLocaleString()} ml
        </ACLabel>
        <ACMono size={10} color={c.accent} style={{ marginTop: 4, fontWeight: 600 }}>
          {Math.round(pct * 100)}%
        </ACMono>
      </div>
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────────── */

export default function S53_Water_Log({
  dark = false,
  entries,
  target,
  onAdd,
  onUndo,
  onEditTarget,
  onBack,
}) {
  const c = useACT(dark);

  const activeEntries = entries || DEMO_ENTRIES;
  const activeTarget = target || DEMO_TARGET;

  const total = useMemo(
    () => activeEntries.reduce((s, e) => s + (e.ml || 0), 0),
    [activeEntries],
  );

  const [editingTarget, setEditingTarget] = useState(false);
  const [draftTarget, setDraftTarget] = useState(activeTarget);

  const handleBack = () => { if (typeof onBack === 'function') onBack(); };
  const handleAdd = (ml) => { if (typeof onAdd === 'function') onAdd(ml); };
  const handleUndo = () => { if (typeof onUndo === 'function') onUndo(); };
  const handleEditTarget = (ml) => { if (typeof onEditTarget === 'function') onEditTarget(ml); };

  function saveTarget() {
    const n = parseInt(draftTarget, 10);
    if (!n || n <= 0) return;
    handleEditTarget(n);
    setEditingTarget(false);
  }

  // Reversed chronological timeline
  const timeline = useMemo(
    () => [...activeEntries].reverse(),
    [activeEntries],
  );

  // Status determination
  const pct = activeTarget > 0 ? Math.round((total / activeTarget) * 100) : 0;
  let statusLabel = 'Start hydrating';
  if (pct >= 100) statusLabel = 'Target reached';
  else if (pct >= 70) statusLabel = 'Almost there';
  else if (pct >= 30) statusLabel = 'Keep going';
  else if (total > 0) statusLabel = 'Just started';

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            width: 28, height: 28, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Water</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* ── Scrollable body ──────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 22px 24px' }}>

        {/* ── State header ───────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <ACLabel size={11} color={c.dim}>Hydration</ACLabel>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
              letterSpacing: -0.8, color: c.fg, marginTop: 4,
            }}>
              Today's water
            </div>
          </div>
          <ACChip accent={pct >= 100} dark={dark} dot={pct >= 100}>
            {statusLabel}
          </ACChip>
        </div>

        {/* ── Progress ring ──────────────────────────────────── */}
        <div style={{
          padding: '28px 20px', background: c.card, borderRadius: ACRadii.card,
          textAlign: 'center', marginBottom: 18,
        }}>
          <WaterRing size={180} total={total} target={activeTarget} dark={dark} />

          {/* Edit target toggle */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            {!editingTarget ? (
              <button
                type="button"
                onClick={() => { setDraftTarget(activeTarget); setEditingTarget(true); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 999,
                  background: c.faint, border: 'none',
                  color: c.dim, fontSize: 12, fontWeight: 600,
                  fontFamily: ACFonts.body,
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" stroke={c.dim} strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                Edit target
              </button>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={draftTarget}
                  onChange={(e) => setDraftTarget(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="2000"
                  style={{
                    width: 80, height: 32, borderRadius: 999,
                    background: c.faint,
                    border: `1px solid ${c.accent}`,
                    color: c.fg, padding: '0 10px',
                    fontSize: 13, fontWeight: 600,
                    fontFamily: ACFonts.mono,
                    textAlign: 'center', outline: 'none',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
                <ACLabel size={11} color={c.dim}>ml</ACLabel>
                <ACBtn primary dark={dark} size="sm" pill onClick={saveTarget}>Save</ACBtn>
                <button
                  type="button"
                  onClick={() => setEditingTarget(false)}
                  style={{
                    background: 'none', border: 'none', padding: '6px 8px',
                    color: c.dim, fontSize: 12, fontWeight: 600,
                    fontFamily: ACFonts.body, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick-add grid ─────────────────────────────────── */}
        <div style={{ marginBottom: 18 }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>
            QUICK ADD
          </ACMono>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {QUICK_ADD.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAdd(p.ml)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '16px 8px',
                  borderRadius: ACRadii.card, background: c.card,
                  border: 'none', cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <WaterDropIcon size={20} color={c.accent} />
                <span style={{
                  fontFamily: ACFonts.body, fontSize: 13, fontWeight: 700,
                  letterSpacing: -0.1, color: c.fg,
                }}>
                  {p.label}
                </span>
                <ACMono size={10} color={c.dim}>{p.ml} ml</ACMono>
              </button>
            ))}
          </div>
        </div>

        {/* ── Today's timeline ───────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACMono size={9} color={c.dim} track={2}>TODAY</ACMono>
            {activeEntries.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 999,
                  background: c.faint, border: 'none',
                  color: c.dim, fontSize: 11, fontWeight: 600,
                  fontFamily: ACFonts.body,
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 5h5a3 3 0 1 1 0 6H5" stroke={c.dim} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 3L2 5l2 2" stroke={c.dim} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Undo last
              </button>
            )}
          </div>

          {activeEntries.length === 0 ? (
            <div style={{
              padding: '28px 20px', background: c.card,
              borderRadius: ACRadii.card, textAlign: 'center',
            }}>
              <div style={{ marginBottom: 10 }}>
                <WaterDropIcon size={28} color={c.accent} />
              </div>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 15, fontWeight: 600, color: c.fg,
              }}>
                Nothing logged yet
              </div>
              <ACLabel size={12} color={c.dim} style={{ marginTop: 4, display: 'block' }}>
                Tap a preset above to log your first drink.
              </ACLabel>
            </div>
          ) : (
            <div style={{ background: c.card, borderRadius: ACRadii.card, overflow: 'hidden' }}>
              {timeline.map((e, i) => (
                <div
                  key={e.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8,
                      background: dark ? 'rgba(232,181,0,0.12)' : 'rgba(232,181,0,0.10)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <WaterDropIcon size={14} color={c.accent} />
                    </div>
                    <ACMono size={12} color={c.dim} style={{ fontWeight: 500 }}>
                      {formatTime(e.createdAt)}
                    </ACMono>
                  </div>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700,
                    color: c.fg, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {e.ml} <span style={{ fontSize: 11, color: c.dim, fontWeight: 500 }}>ml</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Trajectory / insight ─────────────────────────────── */}
        {total > 0 && activeTarget > 0 && (
          <div style={{
            marginTop: 18, padding: '14px 16px', borderRadius: ACRadii.card,
            border: `1px dashed ${c.faint}`,
          }}>
            <ACMono size={10} color={c.accent} track={2} style={{ display: 'block', marginBottom: 4 }}>
              INSIGHT
            </ACMono>
            <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
              {pct >= 100
                ? 'Target reached. Consistent hydration supports recovery and metabolic function.'
                : `${Math.max(0, activeTarget - total).toLocaleString()} ml remaining. ${
                    pct >= 70
                      ? 'One more bottle gets you there.'
                      : 'Steady intake through the afternoon keeps recovery on track.'
                  }`
              }
            </ACLabel>
          </div>
        )}
      </div>
    </div>
  );
}
