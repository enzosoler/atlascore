import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACChip, ACTabBar, CaptureIcon,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

/* ──────────────────────────────────────────────────────────────────────────
 * Mock data (gallery preview). When props are undefined, these render — this
 * preserves the exact look of the design gallery before data-wiring.
 * ──────────────────────────────────────────────────────────────────────── */
const MOCK_MACROS = {
  kcal:    { current: 1842, target: 2380 },
  protein: { current: 148,  target: 186 },
  carbs:   { current: 224,  target: 286 },
  fat:     { current: 62,   target: 79 },
};

const MOCK_MEALS = [
  {
    id: 'mock-breakfast',
    slot: 'breakfast',
    time: '08:12',
    items: [
      { id: 'b1', name: 'Greek yogurt, Fage 0%', qty: '1 cup',          kcal: 140, p: 0, c: 0, f: 0 },
      { id: 'b2', name: 'Overnight oats',        qty: 'Homemade · 85g', kcal: 312, p: 0, c: 0, f: 0 },
      { id: 'b3', name: 'Blueberries',           qty: 'Fresh · ¾ cup',  kcal: 42,  p: 0, c: 0, f: 0 },
      { id: 'b4', name: 'Peanut butter',         qty: '2 tbsp',         kcal: 188, p: 0, c: 0, f: 0 },
      { id: 'b5', name: 'Coffee w/ milk',        qty: '350 ml',         kcal: 160, p: 0, c: 0, f: 0 },
    ],
  },
  {
    id: 'mock-lunch',
    slot: 'lunch',
    time: '12:45',
    items: [
      { id: 'l1', name: 'Chicken rice bowl', qty: 'Sweetgreen', kcal: 580, p: 0, c: 0, f: 0 },
      { id: 'l2', name: 'Apple',             qty: '1 medium',   kcal: 95,  p: 0, c: 0, f: 0 },
      { id: 'l3', name: 'Almonds',           qty: '25g',        kcal: 45,  p: 0, c: 0, f: 0 },
    ],
  },
  {
    id: 'mock-dinner',
    slot: 'dinner',
    time: '—',
    items: [],
  },
];

const SLOT_LABEL = {
  breakfast: 'Breakfast',
  lunch:     'Lunch',
  dinner:    'Dinner',
  snack:     'Snacks',
  snacks:    'Snacks',
};
const SLOT_ORDER = ['breakfast', 'lunch', 'dinner', 'snack', 'snacks'];

