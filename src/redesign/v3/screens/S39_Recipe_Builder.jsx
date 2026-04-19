import React, { useState, useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel,
} from '../lib/paper.jsx';

const DEMO_INGREDIENTS = [
  { n: 'Jasmine rice',     v: '1 cup',   k: 205, p: 4,  c: 44, f: 0 },
  { n: 'Grilled chicken',  v: '6 oz',    k: 280, p: 48, c: 0,  f: 6 },
  { n: 'Avocado',          v: '½',       k: 120, p: 1,  c: 6,  f: 10 },
  { n: 'Broccoli',         v: '1 cup',   k: 30,  p: 2,  c: 6,  f: 0 },
  { n: 'Sesame · tamari',  v: '1 tbsp',  k: 35,  p: 1,  c: 6,  f: 2 },
];

/**
 * S39_Recipe_Builder — create / edit a custom meal from ingredients.
 *
 * Gallery:    <S39_Recipe_Builder dark />
 * Production: <S39_Recipe_Builder dark initialName="Post-lift bowl" initialIngredients={[...]} onClose={fn} onSave={fn} onAddIngredient={fn} />
 *
 * onSave receives: { name, ingredients, totals: { kcal, protein, carbs, fat }, options: { saveAsTemplate, shareWithCrew, addToPlan } }
 * onAddIngredient: () => Promise<ingredient|null> — open search/scan picker, resolves with selected ingredient
 * onRemoveIngredient: (index) — remove ingredient at index
 */
