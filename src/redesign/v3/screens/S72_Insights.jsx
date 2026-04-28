/**
 * S72_Insights -- AI insights dashboard with Pro gate.
 *
 * Replaces v2 Insights.jsx. Uses the v3 paper design system exclusively.
 * Pattern: S2_Today_A (dashboard) + S57_Coach_Insight (insight cards).
 *
 * Period tabs (Today/7d/30d/All). Category filter chips
 * (All/Recovery/Training/Nutrition/Body/Sleep). Insight cards with
 * severity-coded left border, category badge, headline, body preview,
 * timestamp. "Ask coach" floating CTA.
 *
 * Gallery:    <S72_Insights dark />
 * Production: <S72_Insights dark={false} isPremium insights={[...]}
 *               onUpgrade={fn} onOpenInsight={fn} onAsk={fn} onBack={fn} />
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=false]
 * @param {boolean}  [props.isPremium=true]
 * @param {Array}    [props.insights] - [{id, category, severity, headline, body, at, delta, metrics}]
 * @param {function} [props.onUpgrade]
 * @param {function} [props.onOpenInsight] - (id) => void
 * @param {function} [props.onAsk]
 * @param {function} [props.onBack]
 */
import React, { useMemo, useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACNum, ACBtn, ACChip,
} from '../lib/paper.jsx';

/* ── constants ─────────────────────────────────────────────── */
const PERIODS   = ['Today', '7d', '30d', 'All'];
const CATEGORIES = ['All', 'Recovery', 'Training', 'Nutrition', 'Body', 'Sleep'];

/* ── severity palette (theme-aware) ────────────────────────── */
function severityColor(severity, c) {
  const map = {
    positive: c.accent,
    warning:  '#e8a020',
    info:     c.dim,
    danger:   '#c65b4b',
  };
  return map[severity] || c.dim;
}

/* ── DEMO data (gallery fallback) ──────────────────────────── */
const DEMO_INSIGHTS = [
  {
    id: '1',
    category: 'Recovery',
    severity: 'positive',
    headline: 'HRV rebounded 18% overnight',
    body: 'Two consecutive nights of 7+ hours sleep restored your autonomic tone. You are primed for intensity today.',
    at: new Date(Date.now() - 2 * 3600000).toISOString(),
    delta: '+18%',
  },
  {
    id: '2',
    category: 'Training',
    severity: 'warning',
    headline: 'Volume has exceeded plan by 12% this week',
    body: 'Accessory work on Wednesday added 2,400 lb over plan. Consider dropping one set tomorrow.',
    at: new Date(Date.now() - 6 * 3600000).toISOString(),
    delta: '+12%',
  },
  {
    id: '3',
    category: 'Nutrition',
    severity: 'danger',
    headline: 'Protein deficit 3 of last 5 days',
    body: 'Average 148g vs 186g target. Recovery and muscle protein synthesis are impacted.',
    at: new Date(Date.now() - 18 * 3600000).toISOString(),
    delta: '-38g avg',
  },
  {
    id: '4',
    category: 'Sleep',
    severity: 'info',
    headline: 'Sleep window shifted 42 min later this week',
    body: 'Bedtime moved from 22:30 to 23:12 average. Morning HRV readings are trending lower.',
    at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    id: '5',
    category: 'Body',
    severity: 'positive',
    headline: 'Weight trend on target for 3 consecutive weeks',
    body: 'Losing 0.6 lb/wk average. Body fat estimate dropped from 16.2% to 15.4%.',
    at: new Date(Date.now() - 48 * 3600000).toISOString(),
    delta: '-0.8%',
  },
];

const TEASE_HEADLINES = [
  'Why your HRV is trending down.',
  'The macro pattern behind your recent PRs.',
  'Sleep debt: how much you can push this week.',
  'Protein timing vs. strength gains — your data.',
];

