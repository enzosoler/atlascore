/**
 * Today — v2. Whoop-inspired home.
 * Refs (actually copied layouts from):
 *  - Whoop home: big recovery ring + drivers grid + strain meter + sleep card + week calendar
 *  - Apple Fitness: three-ring hero pattern, close-the-rings density
 *  - Fitbit Today: key metric cards stacked with trend sparks
 *  - Cal AI: macro strip + quick-log CTAs
 *  - Oura: sleep score detail + readiness markers
 *
 * Density target: every fold has content. Never blank sections.
 * First-time users see "sync a device" / "log your first …" CTAs that LOOK like
 * the real feature, not empty placeholders.
 */
import React from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import { FlameIcon, LeafIcon, SparkleIcon, SunIcon, MoonIcon, CameraIcon, BarcodeIcon, MicIcon, TrendUpIcon, TrendDownIcon, TargetIcon } from '../lib/icons';

export default function Today({
  user = { name: '', avatar: null },
  // Recovery (Whoop-ish)
  recovery = null,                 // 0..100
  recoveryDrivers = null,          // { hrv, rhr, sleepPerformance, respRate }
  sleep = null,                    // { hours, minutes, performancePct, debtHours }
  strain = null,                   // { today, target, cap }  — 0..21 Whoop scale
  // Weather (contextual greeting)
  weather = null,                  // { tempC, tempF, condition, city, comment }
  // Nutrition (MyFitnessPal-ish)
  macros = { calories: { eaten: 0, target: 2200 }, protein: { eaten: 0, target: 165 }, carbs: { eaten: 0, target: 220 }, fat: { eaten: 0, target: 73 } },
  // Training
  workout = null,                  // { name, duration, exercises: [{name, sets, reps}] }
  weekRecovery = null,             // [7] scores 0..100 for last 7 days
  // Coach
  coachTip = null,                 // { title, body, cta }
  streak = 0,
  // Handlers
  onLogMeal,
  onStartWorkout,
  onOpenCoach,
  onOpenRecovery,
  onOpenSleep,
  onOpenStrain,
  onConnectDevice,
  onOpenWeekly,          // /app/weekly
  onOpenInsights,        // /app/insights
  onOpenDiary,           // /app/diary
  onOpenStreaks,         // /app/today/streaks
  onEnterFocus,          // /app/today/focus?task=workout
  onOpenSocial,          // /app/social — friends' activity teaser
  friendsActivity = null, // null = honest empty-state preview (MVP)
}) {
  const firstName = (user.name || '').split(' ')[0] || 'there';
  const hasRecoveryData = typeof recovery === 'number';

  return (
    <SafeScreen hasTopBar hasBottomNav hasFab paddingX={20}>
      {/* Warm greeting — copied the format Enzo had: salute + name + weather chip + contextual comment */}
      <SpringReveal delay={20}>
        <GreetingHeader firstName={firstName} weather={weather} workout={workout} recovery={recovery} />
      </SpringReveal>

      {/* ── RECOVERY HERO (Whoop-style, dominant) ─────────────────── */}
      <SpringReveal delay={60}>
        <RecoveryHero
          score={recovery}
          drivers={recoveryDrivers}
          streak={streak}
          onOpen={onOpenRecovery}
          onConnectDevice={onConnectDevice}
          onOpenStreaks={onOpenStreaks}
        />
      </SpringReveal>

      {/* ── WEEK STRIP ───────────────────────────────────────────── */}
      <SpringReveal delay={110}>
        <WeekStrip scores={weekRecovery} />
      </SpringReveal>

      {/* ── SLEEP + STRAIN 2-up ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        <SpringReveal delay={160}>
          <SleepCard sleep={sleep} onOpen={onOpenSleep} onConnectDevice={onConnectDevice} />
        </SpringReveal>
        <SpringReveal delay={200}>
          <StrainCard strain={strain} onOpen={onOpenStrain} />
        </SpringReveal>
      </div>

      {/* ── NEXT WORKOUT ─────────────────────────────────────────── */}
      <SpringReveal delay={240}>
        <SectionHeader
          title="Today's training"
          action={
            workout
              ? { label: 'Enter focus mode', onClick: onEnterFocus }
              : { label: 'Browse', onClick: onStartWorkout }
          }
        />
        <WorkoutCard workout={workout} onStart={onStartWorkout} recovery={recovery} />
      </SpringReveal>

      {/* ── NUTRITION STRIP ──────────────────────────────────────── */}
      <SpringReveal delay={280}>
        <SectionHeader title="Fuel" action={{ label: 'Log meal', onClick: onLogMeal }} />
        <MacrosCard macros={macros} onQuickLog={onLogMeal} />
      </SpringReveal>

      {/* ── COACH INSIGHT ────────────────────────────────────────── */}
      <SpringReveal delay={320}>
        <CoachCard
          tip={coachTip || defaultCoachTip(hasRecoveryData, streak)}
          onOpen={onOpenCoach}
        />
      </SpringReveal>

      {/* ── EXPLORE STRIP — entry points to Today's companion screens ── */}
      <SpringReveal delay={380}>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', marginBottom: 10, paddingInline: 2 }}>
            Go deeper
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
            <ExploreTile
              Icon={CalendarIcon}
              label="Weekly"
              sub="Your week in numbers"
              onClick={onOpenWeekly}
            />
            <ExploreTile
              Icon={SparkleIcon}
              label="Insights"
              sub="AI-generated patterns"
              tint="ai"
              onClick={onOpenInsights}
            />
            <ExploreTile
              Icon={NoteIcon}
              label="Diary"
              sub="Today's reflection"
              onClick={onOpenDiary}
            />
          </div>
        </div>
      </SpringReveal>

      {/* ── FRIENDS' ACTIVITY TEASER ─────────────────────────────────
          Low-priority dashboard tile for the (post-launch) Social domain.
          Honest empty preview — no fabricated feed rows. Taps through to
          /app/social where the real feed will live. */}
      <SpringReveal delay={440}>
        <FriendsActivityTeaser
          activity={friendsActivity}
          onOpen={onOpenSocial}
        />
      </SpringReveal>
    </SafeScreen>
  );
}
export { Today };

