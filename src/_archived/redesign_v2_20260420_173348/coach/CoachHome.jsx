/**
 * CoachHome — /app/coach (redesigned, cleaner).
 * Previous version felt messy: 4 colored insight cards + chips + list + floating
 * button all competing for attention. This version is one column, one visual
 * language, clear hierarchy:
 *
 *  1. Hero "Ask anything" composer card at the top (where the eye lands first)
 *  2. Insights — all use the SAME violet-glass card style; severity is a subtle
 *     icon + small colored dot, not a full card tint
 *  3. Recent chats (compact, tappable rows — no icons competing with titles)
 *
 * No floating button (was covering last content / blocking scroll illusion).
 * No rainbow insight cards (was the "bagunçado" source).
 */
import React, { useState } from 'react';
import { SafeScreen, Glass, SpringReveal } from '../lib/glass';

/**
 * CRITICAL RULE: this screen NEVER fabricates user-specific insights.
 * Every card here must come from a real analysis of the user's real data
 * (recovery, nutrition, training). If there's nothing real to show, we show
 * the empty state — we do NOT hardcode "HRV rebounded 12%" style claims.
 * Health/fitness insights shown as real when they aren't = broken trust +
 * potentially dangerous (user changes training based on invented data).
 */

const SEVERITY_DOT = {
  positive: '#34D399',
  warning:  '#FBBF24',
  info:     'hsl(var(--rd-accent))',
  danger:   '#FB7185',
};

export default function CoachHome({
  firstName = '',
  // REAL data only. Never defaults to fabricated entries. Route is responsible
  // for passing insights sourced from the insight service.
  insights = [],
  recentChats = [],
  onOpenChat,
  onOpenInsight,
  onAsk,
}) {
  const [composerText, setComposerText] = useState('');

  const submit = () => {
    const t = composerText.trim();
    if (!t) onOpenChat?.();
    else onAsk?.(t);
    setComposerText('');
  };

  return (
    // `hasFab` on SafeScreen adds 80px of bottom breathing room — important so
    // the last insight / chat isn't obscured by the bottom nav on short viewports.
    <SafeScreen hasTopBar hasBottomNav hasFab paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Eyebrow */}
        <SpringReveal delay={20}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: 99, background: '#34D399', boxShadow: '0 0 6px rgba(52,211,153,.6)' }} />
              <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
                Atlas AI coach
              </span>
            </div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Here's what I'm seeing{firstName ? `, ${firstName}` : ''}.
            </h1>
          </div>
        </SpringReveal>

        {/* Hero composer — the primary action, right where the eye lands */}
        <SpringReveal delay={60}>
          <Glass tint="ai" radius="xl" elevation="md" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(139,92,246,0.28)', border: '1px solid rgba(139,92,246,0.5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#A78BFA' }}>
                <SparkIcon />
              </span>
              <input
                type="text"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                placeholder="Ask anything about your data…"
                style={{
                  flex: 1, height: 40, background: 'transparent', border: 'none', outline: 'none',
                  color: 'hsl(var(--rd-fg-primary))', fontSize: 15, letterSpacing: '-0.005em',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={submit}
                aria-label="Send"
                style={{
                  width: 40, height: 40, borderRadius: 9999, flexShrink: 0,
                  background: 'linear-gradient(180deg, rgba(139,92,246,0.95), rgba(124,58,237,0.9))',
                  border: '1px solid rgba(139,92,246,0.55)',
                  color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 6px 16px -6px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 19V5m0 0l-6 6m6-6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            {/* Quick prompts — subtle row below */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {["Why is my recovery low?", "Plan my next workout", "What should I eat tonight?"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onAsk?.(p)}
                  style={{
                    height: 28, paddingInline: 10, borderRadius: 9999,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    color: 'hsl(var(--rd-fg-secondary))',
                    fontSize: 12, fontWeight: 500, letterSpacing: '-0.005em',
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </Glass>
        </SpringReveal>

        {/* Insights — unified violet glass, severity as icon dot not card tint.
            When empty, we honestly say "no insights yet" instead of hallucinating. */}
        <SpringReveal delay={120}>
          <div style={{ marginTop: 24, paddingInline: 2, marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
              Today's insights{insights.length ? ` · ${insights.length}` : ''}
            </h2>
          </div>
        </SpringReveal>

        {insights.length === 0 ? (
          <SpringReveal delay={160}>
            <Glass radius="xl" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span
                  aria-hidden
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'hsl(var(--rd-fg-muted))',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2.5-2.5 4M12 17v.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', lineHeight: 1.3 }}>
                    No insights yet
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.45 }}>
                    Your coach needs data to analyze. Log a meal, complete a workout, or connect a
                    wearable — real insights will appear here as soon as there's a pattern worth
                    calling out.
                  </p>
                </div>
              </div>
            </Glass>
          </SpringReveal>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {insights.map((i, idx) => (
              <SpringReveal key={i.id} delay={160 + idx * 40}>
                <InsightCard insight={i} onOpen={() => onOpenInsight?.(i.id)} onAsk={onAsk} />
              </SpringReveal>
            ))}
          </div>
        )}

        {/* Recent chats — compact */}
        {recentChats.length > 0 && (
          <SpringReveal delay={320}>
            <div style={{ marginTop: 24, paddingInline: 2, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
                Recent chats
              </h2>
              <button
                type="button"
                onClick={() => onOpenChat?.()}
                style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                New chat
              </button>
            </div>
            <div style={{ display: 'grid', gap: 4 }}>
              {recentChats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onOpenChat?.(c.id)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 4px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: 'hsl(var(--rd-fg-primary))',
                    textAlign: 'left',
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em' }} className="truncate">
                    {c.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', flexShrink: 0, fontWeight: 500 }}>
                    {c.date}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'hsl(var(--rd-fg-muted))', flexShrink: 0 }}>
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </SpringReveal>
        )}
      </div>
    </SafeScreen>
  );
}
export { CoachHome };

/* ─── Insight card (uniform violet glass + severity dot) ─────────────── */

function InsightCard({ insight, onOpen, onAsk }) {
  const dot = SEVERITY_DOT[insight.severity] || '#A78BFA';
  return (
    <Glass radius="xl" style={{ padding: 14, background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span aria-hidden style={{ width: 6, height: 6, borderRadius: 99, background: dot, boxShadow: `0 0 5px ${dot}` }} />
        <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
          {insight.category}
        </span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em', color: 'hsl(var(--rd-fg-primary))' }}>
        {insight.headline}
      </div>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.45 }}>
        {insight.body}
      </p>
      <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
        <button
          type="button"
          onClick={() => onAsk?.(`Tell me more: ${insight.headline}`)}
          style={{ background: 'transparent', border: 'none', color: '#A78BFA', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, letterSpacing: '-0.005em' }}
        >
          Ask why →
        </button>
        <button
          type="button"
          onClick={onOpen}
          style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-fg-muted))', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          Details
        </button>
      </div>
    </Glass>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
