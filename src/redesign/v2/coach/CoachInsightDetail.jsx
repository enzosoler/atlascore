/**
 * CoachInsightDetail — drill-in on one insight card.
 * Ref: Whoop insight detail + Oura reading explanation + Future coach note.
 *
 * Layout:
 *  - Back + share
 *  - Category eyebrow + bold headline
 *  - Data context card (the metrics that drove the insight)
 *  - Coach narrative paragraph
 *  - "What to do" action list (bulleted, tappable)
 *  - Related screens row
 *  - Ask follow-up composer → opens chat with this insight as context
 */
import React from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';

/**
 * CRITICAL: insight is ALWAYS passed in from a real service. Never defaults
 * to a fabricated "HRV rebounded" example. If no insight is loaded, the
 * screen renders a neutral empty state.
 */
export default function CoachInsightDetail({
  insight = null,
  onBack,
  onAsk,             // (prompt) => void  — routes to chat with this insight as context
  onNavigate,        // (route) => void
}) {
  if (!insight) {
    return (
      <SafeScreen paddingX={20}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            position: 'fixed', top: 'calc(env(safe-area-inset-top) + 14px)', left: 'max(16px, env(safe-area-inset-left))',
            zIndex: 45,
            width: 36, height: 36, borderRadius: 9999,
            background: 'rgba(10,14,20,0.55)',
            backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'hsl(var(--rd-fg-primary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 100px)', textAlign: 'center', maxWidth: 360, margin: '0 auto' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Insight not available</div>
          <p style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
            This insight couldn't be loaded. It may have expired or the data it was based on changed.
          </p>
        </div>
      </SafeScreen>
    );
  }
  const palette = {
    positive: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.3)', color: '#34D399', icon: '📈' },
    warning:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)', color: '#FBBF24', icon: '⚠️' },
    info:     { bg: 'rgba(0,255,255,0.06)',   border: 'rgba(0,255,255,0.25)', color: 'hsl(var(--rd-accent))', icon: '💡' },
    danger:   { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.3)',  color: '#FB7185', icon: '🚨' },
  }[insight.severity] || { bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.22)', color: '#A78BFA', icon: '✨' };

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}>
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={{
          position: 'fixed', top: 'calc(env(safe-area-inset-top) + 14px)', left: 'max(16px, env(safe-area-inset-left))',
          zIndex: 45,
          width: 36, height: 36, borderRadius: 9999,
          background: 'rgba(10,14,20,0.55)',
          backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <SpringReveal delay={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span aria-hidden style={{ width: 32, height: 32, borderRadius: 9, background: palette.bg, border: `1px solid ${palette.border}`, color: palette.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {palette.icon}
            </span>
            <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: palette.color, fontWeight: 700 }}>
              {insight.category} · insight
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            {insight.headline}
          </h1>
        </SpringReveal>

        {/* Metrics grid */}
        <SpringReveal delay={60}>
          <Glass radius="xl" style={{ padding: 16, marginTop: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 10 }}>
              The data
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              {insight.metrics.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 3 }}>
                    {m.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                      {m.value}
                    </span>
                    {m.delta && (
                      <span
                        style={{
                          fontSize: 11, fontWeight: 700,
                          color: m.positive === true ? '#34D399' : m.positive === false ? '#FB7185' : 'hsl(var(--rd-fg-muted))',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {m.delta}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Glass>
        </SpringReveal>

        {/* Narrative */}
        <SpringReveal delay={100}>
          <Glass tint="ai" radius="xl" style={{ padding: 18, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span
                aria-hidden
                style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(139,92,246,0.22)',
                  border: '1px solid rgba(139,92,246,0.5)',
                  color: '#A78BFA',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A78BFA', fontWeight: 700, marginBottom: 4 }}>
                  What it means
                </div>
                <p style={{ margin: 0, fontSize: 14, color: 'hsl(var(--rd-fg-primary))', lineHeight: 1.55 }}>
                  {insight.narrative}
                </p>
              </div>
            </div>
          </Glass>
        </SpringReveal>

        {/* Actions */}
        {insight.actions?.length > 0 && (
          <SpringReveal delay={140}>
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', marginBottom: 8, paddingInline: 2 }}>
                What to do
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {insight.actions.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={!a.route}
                    onClick={() => a.route && onNavigate?.(a.route)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'hsl(var(--rd-fg-primary))',
                      textAlign: 'left',
                      cursor: a.route ? 'pointer' : 'default',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 22, height: 22, borderRadius: 9999,
                        background: 'rgba(0,255,255,0.14)',
                        border: '1px solid rgba(0,255,255,0.35)',
                        color: 'hsl(var(--rd-accent))',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>{a.label}</span>
                    {a.route && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))' }}>
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </SpringReveal>
        )}

        {/* Related */}
        {insight.related?.length > 0 && (
          <SpringReveal delay={180}>
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', marginBottom: 8, paddingInline: 2 }}>
                Related
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {insight.related.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onNavigate?.(r.route)}
                    style={{
                      height: 36, paddingInline: 14, borderRadius: 9999,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color: 'hsl(var(--rd-fg-secondary))',
                      fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {r.label} →
                  </button>
                ))}
              </div>
            </div>
          </SpringReveal>
        )}
      </div>

      {/* Ask follow-up sticky */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 640, margin: '0 auto' }}>
          <LiquidButton
            intent="ai"
            size="xl"
            block
            onClick={() => onAsk?.(`Tell me more about: ${insight.headline}`)}
          >
            ✨ Ask follow-up
          </LiquidButton>
        </div>
      </div>
    </SafeScreen>
  );
}
export { CoachInsightDetail };