/* ─── Recovery hero ─────────────────────────────────────────────────────── */

function RecoveryHero({ score, drivers, streak, onOpen, onConnectDevice, onOpenStreaks }) {
  const hasScore = typeof score === 'number';
  const color = hasScore ? ringColor(score) : 'hsl(var(--rd-fg-muted))';
  const bucket = hasScore ? bucketFor(score) : null;

  // Empty state — compact, one-line sub, solid CTA, subtle pulsing ring
  if (!hasScore) {
    return (
      <Glass tint="neutral" radius="xl" elevation="md" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <EmptyPulseRing />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
              Recovery
            </div>
            <div style={{ marginTop: 2, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'hsl(var(--rd-fg-primary))' }}>
              Unlock your readiness
            </div>
            <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 3, lineHeight: 1.35 }}>
              Sync Apple Watch, Whoop, or Oura.
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <LiquidButton intent="primary" size="md" block onClick={onConnectDevice} leftIcon={<IconLink />}>
            Connect device
          </LiquidButton>
        </div>
      </Glass>
    );
  }

  // Populated state — rich hero with drivers grid.
  // NO radial-gradient bloom behind the ring. Even at 0.06 alpha it paints the
  // card background and creates the optical illusion that the ring color is
  // "bleeding out" of the circle boundary. The ring stands on its own.
  return (
    <Glass tint="neutral" radius="xl" elevation="lg" style={{ padding: 20, position: 'relative' }}>

      <button
        type="button"
        onClick={onOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          padding: 0,
          position: 'relative',
        }}
      >
        <BigRing score={score} color={color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Recovery
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1, color }}>
              {score}
            </span>
            <span style={{ fontSize: 18, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>%</span>
          </div>
          <div style={{ fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', marginTop: 6, lineHeight: 1.35 }}>
            {bucket}
          </div>
        </div>
      </button>
      {/* Tappable streak pill — sits outside the recovery button so nested
          interactive elements don't break a11y. Always visible (shows "Streaks"
          as a link even at zero) so the Streaks screen is discoverable. */}
      <div style={{ marginTop: 10, display: 'flex' }}>
        <button
          type="button"
          onClick={onOpenStreaks}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 9999,
            background: streak > 0 ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.04)',
            border: streak > 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
            color: streak > 0 ? '#FBBF24' : 'hsl(var(--rd-fg-secondary))',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <FlameIcon size={12} />
          <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {streak > 0 ? `${streak}-day streak` : 'Streaks'}
          </span>
          <span aria-hidden style={{ fontSize: 12, opacity: 0.7 }}>›</span>
        </button>
      </div>
      {drivers && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, position: 'relative' }}>
          <DriverCell label="HRV"        value={drivers.hrv}   unit="ms"  delta={drivers.hrvDelta}   trendData={drivers.hrvTrend} />
          <DriverCell label="Resting HR" value={drivers.rhr}   unit="bpm" delta={drivers.rhrDelta}   trendData={drivers.rhrTrend} />
          <DriverCell label="Sleep"      value={drivers.sleepPerformance} unit="%" delta={drivers.sleepDelta} trendData={drivers.sleepTrend} />
          <DriverCell label="Resp"       value={drivers.respRate} unit="brpm" delta={drivers.respDelta} trendData={drivers.respTrend} />
        </div>
      )}
    </Glass>
  );
}

