import React, { useMemo, useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACChip,
} from '../lib/paper.jsx';

/**
 * S80_Routine_Presets -- workout routine browser (v3 paper aesthetic).
 *
 * Gallery:    <S80_Routine_Presets dark />
 * Production: <S80_Routine_Presets dark presets={[...]} onOpenPreset={fn} onBack={fn} />
 *
 * @param {object}   props
 * @param {boolean}  props.dark          - light/dark variant
 * @param {Array}    props.presets       - [{id, name, tagline, level, daysPerWeek, split, durationRange, exerciseCount, setCount}]
 * @param {Function} props.onOpenPreset  - (id) => void
 * @param {Function} props.onBack        - () => void
 */

const LEVEL_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const DEMO_PRESETS = [
  {
    id: 'ppl-6',
    name: 'Push / Pull / Legs',
    tagline: 'The gold standard hypertrophy split',
    level: 'Intermediate',
    daysPerWeek: 6,
    split: 'PPL',
    durationRange: '55-70 min',
    exerciseCount: 30,
    setCount: 108,
  },
  {
    id: 'ul-4',
    name: 'Upper / Lower',
    tagline: 'Balanced frequency, minimal time',
    level: 'Beginner',
    daysPerWeek: 4,
    split: 'Upper/Lower',
    durationRange: '45-60 min',
    exerciseCount: 20,
    setCount: 72,
  },
  {
    id: 'fb-3',
    name: 'Full Body 3x',
    tagline: 'High frequency, low volume per session',
    level: 'Beginner',
    daysPerWeek: 3,
    split: 'Full Body',
    durationRange: '40-55 min',
    exerciseCount: 15,
    setCount: 54,
  },
  {
    id: 'arnold-6',
    name: 'Arnold Split',
    tagline: 'Chest/back, shoulders/arms, legs',
    level: 'Advanced',
    daysPerWeek: 6,
    split: 'Arnold',
    durationRange: '60-80 min',
    exerciseCount: 36,
    setCount: 126,
  },
  {
    id: 'brosplit-5',
    name: 'Bro Split',
    tagline: 'One muscle group per day, maximum volume',
    level: 'Intermediate',
    daysPerWeek: 5,
    split: 'Body Part',
    durationRange: '50-65 min',
    exerciseCount: 25,
    setCount: 90,
  },
  {
    id: 'str-4',
    name: 'Strength Focus 5x5',
    tagline: 'Compound-heavy, progressive overload',
    level: 'Advanced',
    daysPerWeek: 4,
    split: 'Upper/Lower',
    durationRange: '60-75 min',
    exerciseCount: 16,
    setCount: 80,
  },
];

function S80_Routine_Presets({
  dark = false,
  presets,
  onOpenPreset,
  onBack,
}) {
  const c = useACT(dark);
  const [level, setLevel] = useState('All');

  const rows = presets === undefined ? DEMO_PRESETS : presets;

  const filtered = useMemo(() => {
    if (level === 'All') return rows;
    return rows.filter((p) => p.level === level);
  }, [rows, level]);

  const handleOpen = (id) => {
    if (typeof onOpenPreset === 'function') onOpenPreset(id);
  };
  const handleBack = () => {
    if (typeof onBack === 'function') onBack();
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* Header */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>
          ROUTINES
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: '14px 22px 6px' }}>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25, textTransform: 'uppercase' }}>
          Browse{rows.length > 0 ? ` \u00b7 ${rows.length} preset${rows.length === 1 ? '' : 's'}` : ''}
        </ACLabel>
        <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
          Routine presets
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: c.dim, lineHeight: 1.5 }}>
          Curated starter programs. Pick one, tweak it, make it yours.
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '10px 22px 0', display: 'flex', gap: 6, overflow: 'auto', scrollbarWidth: 'none' }}>
        {LEVEL_FILTERS.map((l) => {
          const active = level === l;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              style={{
                padding: '8px 14px', borderRadius: 999,
                background: active ? c.fg : c.card,
                color: active ? c.bg : c.fg,
                fontSize: 12, fontWeight: 600,
                flexShrink: 0,
                border: 'none', cursor: 'pointer',
                fontFamily: ACFonts.body,
              }}
            >
              {l}
            </button>
          );
        })}
      </div>

      {/* Scrollable card list */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: '22px 18px',
            background: c.card,
            borderRadius: ACRadii.card,
            textAlign: 'center',
          }}>
            <ACLabel size={12} color={c.dim}>No presets at this level</ACLabel>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((p, i) => (
              <PresetCard
                key={p.id ?? i}
                preset={p}
                c={c}
                dark={dark}
                onClick={() => handleOpen(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -- PresetCard ---------------------------------------------------------- */

function PresetCard({ preset: p, c, dark, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '18px 16px',
        background: c.card,
        borderRadius: ACRadii.card,
        border: 'none',
        color: c.fg,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 10,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Top row: name + level badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 17, fontWeight: 700,
            letterSpacing: -0.3, lineHeight: 1.2, color: c.fg,
          }}>
            {p.name}
          </div>
          <div style={{
            marginTop: 3, fontFamily: ACFonts.body, fontSize: 12,
            color: c.accent, fontWeight: 600, letterSpacing: -0.1,
          }}>
            {p.tagline}
          </div>
        </div>
        <ACChip dark={dark} accent={p.level === 'Advanced'} style={{ flexShrink: 0 }}>
          {p.level}
        </ACChip>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <MetaTag label={`${p.daysPerWeek}d/wk`} c={c} />
        <MetaTag label={p.split} c={c} />
        <MetaTag label={p.durationRange} c={c} />
        <MetaTag label={`${p.exerciseCount} ex \u00b7 ${p.setCount} sets`} c={c} muted />
      </div>

      {/* Chevron hint */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <svg width="10" height="12" viewBox="0 0 10 12">
          <path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

function MetaTag({ label, c, muted = false }) {
  return (
    <span
      style={{
        padding: '4px 9px',
        borderRadius: ACRadii.chip,
        background: muted ? 'transparent' : (c.hair),
        border: muted ? `1px solid ${c.hair}` : 'none',
        color: muted ? c.mute : c.dim,
        fontFamily: ACFonts.mono,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 0.3,
        display: 'inline-flex', alignItems: 'center',
      }}
    >
      {label}
    </span>
  );
}

export default S80_Routine_Presets;
