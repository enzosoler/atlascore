import React, { useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn, ACChip,
} from '../lib/paper.jsx';

/**
 * S81_Routine_Preset_Detail -- single routine preset deep-dive (v3 paper aesthetic).
 *
 * Gallery:    <S81_Routine_Preset_Detail dark />
 * Production: <S81_Routine_Preset_Detail dark preset={...} days={[...]}
 *               onUsePreset={fn} onOpenExercise={fn} onBack={fn} />
 *
 * @param {object}   props
 * @param {boolean}  props.dark            - light/dark variant
 * @param {object}   props.preset          - {id, name, tagline, description, level, daysPerWeek, split, goal, durationRange, equipment}
 * @param {Array}    props.days            - [{label, exercises: [{name, muscle, sets, reps}]}]
 * @param {Function} props.onUsePreset     - ({presetId}) => void
 * @param {Function} props.onOpenExercise  - (name) => void
 * @param {Function} props.onBack          - () => void
 */

const DEMO_PRESET = {
  id: 'ppl-6',
  name: 'Push / Pull / Legs',
  tagline: 'The gold standard hypertrophy split',
  description: 'A six-day rotation that hits each muscle group twice per week. Push days train chest, shoulders, and triceps. Pull days train back and biceps. Leg days train quads, hamstrings, and calves. Proven volume distribution for intermediate lifters.',
  level: 'Intermediate',
  daysPerWeek: 6,
  split: 'PPL',
  goal: 'Hypertrophy',
  durationRange: '55-70 min',
  equipment: ['Barbell', 'Dumbbells', 'Cable machine', 'Pull-up bar'],
};

const DEMO_DAYS = [
  {
    label: 'Push A',
    exercises: [
      { name: 'Bench Press',         muscle: 'Chest',     sets: 4, reps: '6-8' },
      { name: 'Overhead Press',      muscle: 'Shoulders', sets: 3, reps: '8-10' },
      { name: 'Incline DB Press',    muscle: 'Chest',     sets: 3, reps: '10-12' },
      { name: 'Lateral Raise',       muscle: 'Shoulders', sets: 3, reps: '12-15' },
      { name: 'Tricep Pushdown',     muscle: 'Triceps',   sets: 3, reps: '10-12' },
    ],
  },
  {
    label: 'Pull A',
    exercises: [
      { name: 'Barbell Row',         muscle: 'Back',      sets: 4, reps: '6-8' },
      { name: 'Weighted Pull-up',    muscle: 'Back',      sets: 3, reps: '6-10' },
      { name: 'Cable Row',           muscle: 'Back',      sets: 3, reps: '10-12' },
      { name: 'Face Pull',           muscle: 'Shoulders', sets: 3, reps: '15-20' },
      { name: 'Barbell Curl',        muscle: 'Biceps',    sets: 3, reps: '10-12' },
    ],
  },
  {
    label: 'Legs A',
    exercises: [
      { name: 'Squat',               muscle: 'Quads',     sets: 4, reps: '5-8' },
      { name: 'Romanian Deadlift',   muscle: 'Hamstrings', sets: 3, reps: '8-10' },
      { name: 'Leg Press',           muscle: 'Quads',     sets: 3, reps: '10-12' },
      { name: 'Leg Curl',            muscle: 'Hamstrings', sets: 3, reps: '10-12' },
      { name: 'Calf Raise',          muscle: 'Calves',    sets: 4, reps: '12-15' },
    ],
  },
];