/** Small pulsing ring for the empty recovery state — looks alive, not dead. */
function EmptyPulseRing() {
  return (
    <div style={{ width: 72, height: 72, flexShrink: 0, position: 'relative' }}>
      <svg viewBox="0 0 80 80" style={{ width: '100%', height: '100%' }} aria-hidden>
        <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
        <circle
          cx="40"
          cy="40"
          r="32"
          stroke="hsl(var(--rd-accent))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="20 180"
          transform="rotate(-90 40 40)"
          style={{ animation: 'rd-ring-pulse 2200ms cubic-bezier(.4,0,.2,1) infinite' }}
        />
      </svg>
      <style>{`
        @keyframes rd-ring-pulse {
          0%   { stroke-dashoffset: 0;   opacity: 0.4; }
          50%  { stroke-dashoffset: -100; opacity: 1;   }
          100% { stroke-dashoffset: -200; opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="rd-ring-pulse"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function BigRing({ score, color }) {
  const hasScore = typeof score === 'number';
  const pct = hasScore ? Math.max(0, Math.min(100, score)) / 100 : 0;
  const offset = 440 * (1 - pct);
  // NOTE: NO drop-shadow here. Previously `drop-shadow(0 0 10px ...)` created
  // a ~60px halo that read as a smudge/stain. The gradient stroke already gives
  // plenty of visual presence — the halo was gilding.
  return (
    <div style={{ width: 140, height: 140, flexShrink: 0, position: 'relative' }}>
      <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%' }} aria-hidden>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
        <circle
          cx="80"
          cy="80"
          r="70"
          stroke={hasScore ? 'url(#ringGrad)' : 'rgba(255,255,255,0.15)'}
          strokeWidth="12"
          strokeDasharray="440"
          strokeDashoffset={hasScore ? offset : 440 * 0.75}
          strokeLinecap="round"
          fill="none"
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 620ms cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
    </div>
  );
}

function DriverCell({ label, value, unit, delta, trendData }) {
  const has = value !== null && value !== undefined;
  const positive = typeof delta === 'number' && delta >= 0;
  return (
    <div
      style={{
        padding: '10px 8px 8px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: has ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))', lineHeight: 1 }}>
          {has ? value : '—'}
        </span>
        <span style={{ fontSize: 10, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
          {unit}
        </span>
      </div>
      {trendData && (
        <div style={{ marginTop: 6, height: 16, opacity: 0.85 }}>
          <Sparkline data={trendData} color={positive ? 'hsl(var(--rd-health-excellent))' : 'hsl(var(--rd-accent))'} />
        </div>
      )}
      {typeof delta === 'number' && (
        <div style={{ fontSize: 9, color: positive ? '#34D399' : '#FB7185', marginTop: 3, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
          {positive ? '↑' : '↓'} {Math.abs(delta)}{unit === '%' ? 'pts' : ''}
        </div>
      )}
    </div>
  );
}

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ─── Week strip ────────────────────────────────────────────────────────── */

function WeekStrip({ scores }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  return (
    <Glass radius="lg" style={{ padding: 12, marginTop: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {days.map((d, i) => {
          const score = scores?.[i] ?? null;
          const has = typeof score === 'number';
          const color = has ? ringColor(score) : 'rgba(255,255,255,0.14)';
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.08em', color: isToday ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
                {d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
              </span>
              <span
                aria-hidden
                style={{
                  width: isToday ? 14 : 10,
                  height: isToday ? 14 : 10,
                  borderRadius: 9999,
                  background: color,
                  border: isToday ? '2px solid hsl(var(--rd-fg-primary))' : 'none',
                  boxShadow: 'none',
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

/* ─── Sleep card ────────────────────────────────────────────────────────── */

function SleepCard({ sleep, onOpen, onConnectDevice }) {
  if (!sleep) {
    return (
      <Glass tint="ai" radius="xl" style={{ padding: 14, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: '#A78BFA' }}>
          <MoonIcon size={14} />
          <Eyebrow>Sleep</Eyebrow>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', lineHeight: 1.25 }}>
          Track your nights
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.35 }}>
          Unlock REM, deep, and light zones.
        </div>
        <button
          type="button"
          onClick={onConnectDevice}
          style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#A78BFA', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          Connect →
        </button>
      </Glass>
    );
  }
  const totalMin = (sleep.hours || 0) * 60 + (sleep.minutes || 0);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const perf = sleep.performancePct ?? 0;
  // Default zone distribution (typical night) if not provided
  const zones = sleep.zones || { rem: 0.22, deep: 0.18, light: 0.52, awake: 0.08 };
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent', height: '100%' }}
    >
      <Glass tint="ai" radius="xl" style={{ padding: 14, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <MoonIcon />
          <Eyebrow>Last night</Eyebrow>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 2 }}>
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: '#A78BFA' }}>
            {hrs}
          </span>
          <span style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>h</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginLeft: 4, color: '#A78BFA' }}>
            {mins.toString().padStart(2, '0')}
          </span>
          <span style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>m</span>
        </div>

        {/* Stacked zones bar — Whoop/Oura style */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ width: `${zones.deep * 100}%`, background: '#7C3AED' }} title={`Deep ${Math.round(zones.deep * 100)}%`} />
            <div style={{ width: `${zones.rem * 100}%`, background: '#A78BFA' }} title={`REM ${Math.round(zones.rem * 100)}%`} />
            <div style={{ width: `${zones.light * 100}%`, background: 'rgba(167,139,250,0.4)' }} title={`Light ${Math.round(zones.light * 100)}%`} />
            <div style={{ width: `${zones.awake * 100}%`, background: 'rgba(255,255,255,0.15)' }} title={`Awake ${Math.round(zones.awake * 100)}%`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'hsl(var(--rd-fg-muted))', letterSpacing: '0.04em', fontWeight: 600 }}>
            <span><Dot c="#7C3AED" /> Deep</span>
            <span><Dot c="#A78BFA" /> REM</span>
            <span><Dot c="rgba(167,139,250,0.4)" /> Light</span>
            <span style={{ color: '#A78BFA', fontWeight: 700 }}>{perf}%</span>
          </div>
        </div>

        {typeof sleep.debtHours === 'number' && sleep.debtHours > 0 && (
          <div style={{ marginTop: 8, fontSize: 11, color: 'hsl(var(--rd-fg-muted))' }}>
            Debt: <strong style={{ color: '#FB7185' }}>{sleep.debtHours.toFixed(1)}h</strong>
          </div>
        )}
      </Glass>
    </button>
  );
}

function Dot({ c }) {
  return (
    <span aria-hidden style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 99, background: c, marginRight: 4, verticalAlign: 'middle' }} />
  );
}

/* MoonIcon moved to shared lib/icons.jsx (brand rule: no emoji + shared set). */

/* ─── Strain card ───────────────────────────────────────────────────────── */

function StrainCard({ strain, onOpen }) {
  if (!strain) {
    return (
      <Glass tint="accent" radius="xl" style={{ padding: 14, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <BoltIcon />
          <Eyebrow>Day's load</Eyebrow>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>
          Day just started
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.35 }}>
          Builds as you train and move.
        </div>
      </Glass>
    );
  }
  const cap = strain.cap ?? 21;
  const pct = Math.max(0, Math.min(1, (strain.today ?? 0) / cap));
  // Synthetic hourly-strain timeline for the area chart (24 hours)
  const timeline = strain.timeline || generateStrainTimeline(strain.today ?? 0);
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent', height: '100%' }}
    >
      <Glass tint="accent" radius="xl" style={{ padding: 14, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <BoltIcon />
          <Eyebrow>Day's load · today</Eyebrow>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: 'hsl(var(--rd-accent))' }}>
            {(strain.today ?? 0).toFixed(1)}
          </span>
          <span style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>/ {cap}</span>
        </div>
        {/* Timeline area chart */}
        <div style={{ marginTop: 8, height: 34 }}>
          <StrainTimeline data={timeline} target={(strain.target ?? 0) / cap} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'hsl(var(--rd-fg-muted))', letterSpacing: '0.04em', fontWeight: 600, marginTop: 2 }}>
          <span>0h</span>
          <span style={{ color: 'hsl(var(--rd-accent))', fontWeight: 700 }}>Target {strain.target ?? 0}</span>
          <span>24h</span>
        </div>
      </Glass>
    </button>
  );
}

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" stroke="hsl(var(--rd-accent))" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function StrainTimeline({ data, target }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 100;
  const h = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  const areaPath = `M 0,${h} L ${points.join(' L ')} L ${w},${h} Z`;
  const linePath = `M ${points.join(' L ')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }} aria-hidden>
      <defs>
        <linearGradient id="strainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--rd-accent))" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(var(--rd-accent))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Target line */}
      <line
        x1="0"
        x2="100"
        y1={h - target * h}
        y2={h - target * h}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
        strokeDasharray="2 2"
        vectorEffect="non-scaling-stroke"
      />
      <path d={areaPath} fill="url(#strainGrad)" />
      <path d={linePath} fill="none" stroke="hsl(var(--rd-accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function generateStrainTimeline(current) {
  // 24 bars, accumulates up to `current` with sleep 0-6, morning ramp, lunch dip, afternoon peak, evening plateau
  const shape = [0, 0, 0, 0, 0, 0, 0.02, 0.08, 0.18, 0.32, 0.42, 0.48, 0.52, 0.58, 0.72, 0.85, 0.94, 1, 1, 1, 1, 1, 1, 1];
  return shape.map((v) => v * current);
}

