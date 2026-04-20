/**
 * RoutinePresetDetail — detail view of a single preset program.
 *
 * Shows the hero (name + description + accent gradient), metadata pills
 * (level, days/week, split, goal, duration), and every day as an expandable
 * section listing the prescribed exercises with sets × rep-range and rest.
 *
 * Bottom sticky CTA "Use this routine" clones the preset. For MVP it toasts
 * honestly that the clone will land in saved routines once Supabase is wired
 * (TRUST RULE — no fabricated writes).
 */
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SafeScreen, LiquidButton, SpringReveal } from '../lib/glass';
import { DumbbellIcon, MuscleGroupIcon } from '../lib/icons';
import {
  findPresetById,
  totalExerciseCount,
  totalSetCount,
} from './routinePresets';
import { cloneRoutineFromPreset } from '@/lib/workoutsService';
import {
  DEMO_EXERCISES,
  MUSCLE_COLORS,
  FALLBACK_MUSCLE_COLOR,
  EQUIPMENT_COLORS,
  findExerciseById,
} from './ExerciseLibrary';

const ACCENT_COLORS = {
  cyan:   { bg: 'rgba(0,255,255,0.10)',   bd: 'rgba(0,255,255,0.26)',   c: 'hsl(var(--rd-accent))' },
  violet: { bg: 'rgba(139,92,246,0.10)',  bd: 'rgba(139,92,246,0.26)',  c: '#A78BFA' },
  gold:   { bg: 'rgba(201,169,106,0.10)', bd: 'rgba(201,169,106,0.28)', c: 'hsl(var(--rd-premium))' },
};

export default function RoutinePresetDetail({
  preset,
  onBack,
  onUsePreset,
  onOpenExercise,
}) {
  if (!preset) {
    return (
      <SafeScreen>
        <NotFound onBack={onBack} />
      </SafeScreen>
    );
  }

  const accent = ACCENT_COLORS[preset.accent] || ACCENT_COLORS.cyan;
  const exercises = totalExerciseCount(preset);
  const sets = totalSetCount(preset);

  return (
    <SafeScreen paddingX={0}>
      {/* Sticky top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
          paddingInline: 16,
          paddingBottom: 8,
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.86) 0%, rgba(5,7,10,0.70) 70%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            width: 36, height: 36, borderRadius: 9999,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'hsl(var(--rd-fg-primary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'hsl(var(--rd-fg-muted))', fontWeight: 700,
          }}>
            Preset
          </div>
          <div style={{
            fontSize: 15, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))',
            letterSpacing: '-0.005em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {preset.name}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ paddingInline: 16, paddingTop: 8 }}>
        <SpringReveal>
          <div
            style={{
              position: 'relative',
              borderRadius: 24,
              padding: 20,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(18px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(120% 80% at 100% 0%, ${accent.bg.replace('0.10', '0.30')} 0%, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div
                  aria-hidden
                  style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: accent.bg,
                    border: `1px solid ${accent.bd}`,
                    color: accent.c,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <DumbbellIcon size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em',
                    lineHeight: 1.15,
                  }}>
                    {preset.name}
                  </div>
                  <div style={{
                    fontSize: 12, color: accent.c, marginTop: 4, fontWeight: 600, letterSpacing: '0.02em',
                  }}>
                    {preset.tagline}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13.5, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.55, marginTop: 6 }}>
                {preset.description}
              </div>
            </div>
          </div>
        </SpringReveal>

        {/* Meta pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          <MetaPill label="Level"      value={preset.level} />
          <MetaPill label="Days/week"  value={String(preset.daysPerWeek)} />
          <MetaPill label="Split"      value={preset.split} />
          <MetaPill label="Goal"       value={preset.goal} />
          <MetaPill label="Session"    value={`${preset.durationMin[0]}–${preset.durationMin[1]} min`} />
          <MetaPill label="Volume"     value={`${exercises} ex · ${sets} sets`} muted />
        </div>

        {/* Equipment needed */}
        <SectionTitle>Equipment needed</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {preset.equipment.map((e) => {
            const eq = EQUIPMENT_COLORS[e] || EQUIPMENT_COLORS['Bodyweight'];
            return (
              <span
                key={e}
                style={{
                  height: 24, paddingInline: 10, borderRadius: 7,
                  background: eq.bg, border: `1px solid ${eq.bd}`, color: eq.c,
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center',
                }}
              >
                {e}
              </span>
            );
          })}
        </div>

        {/* Days — each rendered as an expandable section */}
        <SectionTitle hint={`${preset.days.length} day${preset.days.length === 1 ? '' : 's'}`}>
          Program
        </SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {preset.days.map((day, i) => (
            <SpringReveal key={i} delay={Math.min(i * 30, 180)}>
              <DaySection day={day} index={i} accent={accent} onOpenExercise={onOpenExercise} />
            </SpringReveal>
          ))}
        </div>

        {/* Bottom spacer for the sticky CTA */}
        <div style={{ height: 'calc(env(safe-area-inset-bottom) + 110px)' }} />
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          paddingInline: 16,
          paddingTop: 10,
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
          backgroundImage: 'linear-gradient(0deg, rgba(5,7,10,0.94) 0%, rgba(5,7,10,0.78) 60%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
          zIndex: 30,
        }}
      >
        <LiquidButton
          variant="primary"
          onClick={() => onUsePreset?.(preset)}
          style={{ width: '100%' }}
        >
          Use this routine
        </LiquidButton>
      </div>
    </SafeScreen>
  );
}

