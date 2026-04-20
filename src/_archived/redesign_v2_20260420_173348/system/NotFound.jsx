/**
 * NotFound — 404 screen for unknown routes.
 *
 * Shown at `/404` and as the catch-all. Matches the v2 Liquid Glass aesthetic —
 * obsidian background, cyan/violet gradient on the "404" numerals, scattered
 * "data" dots in the background to suggest a point that slipped off the chart.
 *
 * Rules applied:
 *  - ZERO emojis — SVG-only scatter decoration.
 *  - Brandmark (Logomark) in the top corner.
 *  - safe-area-inset via SafeScreen on all four sides.
 *  - Two CTAs: primary goes to /app/today when authed, otherwise /.
 *    Secondary is a plain "Go home" that always returns to /.
 *  - Accepts null/undefined `isAuthed` — treats as false.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeScreen, SpringReveal, LiquidButton } from '../lib/glass';
import { Logomark, Wordmark } from '../marketing/MarketingShell';
import { useAuth } from '@/lib/AuthContext';

/* ─── Scattered data decoration ──────────────────────────────────────────── */

/**
 * A deterministic (fixed-seed) constellation of dots and thin lines behind
 * the 404. Deterministic = no hydration mismatch and no layout jitter.
 * We keep opacities low so it reads as ambient texture, not content.
 */
function ScatteredDots() {
  // Pre-baked positions (x%, y%, size px, opacity). Arranged so nothing
  // collides with the centered "404" in the 300x120 headline region.
  const dots = [
    [6, 18, 3, 0.35], [12, 72, 2, 0.28], [22, 28, 2, 0.25],
    [28, 82, 3, 0.30], [38, 10, 2, 0.22], [44, 88, 2, 0.28],
    [56, 14, 3, 0.34], [64, 84, 2, 0.26], [72, 22, 2, 0.24],
    [78, 68, 3, 0.32], [86, 34, 2, 0.22], [92, 78, 2, 0.28],
    [18, 52, 2, 0.20], [82, 52, 2, 0.20],
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    >
      {/* Two very thin "connector" lines that read as data links */}
      <line x1="6"  y1="18" x2="22" y2="28"
            stroke="hsl(var(--rd-accent))" strokeOpacity="0.18" strokeWidth="0.15" />
      <line x1="72" y1="22" x2="86" y2="34"
            stroke="#A78BFA" strokeOpacity="0.18" strokeWidth="0.15" />
      <line x1="28" y1="82" x2="44" y2="88"
            stroke="hsl(var(--rd-accent))" strokeOpacity="0.12" strokeWidth="0.15" />
      {dots.map(([x, y, r, o], i) => (
        <circle
          key={i}
          cx={x} cy={y} r={r / 10}
          fill={i % 2 === 0 ? 'hsl(var(--rd-accent))' : '#A78BFA'}
          fillOpacity={o}
        />
      ))}
    </svg>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function NotFound({ isAuthed = false, onGoToday, onGoHome }) {
  return (
    <SafeScreen paddingX={20}>
      {/* Ambient cyan→violet wash */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background:
            'radial-gradient(60% 40% at 30% 20%, rgba(0,255,255,0.10) 0%, transparent 60%),' +
            'radial-gradient(50% 40% at 80% 80%, rgba(167,139,250,0.10) 0%, transparent 60%)',
        }}
      />

      {/* Brandmark (top-left) */}
      <div
        style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', gap: 8,
          paddingTop: 4,
        }}
      >
        <Logomark size={24} />
        <Wordmark size={15} />
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 520,
          margin: '0 auto',
          minHeight:
            'calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 80px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 22,
        }}
      >
        {/* 404 treatment — the scattered dots sit in a box behind the numerals */}
        <SpringReveal delay={40}>
          <div
            style={{
              position: 'relative',
              width: 300, maxWidth: '90vw',
              height: 140,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ScatteredDots />
            <h1
              style={{
                position: 'relative',
                fontSize: 'clamp(96px, 28vw, 140px)',
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: '-0.05em',
                margin: 0,
                backgroundImage:
                  'linear-gradient(135deg, hsl(var(--rd-accent)) 0%, #A78BFA 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              404
            </h1>
          </div>
        </SpringReveal>

        <SpringReveal delay={140}>
          <h2
            style={{
              fontSize: 26, lineHeight: 1.2,
              fontWeight: 700, letterSpacing: '-0.025em',
              margin: 0, color: 'hsl(var(--rd-fg-primary))',
            }}
          >
            Lost in the data.
          </h2>
          <p
            style={{
              marginTop: 10, marginInline: 'auto', maxWidth: 380,
              fontSize: 15, lineHeight: 1.5,
              color: 'hsl(var(--rd-fg-secondary))',
            }}
          >
            This page isn&apos;t on the map. It might have moved, or the link
            you followed was off by a point.
          </p>
        </SpringReveal>

        <SpringReveal delay={220}>
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', gap: 10,
              justifyContent: 'center', marginTop: 8,
            }}
          >
            <LiquidButton intent="primary" size="lg" onClick={onGoToday}>
              Back to today
            </LiquidButton>
            <LiquidButton intent="neutral" size="lg" onClick={onGoHome}>
              Go home
            </LiquidButton>
          </div>
          {!isAuthed && (
            <p
              style={{
                marginTop: 14, fontSize: 12,
                color: 'hsl(var(--rd-fg-muted))',
              }}
            >
              Not signed in — &quot;Back to today&quot; will bring you to the landing page.
            </p>
          )}
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}

export { NotFound };

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function NotFoundRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthed = !!user;
  return (
    <NotFound
      isAuthed={isAuthed}
      onGoToday={() => navigate(isAuthed ? '/app/today' : '/')}
      onGoHome={() => navigate('/')}
    />
  );
}