function MiniBar({ value, max, color, label }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <>
      <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: color,
            borderRadius: 4,
            transition: 'width 420ms cubic-bezier(.22,1,.36,1)',
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>{label}</div>
    </>
  );
}

/* ─── Workout card ──────────────────────────────────────────────────────── */

function WorkoutCard({ workout, onStart, recovery }) {
  if (!workout) {
    const hasScore = typeof recovery === 'number';
    return (
      <Glass radius="xl" style={{ padding: 18, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            aria-hidden
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.25)',
              color: '#34D399',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <LeafIcon size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
              Rest day
            </div>
            <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, lineHeight: 1.4 }}>
              {hasScore && recovery < 34
                ? 'Your recovery is low — let your body reset today.'
                : 'Nothing prescribed. Light walk + sleep are the training today.'}
            </div>
          </div>
          <LiquidButton intent="neutral" size="sm" onClick={onStart}>
            Browse
          </LiquidButton>
        </div>
      </Glass>
    );
  }
  return (
    <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 18, marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'hsl(var(--rd-accent))', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
            {workout.phase || 'Prescribed'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2, lineHeight: 1.2 }}>
            {workout.name}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', fontSize: 12, color: 'hsl(var(--rd-fg-secondary))' }}>
            {workout.duration != null && <Pill>{workout.duration} min</Pill>}
            {workout.exercises && <Pill>{workout.exercises.length ?? workout.exercises} exercises</Pill>}
            {workout.intensity && <Pill>{workout.intensity}</Pill>}
          </div>
        </div>
      </div>
      {/* Exercise preview */}
      {Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
        <div style={{ padding: '10px 0', borderTop: '1px solid rgba(0,255,255,0.12)', borderBottom: '1px solid rgba(0,255,255,0.12)', marginBottom: 14 }}>
          {workout.exercises.slice(0, 3).map((ex, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
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
      <LiquidButton intent="primary" size="lg" block onClick={onStart} leftIcon={<IconPlay />}>
        Start workout
      </LiquidButton>
    </Glass>
  );
}

/* ─── Macros ────────────────────────────────────────────────────────────── */

function MacrosCard({ macros, onQuickLog }) {
  const { calories, protein, carbs, fat } = macros;
  const caloriePct = calories.target > 0 ? Math.min(1, calories.eaten / calories.target) : 0;
  return (
    <Glass radius="xl" style={{ padding: 16, marginTop: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <svg viewBox="0 0 120 120" style={{ width: '100%', maxWidth: 120 }} aria-hidden>
            <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="hsl(var(--rd-accent))"
              strokeWidth="10"
              strokeDasharray="314"
              strokeDashoffset={314 * (1 - caloriePct)}
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 520ms cubic-bezier(.22,1,.36,1)' }}
            />
            <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="700" fill="hsl(var(--rd-fg-primary))" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              {Math.max(0, (calories.target || 0) - (calories.eaten || 0))}
            </text>
            <text x="60" y="74" textAnchor="middle" fontSize="9" fill="hsl(var(--rd-fg-muted))" style={{ letterSpacing: '0.14em' }}>
              KCAL LEFT
            </text>
          </svg>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <MacroBar label="Protein" eaten={protein.eaten} target={protein.target} color="hsl(var(--rd-accent))" />
          <MacroBar label="Carbs"   eaten={carbs.eaten}   target={carbs.target}   color="#FBBF24" />
          <MacroBar label="Fat"     eaten={fat.eaten}     target={fat.target}     color="#A78BFA" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <LiquidButton intent="neutral" size="sm" block onClick={onQuickLog} leftIcon={<IconCamera />}>Photo</LiquidButton>
        <LiquidButton intent="neutral" size="sm" block onClick={onQuickLog} leftIcon={<IconSearch />}>Search</LiquidButton>
        <LiquidButton intent="neutral" size="sm" block onClick={onQuickLog} leftIcon={<IconBarcode />}>Scan</LiquidButton>
      </div>
    </Glass>
  );
}

function MacroBar({ label, eaten, target, color }) {
  const pct = target > 0 ? Math.min(1, eaten / target) : 0;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--rd-fg-secondary))' }}>
          {Math.round(eaten)}<span style={{ color: 'hsl(var(--rd-fg-muted))', fontWeight: 400 }}>/{target}g</span>
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 420ms cubic-bezier(.22,1,.36,1)' }} />
      </div>
    </div>
  );
}

/* ─── Coach card ────────────────────────────────────────────────────────── */

function CoachCard({ tip, onOpen }) {
  return (
    <Glass tint="ai" radius="xl" elevation="md" style={{ padding: 16, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span aria-hidden style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(139,92,246,0.28)', border: '1px solid rgba(139,92,246,0.5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l1.9 5.9L20 10l-5 3.6L16 20l-4-3-4 3 1-6.4L4 10l6.1-1.1z" stroke="#A78BFA" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A78BFA', fontWeight: 700, marginBottom: 4 }}>
            Coach
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: 'hsl(var(--rd-fg-primary))' }}>
            {tip.title}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, color: 'hsl(var(--rd-fg-secondary))' }}>
            {tip.body}
          </p>
          {tip.cta && (
            <button type="button" onClick={onOpen} style={{ marginTop: 10, background: 'transparent', border: 'none', color: '#A78BFA', fontSize: 13, fontWeight: 600, padding: 0, cursor: 'pointer' }}>
              {tip.cta} →
            </button>
          )}
        </div>
      </div>
    </Glass>
  );
}