/* ─── DaySection — collapsible list of exercises for a single day ──────── */

function DaySection({ day, index, accent, onOpenExercise }) {
  const [open, setOpen] = useState(index === 0); // first day expanded by default

  return (
    <div
      style={{
        borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left',
          padding: 14,
          background: 'transparent',
          border: 'none',
          color: 'hsl(var(--rd-fg-primary))',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 30, height: 30, borderRadius: 9,
            background: accent.bg, border: `1px solid ${accent.bd}`, color: accent.c,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, letterSpacing: '0.02em',
            flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em', lineHeight: 1.25 }}>
            {day.name}
          </div>
          <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
            {day.focus} · {day.exercises.length} exercises
          </div>
        </div>
        <svg
          aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none"
          style={{
            flexShrink: 0,
            color: 'hsl(var(--rd-fg-muted))',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 180ms',
          }}
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: '0 10px 10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {day.exercises.map((item, j) => (
              <ExerciseLine key={j} item={item} onClick={onOpenExercise} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ExerciseLine — one row inside a day ──────────────────────────────── */

function ExerciseLine({ item, onClick }) {
  const exercise = useMemo(() => findExerciseById(item.exerciseId), [item.exerciseId]);
  if (!exercise) {
    // Defensive: catalog entry missing. Show an honest fallback.
    return (
      <div
        style={{
          padding: 10, borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px dashed rgba(255,255,255,0.10)',
          fontSize: 12, color: 'hsl(var(--rd-fg-muted))',
        }}
      >
        Exercise not found: <code>{item.exerciseId}</code>
      </div>
    );
  }

  const primary = exercise.muscles?.[0];
  const mc = MUSCLE_COLORS[primary] || FALLBACK_MUSCLE_COLOR;
  const eq = EQUIPMENT_COLORS[exercise.equipment] || EQUIPMENT_COLORS['Bodyweight'];

  return (
    <button
      type="button"
      onClick={() => onClick?.(exercise)}
      style={{
        width: '100%', textAlign: 'left',
        padding: '10px 10px',
        borderRadius: 11,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 34, height: 34, borderRadius: 9,
          background: mc.bg, border: `1px solid ${mc.bd}`, color: mc.c,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MuscleGroupIcon muscle={primary} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, lineHeight: 1.25,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {exercise.name}
        </div>
        <div style={{
          fontSize: 10.5, color: 'hsl(var(--rd-fg-muted))', marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          <span style={{ color: eq.c, fontWeight: 600 }}>{exercise.equipment}</span>
          {item.note ? <span style={{ marginLeft: 6 }}>· {item.note}</span> : null}
        </div>
      </div>
      <div style={{
        fontSize: 11.5,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        color: 'hsl(var(--rd-fg-primary))',
        background: 'rgba(0,255,255,0.08)',
        border: '1px solid rgba(0,255,255,0.22)',
        borderRadius: 7,
        padding: '3px 8px',
        flexShrink: 0,
        letterSpacing: '0.02em',
      }}>
        {item.sets} × {item.repRange}
      </div>
    </button>
  );
}

/* ─── Small helpers ─────────────────────────────────────────────────────── */

function SectionTitle({ children, hint }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 24,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'hsl(var(--rd-fg-muted))',
        }}
      >
        {children}
      </div>
      {hint ? <div style={{ fontSize: 10.5, color: 'hsl(var(--rd-fg-muted))' }}>{hint}</div> : null}
    </div>
  );
}

function MetaPill({ label, value, muted = false }) {
  return (
    <span
      style={{
        padding: '4px 10px',
        background: muted ? 'transparent' : 'rgba(255,255,255,0.04)',
        border: muted ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.10)',
        borderRadius: 7,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--rd-fg-primary))' }}>
        {value}
      </span>
    </span>
  );
}

function NotFound({ onBack }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 40, minHeight: '60vh', textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', marginBottom: 6 }}>
        Preset not found
      </div>
      <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginBottom: 18, maxWidth: 280 }}>
        That preset ID doesn't exist. Go back and pick another one.
      </div>
      <LiquidButton variant="primary" onClick={onBack}>
        Back
      </LiquidButton>
    </div>
  );
}

/* ─── Route wrapper ───────────────────────────────────────────────────── */

export function RoutinePresetDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const preset = findPresetById(id);
  return (
    <RoutinePresetDetail
      preset={preset}
      onBack={() => navigate(-1)}
      onUsePreset={async (p) => {
        try {
          await cloneRoutineFromPreset({
            name: p.name,
            sourcePresetId: p.id,
            days: p.days,
          });
          toast.success('Saved to your routines');
          navigate('/app/routines');
        } catch (err) {
          toast.error(err?.message || 'Could not save routine');
        }
      }}
      onOpenExercise={(ex) => navigate(`/app/exercises/${ex.id}`)}
    />
  );
}
