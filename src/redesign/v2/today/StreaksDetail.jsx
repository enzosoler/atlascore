/**
 * StreaksDetail — /app/today/streaks
 *
 * Deep view of the user's consistency — hero current/longest flame, a 6-week
 * GitHub-style heatmap, per-track streak cards, and an honest rules block.
 *
 * TRUST RULE — if `streaks` is null/empty, we NEVER fabricate numbers. The
 * screen renders a "Your first streak starts today" empty state with a link
 * to log a workout (the canonical kickoff action).
 *
 * Shape of the `streaks` prop (null or):
 *   {
 *     current: number,                    // current streak in days
 *     longest: number,                    // longest streak ever
 *     heatmap: [{ date: 'YYYY-MM-DD', level: 0|1|2|3|4 }],  // last 42 days
 *     tracks: [{ id, label, current, best }],
 *   }
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import {
  FlameIcon,
  DumbbellIcon,
  UtensilsIcon,
  ScaleIcon,
  PulseIcon,
  TargetIcon,
  ChevronLeftIcon,
} from '../lib/icons';

export default function StreaksDetail({
  streaks = null,
  onBack,
  onLogSomething,
}) {
  const hasStreaks =
    streaks &&
    typeof streaks === 'object' &&
    (typeof streaks.current === 'number' || typeof streaks.longest === 'number');

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>
        {/* Header */}
        <SpringReveal delay={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'hsl(var(--rd-fg-primary))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <ChevronLeftIcon size={18} />
            </button>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
              Streaks
            </div>
          </div>
        </SpringReveal>

        {hasStreaks ? (
          <>
            <SpringReveal delay={60}>
              <HeroStreak current={streaks.current} longest={streaks.longest} />
            </SpringReveal>

            <SpringReveal delay={120}>
              <SectionHeader title="Activity · last 6 weeks" />
              <Heatmap cells={streaks.heatmap || []} />
            </SpringReveal>

            <SpringReveal delay={180}>
              <SectionHeader title="Tracked streaks" />
              <TracksList tracks={streaks.tracks || DEFAULT_TRACKS_SHAPE} />
            </SpringReveal>
          </>
        ) : (
          <SpringReveal delay={60}>
            <EmptyState onLogSomething={onLogSomething} />
          </SpringReveal>
        )}

        {/* Rules card always visible — educates even the empty state user. */}
        <SpringReveal delay={240}>
          <SectionHeader title="How streaks work" />
          <Glass radius="xl" style={{ padding: 16 }}>
            <ul
              style={{
                margin: 0,
                paddingInlineStart: 18,
                fontSize: 13,
                lineHeight: 1.6,
                color: 'hsl(var(--rd-fg-secondary))',
              }}
            >
              <li>
                A day counts if you log at least 1 workout <em>or</em> 1 meal
                entry.
              </li>
              <li>
                Rest days preserve your streak if your plan prescribes rest.
              </li>
              <li>
                Missing a full day resets the current streak, but your longest
                streak stays on record.
              </li>
              <li>
                Streaks are calculated in your local timezone.
              </li>
            </ul>
          </Glass>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}

export { StreaksDetail };

/* ─── Hero (current + longest) ──────────────────────────────────────────── */

function HeroStreak({ current, longest }) {
  const cur = typeof current === 'number' ? current : 0;
  const best = typeof longest === 'number' ? longest : 0;
  return (
    <Glass
      tint="neutral"
      radius="xl"
      elevation="lg"
      style={{
        padding: 20,
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <span
        aria-hidden
        className="streak-flame"
        style={{
          width: 84,
          height: 84,
          borderRadius: 9999,
          flexShrink: 0,
          background:
            'radial-gradient(circle at 50% 55%, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.05) 70%)',
          border: '1px solid rgba(245,158,11,0.35)',
          color: '#FBBF24',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px -10px rgba(245,158,11,0.45)',
        }}
      >
        <FlameIcon size={40} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'hsl(var(--rd-fg-muted))',
          }}
        >
          Current streak
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              color: 'hsl(var(--rd-fg-primary))',
            }}
          >
            {cur}
          </span>
          <span
            style={{
              fontSize: 16,
              color: 'hsl(var(--rd-fg-muted))',
              fontWeight: 600,
            }}
          >
            {cur === 1 ? 'day' : 'days'}
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'hsl(var(--rd-fg-muted))',
            marginTop: 6,
          }}
        >
          Longest ever:{' '}
          <strong
            style={{
              color: 'hsl(var(--rd-fg-primary))',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {best} {best === 1 ? 'day' : 'days'}
          </strong>
        </div>
      </div>

      <style>{`
        @keyframes streak-flicker {
          0%, 100% { transform: scale(1);    filter: brightness(1);    }
          50%      { transform: scale(1.03); filter: brightness(1.15); }
        }
        .streak-flame { animation: streak-flicker 2600ms ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .streak-flame { animation: none !important; }
        }
      `}</style>
    </Glass>
  );
}

/* ─── Heatmap (6 weeks × 7 days) ────────────────────────────────────────── */

/**
 * Heatmap — GitHub-style squares, cyan intensity ∝ activity level (0..4).
 * Accepts an array of `{ date, level }`; any missing days default to level 0.
 */
