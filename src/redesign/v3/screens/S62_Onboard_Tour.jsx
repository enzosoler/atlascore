/**
 * S62_Onboard_Tour -- post-signup 3-slide guided tour.
 *
 * Final onboarding step (10 of 10). Shows how atlas.core works before
 * dropping the user into the main experience. Always dark (ink bg, paper fg)
 * -- this is a brand moment, not a settings screen.
 *
 * Replaces v2 OnboardingTour.jsx. Uses the v3 paper design system exclusively.
 *
 * Slides:
 *   1. "Log without thinking"   — camera/voice, photo + voice food logging
 *   2. "Your coach is always here" — chat bubble, AI coach always available
 *   3. "Recovery is earned"     — readiness ring, score drives training
 *
 * Navigation: dot indicators, swipe (touch X delta) or tap. "Skip tour" top-right.
 * Final slide replaces dots/next with "Enter atlas.core" primary CTA.
 *
 * Gallery:    <S62_Onboard_Tour />
 * Production: <S62_Onboard_Tour dark onFinish={fn} onSkip={fn} />
 *
 * Props contract:
 *   { dark=true, onFinish(), onSkip() }
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';

/* ── slide data ───────────────────────────────────────────────── */
const SLIDES = [
  {
    key: 'log',
    title: 'Log without\nthinking.',
    sub: 'Snap a photo. Say "two eggs and toast." Scan a barcode. We handle the rest.',
    icon: 'camera',
  },
  {
    key: 'coach',
    title: 'Your coach is\nalways here.',
    sub: 'Ask anything. It knows your plan, sleep, training, and what you ate yesterday.',
    icon: 'chat',
  },
  {
    key: 'recovery',
    title: 'Recovery is\nearned.',
    sub: 'Every morning you get a score: what to push, what to hold, when to rest.',
    icon: 'ring',
  },
];

/* ── SVG icons (geometric, minimal, using accent) ─────────────── */
function SlideIcon({ kind, accent, fg, faint }) {
  const size = 120;
  if (kind === 'camera') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        {/* camera body */}
        <rect x="18" y="38" width="84" height="58" rx="10" stroke={accent} strokeWidth="3" />
        {/* lens */}
        <circle cx="60" cy="67" r="18" stroke={accent} strokeWidth="3" />
        <circle cx="60" cy="67" r="7" fill={accent} opacity="0.25" />
        {/* viewfinder bump */}
        <path d="M42 38L48 26h24l6 12" stroke={accent} strokeWidth="3" strokeLinejoin="round" />
        {/* mic indicator (voice) */}
        <rect x="88" y="44" width="6" height="14" rx="3" fill={accent} opacity="0.5" />
        {/* sound waves */}
        <path d="M98 47a6 6 0 0 1 0 8" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      </svg>
    );
  }
  if (kind === 'chat') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        {/* main bubble */}
        <rect x="18" y="24" width="84" height="56" rx="14" stroke={accent} strokeWidth="3" />
        {/* tail */}
        <path d="M36 80L28 96L52 80" stroke={accent} strokeWidth="3" strokeLinejoin="round" />
        {/* typing dots */}
        <circle cx="44" cy="52" r="4" fill={accent} opacity="0.35" />
        <circle cx="60" cy="52" r="4" fill={accent} opacity="0.55" />
        <circle cx="76" cy="52" r="4" fill={accent} opacity="0.80" />
      </svg>
    );
  }
  // ring (readiness)
  const r = 42;
  const cx = 60;
  const circ = 2 * Math.PI * r;
  const fill = 0.8 * circ; // 80% fill
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* track */}
      <circle cx={cx} cy={cx} r={r} stroke={faint} strokeWidth="10" />
      {/* filled arc */}
      <circle
        cx={cx} cy={cx} r={r}
        stroke={accent} strokeWidth="10"
        strokeDasharray={`${fill} ${circ}`}
        strokeDashoffset={circ * 0.25}
        transform={`rotate(-90 ${cx} ${cx})`}
        strokeLinecap="butt"
      />
      {/* center score */}
      <text
        x={cx} y={cx - 2}
        textAnchor="middle" dominantBaseline="central"
        fontFamily={ACFonts.display} fontSize="32" fontWeight="700"
        fill={fg}
        style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}
      >
        82
      </text>
      <text
        x={cx} y={cx + 18}
        textAnchor="middle"
        fontFamily={ACFonts.mono} fontSize="9" fontWeight="600"
        fill={accent}
        style={{ letterSpacing: '2px' }}
      >
        READY
      </text>
    </svg>
  );
}