/* ─── Section header + Pill + icons ─────────────────────────────────────── */

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 4, paddingInline: 2 }}>
      <h2 style={{ margin: 0, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
        {title}
      </h2>
      {action && (
        <button type="button" onClick={action.onClick} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
function Eyebrow({ children }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
      {children}
    </div>
  );
}
function Pill({ children }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 9999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--rd-fg-secondary))', fontWeight: 500 }}>
      {children}
    </span>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function greetingFor(d) {
  const h = d.getHours();
  // No emoji — brand rule. Icon component returned instead.
  if (h < 5)  return { text: 'Still up',   Icon: MoonIcon };
  if (h < 12) return { text: 'Morning',    Icon: SunIcon };
  if (h < 18) return { text: 'Afternoon',  Icon: SunIcon };
  if (h < 22) return { text: 'Evening',    Icon: MoonIcon };
  return          { text: 'Late',          Icon: MoonIcon };
}

/**
 * GreetingHeader — the warm opener for Today.
 * Shows: salute + name + weather chip (right) + one-line contextual comment.
 * The comment reacts to (in priority): weather.comment → workout → recovery → generic.
 */
function GreetingHeader({ firstName, weather, workout, recovery }) {
  const g = greetingFor(new Date());
  const comment = (() => {
    if (weather?.comment) return weather.comment;
    if (workout?.name) {
      return `Today's plan: ${workout.name}${workout.duration ? ` · ${workout.duration} min` : ''}`;
    }
    if (typeof recovery === 'number') {
      if (recovery >= 75) return 'Feeling fresh? Push a little harder today.';
      if (recovery >= 55) return 'Solid recovery — keep the volume honest.';
      if (recovery >= 34) return 'Easy session or skill work today.';
      return 'Low recovery — rest is training too.';
    }
    return 'Ready when you are.';
  })();

  const GreetingIcon = g.Icon;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: 'hsl(var(--rd-fg-primary))',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>{g.text}, {firstName}</span>
            <span aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))', display: 'inline-flex', flexShrink: 0 }}>
              <GreetingIcon size={20} />
            </span>
          </div>
        </div>
        {weather && (
          <WeatherChip weather={weather} />
        )}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 13,
          color: 'hsl(var(--rd-fg-muted))',
          lineHeight: 1.4,
        }}
      >
        {comment}
      </div>
    </div>
  );
}

