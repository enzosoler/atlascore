/**
 * WorkoutDetail — /app/workouts/:id.
 * Ref: Hevy workout detail + Strong session view + Fitbod plan.
 *
 * Dual-purpose: shows a saved routine (template) OR a completed session
 * (history). Exercise list with sets/reps/weight when available.
 */
import React from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { DumbbellIcon, TrendUpIcon, TrophyIcon } from '../lib/icons';

export default function WorkoutDetail({
  workout = null,         // { id, name, phase, duration, intensity, notes, exercises: [...], mode: 'template'|'session', at?, volume?, prs? }
  onBack,
  onStart,                // only shown for templates
  onEdit,
  onShare,
  onDelete,
}) {
  if (!workout) {
    return (
      <SafeScreen paddingX={20}>
        <BackButton onClick={onBack} />
        <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 100px)', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Workout not found</div>
          <p style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 6 }}>
            This workout may have been deleted.
          </p>
        </div>
      </SafeScreen>
    );
  }

  const isSession = workout.mode === 'session';
  const exercises = workout.exercises || [];
  const totalSets = exercises.reduce((s, ex) => s + (ex.sets?.length || ex.targetSets || 0), 0);

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}>
      <BackButton onClick={onBack} />

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            {isSession
              ? (workout.at ? new Date(workout.at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Completed session')
              : (workout.phase || 'Routine')}
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            {workout.name}
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {workout.duration != null && <Pill>{workout.duration} min</Pill>}
            {exercises.length > 0 && <Pill>{exercises.length} exercises</Pill>}
            {totalSets > 0 && <Pill>{totalSets} sets</Pill>}
            {workout.intensity && <Pill>{workout.intensity}</Pill>}
            {isSession && workout.volume != null && (
              <Pill>{formatBig(workout.volume)} kg volume</Pill>
            )}
          </div>
        </SpringReveal>

        {/* PR callouts for sessions */}
        {isSession && Array.isArray(workout.prs) && workout.prs.length > 0 && (
          <SpringReveal delay={60}>
            <Glass tint="premium" radius="xl" style={{ padding: 14, marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <TrophyIcon size={16} />
                <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-premium))', fontWeight: 700 }}>
                  {workout.prs.length} new PR{workout.prs.length === 1 ? '' : 's'}
                </span>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {workout.prs.map((pr, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: 'hsl(var(--rd-fg-primary))' }}>{pr.exercise}</span>
                    <span style={{ color: 'hsl(var(--rd-premium))', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {pr.weight}kg × {pr.reps}
                    </span>
                  </div>
                ))}
              </div>
            </Glass>
          </SpringReveal>
        )}

        {/* Notes */}
        {workout.notes && (
          <SpringReveal delay={100}>
            <Glass radius="xl" style={{ padding: 14, marginTop: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 6 }}>
                Notes
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
                {workout.notes}
              </p>
            </Glass>
          </SpringReveal>
        )}

        {/* Exercise list */}
        <SpringReveal delay={140}>
          <h2 style={{ margin: '24px 0 10px', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', paddingInline: 2 }}>
            Exercises · {exercises.length}
          </h2>
          {exercises.length === 0 ? (
            <Glass radius="lg" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                No exercises added yet.
              </div>
            </Glass>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {exercises.map((ex, i) => (
                <ExerciseBlock key={ex.id || i} exercise={ex} mode={workout.mode} />
              ))}
            </div>
          )}
        </SpringReveal>

        {/* Template management */}
        {!isSession && (
          <SpringReveal delay={200}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
              <LiquidButton intent="neutral" size="md" onClick={onEdit}>Edit routine</LiquidButton>
              <LiquidButton intent="neutral" size="md" onClick={onShare}>Share</LiquidButton>
            </div>
          </SpringReveal>
        )}

        {/* Session management */}
        {isSession && (
          <SpringReveal delay={200}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
              <LiquidButton intent="neutral" size="md" onClick={onShare}>Share</LiquidButton>
              <button
                type="button"
                onClick={onDelete}
                style={{
                  height: 44, borderRadius: 14,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#FB7185',
                  fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
              >
                Delete session
              </button>
            </div>
          </SpringReveal>
        )}
      </div>

      {/* Start workout sticky — only for templates */}
      {!isSession && onStart && (
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
            <LiquidButton intent="primary" size="xl" block onClick={onStart}>
              Start this workout
            </LiquidButton>
          </div>
        </div>
      )}
    </SafeScreen>
  );
}
export { WorkoutDetail };

function ExerciseBlock({ exercise: ex, mode }) {
  const isSession = mode === 'session';
  const sets = ex.sets || [];

  return (
    <Glass radius="xl" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: sets.length > 0 || !isSession ? 10 : 0 }}>
        <span aria-hidden style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.22)', color: 'hsl(var(--rd-accent))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <DumbbellIcon size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {ex.name}
          </div>
          <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
            {ex.muscle ? `${ex.muscle} · ` : ''}
            {isSession
              ? `${sets.length} sets`
              : `${ex.targetSets || 0}×${ex.targetReps || 0}`}
            {ex.restSeconds ? ` · ${Math.round(ex.restSeconds / 60)} min rest` : ''}
          </div>
        </div>
      </div>

      {/* Session mode: show completed sets with weight × reps */}
      {isSession && sets.length > 0 && (
        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr', gap: 6, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, paddingInline: 2, marginBottom: 4 }}>
            <span>Set</span>
            <span style={{ textAlign: 'center' }}>Weight</span>
            <span style={{ textAlign: 'center' }}>Reps</span>
          </div>
          {sets.map((s, idx) => (
            <div
              key={s.id || idx}
              style={{
                display: 'grid', gridTemplateColumns: '28px 1fr 1fr', gap: 6,
                padding: '6px 2px', fontSize: 13,
                color: s.done ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span style={{ fontWeight: 700, textAlign: 'center', color: s.done ? '#34D399' : 'hsl(var(--rd-fg-muted))' }}>
                {idx + 1}
              </span>
              <span style={{ textAlign: 'center' }}>{s.weight || '—'}{s.weight ? 'kg' : ''}</span>
              <span style={{ textAlign: 'center' }}>{s.reps || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </Glass>
  );
}

function Pill({ children }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'hsl(var(--rd-fg-secondary))', fontWeight: 500 }}>
      {children}
    </span>
  );
}

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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

function formatBig(n) {
  if (typeof n !== 'number') return n;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n * 10) / 10);
}