function S81_Routine_Preset_Detail({
  dark = false,
  preset,
  days,
  onUsePreset,
  onOpenExercise,
  onBack,
}) {
  const c = useACT(dark);
  const _preset = preset || DEMO_PRESET;
  const _days = days || DEMO_DAYS;

  const handleUse = () => {
    if (typeof onUsePreset === 'function') onUsePreset({ presetId: _preset.id });
  };
  const handleExercise = (name) => {
    if (typeof onOpenExercise === 'function') onOpenExercise(name);
  };
  const handleBack = () => {
    if (typeof onBack === 'function') onBack();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* Top bar */}
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
          PRESET
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Hero card */}
        <div style={{
          padding: 22, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card, position: 'relative', overflow: 'hidden',
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            {_preset.level} \u00b7 {_preset.split}
          </ACLabel>
          <div style={{
            marginTop: 10, fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700,
            letterSpacing: -1.4, lineHeight: 0.98,
          }}>
            {_preset.name}
          </div>
          <div style={{
            marginTop: 8, fontFamily: ACFonts.body, fontSize: 13,
            color: dark ? 'rgba(10,10,10,0.65)' : 'rgba(239,233,218,0.65)',
            fontWeight: 600, letterSpacing: -0.1,
          }}>
            {_preset.tagline}
          </div>
        </div>

        {/* Description */}
        {_preset.description && (
          <div style={{ marginTop: 16, fontSize: 14, color: c.dim, lineHeight: 1.55 }}>
            {_preset.description}
          </div>
        )}

        {/* Metadata pills */}
        <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <MetaPill label="Level" value={_preset.level} c={c} />
          <MetaPill label="Days/wk" value={String(_preset.daysPerWeek)} c={c} />
          <MetaPill label="Split" value={_preset.split} c={c} />
          <MetaPill label="Goal" value={_preset.goal} c={c} />
          <MetaPill label="Session" value={_preset.durationRange} c={c} />
        </div>

        {/* Equipment needed */}
        {_preset.equipment && _preset.equipment.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              Equipment needed
            </ACLabel>
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {_preset.equipment.map((eq) => (
                <span
                  key={eq}
                  style={{
                    padding: '5px 10px',
                    background: c.card,
                    borderRadius: ACRadii.chip,
                    fontFamily: ACFonts.body,
                    fontSize: 11, fontWeight: 600,
                    color: c.fg,
                    letterSpacing: 0.1,
                  }}
                >
                  {eq}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Day sections */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              Program \u00b7 {_days.length} day{_days.length === 1 ? '' : 's'}
            </ACLabel>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {_days.map((day, i) => (
              <DaySection
                key={i}
                day={day}
                index={i}
                c={c}
                dark={dark}
                defaultOpen={i === 0}
                onOpenExercise={handleExercise}
              />
            ))}
          </div>
        </div>

        {/* Bottom spacer for sticky CTA */}
        <div style={{ height: 80 }} />
      </div>

      {/* Sticky CTA */}
      <div style={{ padding: '12px 22px 22px', background: c.bg }}>
        <ACBtn primary dark={dark} size="lg" pill block onClick={handleUse}>
          Use this routine
        </ACBtn>
      </div>
    </div>
  );
}

/* -- DaySection ---------------------------------------------------------- */

function DaySection({ day, index, c, dark, defaultOpen, onOpenExercise }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      borderRadius: ACRadii.card,
      background: c.card,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        style={{
          width: '100%', textAlign: 'left',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          color: c.fg,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: index === 0 ? c.accent : c.fg,
          color: index === 0 ? c.ink : c.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: ACFonts.display, fontWeight: 700, fontSize: 15,
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700,
            letterSpacing: -0.2, lineHeight: 1.2,
          }}>
            Day {index + 1} \u00b7 {day.label}
          </div>
          <ACLabel size={11} color={c.dim} style={{ marginTop: 2 }}>
            {day.exercises.length} exercise{day.exercises.length === 1 ? '' : 's'}
          </ACLabel>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 12 12"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 180ms ease',
          }}
        >
          <path d="M3 1l5 5-5 5" stroke={c.mute} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {day.exercises.map((ex, j) => (
              <button
                key={j}
                type="button"
                onClick={() => onOpenExercise(ex.name)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: dark ? 'rgba(239,233,218,0.04)' : 'rgba(10,10,10,0.03)',
                  border: 'none',
                  color: c.fg,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: ACFonts.body, fontSize: 13.5, fontWeight: 600,
                    letterSpacing: -0.15, color: c.fg,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {ex.name}
                  </div>
                  <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3, marginTop: 2 }}>
                    {ex.muscle}
                  </ACLabel>
                </div>
                <span style={{
                  fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700,
                  color: c.accent, letterSpacing: 0.2,
                  padding: '3px 8px',
                  background: dark ? 'rgba(232,181,0,0.10)' : 'rgba(232,181,0,0.12)',
                  borderRadius: ACRadii.chip,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}>
                  {ex.sets}\u00d7{ex.reps}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -- MetaPill ------------------------------------------------------------ */

function MetaPill({ label, value, c }) {
  return (
    <span style={{
      padding: '4px 10px',
      background: c.card,
      borderRadius: ACRadii.chip,
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{
        fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.7,
        textTransform: 'uppercase', color: c.mute, fontWeight: 700,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: ACFonts.body, fontSize: 12, fontWeight: 600, color: c.fg,
      }}>
        {value}
      </span>
    </span>
  );
}

export default S81_Routine_Preset_Detail;
