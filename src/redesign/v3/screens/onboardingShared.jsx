import React from 'react';
import { ACFonts, ACRadii, useACT, ACLabel, ACBtn } from '../lib/paper.jsx';

export function OnboardingHeader({ step, total, dark, onBack = true, eyebrow = 'Onboarding' }) {
  const c = useACT(dark);

  return (
    <div style={{ padding: '18px 22px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {onBack ? (
          <button
            type="button"
            onClick={typeof onBack === 'function' ? onBack : undefined}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              background: dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.05)',
              border: `1px solid ${c.hair}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div style={{ width: 34 }} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 10 }}>
            <ACLabel
              size={10}
              color={c.mute}
              style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}
            >
              {eyebrow}
            </ACLabel>
            <ACLabel size={11} color={c.dim} style={{ fontWeight: 600 }}>
              {step}/{total}
            </ACLabel>
          </div>

          <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 999,
                  background: i < step
                    ? c.accent
                    : i === step
                      ? (dark ? 'rgba(239,233,218,0.72)' : 'rgba(10,10,10,0.72)')
                      : c.hair,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OnboardingShell({ dark = false, step, total = 10, onBack, eyebrow, children, footer }) {
  const c = useACT(dark);
  const topGlow = dark
    ? 'radial-gradient(120% 70% at 50% 0%, rgba(232,181,0,0.12), rgba(232,181,0,0) 58%)'
    : 'radial-gradient(120% 70% at 50% 0%, rgba(232,181,0,0.18), rgba(232,181,0,0) 60%)';
  const sideGlow = dark
    ? 'radial-gradient(60% 40% at 100% 20%, rgba(239,233,218,0.04), rgba(239,233,218,0) 70%)'
    : 'radial-gradient(55% 35% at 100% 12%, rgba(10,10,10,0.05), rgba(10,10,10,0) 72%)';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: topGlow, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: sideGlow, pointerEvents: 'none' }} />
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 28,
          right: 28,
          height: 1,
          background: dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.06)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <OnboardingHeader step={step} total={total} dark={dark} onBack={onBack} eyebrow={eyebrow} />
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '26px 28px 16px' }}>{children}</div>
        <div
          style={{
            padding: '14px 28px 26px',
            flexShrink: 0,
            background: dark ? 'linear-gradient(180deg, rgba(10,10,10,0), rgba(10,10,10,0.32) 40%, rgba(10,10,10,0.58))' : 'linear-gradient(180deg, rgba(239,233,218,0), rgba(239,233,218,0.62) 35%, rgba(239,233,218,0.94))',
            backdropFilter: 'blur(10px)',
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}

export function OnboardingHero({ dark = false, label, title, body, aside }) {
  const c = useACT(dark);

  return (
    <div style={{ marginBottom: 26 }}>
      <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
        {label}
      </ACLabel>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: ACFonts.display,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: -1.3,
              lineHeight: 0.98,
              color: c.fg,
              maxWidth: 260,
            }}
          >
            {title}
          </div>
          {body ? (
            <div style={{ marginTop: 12, fontSize: 14, color: c.dim, lineHeight: 1.58, maxWidth: 300 }}>
              {body}
            </div>
          ) : null}
        </div>
        {aside ? (
          <div
            style={{
              flexShrink: 0,
              minWidth: 82,
              padding: '12px 12px 10px',
              borderRadius: ACRadii.card,
              background: dark ? 'rgba(239,233,218,0.04)' : 'rgba(10,10,10,0.035)',
              border: `1px solid ${c.hair}`,
            }}
          >
            {aside}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function OnboardingCard({ dark = false, children, accent = false, style }) {
  const c = useACT(dark);

  return (
    <div
      style={{
        padding: 18,
        borderRadius: ACRadii.card,
        background: dark ? 'rgba(239,233,218,0.05)' : 'rgba(255,255,255,0.34)',
        border: `1px solid ${accent ? 'rgba(232,181,0,0.38)' : c.hair}`,
        boxShadow: dark ? 'none' : '0 10px 30px rgba(10,10,10,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function OnboardingPrimaryAction({ dark = false, children, ...props }) {
  return (
    <ACBtn primary block dark={dark} size="lg" pill style={{ boxShadow: dark ? 'none' : '0 12px 24px rgba(232,181,0,0.22)' }} {...props}>
      {children}
    </ACBtn>
  );
}
