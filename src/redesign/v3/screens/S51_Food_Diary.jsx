import React, { useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACMono, ACChip, ACBtn,
} from '../lib/paper.jsx';

/**
 * S51_Food_Diary — historical food diary with date navigation.
 *
 * Replaces v2 FoodDiary.jsx with the v3 paper+ink+amber design system.
 * Meals grouped by slot (breakfast/lunch/dinner/snacks), each with item
 * name + calories. Daily macro totals strip. Date picker with arrows
 * and Today chip.
 *
 * Gallery:    <S51_Food_Diary dark />
 * Production: <S51_Food_Diary dark date="2026-04-20"
 *               meals={[...]} totals={{...}}
 *               onPickDate={fn} onOpenMeal={fn} onOpenItem={fn}
 *               onCapture={fn} onBack={fn} />
 */

/* ── DEMO data (gallery fallback) ─────────────────────────────── */

const DEMO_DATE = '2026-04-20';

const DEMO_MEALS = [
  {
    id: 'demo-breakfast',
    slot: 'breakfast',
    items: [
      { id: 'b1', name: 'Greek yogurt, Fage 0%', portion: '1 cup',          kcal: 140, protein: 20, carbs: 8,  fat: 0 },
      { id: 'b2', name: 'Overnight oats',        portion: 'Homemade · 85g', kcal: 312, protein: 10, carbs: 48, fat: 8 },
      { id: 'b3', name: 'Blueberries',           portion: 'Fresh · 3/4 cup',kcal: 42,  protein: 1,  carbs: 11, fat: 0 },
      { id: 'b4', name: 'Coffee w/ milk',         portion: '350 ml',         kcal: 60,  protein: 3,  carbs: 5,  fat: 2 },
    ],
  },
  {
    id: 'demo-lunch',
    slot: 'lunch',
    items: [
      { id: 'l1', name: 'Chicken rice bowl', portion: 'Sweetgreen', kcal: 580, protein: 42, carbs: 62, fat: 14 },
      { id: 'l2', name: 'Apple',             portion: '1 medium',   kcal: 95,  protein: 0,  carbs: 25, fat: 0  },
    ],
  },
  {
    id: 'demo-dinner',
    slot: 'dinner',
    items: [
      { id: 'd1', name: 'Salmon fillet',  portion: '200g · grilled', kcal: 412, protein: 44, carbs: 0,  fat: 24 },
      { id: 'd2', name: 'Steamed broccoli', portion: '150g',          kcal: 52,  protein: 4,  carbs: 10, fat: 0  },
      { id: 'd3', name: 'Brown rice',      portion: '1 cup cooked',  kcal: 215, protein: 5,  carbs: 45, fat: 2  },
    ],
  },
  {
    id: 'demo-snacks',
    slot: 'snacks',
    items: [
      { id: 's1', name: 'Almonds',        portion: '25g',   kcal: 145, protein: 5, carbs: 5, fat: 12 },
      { id: 's2', name: 'Protein shake',   portion: '1 scoop', kcal: 120, protein: 24, carbs: 3, fat: 1 },
    ],
  },
];

const DEMO_TOTALS = {
  kcal:    { current: 2173, target: 2380 },
  protein: { current: 158,  target: 186  },
  carbs:   { current: 222,  target: 286  },
  fat:     { current: 63,   target: 79   },
};

/* ── Helpers ───────────────────────────────────────────────────── */

const SLOT_LABEL = {
  breakfast: 'Breakfast',
  lunch:     'Lunch',
  dinner:    'Dinner',
  snacks:    'Snacks',
  snack:     'Snacks',
};
const SLOT_ORDER = ['breakfast', 'lunch', 'dinner', 'snacks', 'snack'];

