/**
 * WorkoutsHome — /app/workouts.
 * Ref: Strong home (today's routine hero) + Hevy (recent activity + programs) + Fitbod (AI suggest)
 *
 * Hero: today's prescribed workout (or rest day) with big Start CTA
 * Quick actions: Start empty, Pick routine, AI-generate
 * This week strip (Mon-Sun with dots per day trained)
 * Routines carousel (user's saved routines)
 * Recent sessions list (last 5)
 */
import React from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';

export default function WorkoutsHome({
  // Prescribed today (or null = rest)
  todaysWorkout = null,   // { phase, name, duration, exercises: [{name,sets,reps}], intensity }
  // Week schedule — [7] bool indicating if user trained that day
  weekSchedule = null,    // [true, false, true, ...]
  // User routines (Hevy-style)
  routines = [],          // [{ id, name, exercises, color }]
  // Recent workout sessions
  recent = [],            // [{ id, name, date, duration, volume }]
  // Handlers
  onStartToday,
  onStartEmpty,
  onPickRoutine,
  onAiGenerate,
  onOpenRoutines,
  onOpenHistory,
  onOpenExerciseLibrary,
  onOpenRoutine,
  onOpenSession,
}) {
  return (
    <SafeScreen hasTopBar hasBottomNav hasFab paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Eyebrow */}
        <SpringReveal delay={20}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', letterSpacing: '0.02em' }}>
              Training
            </div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              {todaysWorkout ? "Today's on." : 'Pick your move.'}
            </h1>
          </div>
        </SpringReveal>

        {/* Today hero */}
        <SpringReveal delay={60}>
          <TodayHero workout={todaysWorkout} onStart={onStartToday} />
        </SpringReveal>

        {/* Quick actions */}
        <SpringReveal delay={120}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
            <QuickAction icon={<BoltIcon />} label="Start empty" tone="cyan" onClick={onStartEmpty} />
            <QuickAction icon={<SparkIcon />} label="AI build" tone="violet" onClick={onAiGenerate} />
            <QuickAction icon={<BookIcon />} label="Exercises" tone="neutral" onClick={onOpenExerciseLibrary} />
          </div>
        </SpringReveal>

        {/* Week strip */}
        <SpringReveal delay={180}>
          <Section title="This week">
            <WeekStrip schedule={weekSchedule} />
          </Section>
        </SpringReveal>

        {/* Routines */}
        <SpringReveal delay={220}>
          <Section title="Routines" action={routines.length ? { label: 'All', onClick: onOpenRoutines } : null}>
            {routines.length === 0 ? (
              <EmptyRoutines onAiGenerate={onAiGenerate} onPickRoutine={onPickRoutine} />
            ) : (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                {routines.map((r) => (
                  <RoutineCard key={r.id} routine={r} onClick={() => onOpenRoutine?.(r.id)} />
                ))}
                <button
                  type="button"
                  onClick={onAiGenerate}
                  style={{
                    flex: '0 0 180px',
                    height: 140,
                    borderRadius: 16,
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px dashed rgba(139,92,246,0.35)',
                    color: '#A78BFA',
                    display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                    padding: 12,
                  }}
                >
                  <SparkIcon />
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em' }}>AI build one</span>
                  <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))' }}>from your goals</span>
                </button>
              </div>
            )}
          </Section>
        </SpringReveal>

        {/* Recent sessions */}
        <SpringReveal delay={260}>
          <Section title="Recent" action={recent.length ? { label: 'History', onClick: onOpenHistory } : null}>
            {recent.length === 0 ? (
              <Glass radius="lg" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                  No sessions logged yet. Your first workout starts the streak.
                </div>
              </Glass>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {recent.slice(0, 5).map((s) => (
                  <SessionRow key={s.id} session={s} onClick={() => onOpenSession?.(s.id)} />
                ))}
              </div>
            )}
          </Section>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}
export { WorkoutsHome };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function TodayHero({ workout, onStart }) {
  if (!workout) {
    return (
      <Glass tint="neutral" radius="xl" elevation="md" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span aria-hidden style={{ fontSize: 36 }}>🌿</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
              Today
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Rest day
            </div>
            <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
              Light walk + good sleep beat any session today.
            </div>
          </div>
        </div>
      </Glass>
    );
  }
  return (
    <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-accent))', fontWeight: 700, marginBottom: 4 }}>
        {workout.phase || 'Prescribed'}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 8 }}>
        {workout.name}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {workout.duration != null && <Pill>⏱ {workout.duration} min</Pill>}
        {Array.isArray(workout.exercises) && <Pill>🏋️ {workout.exercises.length} exercises</Pill>}
        {workout.intensity && <Pill>⚡ {workout.intensity}</Pill>}
      </div>
      {Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
        <div style={{ padding: '10px 0', borderTop: '1px solid rgba(0,255,255,0.14)', borderBottom: '1px solid rgba(0,255,255,0.14)', marginBottom: 14 }}>
          {workout.exercises.slice(0, 3).map((ex, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
              <span style={{ color: 'hsl(var(--rd-fg-primary))', fontWeight: 600 }} className="truncate">{ex.name}</span>
              <span style={{ color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>{ex.sets}×{ex.reps}</span>
            </div>
          ))}
          {workout.exercises.length > 3 && (
            <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', textAlign: 'center', marginTop: 4 }}>
              + {workout.exercises.length - 3} more
            </div>
          )}
        </div>
      )}
      <LiquidButton intent="primary" size="xl" block onClick={onStart} leftIcon={<PlayIcon />}>
        Start workout
      </LiquidButton>
    </Glass>
  );
}