function S39_Recipe_Builder({
  dark = false,
  initialName = 'Post-lift bowl',
  initialIngredients,
  onClose,
  onSave,
  onAddIngredient,
  onRemoveIngredient,
}) {
  const c = useACT(dark);
  const [name, setName] = useState(initialName);
  const [ingredients, setIngredients] = useState(initialIngredients || DEMO_INGREDIENTS);
  const [opts, setOpts] = useState({
    saveAsTemplate: true,
    shareWithCrew: false,
    addToPlan: true,
  });

  const totals = useMemo(() => {
    const t = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    ingredients.forEach((r) => {
      t.kcal += r.k || 0;
      t.protein += r.p || 0;
      t.carbs += r.c || 0;
      t.fat += r.f || 0;
    });
    return t;
  }, [ingredients]);

  const maxKcal = Math.max(...ingredients.map((r) => r.k || 0), 1);
  const canSave = name.trim().length > 0 && ingredients.length > 0;

  function handleRemove(idx) {
    if (onRemoveIngredient) {
      onRemoveIngredient(idx);
    }
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (!canSave) return;
    onSave?.({ name: name.trim(), ingredients, totals, options: opts });
  }

  const toggleOpt = (key) => setOpts((prev) => ({ ...prev, [key]: !prev[key] }));

  const OPTIONS_META = [
    { key: 'saveAsTemplate', label: 'Save as meal template', sub: 'One-tap log next time' },
    { key: 'shareWithCrew', label: 'Share with crew', sub: 'Mara · Ash · Joon · 2 more' },
    { key: 'addToPlan', label: 'Add to plan · Mon lunch', sub: 'Fits today\'s remaining macros' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>NEW MEAL · DRAFT</ACLabel>
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: '4px 10px', background: canSave ? c.accent : c.faint, color: c.ink,
            fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
            letterSpacing: 0.4, borderRadius: 999, border: 'none',
            cursor: canSave ? 'pointer' : 'default',
            opacity: canSave ? 1 : 0.5,
          }}
        >
          SAVE
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Editable name */}
        <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          Meal name
        </ACLabel>
        <div style={{ marginTop: 6, borderBottom: `2px solid ${c.accent}` }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your meal"
            style={{
              width: '100%', padding: '8px 0',
              fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
              letterSpacing: -1, color: c.fg,
              background: 'transparent', border: 'none', outline: 'none',
            }}
          />
        </div>

        {/* Ingredient stack */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              The stack · {ingredients.length} items
            </ACLabel>
            <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, fontWeight: 700 }}>
              {totals.kcal} kcal
            </ACLabel>
          </div>

          <div style={{ marginTop: 14, position: 'relative' }}>
            {ingredients.map((r, i) => {
              const isTop = r.k === maxKcal;
              return (
                <div key={`${r.n}-${i}`} style={{
                  marginTop: i === 0 ? 0 : -4,
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: isTop ? c.fg : c.card,
                  color: isTop ? c.bg : c.fg,
                  borderRadius: 6,
                  boxShadow: `0 2px 0 ${c.hair}`,
                  position: 'relative', zIndex: 10 - i,
                  transform: `translateX(${(i % 2 === 0 ? 0 : 4)}px)`,
                }}>
                  {/* drag handle */}
                  <svg width="10" height="14" viewBox="0 0 10 14" style={{ flexShrink: 0, opacity: 0.5 }}>
                    <circle cx="3" cy="3" r="1.1" fill={isTop ? c.bg : c.dim}/>
                    <circle cx="7" cy="3" r="1.1" fill={isTop ? c.bg : c.dim}/>
                    <circle cx="3" cy="7" r="1.1" fill={isTop ? c.bg : c.dim}/>
                    <circle cx="7" cy="7" r="1.1" fill={isTop ? c.bg : c.dim}/>
                    <circle cx="3" cy="11" r="1.1" fill={isTop ? c.bg : c.dim}/>
                    <circle cx="7" cy="11" r="1.1" fill={isTop ? c.bg : c.dim}/>
                  </svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13.5, fontWeight: 600, letterSpacing: -0.2,
                      color: isTop ? c.bg : c.fg,
                    }}>{r.n}</div>
                    <div style={{
                      marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10,
                      color: isTop ? (dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)') : c.dim,
                      letterSpacing: 0.3,
                    }}>{r.v} · {r.k} kcal · {r.p}P</div>
                  </div>
                  {/* proportional band */}
                  <div style={{
                    width: 48, height: 5,
                    background: isTop ? (dark ? 'rgba(10,10,10,0.2)' : 'rgba(239,233,218,0.2)') : c.faint,
                  }}>
                    <div style={{
                      width: `${((r.k || 0) / maxKcal) * 100}%`, height: '100%',
                      background: isTop ? c.accent : c.dim,
                    }} />
                  </div>
                  {/* remove button */}
                  <button type="button" onClick={() => handleRemove(i)} style={{
                    width: 20, height: 20, borderRadius: 999,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, opacity: 0.5,
                  }}>
                    <svg width="8" height="8" viewBox="0 0 8 8">
                      <path d="M1 1l6 6M7 1l-6 6" stroke={isTop ? c.bg : c.fg} strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* add row */}
            <button type="button" onClick={onAddIngredient} style={{
              marginTop: 10, padding: 12, border: `1px dashed ${c.faint}`,
              borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8,
              color: c.dim, background: 'transparent', cursor: 'pointer', width: '100%',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6h8M6 2v8" stroke={c.accent} strokeWidth="1.8" strokeLinecap="round"/></svg>
              <span style={{ flex: 1, fontSize: 13, color: c.dim, fontWeight: 500, letterSpacing: -0.2, textAlign: 'left' }}>Add ingredient</span>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>Scan · search</ACLabel>
            </button>
          </div>
        </div>

        {/* Summary strip — computed from real totals */}
        <div style={{
          marginTop: 22, padding: 16, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
        }}>
          {[
            { k: 'KCAL',    v: String(totals.kcal), hi: true },
            { k: 'PROTEIN', v: `${totals.protein}g` },
            { k: 'CARBS',   v: `${totals.carbs}g` },
            { k: 'FAT',     v: `${totals.fat}g` },
          ].map((m, i) => (
            <div key={i} style={{
              paddingLeft: i === 0 ? 0 : 10,
              borderLeft: i === 0 ? 'none' : `1px solid ${dark ? 'rgba(10,10,10,0.16)' : 'rgba(239,233,218,0.16)'}`,
            }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)', letterSpacing: 0.7 }}>{m.k}</div>
              <div style={{
                marginTop: 6, fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
                letterSpacing: -0.5, color: m.hi ? c.accent : c.bg,
                fontVariantNumeric: 'tabular-nums',
              }}>{m.v}</div>
            </div>
          ))}
        </div>

        {/* Options with real toggles */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Options
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {OPTIONS_META.map((r, i) => (
              <div key={r.key} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: c.fg }}>{r.label}</div>
                  <ACLabel size={11} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{r.sub}</ACLabel>
                </div>
                <button type="button" onClick={() => toggleOpt(r.key)} style={{
                  width: 36, height: 20, borderRadius: 999,
                  background: opts[r.key] ? c.accent : c.faint, position: 'relative',
                  border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: opts[r.key] ? 18 : 2,
                    width: 16, height: 16, background: opts[r.key] ? c.ink : c.bg,
                    borderRadius: 999,
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default S39_Recipe_Builder;
