/**
 * FocusMode — /app/today/focus
 *
 * A "deep work" / "workout mode" fullscreen overlay that pares the UI down
 * to a single task. Inspired by iOS Focus + Headspace session screens.
 *
 * Props:
 *   task — { title, icon: 'workout'|'meal'|'meditation'|'sleep', details, durationMin }
 *          If omitted, we read `?task=<kind>` from the URL and resolve a preset.
 *
 * Rules:
 *  - Hide the bottom nav (SafeScreen hasBottomNav={false}).
 *  - Darker obsidian than the normal app bg.
 *  - Breathing animation on the hero (scale 1 → 1.02 → 1, 4s).
 *  - Live-updating countdown when durationMin is set. Never fabricate progress.
 *  - "End focus" CTA navigates back to /app/today.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SafeScreen, LiquidButton, SpringReveal } from '../lib/glass';
import {
  DumbbellIcon,
  UtensilsIcon,
  ZenIcon,
  MoonIcon,
  TargetIcon,
} from '../lib/icons';

/* ─── Task presets ─────────────────────────────────────────────────────── */

const TASK_PRESETS = {
  workout: {
    title: 'Workout',
    details: 'One set at a time. Focus on the rep in front of you.',
    durationMin: null,
    iconKey: 'workout',
  },
  meal: {
    title: 'Mindful meal',
    details: 'Phone down. Chew slowly. Notice the first three bites.',
    durationMin: 20,
    iconKey: 'meal',
  },
  meditation: {
    title: 'Meditation',
    details: 'Settle in. Breathe through the nose, slow and deep.',
    durationMin: 10,
    iconKey: 'meditation',
  },
  sleep: {
    title: 'Wind down',
    details: 'Dim the lights. Put the screen away after this timer ends.',
    durationMin: 15,
    iconKey: 'sleep',
  },
};

function IconForKey({ iconKey, size = 56 }) {
  switch (iconKey) {
    case 'workout':    return <DumbbellIcon size={size} />;
    case 'meal':       return <UtensilsIcon size={size} />;
    case 'meditation': return <ZenIcon size={size} />;
    case 'sleep':      return <MoonIcon size={size} />;
    default:           return <TargetIcon size={size} />;
  }
}

/* ─── Screen ───────────────────────────────────────────────────────────── */

export default function FocusMode({ task = null, onEnd }) {
  const resolvedTask = task || {
    title: 'Focus',
    details: 'One thing at a time.',
    durationMin: null,
    iconKey: 'focus',
  };

  // Live countdown, only when durationMin is provided.
  const totalSeconds = typeof resolvedTask.durationMin === 'number'
    ? resolvedTask.durationMin * 60
    : null;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (typeof totalSeconds !== 'number') return;
    // Reset when task changes.
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (typeof secondsLeft !== 'number') return;
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (typeof s === 'number' ? Math.max(0, s - 1) : s));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const mm = typeof secondsLeft === 'number' ? Math.floor(secondsLeft / 60) : null;
  const ss = typeof secondsLeft === 'number' ? secondsLeft % 60 : null;

  return (
    <SafeScreen
      scrollable={false}
      hasBottomNav={false}
      paddingX={24}
      style={{
        // Darker than normal obsidian — this is a focus screen.
        backgroundColor: '#02040A',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Vignette glow behind the hero to add depth without clutter */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(0,255,255,0.08) 0%, rgba(0,255,255,0) 55%)',
        }}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <SpringReveal delay={40}>
          <div
            className="fm-breathe"
            style={{
              width: 160,
              height: 160,
              borderRadius: 9999,
              background:
                'radial-gradient(circle at 50% 50%, rgba(0,255,255,0.18) 0%, rgba(0,255,255,0.04) 60%, rgba(0,255,255,0) 100%)',
              border: '1px solid rgba(0,255,255,0.28)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--rd-accent))',
              boxShadow: '0 0 60px -10px rgba(0,255,255,0.25)',
            }}
          >
            <IconForKey iconKey={resolvedTask.iconKey} size={56} />
          </div>
        </SpringReveal>

        <SpringReveal delay={90}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'hsl(var(--rd-accent))',
                marginBottom: 10,
              }}
            >
              Focus mode
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: 'hsl(var(--rd-fg-primary))',
              }}
            >
              {resolvedTask.title}
            </h1>
            {resolvedTask.details && (
              <p
                style={{
                  margin: '14px 0 0',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: 'hsl(var(--rd-fg-muted))',
                }}
              >
                {resolvedTask.details}
              </p>
            )}
          </div>
        </SpringReveal>

        {typeof mm === 'number' && (
          <SpringReveal delay={140}>
            <div
              style={{
                marginTop: 8,
                fontSize: 72,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                color: 'hsl(var(--rd-fg-primary))',
                textAlign: 'center',
              }}
              aria-live="polite"
            >
              {String(mm).padStart(2, '0')}
              <span style={{ color: 'hsl(var(--rd-fg-muted))' }}>:</span>
              {String(ss).padStart(2, '0')}
            </div>
          </SpringReveal>
        )}
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
          maxWidth: 420,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <LiquidButton intent="ghost" size="lg" block onClick={onEnd}>
          End focus
        </LiquidButton>
      </div>

      {/* Breathing animation — respects reduced-motion. */}
      <style>{`
        @keyframes fm-breathe {
          0%   { transform: scale(1);    box-shadow: 0 0 60px -10px rgba(0,255,255,0.25); }
          50%  { transform: scale(1.02); box-shadow: 0 0 80px -10px rgba(0,255,255,0.35); }
          100% { transform: scale(1);    box-shadow: 0 0 60px -10px rgba(0,255,255,0.25); }
        }
        .fm-breathe { animation: fm-breathe 4000ms ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fm-breathe { animation: none !important; }
        }
      `}</style>
    </SafeScreen>
  );
}

export { FocusMode };

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

/**
 * FocusModeRoute — reads `?task=workout|meal|meditation|sleep` and wires onEnd
 * back to /app/today. If no recognized preset is provided, the screen renders
 * a generic "Focus" session.
 */
export function FocusModeRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskParam = (searchParams.get('task') || '').toLowerCase();

  const resolvedTask = useMemo(() => {
    if (taskParam && TASK_PRESETS[taskParam]) {
      return TASK_PRESETS[taskParam];
    }
    // Unknown/empty — generic session, no duration.
    return {
      title: 'Deep focus',
      details: 'One task. No notifications. Come back when you are done.',
      durationMin: null,
      iconKey: 'focus',
    };
  }, [taskParam]);

  return (
    <FocusMode
      task={resolvedTask}
      onEnd={() => navigate('/app/today')}
    />
  );
}