/* ── relative time formatter ───────────────────────────────── */
function formatRel(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── period filter helper ──────────────────────────────────── */
function periodMaxDays(p) {
  if (p === 'Today') return 1;
  if (p === '7d') return 7;
  if (p === '30d') return 30;
  return Infinity;
}

/* ── safe handler wrapper ──────────────────────────────────── */
const safe = (fn, ...args) => { if (typeof fn === 'function') fn(...args); };

/* ── main component ────────────────────────────────────────── */
export default function S72_Insights({
  dark = false,
  isPremium = true,
  insights,
  onUpgrade,
  onOpenInsight,
  onAsk,
  onBack,
}) {
  const c = useACT(dark);
  const data = insights || DEMO_INSIGHTS;

  const [period, setPeriod] = useState('7d');
  const [cat, setCat] = useState('All');

  const filtered = useMemo(() => {
    const maxDays = periodMaxDays(period);
    return data.filter((i) => {
      if (cat !== 'All' && i.category !== cat) return false;
      if (!i.at || maxDays === Infinity) return true;
      const ageDays = (Date.now() - new Date(i.at).getTime()) / 86400000;
      return ageDays <= maxDays;
    });
  }, [data, period, cat]);

  /* ── Premium gate (free users) ──────────────────────────── */
  if (!isPremium) {
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
        {/* top bar */}
        <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={() => safe(onBack)} style={{
            width: 28, height: 28, borderRadius: 999,
            background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Insights</ACLabel>
          <div style={{ width: 28 }} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 28px' }}>
          {/* Hero */}
          <div style={{ marginTop: 8 }}>
            <ACLabel size={11} color={c.accent} style={{
              fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
            }}>
              Insights · Premium
            </ACLabel>
            <div style={{
              marginTop: 8, fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
              letterSpacing: -0.8, lineHeight: 1.1, color: c.fg,
            }}>
              Your data, decoded.
            </div>
            <div style={{
              marginTop: 8, fontSize: 14, color: c.dim, lineHeight: 1.5, maxWidth: 300,
            }}>
              Atlas AI watches every metric and surfaces the patterns that actually matter.
            </div>
          </div>

          {/* Teaser cards (blurred) */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TEASE_HEADLINES.map((h, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: ACRadii.card,
                background: c.card,
                border: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: ACRadii.chip, flexShrink: 0,
                  background: dark ? 'rgba(232,181,0,0.10)' : 'rgba(232,181,0,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1l1.5 3.5L12 5.5l-2.5 2.5.5 3.5L7 10l-3 1.5.5-3.5L2 5.5l3.5-1L7 1z" stroke={c.accent} strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{
                  flex: 1, fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
                  color: c.dim, filter: 'blur(3px)',
                }}>
                  {h}
                </div>
                <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.3, flexShrink: 0 }}>
                  LOCKED
                </ACLabel>
              </div>
            ))}
          </div>

          {/* Upgrade card */}
          <div style={{
            marginTop: 20, padding: 20, borderRadius: ACRadii.card,
            background: c.fg, color: c.bg,
          }}>
            <ACLabel size={11} color={c.accent} style={{
              fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
            }}>
              Atlas Premium
            </ACLabel>
            <div style={{
              marginTop: 6, fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
              letterSpacing: -0.4, lineHeight: 1.15,
            }}>
              Unlock every insight
            </div>
            <div style={{
              marginTop: 6, fontSize: 13, color: dark ? 'rgba(10,10,10,0.65)' : 'rgba(239,233,218,0.65)',
              lineHeight: 1.5,
            }}>
              Includes AI coach chat, meal plans, lab interpretation, and unlimited AI logs.
            </div>
            <button type="button" onClick={() => safe(onUpgrade)} style={{
              marginTop: 14, padding: '12px 20px', borderRadius: 999,
              background: c.accent, color: c.ink,
              border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%',
            }}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Premium view ───────────────────────────────────────── */
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* top bar */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={() => safe(onBack)} style={{
          width: 28, height: 28, borderRadius: 999,
          background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Insights</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* scroll area */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 90px' }}>
        {/* Title */}
        <div style={{
          fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
          letterSpacing: -0.8, lineHeight: 1.1, color: c.fg,
        }}>
          What I'm seeing.
        </div>

        {/* Period tabs */}
        <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
          {PERIODS.map((p) => {
            const on = p === period;
            return (
              <button key={p} type="button" onClick={() => setPeriod(p)} style={{
                flex: '0 0 auto',
                height: 32, paddingInline: 14, borderRadius: 999,
                background: on ? c.fg : 'transparent',
                color: on ? c.bg : c.dim,
                border: on ? 'none' : `1px solid ${c.hair}`,
                fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}>
                {p}
              </button>
            );
          })}
        </div>

        {/* Category chips */}
        <div style={{
          marginTop: 10, display: 'flex', gap: 6,
          overflowX: 'auto', scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {CATEGORIES.map((g) => {
            const on = g === cat;
            return (
              <button key={g} type="button" onClick={() => setCat(g)} style={{
                flex: '0 0 auto',
                height: 30, paddingInline: 12, borderRadius: ACRadii.chip,
                background: on ? (dark ? 'rgba(232,181,0,0.14)' : 'rgba(232,181,0,0.10)') : (dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.04)'),
                border: on ? `1px solid ${c.accent}` : `1px solid ${c.hair}`,
                color: on ? c.accent : c.dim,
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}>
                {g}
              </button>
            );
          })}
        </div>

        {/* Insight cards or empty state */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: 20, borderRadius: ACRadii.card, background: c.card,
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 16, fontWeight: 700,
                letterSpacing: -0.3, color: c.fg,
              }}>
                Nothing to call out
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: c.dim, lineHeight: 1.5 }}>
                {data.length === 0
                  ? 'Log some meals, workouts, and connect a wearable — the AI needs data to find patterns.'
                  : 'No insights match this filter. Try a broader timeframe or different category.'}
              </div>
            </div>
          ) : (
            filtered.map((insight) => {
              const sevColor = severityColor(insight.severity, c);
              return (
                <button
                  key={insight.id}
                  type="button"
                  onClick={() => safe(onOpenInsight, insight.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '16px 16px 16px 20px',
                    background: c.card, borderRadius: ACRadii.card,
                    borderLeft: `3px solid ${sevColor}`,
                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {/* Category + timestamp row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 8px', borderRadius: ACRadii.chip,
                      background: dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.04)',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: 2, background: sevColor,
                      }} />
                      <ACLabel size={10} color={c.mute} style={{
                        fontFamily: ACFonts.mono, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 700,
                      }}>
                        {insight.category}
                      </ACLabel>
                    </span>
                    {insight.at && (
                      <ACMono size={10} color={c.mute} style={{ marginLeft: 'auto' }}>
                        {formatRel(insight.at)}
                      </ACMono>
                    )}
                  </div>

                  {/* Headline */}
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700,
                    letterSpacing: -0.2, lineHeight: 1.3, color: c.fg,
                  }}>
                    {insight.headline}
                  </div>

                  {/* Body preview */}
                  {insight.body && (
                    <div style={{
                      marginTop: 4, fontSize: 13, color: c.dim, lineHeight: 1.45,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {insight.body}
                    </div>
                  )}

                  {/* Delta chip */}
                  {insight.delta && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px', borderRadius: ACRadii.chip,
                        background: dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.04)',
                        fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: insight.severity === 'positive' ? c.accent
                             : insight.severity === 'danger' ? '#c65b4b'
                             : c.mute,
                      }}>
                        {insight.delta}
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Floating "Ask coach" CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 22px calc(12px + env(safe-area-inset-bottom, 0px))',
        background: `linear-gradient(transparent, ${c.bg} 30%)`,
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <ACBtn primary dark={dark} size="lg" pill block onClick={() => safe(onAsk)}>
            Ask coach
          </ACBtn>
        </div>
      </div>
    </div>
  );
}