function QuickAction({ icon, label, tone, onClick }) {
  const tones = {
    cyan:    { bg: 'rgba(0,255,255,0.08)',   border: 'rgba(0,255,255,0.22)',   color: 'hsl(var(--rd-accent))' },
    violet:  { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.22)',  color: '#A78BFA' },
    neutral: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)', color: 'hsl(var(--rd-fg-primary))' },
  }[tone] || {};
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 14,
        borderRadius: 14,
        background: tones.bg,
        border: `1px solid ${tones.border}`,
        color: tones.color,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        backdropFilter: 'blur(14px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
        minHeight: 80,
      }}
    >
      {icon}
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.005em' }}>{label}</span>
    </button>
  );
}

function WeekStrip({ schedule }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    const offset = (today.getDay() + 6) % 7; // Monday = 0
    d.setDate(today.getDate() - offset + i);
    return d;
  });
  return (
    <Glass radius="lg" style={{ padding: 12, marginTop: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
        {days.map((d, i) => {
          const trained = schedule?.[i] ?? false;
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.08em', color: isToday ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
              <span
                aria-hidden
                style={{
                  width: isToday ? 14 : 10,
                  height: isToday ? 14 : 10,
                  borderRadius: 9999,
                  background: trained ? 'hsl(var(--rd-accent))' : 'rgba(255,255,255,0.14)',
                  border: isToday && !trained ? '2px solid hsl(var(--rd-accent))' : 'none',
                }}
              />
              <span style={{ fontSize: 10, color: isToday ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </Glass>
  );
}

function EmptyRoutines({ onAiGenerate, onPickRoutine }) {
  return (
    <Glass tint="ai" radius="xl" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span aria-hidden style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(139,92,246,0.5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <SparkIcon />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', lineHeight: 1.2 }}>
            No routines yet
          </div>
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.4 }}>
            Atlas AI can build one from your goals, equipment, and schedule — 3 seconds.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <LiquidButton intent="ai" size="sm" onClick={onAiGenerate}>✨ AI build</LiquidButton>
            <LiquidButton intent="neutral" size="sm" onClick={onPickRoutine}>Browse presets</LiquidButton>
          </div>
        </div>
      </div>
    </Glass>
  );
}

function RoutineCard({ routine, onClick }) {
  const tint = routine.color || 'accent';
  const visual = tint === 'violet' ? { bg: 'rgba(139,92,246,0.14)', border: 'rgba(139,92,246,0.4)', color: '#A78BFA' }
               : tint === 'gold' ? { bg: 'rgba(201,169,106,0.14)', border: 'rgba(201,169,106,0.4)', color: 'hsl(var(--rd-premium))' }
               : { bg: 'rgba(0,255,255,0.10)', border: 'rgba(0,255,255,0.3)', color: 'hsl(var(--rd-accent))' };
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: '0 0 180px',
        height: 140,
        borderRadius: 16,
        background: visual.bg,
        border: `1px solid ${visual.border}`,
        color: 'hsl(var(--rd-fg-primary))',
        padding: 14,
        textAlign: 'left',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        backdropFilter: 'blur(14px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: visual.color, fontWeight: 700 }}>
        Routine
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.2 }} className="truncate">{routine.name}</div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>
          {routine.exercises?.length || 0} exercises
        </div>
      </div>
    </button>
  );
}

function SessionRow({ session, onClick }) {
  const d = new Date(session.date);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ width: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
          {d.toLocaleDateString('en-US', { month: 'short' })}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          {d.getDate()}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }} className="truncate">{session.name}</div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {session.duration ? `${session.duration} min` : ''}{session.volume ? ` · ${Math.round(session.volume).toLocaleString()} kg volume` : ''}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, color: 'hsl(var(--rd-fg-muted))' }}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function Section({ title, action, children }) {
  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, paddingInline: 2 }}>
        <h2 style={{ margin: 0, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
          {title}
        </h2>
        {action && (
          <button type="button" onClick={action.onClick} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            {action.label}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Pill({ children }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'hsl(var(--rd-fg-secondary))', fontWeight: 500 }}>
      {children}
    </span>
  );
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const st = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
function BoltIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24"><path {...st} d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" /></svg>; }
function SparkIcon() { return <svg width="22" height="22" viewBox="0 0 24 24"><path {...st} d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" /></svg>; }
function BookIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24"><path {...st} d="M4 4h10a4 4 0 0 1 4 4v12a2 2 0 0 0-2-2H4zM4 4v16" /></svg>; }
function PlayIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 5l12 7-12 7V5z" /></svg>; }
