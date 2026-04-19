/**
 * ExerciseDetail — full-screen exercise detail view.
 * Ref: Fitbod exercise detail + Strong exercise detail + Hevy exercise info.
 *
 * Rules applied:
 *  - ZERO emojis. Large muscle-group SVG in the hero, equipment chip for clarity.
 *  - TRUST RULE — "Your history" and "PR" sections show honest empty states
 *    when no Supabase data is wired yet. No fabricated session counts or PRs.
 *  - PT-first microcopy (user is Brazilian), English exercise names.
 *  - safe-area-inset aware on every side.
 *
 * Route: /app/exercises/:id
 * Props:
 *   exercise      — the catalog entry (required)
 *   history       — optional array of { date, sets: [{ weight, reps }] }
 *   personalBest  — optional { weight, reps, est1rm }
 *   onBack        — navigate back
 *   onAddToPlan   — primary CTA; called with the exercise when user wants
 *                   to add it to a routine
 *   onOpenRelated — called when user taps a related/variation card
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { MuscleGroupIcon } from '../lib/icons';
import {
  DEMO_EXERCISES,
  EQUIPMENT_COLORS,
  MUSCLE_COLORS,
  FALLBACK_MUSCLE_COLOR,
  findExerciseById,
  findRelatedExercises,
} from './ExerciseLibrary';
import { getExerciseDetails } from './exerciseDetails';
import { getSetsForExercise, getPersonalBest } from '@/lib/workoutsService';

/* ─── Tiny building blocks ─────────────────────────────────────────────── */

function SectionTitle({ children, hint }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 28,
        marginBottom: 10,
        paddingInline: 2,
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
      {hint ? (
        <div style={{ fontSize: 10.5, color: 'hsl(var(--rd-fg-muted))' }}>{hint}</div>
      ) : null}
    </div>
  );
}

function MetaPill({ label, value, tint = 'neutral' }) {
  const tints = {
    neutral: { bg: 'rgba(255,255,255,0.04)', bd: 'rgba(255,255,255,0.10)', c: 'hsl(var(--rd-fg-primary))' },
    accent:  { bg: 'rgba(0,255,255,0.08)',   bd: 'rgba(0,255,255,0.22)',   c: 'hsl(var(--rd-accent))' },
    violet:  { bg: 'rgba(139,92,246,0.08)',  bd: 'rgba(139,92,246,0.22)',  c: '#A78BFA' },
  };
  const t = tints[tint] || tints.neutral;
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 0,
        padding: '10px 12px',
        background: t.bg,
        border: `1px solid ${t.bd}`,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: t.c, letterSpacing: '-0.005em' }}>
        {value}
      </div>
    </div>
  );
}

function MuscleChip({ muscle, strong = false }) {
  const mc = MUSCLE_COLORS[muscle] || FALLBACK_MUSCLE_COLOR;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        paddingInline: 10,
        height: 28,
        borderRadius: 9999,
        background: strong ? mc.bg : 'rgba(255,255,255,0.04)',
        border: `1px solid ${strong ? mc.bd : 'rgba(255,255,255,0.10)'}`,
        color: strong ? mc.c : 'hsl(var(--rd-fg-secondary))',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span style={{ display: 'inline-flex' }}>
        <MuscleGroupIcon muscle={MUSCLE_COLORS[muscle] ? muscle : 'Other'} size={14} />
      </span>
      {muscle}
    </div>
  );
}

/* ─── Screen ───────────────────────────────────────────────────────────── */

