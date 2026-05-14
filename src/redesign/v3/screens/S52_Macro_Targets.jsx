import React, { useState, useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACMono, ACBtn, ACChip,
} from '../lib/paper.jsx';

/**
 * S52_Macro_Targets — macro split editor with calorie input + presets.
 *
 * Replaces v2 MacroTargets.jsx with the v3 paper+ink+amber design system.
 * Big calorie number at top. 5 preset buttons that set P/C/F percentages.
 * Manual stepper for each macro %. Live gram calculation. Save button.
 *
 * Gallery:    <S52_Macro_Targets dark />
 * Production: <S52_Macro_Targets dark
 *               initial={{ calories: 2380, split: { p: 30, c: 40, f: 30 } }}
 *               presets={[...]}
 *               onSave={fn} onBack={fn} />
 */

/* ── DEMO data (gallery fallback) ─────────────────────────────── */

const DEMO_INITIAL = {
  calories: 2380,
  split: { p: 30, c: 40, f: 30 },
};

const DEMO_PRESETS = [
  { id: 'balanced',    label: 'Balanced',     split: { p: 30, c: 40, f: 30 } },
  { id: 'highprotein', label: 'High Protein', split: { p: 40, c: 30, f: 30 } },
  { id: 'lowcarb',     label: 'Low Carb',     split: { p: 30, c: 20, f: 50 } },
  { id: 'cutting',     label: 'Cutting',      split: { p: 40, c: 35, f: 25 } },
  { id: 'bulking',     label: 'Bulking',      split: { p: 25, c: 50, f: 25 } },
];

/* ── Helpers ───────────────────────────────────────────────────── */

const KCAL_PER = { p: 4, c: 4, f: 9 };

function gramsFromSplit(calories, split) {
  if (!calories || !split) return { proteinG: 0, carbsG: 0, fatG: 0 };
  return {
    proteinG: Math.round((calories * (split.p / 100)) / KCAL_PER.p),
    carbsG:   Math.round((calories * (split.c / 100)) / KCAL_PER.c),
    fatG:     Math.round((calories * (split.f / 100)) / KCAL_PER.f),
  };
}

/* ── Component ─────────────────────────────────────────────────── */

