/**
 * ManualWorkoutPlan — /app/workouts/manual-plan.
 * Ref: Hevy routine creator + Strong plan editor.
 *
 * User builds a routine from scratch:
 *  1. Name + optional phase/notes
 *  2. Exercise list — tap "+ Add exercise" → opens ExerciseLibrary picker
 *     (here simulated with a modal-style picker)
 *  3. For each exercise: set sets × reps target + rest seconds
 *  4. Save → writes to workoutPlanService (local for now)
 */
import React, { useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { DumbbellIcon } from '../lib/icons';

export default function ManualWorkoutPlan({
  initial = null,            // existing routine to edit, or null for new
  onCancel,
  onSave,                    // async (routine) => void
  onOpenExercisePicker,      // () => Promise<exercise | null>  — parent provides
}) {
  const [name, setName] = useState(initial?.name || '');
  const [phase, setPhase] = useState(initial?.phase || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [exercises, setExercises] = useState(initial?.exercises || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addExercise = async () => {
    try {
      const picked = await onOpenExercisePicker?.();
      if (!picked) return;
      setExercises((xs) => [
        ...xs,
        {
          id: `ex_${Date.now()}`,
          name: picked.name,
          muscle: picked.muscles?.[0] || '',
          targetSets: 3,
          targetReps: 10,
          restSeconds: 90,
        },
      ]);
    } catch (e) { /* ignore cancel */ }
  };

  const updateExercise = (id, patch) => {
    setExercises((xs) => xs.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)));
  };
  const removeExercise = (id) => setExercises((xs) => xs.filter((ex) => ex.id !== id));
  const moveExercise = (id, dir) => {
    setExercises((xs) => {
      const i = xs.findIndex((ex) => ex.id === id);
      if (i < 0) return xs;
      const j = i + dir;
      if (j < 0 || j >= xs.length) return xs;
      const next = xs.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const canSave = name.trim().length > 0 && exercises.length > 0 && !saving;

  const save = async () => {
    setError('');
    setSaving(true);
    try {
      await onSave?.({
        id: initial?.id,
        name: name.trim(),
        phase: phase.trim() || null,
        notes: notes.trim() || null,
        exercises,
      });
    } catch (e) {
      setError(e?.message || 'Could not save routine.');
    } finally { setSaving(false); }
  };

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}>
      <BackButton onClick={onCancel} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 560, margin: '0 auto' }}>
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            {initial ? 'Edit routine' : 'New routine'}
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Build your workout
          </h1>
        </SpringReveal>

        {/* Name */}
        <SpringReveal delay={60}>
          <Section title="Name">
            <Glass radius="lg" style={{ padding: 4 }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Upper body — Push"
                autoFocus
                style={inputStyle}
              />
            </Glass>
          </Section>
        </SpringReveal>

        {/* Phase (optional) */}
        <SpringReveal delay={100}>
          <Section title="Phase" hint="(optional)">
            <Glass radius="lg" style={{ padding: 4 }}>
              <input
                type="text"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                placeholder="Hypertrophy · Week 3"
                style={inputStyle}
              />
            </Glass>
          </Section>
        </SpringReveal>

        {/* Exercises */}
        <SpringReveal delay={140}>
          <Section title={`Exercises · ${exercises.length}`}>
            {exercises.length === 0 ? (
              <Glass radius="lg" style={{ padding: 14 }}>
                <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                  No exercises yet. Tap below to pick from the library.
                </div>
              </Glass>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {exercises.map((ex, i) => (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    isFirst={i === 0}
                    isLast={i === exercises.length - 1}
                    onUpdate={(patch) => updateExercise(ex.id, patch)}
                    onRemove={() => removeExercise(ex.id)}
                    onMove={(dir) => moveExercise(ex.id, dir)}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addExercise}
              style={{
                width: '100%',
                marginTop: 10,
                height: 48,
                borderRadius: 14,
                background: 'rgba(0,255,255,0.06)',
                border: '1px dashed rgba(0,255,255,0.3)',
                color: 'hsl(var(--rd-accent))',
                fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <span aria-hidden>+</span> Add exercise
            </button>
          </Section>
        </SpringReveal>

        {/* Notes */}
        <SpringReveal delay={180}>
          <Section title="Notes" hint="(optional)">
            <Glass radius="lg" style={{ padding: 4 }}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cues, form reminders, intent for this session…"
                rows={3}
                style={{ ...inputStyle, resize: 'none', padding: 14, lineHeight: 1.45 }}
              />
            </Glass>
          </Section>
        </SpringReveal>

        {error && (
          <div role="alert" style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.38)', color: '#FB7185', fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>

      {/* Sticky Save */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 560, margin: '0 auto' }}>
          <LiquidButton intent="primary" size="xl" block disabled={!canSave} loading={saving} onClick={save}>
            {initial ? 'Save changes' : 'Save routine'}
          </LiquidButton>
        </div>
      </div>
    </SafeScreen>
  );
}
export { ManualWorkoutPlan };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function Section({ title, hint, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, paddingInline: 2 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
          {title}
        </span>
        {hint && <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ExerciseRow({ exercise: ex, isFirst, isLast, onUpdate, onRemove, onMove }) {
  return (
    <Glass radius="xl" style={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span aria-hidden style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.22)', color: 'hsl(var(--rd-accent))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <DumbbellIcon size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }} className="truncate">
            {ex.name}
          </div>
          {ex.muscle && (
            <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 1 }} className="truncate">
              {ex.muscle}
            </div>
          )}
        </div>
        {/* Reorder + remove */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <IconBtn disabled={isFirst} onClick={() => onMove(-1)} aria="Move up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </IconBtn>
          <IconBtn disabled={isLast} onClick={() => onMove(1)} aria="Move down">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </IconBtn>
          <IconBtn danger onClick={onRemove} aria="Remove exercise">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </IconBtn>
        </div>
      </div>
      {/* Controls: sets × reps × rest */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        <NumField label="Sets" value={ex.targetSets} onChange={(v) => onUpdate({ targetSets: v })} min={1} max={10} />
        <NumField label="Reps" value={ex.targetReps} onChange={(v) => onUpdate({ targetReps: v })} min={1} max={50} />
        <NumField label="Rest" value={ex.restSeconds} onChange={(v) => onUpdate({ restSeconds: v })} min={0} max={600} step={15} suffix="s" />
      </div>
    </Glass>
  );
}

function NumField({ label, value, onChange, min, max, step = 1, suffix }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, height: 36, overflow: 'hidden' }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - step))} style={miniBtnStyle}>−</button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
          {value}{suffix || ''}
        </span>
        <button type="button" onClick={() => onChange(Math.min(max, value + step))} style={miniBtnStyle}>+</button>
      </div>
    </label>
  );
}

function IconBtn({ children, onClick, disabled, danger, aria }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: danger ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.04)',
        border: danger ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.08)',
        color: danger ? '#FB7185' : 'hsl(var(--rd-fg-secondary))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'hsl(var(--rd-fg-primary))',
  padding: 14,
  fontSize: 15, fontWeight: 500,
  fontFamily: 'inherit',
};

const miniBtnStyle = {
  width: 30, height: '100%',
  background: 'transparent', border: 'none',
  color: 'hsl(var(--rd-fg-secondary))',
  fontSize: 18, fontWeight: 700,
  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
};

function BackButton({ onClick }) {
  return (
    <button
      type="button" onClick={onClick} aria-label="Back"
      style={{
        position: 'fixed', top: 'calc(env(safe-area-inset-top) + 14px)', left: 'max(16px, env(safe-area-inset-left))',
        zIndex: 45,
        width: 36, height: 36, borderRadius: 9999,
        background: 'rgba(10,14,20,0.55)',
        backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
    </button>
  );
}
