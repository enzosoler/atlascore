import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';

const DEMO_ITEMS = [
  { t: 'Chicken breast',   v: '6 oz',     k: '280 · 48P · 0C · 6F', edit: true },
  { t: 'Jasmine rice',     v: '1 cup',    k: '205 · 4P · 44C · 0F' },
  { t: 'Broccoli florets', v: '~2 cups',  k: '55 · 4P · 12C · 0F', low: true },
];

const DEMO_MICROS = [
  { k: 'Fiber',  v: '6.2g',   pct: 80, hi: true },
  { k: 'Sodium', v: '420mg',  pct: 18 },
  { k: 'Iron',   v: '2.1mg',  pct: 26 },
  { k: 'Vit K',  v: '218µg',  pct: 100, hi: true },
];

/**
 * S38_Food_Detail — food detail / log confirmation screen.
 *
 * Gallery:    <S38_Food_Detail dark />
 * Production: <S38_Food_Detail dark meal="Lunch" items={[...]} onBack={fn} onConfirm={fn} onSaveAsMeal={fn} />
 *
 * Props:
 *   dark          — light/dark variant
 *   meal          — meal label ('Breakfast', 'Lunch', etc.)
 *   foodTitle     — main heading (e.g. 'Chicken · rice · broccoli')
 *   sourceLabel   — how the food was captured (e.g. 'Photo log · 92% confidence')
 *   calories      — total kcal number
 *   macros        — [{ k, v, u, pct, hi? }] protein/carbs/fat
 *   items         — [{ t, v, k, edit?, low? }] individual food items
 *   micros        — [{ k, v, pct, hi? }] micronutrient highlights
 *   onBack        — back navigation
 *   onConfirm     — confirm + log action
 *   onSaveAsMeal  — save as reusable meal
 *   onEditItem    — edit a specific item (index)
 *   onMore        — three-dot menu
 */