export default function S52_Macro_Targets({
  dark = false,
  initial,
  presets,
  onSave,
  onBack,
}) {
  const c = useACT(dark);

  const resolvedInitial = initial || DEMO_INITIAL;
  const resolvedPresets = presets || DEMO_PRESETS;

  const [calories, setCalories] = useState(resolvedInitial.calories || 0);
  const [split, setSplit] = useState(resolvedInitial.split || { p: 30, c: 40, f: 30 });

  const sum = split.p + split.c + split.f;
  const validSplit = sum === 100;
  const grams = useMemo(() => gramsFromSplit(calories, split), [calories, split]);
  const canSave = calories > 0 && validSplit;

  const handleBack = () => { if (typeof onBack === 'function') onBack(); };
  const handleSave = () => {
    if (!canSave) return;
    if (typeof onSave === 'function') {
      onSave({
        calories,
        split,
        proteinG: grams.proteinG,
        carbsG: grams.carbsG,
        fatG: grams.fatG,
      });
    }
  };

  function pickPreset(p) {
    setSplit({ ...p.split });
    if (!calories || calories <= 0) setCalories(2000);
  }

  function adjust(key, delta) {
    const next = { ...split, [key]: Math.max(0, Math.min(100, split[key] + delta)) };
    setSplit(next);
  }

  function isActivePreset(p) {
    return split.p === p.split.p && split.c === p.split.c && split.f === p.split.f;
  }

  const macroRows = [
    { k: 'p', label: 'Protein', g: grams.proteinG, color: c.accent },
    { k: 'c', label: 'Carbs',   g: grams.carbsG,   color: c.fg     },
    { k: 'f', label: 'Fat',     g: grams.fatG,      color: c.dim    },
  ];

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
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Macro targets</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* ── Scrollable body ──────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 22px 24px' }}>

        {/* ── State Header ─────────────────────────────────────── */}
        <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          Nutrition targets
        </ACLabel>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700,
          letterSpacing: -0.6, lineHeight: 1.1, color: c.fg,
        }}>
          Set your daily nutrition plan
        </div>
        <ACLabel size={12} color={c.dim} style={{ marginTop: 6, display: 'block', lineHeight: 1.45 }}>
          Pick a preset or adjust manually. atlas.core recalibrates weekly.
        </ACLabel>

        {/* ── Calorie hero card ────────────────────────────────── */}
        <div style={{
          marginTop: 22, padding: 22, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card, textAlign: 'center',
        }}>
          <ACMono size={10} color={c.accent} track={2}>DAILY TARGET</ACMono>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
            <input
              type="number"
              inputMode="numeric"
              placeholder="\u2014"
              value={calories || ''}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d]/g, '');
                setCalories(v ? parseInt(v, 10) : 0);
              }}
              style={{
                width: '5ch', background: 'transparent', border: 'none', outline: 'none',
                textAlign: 'center', color: c.bg,
                fontFamily: ACFonts.display, fontSize: 56, fontWeight: 700,
                letterSpacing: -2, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}
              aria-label="Daily calorie target"
            />
            <ACLabel size={14} color="rgba(239,233,218,0.55)">kcal</ACLabel>
          </div>

          {/* Live grams row */}
          {calories > 0 && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 20 }}>
              {macroRows.map((m) => (
                <div key={m.k} style={{ textAlign: 'center' }}>
                  <ACLabel size={10} color="rgba(239,233,218,0.50)">{m.label}</ACLabel>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
                    color: c.bg, marginTop: 2, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {m.g}<span style={{ fontSize: 11, color: 'rgba(239,233,218,0.50)', fontWeight: 500, marginLeft: 2 }}>g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Preset buttons ───────────────────────────────────── */}
        <div style={{ marginTop: 22 }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>
            PRESETS
          </ACMono>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {resolvedPresets.map((p) => {
              const active = isActivePreset(p);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickPreset(p)}
                  style={{
                    padding: '10px 14px', borderRadius: ACRadii.chip,
                    background: active ? c.accent : c.card,
                    color: active ? c.ink : c.fg,
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: ACFonts.body,
                    letterSpacing: -0.1,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Macro split steppers ─────────────────────────────── */}
        <div style={{ marginTop: 22 }}>
          <ACMono size={9} color={c.dim} track={2} style={{ display: 'block', marginBottom: 10 }}>
            MACRO SPLIT
          </ACMono>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {macroRows.map((m) => (
              <div key={m.k} style={{
                padding: '14px 16px', background: c.card, borderRadius: ACRadii.card,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <ACLabel size={11} color={c.dim} style={{ textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      {m.label}
                    </ACLabel>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                      <span style={{
                        fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
                        letterSpacing: -0.8, color: c.fg, fontVariantNumeric: 'tabular-nums',
                      }}>
                        {split[m.k]}%
                      </span>
                      <ACMono size={11} color={c.dim}>
                        {'\u00B7'} {m.g}g
                      </ACMono>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => adjust(m.k, -5)}
                      aria-label={`Decrease ${m.label}`}
                      style={{
                        width: 36, height: 36, borderRadius: 999,
                        background: c.faint, border: 'none',
                        color: c.fg, fontSize: 18, fontWeight: 600,
                        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      \u2212
                    </button>
                    <button
                      type="button"
                      onClick={() => adjust(m.k, 5)}
                      aria-label={`Increase ${m.label}`}
                      style={{
                        width: 36, height: 36, borderRadius: 999,
                        background: c.faint, border: 'none',
                        color: c.fg, fontSize: 18, fontWeight: 600,
                        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 10, height: 4, background: c.faint, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${split[m.k]}%`, height: '100%', background: m.color,
                    borderRadius: 2, transition: 'width 220ms ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Sum validation row */}
          <div style={{
            marginTop: 10, padding: '10px 16px', borderRadius: ACRadii.chip,
            background: validSplit ? 'rgba(232,181,0,0.10)' : 'rgba(198,91,75,0.10)',
            border: `1px solid ${validSplit ? 'rgba(232,181,0,0.30)' : 'rgba(198,91,75,0.30)'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <ACLabel size={12} color={validSplit ? c.accent : '#c65b4b'} style={{ fontWeight: 600 }}>
              Split total
            </ACLabel>
            <ACMono size={13} color={validSplit ? c.accent : '#c65b4b'} style={{ fontWeight: 700 }}>
              {sum}%
            </ACMono>
          </div>
        </div>

        {/* ── Trajectory / insight ─────────────────────────────── */}
        {calories > 0 && validSplit && (
          <div style={{
            marginTop: 22, padding: '14px 16px', borderRadius: ACRadii.card,
            border: `1px dashed ${c.faint}`,
          }}>
            <ACMono size={10} color={c.accent} track={2} style={{ display: 'block', marginBottom: 4 }}>
              PROJECTION
            </ACMono>
            <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
              {grams.proteinG}g protein at {calories} kcal supports{' '}
              {grams.proteinG >= 140 ? 'lean mass retention and recovery' : 'basic recovery needs'}.
              {' '}atlas.core adjusts weekly from your weight trend.
            </ACLabel>
          </div>
        )}
      </div>

      {/* ── Bottom save bar ──────────────────────────────────── */}
      <div style={{ padding: '14px 22px 26px', background: c.bg }}>
        <ACBtn
          primary
          block
          dark={dark}
          size="lg"
          pill
          onClick={handleSave}
          style={{
            opacity: canSave ? 1 : 0.4,
            pointerEvents: canSave ? 'auto' : 'none',
          }}
        >
          Save targets
        </ACBtn>
        {!canSave && (
          <div style={{
            fontSize: 12, color: c.mute, textAlign: 'center', marginTop: 8,
            fontFamily: ACFonts.body,
          }}>
            {calories <= 0
              ? 'Enter your daily kcal to continue'
              : `Split must total 100% (currently ${sum}%)`
            }
          </div>
        )}
      </div>
    </div>
  );
}