function WeatherChip({ weather }) {
  const { tempC, tempF, condition } = weather;
  const temp = typeof tempC === 'number' ? `${Math.round(tempC)}°` : typeof tempF === 'number' ? `${Math.round(tempF)}°F` : '—';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 9999,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(14px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
      }}
    >
      <WeatherIcon condition={condition} />
      <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--rd-fg-primary))', letterSpacing: '-0.01em' }}>
        {temp}
      </span>
    </div>
  );
}

function WeatherIcon({ condition }) {
  const c = (condition || '').toLowerCase();
  const s = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  if (c.includes('rain') || c.includes('shower')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" style={{ color: 'hsl(var(--rd-accent))' }} aria-hidden>
        <path {...s} d="M7 15a5 5 0 0 1 .1-10 6 6 0 0 1 11.3 2A4 4 0 0 1 18 15z" />
        <path {...s} d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" />
      </svg>
    );
  }
  if (c.includes('snow')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" style={{ color: '#BAE6FD' }} aria-hidden>
        <path {...s} d="M12 3v18M3 12h18M5 5l14 14M19 5L5 19" />
      </svg>
    );
  }
  if (c.includes('cloud')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" style={{ color: '#C6CDD7' }} aria-hidden>
        <path {...s} d="M7 18a5 5 0 0 1 .1-10 6 6 0 0 1 11.3 2A4 4 0 0 1 18 18z" />
      </svg>
    );
  }
  if (c.includes('night') || c.includes('clear night')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" style={{ color: '#A78BFA' }} aria-hidden>
        <path {...s} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    );
  }
  // default: sun / clear
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ color: '#FBBF24' }} aria-hidden>
      <circle {...s} cx="12" cy="12" r="4" />
      <path {...s} d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
    </svg>
  );
}
function ringColor(s) {
  if (s >= 75) return 'hsl(var(--rd-health-excellent))';
  if (s >= 55) return 'hsl(var(--rd-health-good))';
  if (s >= 34) return 'hsl(var(--rd-health-moderate))';
  return 'hsl(var(--rd-health-low))';
}
function bucketFor(s) {
  if (s >= 75) return 'Ready to push. Green light for intensity.';
  if (s >= 55) return 'Moderate. Train, but keep volume honest.';
  if (s >= 34) return 'Recover first. Skill work or easy session only.';
  return 'Rest today. Your body is asking.';
}
function defaultCoachTip(hasRecovery, streak) {
  if (!hasRecovery) {
    return {
      title: "Let's make today count.",
      body: "Connect a wearable to unlock personalized coaching. In the meantime, log your first meal so I can calibrate your macros.",
      cta: 'Connect device',
    };
  }
  if (streak === 0) {
    return {
      title: 'Start your streak.',
      body: "Log your first meal or complete a workout today to start a streak. Consistency beats intensity.",
      cta: 'Ask coach',
    };
  }
  return {
    title: `${streak} days strong.`,
    body: "Keep showing up. I'll be here the moment something shifts in your data.",
    cta: 'Ask coach',
  };
}

