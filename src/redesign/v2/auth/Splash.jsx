/**
 * Splash — app launch screen (iOS/Android native, also web fallback)
 * Ref: Apple boot, Instagram launch, Linear brand pause
 *
 * Respects: safe-area insets, reduced-motion.
 * Palette: obsidian canvas + white mark + cyan accent dot.
 */
import React, { useEffect } from 'react';

export default function Splash({
  phase = 'boot',           // 'boot' | 'syncing' | 'ready' | 'error'
  firstLaunch = false,      // true ⇒ lingers a beat longer for brand
  progress = null,          // 0..1 determinate progress (optional)
  error = null,             // { title?, message?, onRetry? }
  onReady,
}) {
  useEffect(() => {
    if (phase === 'ready') onReady?.();
  }, [phase, onReady]);

  const markSize = firstLaunch ? 120 : 92;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={phase !== 'ready'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow — cyan bloom under the mark, Linear style */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(0,255,255,0.08) 0%, transparent 55%)',
          animation: 'splash-glow 2400ms ease-out both',
        }}
      />

      {/* Mark */}
      <div
        className="motion-safe:animate-splash-in"
        style={{ width: markSize, height: markSize, position: 'relative' }}
      >
        <svg viewBox="0 0 200 100" fill="none" aria-label="atlas.core" style={{ width: '100%', height: '100%' }}>
          <path
            d="M20 50H50L57 62L68 24L80 62L88 50H104L140 32"
            stroke="hsl(var(--rd-fg-primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 300, animation: 'splash-draw 900ms cubic-bezier(.22,1,.36,1) both' }}
          />
          <path
            d="M133 32H140V40"
            stroke="hsl(var(--rd-accent))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'splash-dot 520ms 780ms cubic-bezier(.34,1.56,.64,1) both' }}
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div
        style={{
          marginTop: 20,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          animation: 'splash-word 520ms 480ms cubic-bezier(.22,1,.36,1) both',
        }}
      >
        atlas<span style={{ color: 'hsl(var(--rd-accent))' }}>.</span>core
      </div>

      {/* Tagline — first launch only */}
      {firstLaunch && (
        <div
          style={{
            position: 'absolute',
            bottom: `max(40px, calc(env(safe-area-inset-bottom) + 24px))`,
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'hsl(var(--rd-fg-muted))',
            animation: 'splash-word 520ms 900ms cubic-bezier(.22,1,.36,1) both',
          }}
        >
          Measure · Train · Recover
        </div>
      )}

      {/* Progress hairline */}
      {(phase === 'syncing' || progress !== null) && !error && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: `env(safe-area-inset-bottom)`,
            left: 0,
            right: 0,
            height: 2,
            background: 'hsl(var(--rd-border-subtle))',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: progress != null ? `${Math.max(0, Math.min(1, progress)) * 100}%` : '35%',
              backgroundColor: 'hsl(var(--rd-accent))',
              boxShadow: '0 0 12px hsl(var(--rd-accent) / .6)',
              transition: 'width 320ms cubic-bezier(.22,1,.36,1)',
              animation: progress == null ? 'splash-indeterminate 1400ms infinite ease-in-out' : undefined,
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            position: 'absolute',
            left: 'max(16px, env(safe-area-inset-left))',
            right: 'max(16px, env(safe-area-inset-right))',
            bottom: `calc(env(safe-area-inset-bottom) + 32px)`,
            padding: '14px 16px',
            borderRadius: 16,
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.38)',
            backdropFilter: 'blur(18px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600 }}>{error.title || "Couldn't start"}</div>
          {error.message && (
            <div style={{ marginTop: 4, fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>
              {error.message}
            </div>
          )}
          {error.onRetry && (
            <button
              onClick={error.onRetry}
              style={{
                marginTop: 12,
                height: 40,
                paddingInline: 18,
                borderRadius: 9999,
                background: 'rgba(239,68,68,0.22)',
                border: '1px solid rgba(239,68,68,0.5)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Try again
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes splash-in     { 0%{opacity:0;transform:scale(.92)} 60%{opacity:1;transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
        @keyframes splash-draw   { 0%{stroke-dashoffset:300;opacity:0} 40%{opacity:1} 100%{stroke-dashoffset:0;opacity:1} }
        @keyframes splash-dot    { 0%{opacity:0;transform:translateX(-6px)} 100%{opacity:1;transform:translateX(0)} }
        @keyframes splash-word   { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes splash-glow   { 0%{opacity:0} 30%{opacity:1} 100%{opacity:1} }
        @keyframes splash-indeterminate { 0%{transform:translateX(-100%)} 100%{transform:translateX(380%)} }
        @media (prefers-reduced-motion: reduce) {
          [style*="splash-"] { animation: none !important; }
        }
        .animate-splash-in { animation: splash-in 640ms cubic-bezier(.22,1,.36,1) both; }
      `}</style>
    </div>
  );
}

export { Splash };