function Heatmap({ cells }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const WEEKS = 6;
  const days = WEEKS * 7;

  // Build the 42-day grid ending today.
  const gridDates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    gridDates.push(d);
  }

  const levelMap = new Map();
  (cells || []).forEach((c) => {
    if (c && c.date) {
      levelMap.set(c.date, Math.max(0, Math.min(4, Number(c.level) || 0)));
    }
  });

  // Lay out as 6 columns (weeks) × 7 rows (days). Transpose the linear array.
  const columns = Array.from({ length: WEEKS }, (_, col) =>
    Array.from({ length: 7 }, (_, row) => gridDates[col * 7 + row])
  );

  return (
    <Glass radius="xl" style={{ padding: 14, marginTop: 10 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${WEEKS}, 1fr)`,
          gap: 6,
        }}
      >
        {columns.map((col, ci) => (
          <div
            key={ci}
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(7, 1fr)',
              gap: 4,
            }}
          >
            {col.map((d, ri) => {
              const iso = d.toISOString().slice(0, 10);
              const level = levelMap.get(iso) ?? 0;
              return (
                <span
                  key={ri}
                  aria-label={`${iso} — level ${level}`}
                  title={`${iso} — level ${level}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: 4,
                    background: levelColor(level),
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10,
          color: 'hsl(var(--rd-fg-muted))',
          letterSpacing: '0.06em',
          justifyContent: 'flex-end',
        }}
      >
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: levelColor(l),
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          />
        ))}
        <span>More</span>
      </div>
    </Glass>
  );
}

function levelColor(level) {
  // Obsidian base → cyan ramp. 0 is empty (very faint), 4 is full cyan.
  switch (level) {
    case 0: return 'rgba(255,255,255,0.05)';
    case 1: return 'rgba(0,255,255,0.18)';
    case 2: return 'rgba(0,255,255,0.35)';
    case 3: return 'rgba(0,255,255,0.6)';
    case 4: return 'rgba(0,255,255,0.92)';
    default: return 'rgba(255,255,255,0.05)';
  }
}

/* ─── Tracked streaks list ──────────────────────────────────────────────── */

const DEFAULT_TRACKS_SHAPE = [
  { id: 'workout', label: 'Workout streak',      current: null, best: null },
  { id: 'meal',    label: 'Meal logged streak',  current: null, best: null },
  { id: 'body',    label: 'Body weight streak',  current: null, best: null },
  { id: 'lab',     label: 'Lab upload cadence',  current: null, best: null },
];

function TracksList({ tracks }) {
  const list =
    Array.isArray(tracks) && tracks.length > 0 ? tracks : DEFAULT_TRACKS_SHAPE;
  return (
    <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
      {list.map((t) => (
        <TrackRow key={t.id} track={t} />
      ))}
    </div>
  );
}

function iconForTrack(id) {
  switch (id) {
    case 'workout': return <DumbbellIcon size={18} />;
    case 'meal':    return <UtensilsIcon size={18} />;
    case 'body':    return <ScaleIcon size={18} />;
    case 'lab':     return <PulseIcon size={18} />;
    default:        return <TargetIcon size={18} />;
  }
}

function TrackRow({ track }) {
  const cur = typeof track.current === 'number' ? track.current : null;
  const best = typeof track.best === 'number' ? track.best : null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(0,255,255,0.08)',
          border: '1px solid rgba(0,255,255,0.22)',
          color: 'hsl(var(--rd-accent))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {iconForTrack(track.id)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '-0.005em',
            color: 'hsl(var(--rd-fg-primary))',
          }}
          className="truncate"
        >
          {track.label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'hsl(var(--rd-fg-muted))',
            marginTop: 2,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          Current{' '}
          <strong
            style={{
              color: 'hsl(var(--rd-fg-primary))',
              fontWeight: 700,
            }}
          >
            {cur != null ? cur : '—'}
          </strong>
          {'  ·  '}Best{' '}
          <strong
            style={{
              color: 'hsl(var(--rd-fg-primary))',
              fontWeight: 700,
            }}
          >
            {best != null ? best : '—'}
          </strong>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────────────────────── */

function EmptyState({ onLogSomething }) {
  return (
    <Glass
      tint="neutral"
      radius="xl"
      elevation="md"
      style={{
        marginTop: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 64,
          height: 64,
          borderRadius: 9999,
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.28)',
          color: '#FBBF24',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginInline: 'auto',
        }}
      >
        <FlameIcon size={28} />
      </span>
      <div
        style={{
          marginTop: 14,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'hsl(var(--rd-fg-primary))',
        }}
      >
        Your first streak starts today.
      </div>
      <p
        style={{
          margin: '6px auto 0',
          maxWidth: 340,
          fontSize: 13,
          color: 'hsl(var(--rd-fg-muted))',
          lineHeight: 1.5,
        }}
      >
        Log a workout or a meal to light the flame. One honest day is enough
        to start the count.
      </p>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        <LiquidButton intent="primary" size="md" onClick={onLogSomething}>
          Log something
        </LiquidButton>
      </div>
    </Glass>
  );
}

/* ─── Section header ────────────────────────────────────────────────────── */

function SectionHeader({ title }) {
  return (
    <h2
      style={{
        margin: '24px 0 8px',
        fontSize: 12,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        fontWeight: 700,
        color: 'hsl(var(--rd-fg-muted))',
        paddingInline: 2,
      }}
    >
      {title}
    </h2>
  );
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

/**
 * StreaksDetailRoute — MVP wrapper.
 * Passes `streaks={null}` so the honest empty state renders. The "Log
 * something" CTA routes to the workouts home (canonical kickoff).
 *
 * TODO: wire to a real streaks service — see follow-ups.
 */
export function StreaksDetailRoute() {
  const navigate = useNavigate();
  return (
    <StreaksDetail
      streaks={null}
      onBack={() => navigate('/app/today')}
      onLogSomething={() => navigate('/app/workouts')}
    />
  );
}