function toISO(d) {
  if (typeof d === 'string') return d;
  const dt = d instanceof Date ? d : new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

function formatDateLabel(iso) {
  const d = fromISO(iso);
  const today = new Date();
  const todayISO = toISO(today);
  const yesterdayISO = addDays(todayISO, -1);
  if (iso === todayISO) return 'Today';
  if (iso === yesterdayISO) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateShort(iso) {
  const d = fromISO(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Component ─────────────────────────────────────────────────── */

export default function S51_Food_Diary({
  dark = false,
  date,
  meals,
  totals,
  onPickDate,
  onOpenMeal,
  onOpenItem,
  onCapture,
  onBack,
}) {
  const c = useACT(dark);

  const activeDate = date || DEMO_DATE;
  const activeMeals = meals || DEMO_MEALS;
  const activeTotals = totals || DEMO_TOTALS;

  const isToday = activeDate === toISO(new Date());

  const sortedMeals = useMemo(() =>
    [...activeMeals].sort((a, b) => {
      const ai = SLOT_ORDER.indexOf(a.slot);
      const bi = SLOT_ORDER.indexOf(b.slot);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    }),
  [activeMeals]);

  const kcalCur = Math.round(activeTotals.kcal?.current || 0);
  const kcalTgt = Math.round(activeTotals.kcal?.target || 0);
  const kcalPct = kcalTgt > 0 ? Math.min(100, Math.round((kcalCur / kcalTgt) * 100)) : 0;

  const macros = [
    { k: 'protein', label: 'P', v: Math.round(activeTotals.protein?.current || 0), t: Math.round(activeTotals.protein?.target || 0) },
    { k: 'carbs',   label: 'C', v: Math.round(activeTotals.carbs?.current || 0),   t: Math.round(activeTotals.carbs?.target || 0)   },
    { k: 'fat',     label: 'F', v: Math.round(activeTotals.fat?.current || 0),     t: Math.round(activeTotals.fat?.target || 0)     },
  ];

  const handlePickDate = (d) => { if (typeof onPickDate === 'function') onPickDate(d); };
  const handleOpenMeal = (id) => { if (typeof onOpenMeal === 'function') onOpenMeal(id); };
  const handleOpenItem = (id) => { if (typeof onOpenItem === 'function') onOpenItem(id); };
  const handleCapture = () => { if (typeof onCapture === 'function') onCapture(); };
  const handleBack = () => { if (typeof onBack === 'function') onBack(); };

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
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Food diary</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* ── State header ─────────────────────────────────────── */}
      <div style={{ padding: '16px 22px 8px' }}>
        <ACLabel size={11} color={c.dim}>Fuel log</ACLabel>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
          letterSpacing: -0.8, color: c.fg, marginTop: 4,
        }}>
          {formatDateLabel(activeDate)}
        </div>
      </div>

      {/* ── Date navigator ───────────────────────────────────── */}
      <div style={{ padding: '0 22px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={() => handlePickDate(addDays(activeDate, -1))}
          aria-label="Previous day"
          style={{
            width: 36, height: 36, borderRadius: 10, background: c.card,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <label style={{
          flex: 1, position: 'relative', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, height: 36, borderRadius: 10,
          background: c.card, cursor: 'pointer',
        }}>
          <ACMono size={12} color={c.fg} style={{ fontWeight: 600 }}>
            {formatDateShort(activeDate)}
          </ACMono>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => { if (e.target.value) handlePickDate(e.target.value); }}
            style={{
              position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer',
              border: 'none', background: 'transparent',
            }}
            aria-label="Pick a date"
          />
        </label>

        <button
          type="button"
          onClick={() => handlePickDate(addDays(activeDate, 1))}
          aria-label="Next day"
          style={{
            width: 36, height: 36, borderRadius: 10, background: c.card,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M3 1l4 4-4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {!isToday && (
          <button
            type="button"
            onClick={() => handlePickDate(toISO(new Date()))}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <ACChip accent dark={dark}>Today</ACChip>
          </button>
        )}
      </div>

      {/* ── Scrollable body ──────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 22px 24px' }}>

        {/* ── Macro totals strip ─────────────────────────────── */}
        <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <ACLabel size={11} color={c.dim}>Total intake</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <ACNum size={42} color={c.fg} weight={700}>{kcalCur.toLocaleString()}</ACNum>
                <ACLabel size={12} color={c.dim}>/ {kcalTgt ? kcalTgt.toLocaleString() : '\u2014'} kcal</ACLabel>
              </div>
            </div>
            <div style={{ textAlign: 'right', paddingBottom: 6 }}>
              <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>
                {kcalTgt > 0 ? `${kcalPct}%` : '\u2014'}
              </ACLabel>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 14, height: 5, background: c.faint, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${kcalPct}%`, height: '100%', background: c.accent,
              borderRadius: 3, transition: 'width 320ms ease',
            }} />
          </div>

          {/* Macro pills */}
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            {macros.map((m) => {
              const pct = m.t > 0 ? Math.min(100, Math.round((m.v / m.t) * 100)) : 0;
              return (
                <div key={m.k} style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
                  <ACLabel size={10} color={c.mute}>{m.label}</ACLabel>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
                    color: c.fg, marginTop: 2, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {m.v}<span style={{ fontSize: 11, color: c.dim, fontWeight: 500 }}>g</span>
                  </div>
                  <div style={{ marginTop: 4, height: 3, background: c.faint, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: m.k === 'protein' ? c.accent : c.fg,
                      borderRadius: 2,
                    }} />
                  </div>
                  <ACMono size={9} color={c.dim} style={{ marginTop: 3 }}>{m.v}/{m.t}g</ACMono>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Meal groups ─────────────────────────────────────── */}
        {sortedMeals.length === 0 ? (
          <div style={{
            padding: '28px 20px', background: c.card,
            borderRadius: ACRadii.card, textAlign: 'center',
          }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 16, fontWeight: 600, color: c.fg, marginBottom: 6,
            }}>
              Nothing logged
            </div>
            <ACLabel size={12} color={c.dim}>
              No meals recorded for this day.
            </ACLabel>
          </div>
        ) : (
          sortedMeals.map((meal) => {
            const items = Array.isArray(meal.items) ? meal.items : [];
            const mealKcal = items.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
            const slotName = SLOT_LABEL[meal.slot] || meal.slot || 'Meal';
            const empty = items.length === 0;

            return (
              <div key={meal.id} style={{ marginBottom: 18 }}>
                {/* Meal header */}
                <button
                  type="button"
                  onClick={() => handleOpenMeal(meal.id)}
                  style={{
                    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                    width: '100%', padding: '0 0 10px', background: 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 17, fontWeight: 600,
                    color: c.fg, letterSpacing: -0.2,
                  }}>
                    {slotName}
                  </div>
                  <ACLabel size={12} color={empty ? c.mute : c.fg} style={{ fontWeight: 500 }}>
                    {empty ? 'Empty' : `${Math.round(mealKcal)} kcal`}
                  </ACLabel>
                </button>

                {/* Items */}
                {items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => handleOpenItem(it.id)}
                    style={{
                      display: 'flex', width: '100%', padding: '12px 0',
                      alignItems: 'center', background: 'transparent',
                      border: 'none', borderTop: `1px solid ${c.hair}`,
                      cursor: 'pointer', textAlign: 'left', gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14.5, fontWeight: 500, color: c.fg,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {it.name}
                      </div>
                      <ACLabel size={11} color={c.dim}>{it.portion || '\u2014'}</ACLabel>
                    </div>
                    <span style={{
                      fontFamily: ACFonts.display, fontSize: 13, fontWeight: 600,
                      color: c.fg, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                    }}>
                      {Math.round(Number(it.kcal) || 0)}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
                      <path d="M4 2l4 4-4 4" stroke={c.mute} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}

                {/* Add-to-slot action */}
                {empty && (
                  <button
                    type="button"
                    onClick={handleCapture}
                    style={{
                      padding: '12px 0', display: 'flex', alignItems: 'center', gap: 10,
                      color: c.accent, fontSize: 13, fontWeight: 600,
                      borderTop: `1px solid ${c.hair}`,
                      background: 'transparent', border: 'none', borderTopStyle: 'solid',
                      borderTopWidth: 1, borderTopColor: c.hair,
                      width: '100%', textAlign: 'left', cursor: 'pointer',
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 6,
                      background: c.accent, color: c.ink,
                      textAlign: 'center', lineHeight: '20px',
                      fontSize: 16, fontWeight: 600,
                    }}>+</span>
                    Add to {slotName.toLowerCase()}
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* ── Trajectory / insight strip ──────────────────────── */}
        {kcalTgt > 0 && kcalCur > 0 && (
          <div style={{
            marginTop: 4, padding: '14px 16px', borderRadius: ACRadii.card,
            border: `1px dashed ${c.faint}`,
          }}>
            <ACMono size={10} color={c.accent} track={2} style={{ display: 'block', marginBottom: 4 }}>
              INSIGHT
            </ACMono>
            <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
              {kcalCur >= kcalTgt
                ? 'Target reached. Review individual macros to check balance.'
                : `${Math.max(0, kcalTgt - kcalCur).toLocaleString()} kcal remaining. ${
                    macros[0].t > 0 && macros[0].v < macros[0].t
                      ? `Prioritize protein (${macros[0].t - macros[0].v}g left).`
                      : 'Protein on track.'
                  }`
              }
            </ACLabel>
          </div>
        )}
      </div>
    </div>
  );
}
