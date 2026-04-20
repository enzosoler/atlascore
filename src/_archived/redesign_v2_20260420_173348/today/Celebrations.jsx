/**
 * Celebrations — /app/today/celebrate/:kind
 *
 * One-shot achievement / milestone screen. Each `:kind` slug maps to a tailored
 * headline + icon. Unknown kinds fall back to a generic "Great work" card.
 *
 * Supported kinds:
 *   first-workout, 7-day-streak, 30-day-streak, first-pr,
 *   body-goal, nutrition-goal, first-lab-upload
 *
 * Rules:
 *  - TRUST: celebrations are triggered by real milestone detection upstream,
 *    never fabricated from this screen. This view only *renders* a celebration
 *    the caller decided to fire.
 *  - "Share with friends" navigates to /app/social/share?ref=… — if that route
 *    doesn't exist yet it falls through to the placeholder, so we emit a toast
 *    from the route wrapper instead.
 *  - "Keep going" returns the user to /app/today.
 */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';
import {
  TrophyIcon,
  FlameIcon,
  SparkleIcon,
  TargetIcon,
  ScaleIcon,
  UtensilsIcon,
  PulseIcon,
} from '../lib/icons';

/* ─── Copy map ─────────────────────────────────────────────────────────── */

const CELEBRATION_COPY = {
  'first-workout': {
    Icon: TrophyIcon,
    eyebrow: 'First workout',
    title: 'You showed up.',
    subtitle: 'Day one is always the hardest. The next one gets a little easier.',
  },
  '7-day-streak': {
    Icon: FlameIcon,
    eyebrow: '7 days in a row',
    title: 'One full week.',
    subtitle: 'Consistency beats intensity. Keep the chain going.',
  },
  '30-day-streak': {
    Icon: FlameIcon,
    eyebrow: '30 days in a row',
    title: 'A month of showing up.',
    subtitle: 'This is how identity changes — one honest day at a time.',
  },
  'first-pr': {
    Icon: TrophyIcon,
    eyebrow: 'New personal record',
    title: 'You set a new PR.',
    subtitle: 'Progressive overload pays off. The bar just moved up for you.',
  },
  'body-goal': {
    Icon: ScaleIcon,
    eyebrow: 'Body goal',
    title: 'Goal reached.',
    subtitle: 'The body target you set is behind you. Time to pick the next one.',
  },
  'nutrition-goal': {
    Icon: UtensilsIcon,
    eyebrow: 'Nutrition goal',
    title: 'Target hit.',
    subtitle: 'Fuel dialed in. Your recovery and training will thank you.',
  },
  'first-lab-upload': {
    Icon: PulseIcon,
    eyebrow: 'First lab panel',
    title: 'Your biomarkers are in.',
    subtitle: 'Real data beats guessing. Your coach now has a true baseline.',
  },
};

const GENERIC = {
  Icon: SparkleIcon,
  eyebrow: 'Milestone',
  title: 'Great work.',
  subtitle: 'Something worth noting just happened. Keep the momentum.',
};

/* ─── Screen ───────────────────────────────────────────────────────────── */

export default function Celebrations({
  kind = null,
  onShare,
  onKeepGoing,
}) {
  const copy = (kind && CELEBRATION_COPY[kind]) || GENERIC;
  const Icon = copy.Icon;

  return (
    <SafeScreen hasBottomNav={false} paddingX={20}>
      {/* Confetti background — deterministic, CSS-only, never randomized. */}
      <ConfettiBackdrop />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          textAlign: 'center',
          paddingBlock: 40,
        }}
      >
        {/* Hero icon with cyan→violet gradient backdrop */}
        <SpringReveal delay={40}>
          <div
            className="cel-icon"
            style={{
              width: 120,
              height: 120,
              borderRadius: 9999,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, rgba(0,255,255,0.22) 0%, rgba(139,92,246,0.22) 100%)',
              border: '1px solid rgba(0,255,255,0.35)',
              boxShadow:
                '0 20px 60px -10px rgba(0,255,255,0.35), 0 10px 40px -10px rgba(139,92,246,0.35)',
              color: '#E5F9FF',
            }}
          >
            <Icon size={52} />
          </div>
        </SpringReveal>

        <SpringReveal delay={100}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'hsl(var(--rd-accent))',
            }}
          >
            {copy.eyebrow}
          </div>
        </SpringReveal>

        <SpringReveal delay={140}>
          <h1
            style={{
              margin: 0,
              maxWidth: 420,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              backgroundImage:
                'linear-gradient(135deg, #A5F3FC 0%, #C4B5FD 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            {copy.title}
          </h1>
        </SpringReveal>

        <SpringReveal delay={180}>
          <p
            style={{
              margin: 0,
              maxWidth: 360,
              fontSize: 15,
              lineHeight: 1.5,
              color: 'hsl(var(--rd-fg-muted))',
            }}
          >
            {copy.subtitle}
          </p>
        </SpringReveal>

        {/* CTAs */}
        <SpringReveal delay={240}>
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              width: '100%',
              maxWidth: 360,
            }}
          >
            <LiquidButton intent="primary" size="lg" block onClick={onKeepGoing}>
              Keep going
            </LiquidButton>
            <LiquidButton intent="ghost" size="md" block onClick={onShare}>
              Share with friends
            </LiquidButton>
          </div>
        </SpringReveal>
      </div>

      <style>{`
        @keyframes cel-icon-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.03); }
        }
        .cel-icon { animation: cel-icon-pulse 3200ms ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cel-icon { animation: none !important; }
        }
      `}</style>
    </SafeScreen>
  );
}

