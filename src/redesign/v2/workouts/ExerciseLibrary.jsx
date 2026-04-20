/**
 * ExerciseLibrary — searchable catalogue of exercises.
 * Ref: Jefit library + Hevy exercise picker + Fitbod exercise detail.
 *
 * Rules applied:
 *  - ZERO emojis — brand rule. Instead each card has a clean SVG **muscle-group
 *    icon** (chest, back, delts, arms, legs, glutes, core, cardio, calves) tinted
 *    to its group, plus a colored equipment chip pinned to the bottom.
 *  - Large catalog (130+) with real variations: Pendulum squat, Hack squat,
 *    Smith variations, Cable crossover positions, Meadows row, Zercher squat,
 *    etc. Enzo specifically asked for variation depth.
 *  - Multi-signal search: name, aliases (PT + EN), muscles, equipment. "agachamento"
 *    matches all squat variants. "free weight" matches free-weight ones only.
 *
 * This screen works standalone (/app/exercises) AND as a modal picker inside
 * ManualWorkoutPlan — both paths use the same component.
 */
import React, { useMemo, useState } from 'react';
import { SafeScreen, SpringReveal } from '../lib/glass';
import { MuscleGroupIcon } from '../lib/icons';
import { DEMO_EXERCISES } from '@/redesign/v3/lib/exerciseCatalog.js';

export { DEMO_EXERCISES };