export default function ExerciseDetail({
  exercise,
  history = null,
  personalBest = null,
  onBack,
  onAddToPlan,
  onOpenRelated,
}) {
  const details = useMemo(() => getExerciseDetails(exercise), [exercise]);
  const related = useMemo(() => findRelatedExercises(exercise, 6), [exercise]);
  const [tab, setTab] = useState('guide'); // 'guide' | 'history' | 'related'

  if (!exercise) {
    return (
      <SafeScreen>
        <NotFound onBack={onBack} />
      </SafeScreen>
    );
  }

  const primary = exercise.muscles?.[0];
  const mc = MUSCLE_COLORS[primary] || FALLBACK_MUSCLE_COLOR;
  const eq = EQUIPMENT_COLORS[exercise.equipment] || EQUIPMENT_COLORS['Bodyweight'];

  return (
    <SafeScreen paddingX={0}>
      {/* ── Top bar — glass that fades with scroll ─────────────────────── */}
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
          display: 'flex',
          alignItems: 'center',
          gap: 10,
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'hsl(var(--rd-fg-muted))', fontWeight: 700,
          }}>
            Exercise
          </div>
          <div style={{
            fontSize: 15, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))',
            letterSpacing: '-0.005em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {exercise.name}
          </div>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
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
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              minHeight: 150,
            }}
          >
            {/* Subtle radial tint tied to the muscle group */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(120% 80% at 80% 0%, ${mc.bg.replace('0.10', '0.28')} 0%, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
            {/* Big muscle-group icon tile */}
            <div
              aria-hidden
              style={{
                position: 'relative',
                width: 96, height: 96, borderRadius: 22,
                background: mc.bg,
                border: `1px solid ${mc.bd}`,
                color: mc.c,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MuscleGroupIcon muscle={primary} size={52} />
            </div>
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em',
                color: 'hsl(var(--rd-fg-primary))', lineHeight: 1.15, marginBottom: 6,
              }}>
                {exercise.name}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span
                  style={{
                    height: 22, paddingInline: 10, borderRadius: 9999,
                    background: eq.bg, border: `1px solid ${eq.bd}`, color: eq.c,
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center',
                  }}
                >
                  {exercise.equipment}
                </span>
                {(exercise.muscles || []).map((m) => (
                  <MuscleChip key={m} muscle={m} strong={m === primary} />
                ))}
              </div>
            </div>
          </div>
        </SpringReveal>

        {/* ── Meta strip (4 pills) ─────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <MetaPill label="Type" value={details.category} tint="accent" />
          <MetaPill label="Mechanic" value={details.mechanic} />
          <MetaPill
            label="Difficulty"
            value={details.difficulty || '—'}
            tint={details.difficulty ? 'violet' : 'neutral'}
          />
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 6, paddingInline: 16, paddingTop: 20, paddingBottom: 4,
      }}>
        <TabButton active={tab === 'guide'}   onClick={() => setTab('guide')}>Guide</TabButton>
        <TabButton active={tab === 'history'} onClick={() => setTab('history')}>History</TabButton>
        <TabButton active={tab === 'related'} onClick={() => setTab('related')}>Variations</TabButton>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      <div style={{ paddingInline: 16, paddingBottom: 'calc(env(safe-area-inset-bottom) + 110px)' }}>
        {tab === 'guide'   && <GuideTab details={details} aliases={exercise.aliases} />}
        {tab === 'history' && <HistoryTab history={history} personalBest={personalBest} exerciseName={exercise.name} />}
        {tab === 'related' && <RelatedTab related={related} onOpenRelated={onOpenRelated} />}
      </div>

      {/* ── Sticky bottom CTA ────────────────────────────────────────── */}
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
          onClick={() => onAddToPlan?.(exercise)}
          style={{ width: '100%' }}
        >
          Add to workout
        </LiquidButton>
      </div>
    </SafeScreen>
  );
}

/* ─── Tab components ───────────────────────────────────────────────────── */

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: 36,
        borderRadius: 10,
        background: active ? 'rgba(0,255,255,0.10)' : 'rgba(255,255,255,0.03)',
        border: active ? '1px solid rgba(0,255,255,0.26)' : '1px solid rgba(255,255,255,0.08)',
        color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
        fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </button>
  );
}