export { Celebrations };

/* ─── Confetti backdrop ─────────────────────────────────────────────────── */

/**
 * Deterministic confetti — NOT randomized per render. Same positions every time
 * so the screen feels stable. Pure CSS animation (falling + subtle rotation).
 */
function ConfettiBackdrop() {
  // Fixed positions/colors/delays. 24 pieces, symmetrical-ish spread.
  const pieces = [
    { left: '6%',  hue: 'cyan',   delay:  0, dur: 7.2, size: 8  },
    { left: '12%', hue: 'violet', delay: 1.2, dur: 8.1, size: 6  },
    { left: '18%', hue: 'cyan',   delay: 2.4, dur: 6.6, size: 10 },
    { left: '24%', hue: 'cyan',   delay: 0.6, dur: 7.8, size: 7  },
    { left: '30%', hue: 'violet', delay: 1.8, dur: 8.6, size: 9  },
    { left: '36%', hue: 'cyan',   delay: 3.0, dur: 6.9, size: 6  },
    { left: '42%', hue: 'violet', delay: 0.3, dur: 7.5, size: 8  },
    { left: '48%', hue: 'cyan',   delay: 2.1, dur: 8.3, size: 10 },
    { left: '54%', hue: 'violet', delay: 1.5, dur: 7.0, size: 7  },
    { left: '60%', hue: 'cyan',   delay: 0.9, dur: 7.7, size: 9  },
    { left: '66%', hue: 'violet', delay: 2.7, dur: 8.0, size: 6  },
    { left: '72%', hue: 'cyan',   delay: 1.1, dur: 6.8, size: 8  },
    { left: '78%', hue: 'violet', delay: 2.3, dur: 7.4, size: 10 },
    { left: '84%', hue: 'cyan',   delay: 0.4, dur: 7.9, size: 7  },
    { left: '90%', hue: 'violet', delay: 1.7, dur: 8.2, size: 9  },
    { left: '96%', hue: 'cyan',   delay: 3.1, dur: 6.7, size: 6  },
    { left: '9%',  hue: 'violet', delay: 2.0, dur: 8.4, size: 8  },
    { left: '21%', hue: 'cyan',   delay: 0.7, dur: 7.3, size: 9  },
    { left: '33%', hue: 'cyan',   delay: 1.4, dur: 8.5, size: 6  },
    { left: '45%', hue: 'violet', delay: 2.6, dur: 7.1, size: 10 },
    { left: '57%', hue: 'cyan',   delay: 0.5, dur: 7.6, size: 7  },
    { left: '69%', hue: 'violet', delay: 1.9, dur: 8.7, size: 9  },
    { left: '81%', hue: 'cyan',   delay: 2.8, dur: 6.5, size: 6  },
    { left: '93%', hue: 'violet', delay: 0.8, dur: 7.8, size: 8  },
  ];

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti-piece confetti-${p.hue}`}
          style={{
            position: 'absolute',
            top: '-20px',
            left: p.left,
            width: p.size,
            height: p.size * 1.4,
            borderRadius: 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg);    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg);  opacity: 0; }
        }
        .confetti-piece {
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(.25, .65, .3, 1);
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }
        .confetti-cyan   { background: linear-gradient(180deg, #22D3EE 0%, #06B6D4 100%); box-shadow: 0 0 6px rgba(34,211,238,0.55); }
        .confetti-violet { background: linear-gradient(180deg, #C4B5FD 0%, #8B5CF6 100%); box-shadow: 0 0 6px rgba(139,92,246,0.55); }
        @media (prefers-reduced-motion: reduce) {
          .confetti-piece { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

/**
 * CelebrationsRoute — reads :kind from the URL. Wires "Share" to navigate to
 * /app/social/share?ref=celebration-<kind>; since that route may not exist yet,
 * we emit a "Share coming soon" toast as the honest fallback.
 */
export function CelebrationsRoute() {
  const navigate = useNavigate();
  const { kind } = useParams();
  const known = kind && Object.prototype.hasOwnProperty.call(CELEBRATION_COPY, kind);

  return (
    <Celebrations
      kind={known ? kind : null}
      onKeepGoing={() => navigate('/app/today')}
      onShare={() => {
        // Route may not exist yet — be honest rather than dead-end.
        // TODO: once /app/social/share is wired, remove the fallback toast.
        toast('Share coming soon', {
          description: 'Wiring social share up next session.',
        });
      }}
    />
  );
}
