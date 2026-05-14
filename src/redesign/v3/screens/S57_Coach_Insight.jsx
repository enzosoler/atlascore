/**
 * S57_Coach_Insight -- deep coaching insight detail with 3-stage gift reveal.
 *
 * Replaces v2 CoachInsightDetail. Uses the v3 paper design system exclusively.
 * This is a GIFT MOMENT per CLAUDE.md S12 -- intelligence delivery.
 *
 * 3-stage reveal:
 *   1. Anticipation: "Analyzing your data..." shimmer bar
 *   2. Reveal: headline + metrics fade/slide in
 *   3. Celebration: narrative + actions appear with coach note feel
 *
 * Gallery:    <S57_Coach_Insight dark />
 * Production: <S57_Coach_Insight dark={false}
 *               insight={{headline, category, severity, metrics, narrative, actions, related}}
 *               onBack={fn} onAskFollowUp={fn} onNavigate={fn} />
 *
 * Props contract:
 *   { dark, insight: {headline, category, severity, metrics: [{label, value, delta, positive}],
 *     narrative, actions: [{label, route}], related: [{label, route}]},
 *     onBack(), onAskFollowUp({headline, category}), onNavigate(route) }
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn, ACMono,
} from '../lib/paper.jsx';

/* ── DEMO data (gallery fallback) ─────────────────────────────── */
const DEMO_INSIGHT = {
  headline: 'HRV rebounded 18% overnight',
  category: 'Recovery',
  severity: 'positive',
  metrics: [
    { label: 'HRV', value: '62 ms', delta: '+18%', positive: true },
    { label: 'RHR', value: '51 bpm', delta: '\u22122', positive: true },
    { label: 'Sleep score', value: '84', delta: '+6', positive: true },
    { label: 'Readiness', value: '87', delta: '+11', positive: true },
  ],
  narrative:
    'Your heart rate variability jumped from 52 to 62 ms after two consecutive nights of 7+ hours sleep and yesterday\'s active recovery session. This places you in the top 15% of your 90-day range. Your autonomic nervous system is ready for high-intensity work today.',
  actions: [
    { label: 'Train heavy lower today', route: '/app/train/today' },
    { label: 'Hit 186g protein target', route: '/app/eat/today' },
    { label: 'Review weekly load plan', route: '/app/train/calendar' },
  ],
  related: [
    { label: 'Sleep detail', route: '/app/body/sleep' },
    { label: 'Readiness history', route: '/app/body/readiness' },
  ],
};

/* ── severity palette (theme-aware via useACT) ─────────────────── */
function useSeverityPalette(severity, c) {
  const palettes = {
    positive: { border: c.accent, badge: c.accent, badgeBg: 'rgba(232,181,0,0.12)' },
    warning:  { border: '#e8a020', badge: '#e8a020', badgeBg: 'rgba(232,160,32,0.12)' },
    info:     { border: c.dim, badge: c.dim, badgeBg: c.card },
    danger:   { border: '#c65b4b', badge: '#c65b4b', badgeBg: 'rgba(198,91,75,0.12)' },
  };
  return palettes[severity] || palettes.info;
}