function GuideTab({ details, aliases }) {
  const hasInstructions = Array.isArray(details.instructions) && details.instructions.length > 0;
  const hasTips = Array.isArray(details.tips) && details.tips.length > 0;
  const hasAliases = Array.isArray(aliases) && aliases.length > 0;

  return (
    <>
      {/* Primary / secondary muscles */}
      <SectionTitle>Muscles worked</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(details.primaryMuscles || []).map((m) => (
          <span
            key={m}
            style={{
              paddingInline: 12, height: 30, borderRadius: 9999,
              background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.22)',
              color: 'hsl(var(--rd-accent))',
              fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center',
            }}
          >
            {m}
          </span>
        ))}
        {(details.secondaryMuscles || []).map((m) => (
          <span
            key={m}
            style={{
              paddingInline: 12, height: 30, borderRadius: 9999,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
              color: 'hsl(var(--rd-fg-secondary))',
              fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
            }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* Instructions */}
      <SectionTitle hint={hasInstructions ? `${details.instructions.length} steps` : null}>
        How to perform
      </SectionTitle>
      {hasInstructions ? (
        <ol style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
          {details.instructions.map((step, i) => (
            <li key={i}>
              <SpringReveal delay={i * 30}>
                <div
                  style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: 12,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      width: 26, height: 26, borderRadius: 9999,
                      background: 'rgba(0,255,255,0.10)',
                      border: '1px solid rgba(0,255,255,0.26)',
                      color: 'hsl(var(--rd-accent))',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'hsl(var(--rd-fg-primary))' }}>
                    {step}
                  </div>
                </div>
              </SpringReveal>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyCard
          title="Detailed guide coming soon"
          body="This exercise doesn't have a step-by-step guide yet. Until it does, focus on a full range of motion and controlled eccentrics."
        />
      )}

      {/* Tips */}
      {hasTips && (
        <>
          <SectionTitle>Form tips</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {details.tips.map((tip, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(139,92,246,0.06)',
                  border: '1px solid rgba(139,92,246,0.18)',
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 6, height: 6, borderRadius: 9999,
                    background: '#A78BFA', marginTop: 7, flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: 13, lineHeight: 1.45, color: 'hsl(var(--rd-fg-primary))' }}>
                  {tip}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Aliases / regional names */}
      {hasAliases && (
        <>
          <SectionTitle>Also known as</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {aliases.map((a) => (
              <span
                key={a}
                style={{
                  paddingInline: 10, height: 26, borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'hsl(var(--rd-fg-muted))',
                  fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function HistoryTab({ history, personalBest, exerciseName }) {
  const hasHistory = Array.isArray(history) && history.length > 0;
  const hasPR = personalBest && (personalBest.weight || personalBest.reps);

  return (
    <>
      <SectionTitle>Personal records</SectionTitle>
      {hasPR ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <PRStat label="Weight" value={personalBest.weight ? `${personalBest.weight} kg` : '—'} />
          <PRStat label="Reps" value={personalBest.reps ? String(personalBest.reps) : '—'} />
          <PRStat label="Est. 1RM" value={personalBest.est1rm ? `${personalBest.est1rm} kg` : '—'} />
        </div>
      ) : (
        <EmptyCard
          title="No PR logged yet"
          body={`Your best set on ${exerciseName} will appear here after your first logged set.`}
        />
      )}

      <SectionTitle hint={hasHistory ? `${history.length} sessions` : null}>
        Recent sessions
      </SectionTitle>
      {hasHistory ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.slice(0, 10).map((s, i) => (
            <div
              key={i}
              style={{
                padding: 12,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginBottom: 6 }}>
                {formatDate(s.date)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(s.sets || []).map((set, j) => (
                  <span
                    key={j}
                    style={{
                      paddingInline: 8, height: 22, borderRadius: 6,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                      color: 'hsl(var(--rd-fg-primary))',
                      fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                      display: 'inline-flex', alignItems: 'center',
                    }}
                  >
                    {set.weight ?? '—'} kg × {set.reps ?? '—'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyCard
          title="No history yet"
          body="After you complete sets of this exercise, your progress will show here with weight, reps, and a trend chart."
        />
      )}
    </>
  );
}

function RelatedTab({ related, onOpenRelated }) {
  if (!related || related.length === 0) {
    return (
      <>
        <SectionTitle>Variations</SectionTitle>
        <EmptyCard
          title="No variations found"
          body="No other cataloged exercises share this primary muscle group."
        />
      </>
    );
  }
  return (
    <>
      <SectionTitle hint={`${related.length} options`}>Similar exercises</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {related.map((ex, i) => {
          const primary = ex.muscles?.[0];
          const mc = MUSCLE_COLORS[primary] || FALLBACK_MUSCLE_COLOR;
          const eq = EQUIPMENT_COLORS[ex.equipment] || EQUIPMENT_COLORS['Bodyweight'];
          return (
            <SpringReveal key={ex.id} delay={Math.min(i * 10, 80)}>
              <button
                type="button"
                onClick={() => onOpenRelated?.(ex)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: 10, borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'hsl(var(--rd-fg-primary))',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: mc.bg, border: `1px solid ${mc.bd}`, color: mc.c,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MuscleGroupIcon muscle={primary} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em',
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
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
                <svg
                  aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none"
                  style={{ flexShrink: 0, color: 'hsl(var(--rd-fg-muted))' }}
                >
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </SpringReveal>
          );
        })}
      </div>
    </>
  );
}

/* ─── Leaves ──────────────────────────────────────────────────────────── */

function PRStat({ label, value }) {
  return (
    <div
      style={{
        padding: '12px 10px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'hsl(var(--rd-fg-primary))', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

function EmptyCard({ title, body }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px dashed rgba(255,255,255,0.10)',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 12.5, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.45 }}>
        {body}
      </div>
    </div>
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
        Exercise not found
      </div>
      <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginBottom: 18, maxWidth: 280 }}>
        That ID isn't in the catalog. Go back and pick another one.
      </div>
      <LiquidButton variant="primary" onClick={onBack}>
        Back
      </LiquidButton>
    </div>
  );
}

function formatDate(input) {
  if (!input) return '—';
  try {
    const d = input instanceof Date ? input : new Date(input);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(input);
  }
}

/* ─── Convenience wrapper for the /app/exercises/:id route ─────────────── */

export function ExerciseDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exercise = findExerciseById(id);
  const [history, setHistory] = useState(null);
  const [personalBest, setPersonalBest] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const [sets, pr] = await Promise.all([
        getSetsForExercise(id, { limit: 200 }),
        getPersonalBest(id),
      ]);
      if (cancelled) return;

      // Group sets by session date (YYYY-MM-DD of started_at) so the
      // HistoryTab shows one row per workout date.
      const byDate = new Map();
      for (const s of sets || []) {
        const iso = s.started_at || s.performed_at;
        if (!iso) continue;
        const dayKey = new Date(iso).toISOString().slice(0, 10);
        let bucket = byDate.get(dayKey);
        if (!bucket) {
          bucket = { date: iso, sets: [] };
          byDate.set(dayKey, bucket);
        }
        bucket.sets.push({
          weight: s.weight_kg,
          reps: s.reps,
        });
      }
      // Newest first.
      const grouped = Array.from(byDate.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setHistory(grouped.length > 0 ? grouped : null);
      setPersonalBest(pr);
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <ExerciseDetail
      exercise={exercise}
      history={history}
      personalBest={personalBest}
      onBack={() => navigate(-1)}
      onAddToPlan={(ex) => navigate(`/app/workouts/manual-plan?add=${encodeURIComponent(ex.id)}`)}
      onOpenRelated={(ex) => navigate(`/app/exercises/${ex.id}`)}
    />
  );
}
