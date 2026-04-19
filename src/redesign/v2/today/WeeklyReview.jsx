/**
 * WeeklyReview — /app/weekly.
 * Ref: Strava weekly wrap + Whoop weekly performance + Apple Fitness weekly summary.
 *
 * The "here's your week in one scroll" screen. Editorial headline → 7-day
 * calendar heatmap → 4 big metrics compared to last week → workout list →
 * nutrition summary → coach reflection.
 *
 * RULE: every data slice accepts null and shows an honest empty state.
 */
import React from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { DumbbellIcon, FlameIcon, PulseIcon, UtensilsIcon, SparkleIcon, TrendUpIcon, TrendDownIcon, ChevronRightIcon } from '../lib/icons';

export default function WeeklyReview({
  weekOf = new Date(),        // Date at start of week (Mon)
  days = null,                // [7] { date, workouts, kcal, steps, recovery } — or null
  summary = null,             // { sessions, totalVolume, avgRecovery, avgKcal, deltaSessions, deltaVolume, ... }
  workouts = [],              // [{ id, date, name, duration, volume }]
  coachReflection = null,     // { title, body, cta }
  onOpenDay,                  // (dateISO) => void
  onOpenStreaks,              // () => void — navigate to /app/today/streaks
  onBack,
}) {
  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>

        {/* Header */}
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Week of {weekOf.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            {summary
              ? <>Your week, end to end.</>
              : <>Week in review.</>}
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
            {summary
              ? 'Every session, meal, and recovery signal — summarized.'
              : 'Your weekly recap will fill in as you log training and meals.'}
          </p>
        </SpringReveal>

        {/* 7-day calendar strip */}
        <SpringReveal delay={60}>
          <WeekCalendarStrip days={days} onOpenDay={onOpenDay} />
        </SpringReveal>

        {/* Summary metrics */}
        <SpringReveal delay={120}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 20 }}>
            <SummaryMetric Icon={DumbbellIcon} label="Sessions" value={summary?.sessions} delta={summary?.deltaSessions} />
            <SummaryMetric Icon={TrendUpIcon}  label="Volume"   value={summary?.totalVolume} unit="kg" delta={summary?.deltaVolume} bigNumber />
            <SummaryMetric Icon={PulseIcon}    label="Avg recovery" value={summary?.avgRecovery} unit="%" delta={summary?.deltaRecovery} />
            <SummaryMetric Icon={UtensilsIcon} label="Avg kcal" value={summary?.avgKcal} delta={summary?.deltaKcal} />
          </div>
        </SpringReveal>

        {/* Workouts list */}
        <SpringReveal delay={180}>
          <SectionHeader title="Workouts this week" />
          {workouts.length === 0 ? (
            <Glass radius="lg" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                No sessions logged. Your completed workouts appear here at the end of the week.
              </div>
            </Glass>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {workouts.map((w) => <WorkoutRow key={w.id} workout={w} />)}
            </div>
          )}
        </SpringReveal>

        {/* Coach reflection */}
        <SpringReveal delay={240}>
          <SectionHeader title="Coach reflection" />
          {coachReflection ? (
            <Glass tint="ai" radius="xl" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span aria-hidden style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(139,92,246,0.22)', border: '1px solid rgba(139,92,246,0.5)', color: '#A78BFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SparkleIcon size={16} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', marginBottom: 4 }}>
                    {coachReflection.title}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
                    {coachReflection.body}
                  </p>
                </div>
              </div>
            </Glass>
          ) : (
            <Glass radius="lg" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                A short reflection from your coach will appear here once there's a full week of data to analyze.
              </div>
            </Glass>
          )}
        </SpringReveal>

        {/* Streaks entry point — the weekly recap is the natural place to
            surface consistency over time. */}
        <SpringReveal delay={280}>
          <button
            type="button"
            onClick={onOpenStreaks}
            style={{
              width: '100%',
              marginTop: 18,
              padding: '14px 16px',
              borderRadius: 16,
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.22)',
              color: 'hsl(var(--rd-fg-primary))',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              backdropFilter: 'blur(14px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
              textAlign: 'left',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(245,158,11,0.14)',
                border: '1px solid rgba(245,158,11,0.35)',
                color: '#FBBF24',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FlameIcon size={16} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }}>
                View all streaks
              </span>
              <span style={{ display: 'block', fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
                Consistency over weeks and months.
              </span>
            </span>
            <ChevronRightIcon size={16} />
          </button>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}
export { WeeklyReview };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function WeekCalendarStrip({ days, onOpenDay }) {
  const fallback = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: d, workouts: 0, recovery: null };
  });
  const arr = Array.isArray(days) && days.length === 7 ? days : fallback;

  return (
    <Glass radius="xl" style={{ padding: 12, marginTop: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4 }}>
        {arr.map((d, i) => {
          const date = d.date instanceof Date ? d.date : new Date(d.date);
          const hasWorkout = (d.workouts || 0) > 0;
          const recoveryColor = d.recovery == null ? null
            : d.recovery >= 75 ? 'hsl(var(--rd-health-excellent))'
            : d.recovery >= 55 ? 'hsl(var(--rd-health-good))'
            : d.recovery >= 34 ? 'hsl(var(--rd-health-moderate))'
            : 'hsl(var(--rd-health-low))';
          return (
            <button
              key={i}
              type="button"
              onClick={() => onOpenDay?.(date.toISOString().slice(0, 10))}
              style={{
                padding: '10px 2px',
                borderRadius: 12,
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--rd-fg-primary))',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: '0.08em', color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
                {date.getDate()}
              </span>
              {/* Workout dot */}
              <span
                aria-hidden
                style={{
                  width: 6, height: 6, borderRadius: 99,
                  background: hasWorkout ? 'hsl(var(--rd-accent))' : 'rgba(255,255,255,0.1)',
                }}
              />
              {/* Recovery bar */}
              <span
                aria-hidden
                style={{
                  width: 22, height: 3, borderRadius: 2,
                  background: recoveryColor || 'rgba(255,255,255,0.06)',
                }}
              />
            </button>
          );
        })}
      </div>
    </Glass>
  );
}