/* ── main component ────────────────────────────────────────────── */
export default function S57_Coach_Insight({
  dark = false,
  insight,
  onBack,
  onAskFollowUp,
  onNavigate,
}) {
  const c = useACT(dark);
  const data = insight || DEMO_INSIGHT;
  const sev = useSeverityPalette(data.severity, c);

  /* ── 3-stage gift reveal state ── */
  const [stage, setStage] = useState(0); // 0=anticipation, 1=reveal, 2=celebration
  const timerRef = useRef(null);

  useEffect(() => {
    // Stage 0 → 1 after brief anticipation
    timerRef.current = setTimeout(() => setStage(1), 800);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (stage === 1) {
      // Stage 1 → 2 after reveal settles
      timerRef.current = setTimeout(() => setStage(2), 600);
      return () => clearTimeout(timerRef.current);
    }
  }, [stage]);

  const safe = (fn, ...args) => { if (typeof fn === 'function') fn(...args); };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* ── top bar ── */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={() => safe(onBack)} style={{
          width: 28, height: 28, borderRadius: 999,
          background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Coach insight</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* ── scroll area ── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 28px' }}>

        {/* ── STAGE 0: Anticipation ── */}
        {stage === 0 && (
          <div style={{
            padding: '32px 20px', textAlign: 'center',
            opacity: 1,
            transition: 'opacity 300ms ease-out',
          }}>
            <ACLabel size={11} color={c.accent} style={{
              fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            }}>
              Analyzing your data...
            </ACLabel>
            {/* shimmer bar */}
            <div style={{
              marginTop: 16, height: 3, borderRadius: 2,
              background: c.hair, overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%', width: '40%',
                background: c.accent, borderRadius: 2,
                animation: 'shimmer 1s ease-in-out infinite alternate',
              }} />
              <style>{`@keyframes shimmer { from { transform: translateX(0); } to { transform: translateX(150%); } }`}</style>
            </div>
          </div>
        )}

        {/* ── STAGE 1+: Reveal (header + metrics) ── */}
        {stage >= 1 && (
          <div style={{
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 400ms ease-out, transform 400ms ease-out',
          }}>
            {/* Category eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 2,
                background: sev.border,
              }} />
              <ACLabel size={11} color={sev.badge} style={{
                fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
              }}>
                {data.category} insight
              </ACLabel>
            </div>

            {/* Bold headline */}
            <div style={{
              fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
              letterSpacing: -0.8, lineHeight: 1.15, color: c.fg,
            }}>
              {data.headline}
            </div>

            {/* Severity-coded left border card: metrics grid */}
            <div style={{
              marginTop: 16, padding: '16px 16px 16px 20px',
              background: c.card, borderRadius: ACRadii.card,
              borderLeft: `3px solid ${sev.border}`,
            }}>
              <ACLabel size={10} color={c.dim} style={{
                fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>
                The data
              </ACLabel>
              <div style={{
                marginTop: 12, display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
              }}>
                {(data.metrics || []).map((m, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', borderRadius: ACRadii.input,
                    background: dark ? 'rgba(239,233,218,0.04)' : 'rgba(10,10,10,0.03)',
                  }}>
                    <ACLabel size={9} color={c.mute} style={{
                      fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase',
                    }}>
                      {m.label}
                    </ACLabel>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                      <ACNum size={18} color={c.fg} weight={700}>{m.value}</ACNum>
                      {m.delta && (
                        <span style={{
                          fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          color: m.positive === true ? c.accent
                            : m.positive === false ? '#c65b4b'
                            : c.mute,
                        }}>
                          {m.delta}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE 2: Celebration (narrative + actions) ── */}
        {stage >= 2 && (
          <div style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 400ms ease-out 100ms, transform 400ms ease-out 100ms',
          }}>
            {/* AI narrative */}
            <div style={{
              marginTop: 16, padding: 18,
              background: c.card, borderRadius: ACRadii.card,
              borderLeft: `3px solid ${c.accent}`,
            }}>
              <ACLabel size={10} color={c.accent} style={{
                fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
              }}>
                What it means
              </ACLabel>
              <div style={{
                marginTop: 10, fontSize: 14, fontFamily: ACFonts.body,
                color: c.fg, lineHeight: 1.6, letterSpacing: -0.1,
              }}>
                {data.narrative}
              </div>
            </div>

            {/* Numbered action list */}
            {Array.isArray(data.actions) && data.actions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <ACLabel size={11} color={c.dim} style={{
                  fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25, textTransform: 'uppercase',
                }}>
                  What to do
                </ACLabel>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.actions.map((a, i) => (
                    <button key={i} type="button"
                      onClick={() => { if (a.route) safe(onNavigate, a.route); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px', borderRadius: ACRadii.card,
                        background: c.card, border: 'none',
                        cursor: a.route ? 'pointer' : 'default',
                        textAlign: 'left', width: '100%',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {/* numbered badge */}
                      <div style={{
                        width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                        background: i === 0 ? c.accent : c.faint,
                        color: i === 0 ? c.ink : c.fg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: ACFonts.mono, fontSize: 12, fontWeight: 700,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <span style={{
                        flex: 1, fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
                        letterSpacing: -0.2, color: c.fg,
                      }}>
                        {a.label}
                      </span>
                      {a.route && (
                        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                          <path d="M1 1l5 5-5 5" stroke={c.mute} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related links */}
            {Array.isArray(data.related) && data.related.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <ACLabel size={11} color={c.dim} style={{
                  fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25, textTransform: 'uppercase',
                }}>
                  Related
                </ACLabel>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.related.map((r, i) => (
                    <button key={i} type="button"
                      onClick={() => safe(onNavigate, r.route)}
                      style={{
                        height: 34, paddingInline: 14, borderRadius: 999,
                        background: c.card, border: `1px solid ${c.hair}`,
                        fontFamily: ACFonts.body, fontSize: 12, fontWeight: 600,
                        color: c.fg, cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {r.label} →
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ACTION: ask follow-up (sticky bottom) ── */}
      <div style={{ padding: '12px 22px 24px', background: c.bg }}>
        <ACBtn primary dark={dark} size="lg" pill block
          onClick={() => safe(onAskFollowUp, { headline: data.headline, category: data.category })}>
          Ask follow-up →
        </ACBtn>
      </div>
    </div>
  );
}