function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5l12 7-12 7V5z" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 6l1.5-2h5L16 6" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
function IconBarcode() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6v12M7 6v12M10 6v12M13 6v12M16 6v12M19 6v12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
function NoteIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 4h11l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM15 4v5h5M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * FriendsActivityTeaser — low-priority Social entry point at the bottom of
 * the Today dashboard. Always renders a compact "find friends" empty preview
 * until the feed service is wired. TRUST RULE: never fabricate activity rows.
 */
function FriendsActivityTeaser({ activity, onOpen }) {
  const hasAny = Array.isArray(activity) && activity.length > 0;
  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10, paddingInline: 2,
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
          Friends' activity
        </div>
        <button
          type="button"
          onClick={onOpen}
          style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          See all
        </button>
      </div>
      <button
        type="button"
        onClick={onOpen}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 14px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(14px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
          color: 'inherit',
          textAlign: 'left',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span
          aria-hidden
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(0,255,255,0.08)',
            border: '1px solid rgba(0,255,255,0.22)',
            color: 'hsl(var(--rd-accent))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
            <path d="M3 20c0-3 3-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="17" cy="9" r="2.8" stroke="currentColor" strokeWidth="1.75" />
            <path d="M15 15c3 0 6 2 6 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em', color: 'hsl(var(--rd-fg-primary))' }}>
            {hasAny ? 'Recent from your crew' : 'Your feed is quiet'}
          </div>
          <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, lineHeight: 1.4 }}>
            {hasAny ? 'Tap to see what friends are up to.' : 'Find friends to see their progress here.'}
          </div>
        </div>
      </button>
    </div>
  );
}

/**
 * ExploreTile — one of the 3 entry points in the "Go deeper" strip.
 * Accepts an Icon component, label, subtext, optional violet (ai) tint.
 */
function ExploreTile({ Icon, label, sub, tint, onClick }) {
  const isAi = tint === 'ai';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 14,
        borderRadius: 16,
        background: isAi ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.03)',
        border: isAi ? '1px solid rgba(139,92,246,0.22)' : '1px solid rgba(255,255,255,0.08)',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'flex', flexDirection: 'column', gap: 8,
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        backdropFilter: 'blur(14px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
        minHeight: 96,
        transition: 'transform 180ms cubic-bezier(.34,1.56,.64,1), background 180ms',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.98)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span
        aria-hidden
        style={{
          width: 32, height: 32, borderRadius: 10,
          background: isAi ? 'rgba(139,92,246,0.14)' : 'rgba(0,255,255,0.08)',
          border: isAi ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(0,255,255,0.22)',
          color: isAi ? '#A78BFA' : 'hsl(var(--rd-accent))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon size={16} />
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em', lineHeight: 1.2 }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2, lineHeight: 1.3 }}>
          {sub}
        </div>
      </div>
    </button>
  );
}
