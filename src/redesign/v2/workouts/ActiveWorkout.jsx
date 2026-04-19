/**
 * ActiveWorkout — fullscreen Hevy-style workout logger.
 * Ref: Hevy active session + Strong set tracker + iOS Health workouts + Fitbod.
 *
 * Core UX:
 *  - Running timer at top (fixed, live, pause-resume)
 *  - Scrollable exercise list. Each exercise:
 *      - name, muscle, optional previous session line
 *      - Set rows: set# · previous (weight×reps) · WEIGHT input · REPS input · ✓ mark
 *      - + Add set button
 *  - Rest timer (auto-starts after ✓, 60-180s per exercise)
 *  - Sticky bottom:  "Finish workout" CTA + volume + totals
 *  - Cancel / discard in top-right
 *
 * State is local + notifies parent via onLog when a set is marked complete.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Glass, LiquidButton, SpringReveal } from '../lib/glass';

const DEMO_EXERCISES = [
  {
    id: 'ex1',
    name: 'Barbell bench press',
    muscle: 'Chest',
    targetSets: 4,
    targetReps: 8,
    previous: [
      { weight: 70, reps: 8 },
      { weight: 70, reps: 8 },
      { weight: 72.5, reps: 7 },
      { weight: 72.5, reps: 6 },
    ],
    sets: [
      { id: 's1', weight: '', reps: '', done: false },
      { id: 's2', weight: '', reps: '', done: false },
      { id: 's3', weight: '', reps: '', done: false },
      { id: 's4', weight: '', reps: '', done: false },
    ],
    restSeconds: 120,
  },
  {
    id: 'ex2',
    name: 'Incline dumbbell press',
    muscle: 'Chest · upper',
    targetSets: 3,
    targetReps: 10,
    previous: [
      { weight: 24, reps: 10 },
      { weight: 24, reps: 10 },
      { weight: 26, reps: 8 },
    ],
    sets: [
      { id: 's1', weight: '', reps: '', done: false },
      { id: 's2', weight: '', reps: '', done: false },
      { id: 's3', weight: '', reps: '', done: false },
    ],
    restSeconds: 90,
  },
  {
    id: 'ex3',
    name: 'Cable fly',
    muscle: 'Chest · inner',
    targetSets: 3,
    targetReps: 12,
    previous: null,
    sets: [
      { id: 's1', weight: '', reps: '', done: false },
      { id: 's2', weight: '', reps: '', done: false },
      { id: 's3', weight: '', reps: '', done: false },
    ],
    restSeconds: 60,
  },
];

export default function ActiveWorkout({
  workoutName = 'Upper body — Push',
  exercises: initialExercises = DEMO_EXERCISES,
  onFinish,
  onDiscard,
  onLog, // (exerciseId, setId, {weight, reps}) => void
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [elapsed, setElapsed] = useState(0);           // seconds since start
  const [restSeconds, setRestSeconds] = useState(0);   // seconds remaining for rest timer
  const [restBase, setRestBase] = useState(0);         // to compute progress
  const [paused, setPaused] = useState(false);

  // Master elapsed timer
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  // Rest timer countdown
  useEffect(() => {
    if (restSeconds <= 0) return;
    const id = setInterval(() => setRestSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [restSeconds]);

  const totals = useMemo(() => {
    let sets = 0, volume = 0, done = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        sets++;
        if (s.done) {
          done++;
          const w = Number(s.weight) || 0;
          const r = Number(s.reps) || 0;
          volume += w * r;
        }
      });
    });
    return { sets, done, volume };
  }, [exercises]);

  const updateSet = (exId, setId, patch) => {
    setExercises((xs) =>
      xs.map((ex) =>
        ex.id !== exId ? ex : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) },
      ),
    );
  };

  const toggleDone = (ex, set) => {
    const wasDone = set.done;
    updateSet(ex.id, set.id, { done: !wasDone });
    if (!wasDone) {
      // Starting rest
      setRestBase(ex.restSeconds || 90);
      setRestSeconds(ex.restSeconds || 90);
      onLog?.(ex.id, set.id, { weight: set.weight, reps: set.reps });
    }
  };

  const addSet = (exId) => {
    setExercises((xs) =>
      xs.map((ex) =>
        ex.id !== exId
          ? ex
          : {
              ...ex,
              sets: [
                ...ex.sets,
                { id: `s_${Date.now()}`, weight: '', reps: '', done: false },
              ],
            },
      ),
    );
  };

  const skipRest = () => setRestSeconds(0);
  const addRest = (delta) => setRestSeconds((s) => Math.max(0, s + delta));

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          paddingTop: 'env(safe-area-inset-top)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.92) 0%, rgba(5,7,10,0.78) 80%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 40px', alignItems: 'center', padding: '12px max(16px, env(safe-area-inset-left))', gap: 8 }}>
          <button
            type="button"
            onClick={onDiscard}
            aria-label="Cancel workout"
            style={{ width: 40, height: 40, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'hsl(var(--rd-fg-primary))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </button>

          <div style={{ textAlign: 'center', minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
              Active workout
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.1 }} className="truncate">
              {workoutName}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume' : 'Pause'}
            style={{ width: 40, height: 40, borderRadius: 9999, background: paused ? 'rgba(0,255,255,0.14)' : 'rgba(255,255,255,0.06)', border: paused ? '1px solid rgba(0,255,255,0.4)' : '1px solid rgba(255,255,255,0.10)', color: paused ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-primary))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
          >
            {paused ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7V5z" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            )}
          </button>
        </div>

        {/* Big elapsed timer */}
        <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
          <div style={{ fontSize: 42, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1, color: paused ? 'hsl(var(--rd-fg-muted))' : 'hsl(var(--rd-fg-primary))' }}>
            {formatTime(elapsed)}
          </div>
          <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', letterSpacing: '0.08em', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {totals.done}/{totals.sets} sets · {Math.round(totals.volume).toLocaleString()} kg volume
          </div>
        </div>

        {/* Rest timer banner */}
        {restSeconds > 0 && (
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.06) 100%)',
              border: '1px solid rgba(245,158,11,0.4)',
              margin: '0 max(12px, env(safe-area-inset-left)) 8px',
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span aria-hidden style={{ fontSize: 20 }}>⏸</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FBBF24', fontWeight: 700 }}>
                Rest
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {formatTime(restSeconds)}
              </div>
              <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 6 }}>
                <div style={{ height: '100%', width: `${(1 - restSeconds / Math.max(1, restBase)) * 100}%`, background: '#FBBF24', transition: 'width 1s linear' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <MiniBtn onClick={() => addRest(-15)}>−15s</MiniBtn>
              <MiniBtn onClick={() => addRest(15)}>+15s</MiniBtn>
              <MiniBtn onClick={skipRest} danger>Skip</MiniBtn>
            </div>
          </div>
        )}
      </header>

      {/* ── Exercise list ─────────────────────────────────────────── */}
      <main style={{ padding: '8px max(16px, env(safe-area-inset-left)) 140px', maxWidth: 640, margin: '0 auto' }}>
        {exercises.map((ex, idx) => (
          <SpringReveal key={ex.id} delay={idx * 40}>
            <ExerciseBlock
              exercise={ex}
              onUpdateSet={(setId, patch) => updateSet(ex.id, setId, patch)}
              onToggleDone={(set) => toggleDone(ex, set)}
              onAddSet={() => addSet(ex.id)}
            />
          </SpringReveal>
        ))}

        {/* Add exercise */}
        <button
          type="button"
          style={{
            width: '100%',
            marginTop: 10,
            height: 48,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.15)',
            color: 'hsl(var(--rd-fg-muted))',
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <span aria-hidden>+</span> Add exercise
        </button>
      </main>

      {/* ── Finish footer ────────────────────────────────────────── */}
      <footer
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 560, margin: '0 auto' }}>
          <LiquidButton
            intent="primary"
            size="xl"
            block
            onClick={() => onFinish?.({ elapsed, exercises, totals })}
            disabled={totals.done === 0}
          >
            Finish workout
          </LiquidButton>
          {/*
           * TODO — Celebration trigger for milestone completions.
           *
           * When `onFinish` returns, the caller should run milestone detection
           * against the user's real workout history (e.g. via a streaks /
           * achievements service) and decide whether to fire a celebration:
           *
           *   - If this is the user's first-ever completed workout:
           *       navigate('/app/today/celebrate/first-workout')
           *   - If this session set a new PR:
           *       navigate('/app/today/celebrate/first-pr')
           *   - If this completion closes a 7- or 30-day streak boundary:
           *       navigate('/app/today/celebrate/7-day-streak') / 30-day-streak
           *
           * We DO NOT fire any celebration unconditionally here — that would
           * be a fabricated achievement. The trigger belongs on the service
           * that knows the user's history (backend), not on this screen.
           *
           * Until that service exists, onFinish just returns to /app/workouts.
           */}
        </div>
      </footer>
    </div>
  );
}
export { ActiveWorkout };