/* ── swipe threshold (px) ─────────────────────────────────────── */
const SWIPE_THRESHOLD = 50;

/* ── main component ───────────────────────────────────────────── */
export default function S62_Onboard_Tour({
  dark = true,
  onFinish,
  onSkip,
}) {
  const c = useACT(dark);
  const [idx, setIdx] = useState(0);
  const touchRef = useRef(null);
  const last = idx === SLIDES.length - 1;

  const safe = useCallback((fn, ...args) => {
    if (typeof fn === 'function') fn(...args);
  }, []);

  const goNext = useCallback(() => {
    setIdx((prev) => Math.min(prev + 1, SLIDES.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setIdx((prev) => Math.max(prev - 1, 0));
  }, []);

  /* ── touch handlers (swipe left/right) ── */
  const onTouchStart = useCallback((e) => {
    touchRef.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (touchRef.current == null) return;
    const delta = e.changedTouches[0].clientX - touchRef.current;
    touchRef.current = null;
    if (delta < -SWIPE_THRESHOLD) {
      if (last) {
        safe(onFinish);
      } else {
        goNext();
      }
    } else if (delta > SWIPE_THRESHOLD) {
      goPrev();
    }
  }, [last, goNext, goPrev, safe, onFinish]);

  const slide = SLIDES[idx];

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: c.bg,
        color: c.fg,
        minHeight: '100svh',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── skip tour (top-right) ── */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 22px 0',
        display: 'flex',
        justifyContent: 'flex-end',
        position: 'relative',
        zIndex: 2,
      }}>
        <button
          type="button"
          onClick={() => safe(onSkip)}
          style={{
            border: 'none',
            background: 'transparent',
            padding: '6px 0',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <ACLabel size={13} color={c.mute} style={{ fontWeight: 500 }}>
            Skip tour
          </ACLabel>
        </button>
      </div>

      {/* ── slide content (translateX carousel) ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          width: `${SLIDES.length * 100}%`,
          transform: `translateX(-${idx * (100 / SLIDES.length)}%)`,
          transition: 'transform 400ms cubic-bezier(.22,1,.36,1)',
        }}>
          {SLIDES.map((s, i) => (
            <div
              key={s.key}
              style={{
                width: `${100 / SLIDES.length}%`,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 32px',
              }}
            >
              {/* icon */}
              <div style={{ marginBottom: 40 }}>
                <SlideIcon kind={s.icon} accent={c.accent} fg={c.fg} faint={c.faint} />
              </div>

              {/* headline */}
              <div style={{
                fontFamily: ACFonts.brand,
                fontSize: 44,
                letterSpacing: -2,
                lineHeight: 1.05,
                color: c.fg,
                textTransform: 'lowercase',
                textAlign: 'center',
                whiteSpace: 'pre-line',
              }}>
                {s.title}
              </div>

              {/* subtitle */}
              <div style={{
                marginTop: 16,
                fontFamily: ACFonts.body,
                fontSize: 14,
                lineHeight: 1.55,
                color: c.dim,
                textAlign: 'center',
                maxWidth: 300,
                letterSpacing: -0.1,
              }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── bottom area: dots + CTA ── */}
      <div style={{
        padding: '0 28px calc(env(safe-area-inset-bottom, 0px) + 28px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        position: 'relative',
        zIndex: 2,
      }}>
        {/* dot indicators (hidden on last slide when CTA shows) */}
        {!last && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{
                    width: i === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 999,
                    background: i === idx ? c.accent : c.faint,
                    transition: 'all 300ms cubic-bezier(.22,1,.36,1)',
                  }}
                />
              ))}
            </div>

            {/* next button */}
            <ACBtn
              primary
              dark={dark}
              size="lg"
              pill
              block
              onClick={goNext}
              style={{ width: '100%' }}
            >
              Next
            </ACBtn>
          </>
        )}

        {/* final slide: enter CTA */}
        {last && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{
                    width: i === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 999,
                    background: i === idx ? c.accent : c.faint,
                    transition: 'all 300ms cubic-bezier(.22,1,.36,1)',
                  }}
                />
              ))}
            </div>

            <ACBtn
              primary
              dark={dark}
              size="lg"
              pill
              block
              onClick={() => safe(onFinish)}
              style={{ width: '100%' }}
            >
              Enter atlas.core &rarr;
            </ACBtn>
          </>
        )}
      </div>
    </div>
  );
}