function S38_Food_Detail({
  dark = false,
  meal = 'Lunch',
  foodTitle = 'Chicken · rice · broccoli',
  sourceLabel = 'Photo log · 92% confidence',
  calories = 540,
  macros,
  items,
  micros,
  onBack,
  onConfirm,
  onSaveAsMeal,
  onEditItem,
  onMore,
}) {
  const c = useACT(dark);
  const _macros = macros || [
    { k: 'PROTEIN', v: '48', u: 'g', pct: '36%', hi: true },
    { k: 'CARBS',   v: '52', u: 'g', pct: '38%' },
    { k: 'FAT',     v: '14', u: 'g', pct: '23%' },
  ];
  const _items = items || DEMO_ITEMS;
  const _micros = micros || DEMO_MICROS;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onBack} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>FOOD · {meal.toUpperCase()}</ACLabel>
        <button type="button" onClick={onMore} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="4" height="14" viewBox="0 0 4 14">
            <circle cx="2" cy="2" r="1.6" fill={c.fg}/>
            <circle cx="2" cy="7" r="1.6" fill={c.fg}/>
            <circle cx="2" cy="12" r="1.6" fill={c.fg}/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Heading block */}
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          From your log · 12:41
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700,
          letterSpacing: -1.4, lineHeight: 1.02, color: c.fg,
        }}>
          {foodTitle}
        </div>
        <div style={{
          marginTop: 6, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.3,
        }}>
          MEAL · {_items.length} ITEMS · DETECTED FROM PHOTO
        </div>

        {/* Macro hero — inverted card */}
        <div style={{
          marginTop: 22, padding: 22,
          background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 54, fontWeight: 700,
              letterSpacing: -2.4, lineHeight: 1,
              color: c.accent, fontVariantNumeric: 'tabular-nums',
            }}>{calories}</div>
            <div style={{ fontFamily: ACFonts.mono, fontSize: 12, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)', letterSpacing: 0.4, fontWeight: 600 }}>
              KCAL
            </div>
          </div>

          {/* stacked macro bar */}
          <div style={{ marginTop: 18, height: 10, display: 'flex', gap: 2 }}>
            <div style={{ flex: parseInt(_macros[0]?.pct) || 36, background: c.accent }} />
            <div style={{ flex: parseInt(_macros[1]?.pct) || 38, background: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.6)' }} />
            <div style={{ flex: parseInt(_macros[2]?.pct) || 23, background: dark ? 'rgba(10,10,10,0.3)' : 'rgba(239,233,218,0.35)' }} />
          </div>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {_macros.map((m, i) => (
              <div key={i} style={{
                paddingLeft: i === 0 ? 0 : 14,
                borderLeft: i === 0 ? 'none' : `1px solid ${dark ? 'rgba(10,10,10,0.14)' : 'rgba(239,233,218,0.14)'}`,
              }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)', letterSpacing: 0.7 }}>{m.k}</div>
                <div style={{
                  marginTop: 6, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
                  letterSpacing: -0.7, color: m.hi ? c.accent : c.bg,
                  fontVariantNumeric: 'tabular-nums',
                }}>{m.v}<span style={{ fontSize: 12, fontFamily: ACFonts.mono, color: dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.5)', marginLeft: 2 }}>{m.u}</span></div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: dark ? 'rgba(10,10,10,0.45)' : 'rgba(239,233,218,0.45)', marginTop: 2 }}>{m.pct} of day</div>
              </div>
            ))}
          </div>
        </div>

        {/* Items list */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Items · editable
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {_items.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  width: 36, height: 36, background: c.card,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, borderRadius: 8,
                }}>
                  <div style={{
                    width: 16, height: 16,
                    background: r.low ? c.mute : c.fg, opacity: r.low ? 0.4 : 1,
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>{r.t}</div>
                  <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.2, marginTop: 2, display: 'block' }}>
                    {r.v} · {r.k}
                  </ACLabel>
                </div>
                {r.edit && (
                  <button type="button" onClick={() => onEditItem?.(i)} style={{
                    padding: '4px 10px', border: `1px solid ${c.hair}`, borderRadius: 999,
                    fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, letterSpacing: 0.4,
                    background: 'transparent', cursor: 'pointer',
                  }}>EDIT</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Micronutrient strip */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Notable · {_micros.length} of 23 shown
          </ACLabel>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {_micros.map((m, i) => (
              <div key={i} style={{ padding: 12, background: c.card, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4 }}>{m.k}</ACLabel>
                  <span style={{ fontFamily: ACFonts.mono, fontSize: 11, color: m.hi ? c.accent : c.fg, fontWeight: 700 }}>{m.v}</span>
                </div>
                <div style={{ marginTop: 8, height: 3, background: c.faint }}>
                  <div style={{ width: `${m.pct}%`, height: '100%', background: m.hi ? c.accent : c.dim }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source card */}
        <div style={{
          marginTop: 22, padding: 14,
          background: c.card, borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, background: c.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px dashed ${c.faint}`, flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="4" width="14" height="11" stroke={c.fg} strokeWidth="1.4"/>
              <circle cx="9" cy="10" r="2.4" stroke={c.fg} strokeWidth="1.4"/>
              <rect x="6" y="2" width="6" height="2.5" stroke={c.fg} strokeWidth="1.4"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>Source</ACLabel>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.fg, marginTop: 2 }}>{sourceLabel}</div>
          </div>
          <svg width="8" height="12" viewBox="0 0 8 12">
            <path d="M1 1l5 5-5 5" stroke={c.mute} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div style={{ padding: '12px 22px 22px', background: c.bg, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block onClick={() => onSaveAsMeal?.({ name: foodTitle, items: _items, calories, macros: _macros, meal })}>Save as meal</ACBtn>
        </div>
        <div style={{ flex: 1.2 }}>
          <ACBtn primary dark={dark} size="lg" pill block onClick={() => onConfirm?.({ name: foodTitle, items: _items, calories, macros: _macros, meal })}>Confirm · log</ACBtn>
        </div>
      </div>
    </div>
  );
}

export default S38_Food_Detail;