const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Core', 'Cardio'];
const EQUIPMENT_FILTERS = ['Any', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Smith', 'Bodyweight'];

export const EQUIPMENT_COLORS = {
  'Barbell':    { bg: 'rgba(0,255,255,0.08)',   bd: 'rgba(0,255,255,0.22)',   c: 'hsl(var(--rd-accent))' },
  'Dumbbell':   { bg: 'rgba(139,92,246,0.08)',  bd: 'rgba(139,92,246,0.22)',  c: '#A78BFA' },
  'Cable':      { bg: 'rgba(251,191,36,0.08)',  bd: 'rgba(251,191,36,0.22)',  c: '#FBBF24' },
  'Machine':    { bg: 'rgba(52,211,153,0.08)',  bd: 'rgba(52,211,153,0.22)',  c: '#34D399' },
  'Smith':      { bg: 'rgba(96,165,250,0.08)',  bd: 'rgba(96,165,250,0.22)',  c: '#60A5FA' },
  'Bodyweight': { bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.14)', c: 'hsl(var(--rd-fg-secondary))' },
  'Kettlebell': { bg: 'rgba(201,169,106,0.08)', bd: 'rgba(201,169,106,0.22)', c: 'hsl(var(--rd-premium))' },
  'Bar':        { bg: 'rgba(0,255,255,0.05)',   bd: 'rgba(0,255,255,0.18)',   c: 'hsl(var(--rd-accent))' },
  'Bands':      { bg: 'rgba(251,113,133,0.08)', bd: 'rgba(251,113,133,0.22)', c: '#FB7185' },
  'EZ bar':     { bg: 'rgba(0,255,255,0.06)',   bd: 'rgba(0,255,255,0.20)',   c: 'hsl(var(--rd-accent))' },
  'Bench':      { bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.14)', c: 'hsl(var(--rd-fg-secondary))' },
};

/** Tint per primary muscle group — icon tile color on each card. */
export const MUSCLE_COLORS = {
  'Chest':     { bg: 'rgba(0,255,255,0.10)',   bd: 'rgba(0,255,255,0.26)',   c: 'hsl(var(--rd-accent))' },
  'Back':      { bg: 'rgba(139,92,246,0.10)',  bd: 'rgba(139,92,246,0.26)',  c: '#A78BFA' },
  'Shoulders': { bg: 'rgba(251,191,36,0.10)',  bd: 'rgba(251,191,36,0.26)',  c: '#FBBF24' },
  'Arms':      { bg: 'rgba(251,113,133,0.10)', bd: 'rgba(251,113,133,0.26)', c: '#FB7185' },
  'Legs':      { bg: 'rgba(52,211,153,0.10)',  bd: 'rgba(52,211,153,0.26)',  c: '#34D399' },
  'Glutes':    { bg: 'rgba(192,132,252,0.10)', bd: 'rgba(192,132,252,0.26)', c: '#C084FC' },
  'Core':      { bg: 'rgba(96,165,250,0.10)',  bd: 'rgba(96,165,250,0.26)',  c: '#60A5FA' },
  'Cardio':    { bg: 'rgba(248,113,113,0.10)', bd: 'rgba(248,113,113,0.26)', c: '#F87171' },
};
export const FALLBACK_MUSCLE_COLOR = { bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.14)', c: 'hsl(var(--rd-fg-secondary))' };


/** Look up an exercise in the main catalog by its id. Returns null when not found. */
export function findExerciseById(id, catalogue = DEMO_EXERCISES) {
  if (!id) return null;
  return catalogue.find((ex) => ex.id === id) || null;
}

/**
 * Surface related exercises based on shared primary muscle group.
 * Returns up to `limit` exercises, excluding the reference one. Prefers same
 * equipment first so the user sees swappable variants (e.g. dumbbell alternative
 * to a cable movement).
 */
export function findRelatedExercises(exercise, limit = 6, catalogue = DEMO_EXERCISES) {
  if (!exercise) return [];
  const primary = exercise.muscles?.[0];
  if (!primary) return [];
  const pool = catalogue.filter((e) => e.id !== exercise.id && e.muscles?.includes(primary));
  pool.sort((a, b) => {
    const aSame = a.equipment === exercise.equipment ? 0 : 1;
    const bSame = b.equipment === exercise.equipment ? 0 : 1;
    return aSame - bSame;
  });
  return pool.slice(0, limit);
}

export default function ExerciseLibrary({
  onClose,
  onPick,
  onOpen,
  catalogue = DEMO_EXERCISES,
}) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All');
  const [equip, setEquip] = useState('Any');

  const results = useMemo(() => {
    const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const tokens = norm(q).split(/\s+/).filter(Boolean);

    return catalogue.filter((ex) => {
      // Muscle group
      if (group !== 'All' && !ex.muscles.includes(group)) return false;
      // Equipment
      if (equip !== 'Any' && ex.equipment !== equip) return false;
      // Search tokens — every token must hit somewhere
      if (tokens.length === 0) return true;
      const hay = [
        norm(ex.name),
        ...ex.muscles.map(norm),
        norm(ex.equipment),
        ...(ex.aliases || []).map(norm),
      ].join(' ');
      return tokens.every((t) => hay.includes(t));
    });
  }, [q, group, equip, catalogue]);

  return (
    <SafeScreen paddingX={0}>
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
          paddingInline: 16,
          paddingBottom: 10,
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.94) 0%, rgba(5,7,10,0.82) 70%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36, height: 36, borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'hsl(var(--rd-fg-primary))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <span aria-hidden style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--rd-fg-muted))' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search · agachamento, pendulum, cable…"
              style={{
                width: '100%', height: 44, borderRadius: 14,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                color: 'hsl(var(--rd-fg-primary))',
                padding: '0 14px 0 40px',
                fontSize: 15, outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Muscle group chips */}
        <ChipRow items={MUSCLE_GROUPS} value={group} onChange={setGroup} style={{ marginTop: 10 }} />
        {/* Equipment filter */}
        <ChipRow items={EQUIPMENT_FILTERS} value={equip} onChange={setEquip} tint="neutral" style={{ marginTop: 6 }} />
      </div>

      {/* Count strip */}
      <div style={{ paddingInline: 16, paddingTop: 6, paddingBottom: 8, fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>
        {results.length} {results.length === 1 ? 'exercise' : 'exercises'}
      </div>

      {/* Grid */}
      <div style={{ paddingInline: 16, paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'hsl(var(--rd-fg-muted))' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'hsl(var(--rd-fg-primary))', marginBottom: 4 }}>
              No exercises match
            </div>
            <div style={{ fontSize: 12 }}>
              Try clearing filters or a different search term.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {results.map((ex, i) => (
              <SpringReveal key={ex.id} delay={Math.min(i * 6, 120)}>
                <ExerciseRow
                  exercise={ex}
                  onClick={() => {
                    // Picker mode (onPick defined) → return the exercise to caller.
                    // Standalone mode → open the detail screen.
                    if (onPick) onPick(ex);
                    else onOpen?.(ex);
                  }}
                />
              </SpringReveal>
            ))}
          </div>
        )}
      </div>
    </SafeScreen>
  );
}
export { ExerciseLibrary };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function ChipRow({ items, value, onChange, tint = 'accent', style }) {
  const activeStyles = tint === 'neutral'
    ? { bg: 'rgba(255,255,255,0.08)', bd: 'rgba(255,255,255,0.22)', c: 'hsl(var(--rd-fg-primary))' }
    : { bg: 'rgba(0,255,255,0.14)',   bd: 'rgba(0,255,255,0.4)',    c: 'hsl(var(--rd-accent))' };
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2, ...style }}>
      {items.map((g) => {
        const active = value === g;
        return (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            style={{
              flex: '0 0 auto',
              height: 30, paddingInline: 12, borderRadius: 9999,
              background: active ? activeStyles.bg : 'rgba(255,255,255,0.04)',
              border: active ? `1px solid ${activeStyles.bd}` : '1px solid rgba(255,255,255,0.08)',
              color: active ? activeStyles.c : 'hsl(var(--rd-fg-secondary))',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}

/**
 * List row — the canonical layout used by Hevy / Fitbod / Strong for exercise
 * pickers. Full-width rows with a fixed-size icon tile on the left, bold name,
 * subtitle that combines muscles + equipment, and a subtle chevron on the right.
 * Every row has identical structure and vertical rhythm, regardless of how long
 * the exercise name is.
 */
function ExerciseRow({ exercise: ex, onClick }) {
  const primary = ex.muscles[0];
  const mc = MUSCLE_COLORS[primary] || FALLBACK_MUSCLE_COLOR;
  const eq = EQUIPMENT_COLORS[ex.equipment] || EQUIPMENT_COLORS['Bodyweight'];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 10,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'transform 160ms cubic-bezier(.34,1.56,.64,1), background 160ms',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.992)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* Muscle icon tile */}
      <div
        aria-hidden
        style={{
          width: 44, height: 44, borderRadius: 12,
          background: mc.bg,
          border: `1px solid ${mc.bd}`,
          color: mc.c,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MuscleGroupIcon muscle={primary} size={22} />
      </div>

      {/* Text block — name + subtitle (muscles · equipment) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
          lineHeight: 1.25,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: 'hsl(var(--rd-fg-primary))',
        }}>
          {ex.name}
        </div>
        <div style={{
          fontSize: 11, lineHeight: 1.35, marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: 'hsl(var(--rd-fg-muted))',
        }}>
          {ex.muscles.join(' · ')}
          <span style={{ color: 'rgba(255,255,255,0.24)', margin: '0 6px' }}>•</span>
          <span style={{ color: eq.c, fontWeight: 600, letterSpacing: '0.02em' }}>
            {ex.equipment}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <svg
        aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none"
        style={{ flexShrink: 0, color: 'hsl(var(--rd-fg-muted))' }}
      >
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
