/**
 * S75_Celebrations -- Achievement celebration screen (GIFT MOMENT).
 *
 * Always dark (ink background). Uses the 3-stage reveal framework:
 *   1. Anticipation -- icon pulses, no content yet
 *   2. Reveal -- headline appears + confetti burst
 *   3. Celebration -- subtitle + action buttons appear
 *
 * 7 achievement kinds:
 *   first-workout, 7-day-streak, 30-day-streak, first-pr,
 *   body-goal, nutrition-goal, first-lab-upload
 *
 * Gallery:    <S75_Celebrations />
 * Production: <S75_Celebrations kind="first-pr" headline="..." onShare={fn} onKeepGoing={fn} />
 *
 * Props:
 *   dark       -- always true (forced), kept for API symmetry
 *   kind       -- one of the 7 achievement slugs
 *   headline   -- override headline text
 *   subtitle   -- override subtitle text
 *   onShare    -- ({kind}) => void
 *   onKeepGoing -- () => void
 */
import React, { useState, useEffect } from 'react';
import {
  ACFonts, useACT,
  ACLabel, ACBtn, ACSpark,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

/* -- Achievement icon SVGs (deterministic, inline) ----------------------- */

function IconFirstWorkout({ size = 56, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="8" y="22" width="40" height="12" rx="3" stroke={color} strokeWidth="2.4" />
      <rect x="16" y="16" width="4" height="24" rx="2" stroke={color} strokeWidth="2.4" />
      <rect x="36" y="16" width="4" height="24" rx="2" stroke={color} strokeWidth="2.4" />
      <rect x="12" y="18" width="4" height="20" rx="2" stroke={color} strokeWidth="2.4" />
      <rect x="40" y="18" width="4" height="20" rx="2" stroke={color} strokeWidth="2.4" />
    </svg>
  );
}

function IconStreak({ size = 56, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path
        d="M28 6c0 0-14 16-14 28a14 14 0 0 0 28 0C42 22 28 6 28 6Z"
        stroke={color} strokeWidth="2.4" strokeLinejoin="round"
      />
      <path
        d="M28 26c0 0-6 7-6 13a6 6 0 0 0 12 0C34 33 28 26 28 26Z"
        fill={color} opacity="0.3"
      />
    </svg>
  );
}

function IconPR({ size = 56, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M28 6l6 12 14 2-10 10 2 14-12-6-12 6 2-14L8 20l14-2Z"
        stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconBodyGoal({ size = 56, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="20" stroke={color} strokeWidth="2.4" />
      <circle cx="28" cy="28" r="12" stroke={color} strokeWidth="2.4" />
      <circle cx="28" cy="28" r="4" fill={color} />
    </svg>
  );
}

function IconNutritionGoal({ size = 56, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="18" stroke={color} strokeWidth="2.4" />
      <path d="M28 14v14h10" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 8l-4 6M38 8l4 6" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function IconLabUpload({ size = 56, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M20 8v16l-10 20a4 4 0 0 0 3.6 5.6h28.8A4 4 0 0 0 46 44L36 24V8"
        stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M20 8h16" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 36h24" stroke={color} strokeWidth="2" strokeDasharray="3 3" opacity="0.5" />
      <circle cx="24" cy="40" r="2" fill={color} opacity="0.5" />
      <circle cx="32" cy="38" r="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

/* -- Achievement data map ------------------------------------------------ */

const ACHIEVEMENT_MAP = {
  'first-workout': {
    Icon: IconFirstWorkout,
    headline: 'You showed up.',
    subtitle: 'Day one is the hardest. The system is now calibrating to you.',
  },
  '7-day-streak': {
    Icon: IconStreak,
    headline: 'One full week.',
    subtitle: 'Consistency beats intensity. Your baseline is forming.',
  },
  '30-day-streak': {
    Icon: IconStreak,
    headline: 'A month of execution.',
    subtitle: 'This is how identity shifts. One honest day at a time.',
  },
  'first-pr': {
    Icon: IconPR,
    headline: 'New personal record.',
    subtitle: 'Progressive overload works. The bar just moved up.',
  },
  'body-goal': {
    Icon: IconBodyGoal,
    headline: 'Goal reached.',
    subtitle: 'The target you set is behind you. Time for the next one.',
  },
  'nutrition-goal': {
    Icon: IconNutritionGoal,
    headline: 'Target hit.',
    subtitle: 'Nutrition dialed in. Recovery and training will follow.',
  },
  'first-lab-upload': {
    Icon: IconLabUpload,
    headline: 'Biomarkers are in.',
    subtitle: 'Real data beats guessing. Your coach now has a baseline.',
  },
};

const FALLBACK = {
  Icon: IconPR,
  headline: 'Great work.',
  subtitle: 'Something worth noting just happened. Keep the momentum.',
};

/* -- Deterministic confetti (CSS-only, fixed positions) ------------------- */

const CONFETTI_PIECES = [
  { left: '6%',  top: '12%', w: 8,  h: 11, rot: 15,  delay: 0,    accent: true  },
  { left: '14%', top: '8%',  w: 6,  h: 9,  rot: -30, delay: 0.4,  accent: false },
  { left: '22%', top: '18%', w: 10, h: 6,  rot: 45,  delay: 0.1,  accent: true  },
  { left: '30%', top: '5%',  w: 7,  h: 10, rot: -15, delay: 0.7,  accent: false },
  { left: '38%', top: '14%', w: 5,  h: 8,  rot: 60,  delay: 0.3,  accent: true  },
  { left: '46%', top: '9%',  w: 9,  h: 6,  rot: -45, delay: 0.5,  accent: false },
  { left: '54%', top: '16%', w: 6,  h: 10, rot: 20,  delay: 0.2,  accent: true  },
  { left: '62%', top: '7%',  w: 8,  h: 7,  rot: -55, delay: 0.6,  accent: false },
  { left: '70%', top: '13%', w: 7,  h: 9,  rot: 35,  delay: 0.1,  accent: true  },
  { left: '78%', top: '10%', w: 10, h: 6,  rot: -20, delay: 0.8,  accent: false },
  { left: '86%', top: '17%', w: 6,  h: 11, rot: 50,  delay: 0.4,  accent: true  },
  { left: '94%', top: '6%',  w: 8,  h: 8,  rot: -40, delay: 0.2,  accent: false },
  { left: '10%', top: '22%', w: 5,  h: 7,  rot: 25,  delay: 0.9,  accent: true  },
  { left: '26%', top: '24%', w: 7,  h: 5,  rot: -10, delay: 0.3,  accent: false },
  { left: '42%', top: '20%', w: 9,  h: 8,  rot: 40,  delay: 0.6,  accent: true  },
  { left: '58%', top: '23%', w: 6,  h: 10, rot: -35, delay: 0.1,  accent: false },
  { left: '74%', top: '21%', w: 8,  h: 6,  rot: 55,  delay: 0.5,  accent: true  },
  { left: '90%', top: '19%', w: 7,  h: 9,  rot: -25, delay: 0.7,  accent: false },
  { left: '18%', top: '3%',  w: 6,  h: 8,  rot: 10,  delay: 0.2,  accent: true  },
  { left: '50%', top: '2%',  w: 8,  h: 6,  rot: -50, delay: 0.8,  accent: false },
  { left: '82%', top: '4%',  w: 5,  h: 7,  rot: 30,  delay: 0.4,  accent: true  },
  { left: '34%', top: '26%', w: 9,  h: 5,  rot: -15, delay: 0.6,  accent: false },
  { left: '66%', top: '25%', w: 7,  h: 8,  rot: 45,  delay: 0.3,  accent: true  },
  { left: '2%',  top: '15%', w: 6,  h: 6,  rot: -60, delay: 0.9,  accent: false },
];

function ConfettiLayer({ c, visible }) {
  if (!visible) return null;
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {CONFETTI_PIECES.map((p, i) => (
        <span
          key={i}
          className="s75-confetti"
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.w,
            height: p.h,
            background: p.accent ? c.accent : c.paper,
            opacity: p.accent ? 0.7 : 0.3,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* -- Stages: anticipation(0) -> reveal(1) -> celebration(2) -------------- */

const STAGE_ANTICIPATION = 0;
const STAGE_REVEAL = 1;
const STAGE_CELEBRATION = 2;

const ANTICIPATION_MS = 1200;
const REVEAL_MS = 800;

/* -- Screen --------------------------------------------------------------- */

/**
 * @param {object} props
 * @param {boolean} [props.dark=true]
 * @param {string} [props.kind]
 * @param {string} [props.headline]
 * @param {string} [props.subtitle]
 * @param {function} [props.onShare]
 * @param {function} [props.onKeepGoing]
 */
function S75_Celebrations({
  dark = true,
  kind,
  headline,
  subtitle,
  onShare,
  onKeepGoing,
}) {
  // Always dark
  const c = useACT(true);

  const data = (kind && ACHIEVEMENT_MAP[kind]) || FALLBACK;
  const AchievementIcon = data.Icon;
  const displayHeadline = headline || data.headline;
  const displaySubtitle = subtitle || data.subtitle;

  /* 3-stage timer */
  const [stage, setStage] = useState(STAGE_ANTICIPATION);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(STAGE_REVEAL), ANTICIPATION_MS);
    const t2 = setTimeout(() => setStage(STAGE_CELEBRATION), ANTICIPATION_MS + REVEAL_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const safeShare = () => {
    if (typeof onShare === 'function') onShare({ kind: kind || 'unknown' });
  };
  const safeKeepGoing = () => {
    if (typeof onKeepGoing === 'function') onKeepGoing();
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: c.bg,
        color: c.fg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Confetti layer -- appears at reveal stage */}
      <ConfettiLayer c={c} visible={stage >= STAGE_REVEAL} />

      {/* Content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 28px 24px',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          gap: 0,
        }}
      >
        {/* Brand watermark top */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            opacity: stage >= STAGE_REVEAL ? 0.4 : 0.2,
            transition: 'opacity 600ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HeartMark size={14} color={c.fg} accent={c.accent} />
            <span
              style={{
                fontFamily: ACFonts.brand,
                fontSize: 11,
                color: c.fg,
                letterSpacing: -0.4,
                textTransform: 'lowercase',
              }}
            >
              atlas<span style={{ color: c.accent }}>.</span>core
            </span>
          </div>
        </div>

        {/* Stage 1: Icon -- always visible, pulses during anticipation */}
        <div
          className={stage === STAGE_ANTICIPATION ? 's75-icon-pulse' : ''}
          style={{
            width: 120,
            height: 120,
            borderRadius: 999,
            background: 'rgba(239,233,218,0.06)',
            border: `2px solid ${stage >= STAGE_REVEAL ? c.accent : 'rgba(239,233,218,0.12)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 400ms ease',
            marginBottom: 28,
          }}
        >
          <AchievementIcon
            size={56}
            color={stage >= STAGE_REVEAL ? c.accent : c.dim}
          />
        </div>

        {/* ECG line -- decorative, appears at reveal */}
        <div
          style={{
            opacity: stage >= STAGE_REVEAL ? 1 : 0,
            transition: 'opacity 500ms ease',
            marginBottom: 20,
          }}
        >
          <ACSpark w={200} h={18} dark={true} color={c.accent} stroke={1.6} />
        </div>

        {/* Stage 2: Headline -- appears at reveal */}
        <div
          style={{
            opacity: stage >= STAGE_REVEAL ? 1 : 0,
            transform: stage >= STAGE_REVEAL ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 500ms ease, transform 500ms ease',
          }}
        >
          <div
            style={{
              fontFamily: ACFonts.display,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -1.4,
              lineHeight: 1.05,
              color: c.fg,
              maxWidth: 320,
            }}
          >
            {displayHeadline}
          </div>
        </div>

        {/* Stage 3: Subtitle -- appears at celebration */}
        <div
          style={{
            marginTop: 14,
            opacity: stage >= STAGE_CELEBRATION ? 1 : 0,
            transform: stage >= STAGE_CELEBRATION ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 500ms ease, transform 500ms ease',
          }}
        >
          <div
            style={{
              fontFamily: ACFonts.body,
              fontSize: 15,
              color: c.dim,
              lineHeight: 1.5,
              maxWidth: 300,
            }}
          >
            {displaySubtitle}
          </div>
        </div>
      </div>

      {/* Stage 3: Action buttons -- appear at celebration */}
      <div
        style={{
          padding: '0 28px 40px',
          position: 'relative',
          zIndex: 1,
          opacity: stage >= STAGE_CELEBRATION ? 1 : 0,
          transform: stage >= STAGE_CELEBRATION ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 500ms ease, transform 500ms ease',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <ACBtn
          primary
          dark={true}
          block
          size="lg"
          pill
          onClick={safeKeepGoing}
        >
          Keep going
        </ACBtn>
        <ACBtn
          dark={true}
          block
          size="md"
          pill
          onClick={safeShare}
          style={{ background: 'rgba(239,233,218,0.08)' }}
        >
          Share
        </ACBtn>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes s75-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.06); opacity: 0.85; }
        }
        .s75-icon-pulse {
          animation: s75-pulse 1600ms ease-in-out infinite;
        }
        @keyframes s75-confetti-fall {
          0%   { transform: translateY(-30px) rotate(var(--rot, 0deg)); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(calc(var(--rot, 0deg) + 360deg)); opacity: 0; }
        }
        .s75-confetti {
          animation: s75-confetti-fall 6s cubic-bezier(.25,.65,.3,1) infinite;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .s75-icon-pulse { animation: none !important; }
          .s75-confetti { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </div>
  );
}

export default S75_Celebrations;
