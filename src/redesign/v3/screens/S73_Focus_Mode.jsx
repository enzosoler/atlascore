/**
 * S73_Focus_Mode -- distraction-free countdown screen.
 *
 * Replaces v2 FocusMode.jsx. Uses the v3 paper design system exclusively.
 * Pattern: S1_Splash_A (full-screen brand moment).
 *
 * Always renders in dark mode (ink background) regardless of the dark prop.
 * Large centered task title + details. Live countdown timer (mm:ss, big ACNum).
 * Subtle breathing animation on background. Preset task types:
 * workout / meal / meditation / sleep. "End focus" button at bottom.
 * Minimal UI — this is about removing noise.
 *
 * Gallery:    <S73_Focus_Mode />
 * Production: <S73_Focus_Mode task={{title, details, durationMin, iconKey}}
 *               onEnd={fn} />
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=true] - ignored; always renders dark
 * @param {object}   [props.task]      - {title, details, durationMin, iconKey}
 * @param {function} [props.onEnd]
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn,
} from '../lib/paper.jsx';

/* ── task presets ──────────────────────────────────────────── */
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

/* ── DEMO fallback ─────────────────────────────────────────── */
const DEMO_TASK = TASK_PRESETS.meditation;

/* ── task icon (simple SVG, ink/paper/accent only) ─────────── */
function TaskIcon({ iconKey, size = 48, color, accent }) {
  const sw = 2;
  if (iconKey === 'workout') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="8" y="18" width="6" height="12" rx="1.5" stroke={color} strokeWidth={sw} />
        <rect x="34" y="18" width="6" height="12" rx="1.5" stroke={color} strokeWidth={sw} />
        <line x1="14" y1="24" x2="34" y2="24" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1="5" y1="24" x2="8" y2="24" stroke={accent} strokeWidth={sw} strokeLinecap="round" />
        <line x1="40" y1="24" x2="43" y2="24" stroke={accent} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }
  if (iconKey === 'meal') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="14" stroke={color} strokeWidth={sw} />
        <circle cx="24" cy="24" r="5" fill={accent} opacity="0.3" />
        <path d="M16 20c2-3 4-3 8 0s6 3 8 0" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }
  if (iconKey === 'meditation') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="5" stroke={color} strokeWidth={sw} />
        <path d="M14 38c0-6 4.5-10 10-10s10 4 10 10" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="24" cy="16" r="2" fill={accent} opacity="0.5" />
      </svg>
    );
  }
  if (iconKey === 'sleep') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M30 12a14 14 0 1 0 0 24 10 10 0 0 1 0-24z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="34" cy="14" r="1.5" fill={accent} />
        <circle cx="38" cy="20" r="1" fill={accent} opacity="0.6" />
      </svg>
    );
  }
  // default: target
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="14" stroke={color} strokeWidth={sw} />
      <circle cx="24" cy="24" r="7" stroke={color} strokeWidth={sw} />
      <circle cx="24" cy="24" r="2.5" fill={accent} />
    </svg>
  );
}

/* ── safe handler wrapper ──────────────────────────────────── */
const safe = (fn, ...args) => { if (typeof fn === 'function') fn(...args); };

/* ── main component ────────────────────────────────────────── */
export default function S73_Focus_Mode({
  dark = true,   
  task,
  onEnd,
}) {
  // Always dark, regardless of prop
  const c = useACT(true);
  const data = task || DEMO_TASK;

  /* ── live countdown ──────────────────────────────────────── */
  const totalSeconds = typeof data.durationMin === 'number' ? data.durationMin * 60 : null;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (typeof secondsLeft !== 'number' || secondsLeft <= 0) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => (typeof s === 'number' ? Math.max(0, s - 1) : s));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [secondsLeft !== null && secondsLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const mm = typeof secondsLeft === 'number' ? Math.floor(secondsLeft / 60) : null;
  const ss = typeof secondsLeft === 'number' ? secondsLeft % 60 : null;
  const timerDone = typeof secondsLeft === 'number' && secondsLeft <= 0;

  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
      background: c.bg, color: c.fg, position: 'relative', overflow: 'hidden',
    }}>
      {/* Breathing background glow */}
      <div
        aria-hidden
        className="s73-breathe"
        style={{
          position: 'absolute',
          top: '30%', left: '50%',
          width: 320, height: 320,
          transform: 'translate(-50%, -50%)',
          borderRadius: 9999,
          background: `radial-gradient(circle, ${c.accent}12 0%, ${c.accent}04 45%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top bar — minimal, just "Focus mode" label */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <ACLabel size={11} color={c.mute} style={{
          fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
        }}>
          Focus mode
        </ACLabel>
      </div>

      {/* Center content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 24, position: 'relative', zIndex: 1,
        padding: '0 28px',
      }}>
        {/* Task icon in a breathing ring */}
        <div style={{
          width: 120, height: 120, borderRadius: 9999,
          background: `${c.accent}0A`,
          border: `1px solid ${c.accent}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TaskIcon iconKey={data.iconKey} size={48} color={c.fg} accent={c.accent} />
        </div>

        {/* Task title */}
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 38, fontWeight: 700,
            letterSpacing: -1.2, lineHeight: 1.05, color: c.fg,
          }}>
            {data.title}
          </div>
          {data.details && (
            <div style={{
              marginTop: 12, fontSize: 15, color: c.dim,
              lineHeight: 1.5, fontFamily: ACFonts.body,
            }}>
              {data.details}
            </div>
          )}
        </div>

        {/* Countdown timer */}
        {typeof mm === 'number' && (
          <div style={{ marginTop: 8, textAlign: 'center' }} aria-live="polite">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
              <ACNum size={72} color={timerDone ? c.accent : c.fg} weight={700}>
                {String(mm).padStart(2, '0')}
              </ACNum>
              <ACNum size={72} color={c.mute} weight={700}>:</ACNum>
              <ACNum size={72} color={timerDone ? c.accent : c.fg} weight={700}>
                {String(ss).padStart(2, '0')}
              </ACNum>
            </div>
            {timerDone && (
              <div style={{ marginTop: 12 }}>
                <ACLabel size={13} color={c.accent} style={{ fontWeight: 600 }}>
                  Time's up
                </ACLabel>
              </div>
            )}
          </div>
        )}

        {/* No-timer state: just a subtle "open session" indicator */}
        {totalSeconds === null && (
          <div style={{
            width: 6, height: 6, borderRadius: 999,
            background: c.accent, opacity: 0.7,
          }} />
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{
        padding: '16px 28px calc(16px + env(safe-area-inset-bottom, 0px))',
        position: 'relative', zIndex: 1,
      }}>
        <ACBtn dark={true} size="lg" pill block onClick={() => safe(onEnd)}
          style={{
            background: 'rgba(239,233,218,0.08)',
            border: `1px solid ${c.hair}`,
          }}
        >
          End focus
        </ACBtn>
      </div>

      {/* Breathing animation keyframes */}
      <style>{`
        @keyframes s73-breathe {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 1;   }
          50%  { transform: translate(-50%, -50%) scale(1.08); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1);   opacity: 1;   }
        }
        .s73-breathe { animation: s73-breathe 4000ms ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .s73-breathe { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