/* ─── Exercise block ───────────────────────────────────────────────────── */

function ExerciseBlock({ exercise: ex, onUpdateSet, onToggleDone, onAddSet }) {
  return (
    <Glass radius="xl" style={{ padding: 14, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
            {ex.name}
          </div>
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
            {ex.muscle} · {ex.targetSets}×{ex.targetReps}
          </div>
        </div>
        <button
          type="button"
          aria-label="Exercise options"
          style={{ width: 32, height: 32, borderRadius: 9999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--rd-fg-muted))', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0 }}
        >
          ⋯
        </button>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 76px 60px 40px', gap: 6, alignItems: 'center', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, paddingInline: 2, marginBottom: 6 }}>
        <span>Set</span>
        <span>Previous</span>
        <span style={{ textAlign: 'center' }}>Kg</span>
        <span style={{ textAlign: 'center' }}>Reps</span>
        <span />
      </div>

      {/* Set rows */}
      <div style={{ display: 'grid', gap: 4 }}>
        {ex.sets.map((s, i) => {
          const prev = ex.previous?.[i];
          return (
            <SetRow
              key={s.id}
              idx={i + 1}
              previous={prev}
              set={s}
              onUpdate={(patch) => onUpdateSet(s.id, patch)}
              onToggleDone={() => onToggleDone(s)}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={onAddSet}
        style={{
          marginTop: 8,
          width: '100%',
          height: 36,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'hsl(var(--rd-fg-secondary))',
          fontSize: 12, fontWeight: 600,
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <span aria-hidden>+</span> Add set
      </button>
    </Glass>
  );
}

function SetRow({ idx, previous, set, onUpdate, onToggleDone }) {
  const done = set.done;
  const rowStyle = {
    display: 'grid', gridTemplateColumns: '28px 1fr 76px 60px 40px',
    gap: 6, alignItems: 'center', padding: '6px 2px',
    background: done ? 'rgba(16,185,129,0.06)' : 'transparent',
    borderRadius: 8,
    transition: 'background 200ms',
  };
  return (
    <div style={rowStyle}>
      <span style={{ fontSize: 13, fontWeight: 700, color: done ? '#34D399' : 'hsl(var(--rd-fg-primary))', fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>
        {idx}
      </span>
      <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
        {previous ? `${previous.weight}kg × ${previous.reps}` : '—'}
      </span>
      <NumInput value={set.weight} onChange={(v) => onUpdate({ weight: v })} placeholder={previous?.weight ? String(previous.weight) : '0'} />
      <NumInput value={set.reps} onChange={(v) => onUpdate({ reps: v })} placeholder={previous?.reps ? String(previous.reps) : '0'} />
      <button
        type="button"
        onClick={onToggleDone}
        aria-label={done ? 'Unmark set' : 'Mark set complete'}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: done ? 'hsl(var(--rd-health-excellent))' : 'rgba(255,255,255,0.04)',
          border: done ? '1px solid hsl(var(--rd-health-excellent))' : '1px solid rgba(255,255,255,0.15)',
          color: done ? 'hsl(var(--rd-fg-on-accent))' : 'hsl(var(--rd-fg-muted))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          justifySelf: 'center',
          transition: 'background 180ms, color 180ms, border-color 180ms, transform 160ms cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        {done ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </button>
    </div>
  );
}

function NumInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))}
      placeholder={placeholder}
      style={{
        height: 32,
        borderRadius: 8,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'center',
        fontSize: 14, fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        padding: '0 8px',
        outline: 'none',
        minWidth: 0,
      }}
    />
  );
}

function MiniBtn({ children, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 28,
        paddingInline: 10,
        borderRadius: 9999,
        background: danger ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.06)',
        border: danger ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.10)',
        color: danger ? '#FB7185' : 'hsl(var(--rd-fg-primary))',
        fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