function niceDateLabel(d = new Date()) {
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* ──────────────────────────────────────────────────────────────────────────
 * S4 Nutrition — props-driven with mock fallback (gallery parity).
 *
 * Props (all optional — undefined = mock renders):
 *   dark       : boolean
 *   macros     : { kcal:{current,target}, protein:{current,target},
 *                  carbs:{current,target}, fat:{current,target} }
 *   meals      : [{ id, slot:'breakfast'|'lunch'|'dinner'|'snack',
 *                   time?, items:[{id,name,qty,kcal,p,c,f}] }]
 *                 - undefined   → mock meals render (loading)
 *                 - []          → empty-state copy renders (real user, no logs)
 *   onCapture  : (kind:'scan'|'camera'|'voice'|'recents') => void
 * ──────────────────────────────────────────────────────────────────────── */
function S4_Nutrition_A({ dark = false, macros, meals, onCapture, onOpenMeal, onAddToSlot, showTabBar = false }) {
  const c = useACT(dark);

  const isRealData = meals !== undefined || macros !== undefined;
  const m = macros || MOCK_MACROS;
  const renderedMeals = (meals === undefined) ? MOCK_MEALS : meals;

  // Order real-data meals by slot; mock is pre-ordered.
  const sortedMeals = (meals === undefined)
    ? renderedMeals
    : [...renderedMeals].sort((a, b) => {
        const ai = SLOT_ORDER.indexOf(a.slot);
        const bi = SLOT_ORDER.indexOf(b.slot);
        return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      });

  const kcalCurrent = Math.round(m.kcal?.current || 0);
  const kcalTarget  = Math.round(m.kcal?.target  || 0);
  const kcalLeft    = Math.max(0, kcalTarget - kcalCurrent);
  const kcalPct     = kcalTarget > 0 ? Math.min(100, Math.round((kcalCurrent / kcalTarget) * 100)) : 0;

  const macroRows = [
    { k: 'p', label: 'Protein', v: Math.round(m.protein?.current || 0), t: Math.round(m.protein?.target || 0), u: 'g' },
    { k: 'c', label: 'Carbs',   v: Math.round(m.carbs?.current   || 0), t: Math.round(m.carbs?.target   || 0), u: 'g' },
    { k: 'f', label: 'Fat',     v: Math.round(m.fat?.current     || 0), t: Math.round(m.fat?.target     || 0), u: 'g' },
  ];

  // Status chip: only shown when we have a non-zero kcal target
  let statusLabel = 'On track';
  if (isRealData) {
    if (kcalTarget === 0)          statusLabel = 'Set a target';
    else if (kcalCurrent === 0)    statusLabel = 'Log first meal';
    else if (kcalCurrent > kcalTarget) statusLabel = 'Over target';
    else if (kcalPct >= 70)        statusLabel = 'On track';
    else                           statusLabel = 'Below target';
  }

  const handleCapture = (kind) => {
    if (typeof onCapture === 'function') onCapture(kind);
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Eat · {niceDateLabel(new Date())}</ACLabel>
        </div>
        {(statusLabel === 'Log first meal' || statusLabel === 'Set a target') ? (
          <button
            type="button"
            onClick={() => {
              if (statusLabel === 'Log first meal') handleCapture('search');
            }}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: statusLabel === 'Log first meal' ? 'pointer' : 'default',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <ACChip accent dark={dark}>{statusLabel}</ACChip>
          </button>
        ) : (
          <ACChip accent dark={dark}>{statusLabel}</ACChip>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 22px 20px' }}>
        {/* Quick capture row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { t: 'Scan',    k: 'scan' },
            { t: 'Camera',  k: 'camera' },
            { t: 'Voice',   k: 'voice' },
            { t: 'Recents', k: 'recents' },
          ].map(b => (
            <button
              key={b.k}
              type="button"
              onClick={() => handleCapture(b.k)}
              style={{
                flex: 1, padding: '14px 0 12px', borderRadius: ACRadii.input,
                background: c.card, border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                color: c.fg, WebkitTapHighlightColor: 'transparent',
              }}
            >
              <CaptureIcon k={b.k} color={c.fg} accent={c.accent} />
              <ACLabel size={11} color={c.fg} style={{ fontWeight: 500 }}>{b.t}</ACLabel>
            </button>
          ))}
        </div>

        <div style={{ padding: 20, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <ACLabel size={11} color={c.dim}>Intake · kcal</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <ACNum size={54} color={c.fg} weight={700}>{kcalCurrent.toLocaleString()}</ACNum>
                <ACLabel size={13} color={c.dim}>/ {kcalTarget ? kcalTarget.toLocaleString() : '—'}</ACLabel>
              </div>
            </div>
            <div style={{ textAlign: 'right', paddingBottom: 10 }}>
              <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>
                {kcalTarget > 0 ? `${kcalLeft.toLocaleString()} left` : 'No target'}
              </ACLabel>
              <div style={{ marginTop: 4 }}>
                <ACLabel size={11} color={c.dim}>{kcalTarget > 0 ? `${kcalPct}%` : '—'}</ACLabel>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {macroRows.map(row => {
              const pct = row.t > 0 ? Math.min(100, (row.v / row.t) * 100) : 0;
              return (
                <div key={row.k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <ACLabel size={12} color={c.dim}>{row.label}</ACLabel>
                    <span style={{ fontSize: 12, color: c.fg }}>
                      <b style={{ fontWeight: 600 }}>{row.v}</b>
                      <span style={{ opacity: 0.5 }}>{row.u} / {row.t || '—'}{row.t ? row.u : ''}</span>
                    </span>
                  </div>
                  <div style={{ height: 6, background: c.faint, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', inset: 0, width: `${pct}%`,
                      background: row.k === 'p' ? c.accent : c.fg,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meals */}
        {(() => {
          // Real-data empty state: user has logged nothing today.
          if (meals !== undefined && sortedMeals.length === 0) {
            return (
              <div style={{
                marginTop: 22, padding: '28px 20px', background: c.card,
                borderRadius: ACRadii.card, textAlign: 'center',
              }}>
                <div style={{ fontFamily: ACFonts.display, fontSize: 16, fontWeight: 600, color: c.fg, marginBottom: 6 }}>
                  Nothing logged yet
                </div>
                <ACLabel size={12} color={c.dim}>
                  Tap a capture button to start your day's fuel log.
                </ACLabel>
              </div>
            );
          }

          return sortedMeals.map((meal, mi) => {
            const items = Array.isArray(meal.items) ? meal.items : [];
            const kcalSum = items.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
            const name = SLOT_LABEL[meal.slot] || meal.slot || 'Meal';
            const empty = items.length === 0;
            return (
              <div key={meal.id || mi} style={{ marginTop: 22 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <div style={{ fontFamily: ACFonts.display, fontSize: 17, fontWeight: 600, color: c.fg }}>
                      {name}
                    </div>
                    {meal.time ? <ACLabel size={11} color={c.dim}>{meal.time}</ACLabel> : null}
                  </div>
                  <ACLabel size={12} color={empty ? c.mute : c.fg} style={{ fontWeight: 500 }}>
                    {empty ? 'Empty' : `${Math.round(kcalSum)} kcal`}
                  </ACLabel>
                </div>
                {items.map((it, i) => (
                  <button key={it.id || i} type="button" onClick={() => onOpenMeal?.(it.id || it.name)} style={{
                    display: 'flex', padding: '12px 0', alignItems: 'flex-start',
                    background: 'transparent', border: 'none', borderTop: `1px solid ${c.hair}`,
                    width: '100%', textAlign: 'left', cursor: onOpenMeal ? 'pointer' : 'default',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14.5, color: c.fg }}>{it.name || it.t}</div>
                      <ACLabel size={11} color={c.dim}>{it.qty || it.d || ''}</ACLabel>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>
                      {Math.round(Number(it.kcal) || 0)}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleCapture('scan')}
                  style={{
                    padding: '12px 0', display: 'flex', alignItems: 'center', gap: 10,
                    color: c.accent, fontSize: 13, fontWeight: 600, borderTop: `1px solid ${c.hair}`,
                    cursor: onCapture ? 'pointer' : 'default',
                    background: 'transparent', borderRight: 'none', borderBottom: 'none', borderLeft: 'none', width: '100%', textAlign: 'left',
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: c.accent, color: c.ink, textAlign: 'center', lineHeight: '20px', fontSize: 16, fontWeight: 600 }}>+</span>
                  Add to {name.toLowerCase()}
                </button>
              </div>
            );
          });
        })()}
      </div>

      {showTabBar ? <ACTabBar active="eat" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}

export default S4_Nutrition_A;