function SummaryMetric({ Icon, label, value, unit = '', delta, bigNumber }) {
  const has = value !== null && value !== undefined;
  const deltaPositive = typeof delta === 'number' && delta > 0;
  const deltaNegative = typeof delta === 'number' && delta < 0;
  return (
    <Glass radius="xl" style={{ padding: 14 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'hsl(var(--rd-accent))' }}>
        <Icon size={14} />
        <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: has ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.1 }}>
        {has ? (bigNumber ? formatBig(value) : value) : '—'}
        {has && unit && <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{unit}</span>}
      </div>
      {typeof delta === 'number' && (
        <div
          style={{
            fontSize: 11, fontWeight: 700, marginTop: 6,
            color: deltaPositive ? '#34D399' : deltaNegative ? '#FB7185' : 'hsl(var(--rd-fg-muted))',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {deltaPositive ? '↑' : deltaNegative ? '↓' : '·'} {Math.abs(delta)}{unit} vs last week
        </div>
      )}
    </Glass>
  );
}

function WorkoutRow({ workout }) {
  const d = new Date(workout.date);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ width: 36, textAlign: 'center' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
          {d.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          {d.getDate()}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }} className="truncate">{workout.name}</div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {workout.duration ? `${workout.duration} min` : ''}
          {workout.volume ? ` · ${formatBig(workout.volume)} kg` : ''}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <h2 style={{ margin: '24px 0 10px', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', paddingInline: 2 }}>
      {title}
    </h2>
  );
}

function formatBig(n) {
  if (typeof n !== 'number') return n;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n * 10) / 10);
}
