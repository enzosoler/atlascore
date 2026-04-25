/**
 * S68_Meal_Plans — meal plan browser with Pro gate (v3 paper system).
 *
 * Replaces v2 MealPlans.jsx with the paper+ink+amber aesthetic.
 * Pattern: S24_Library (browse list with tabs) + S44_Protocols_Empty_Locked (Pro gate).
 *
 * Two states:
 *  1. Locked (non-Pro) — accent-bordered card explaining the feature + upgrade CTA
 *  2. Unlocked (Pro)   — "My plans" tab (empty state or user list) + "Templates" tab
 *
 * Template cards: plan name, kcal range, macro split bar (P/C/F), description, "Start" CTA.
 * 6 presets: Cutting, Maintenance, Lean Bulking, Endurance, Low FODMAP, Plant-based.
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=false]
 * @param {boolean}  [props.isPro=false]
 * @param {Array}    [props.myPlans]            — [{id, name, kcalRange, split}]
 * @param {function} [props.onStartTemplate]    — (templateId) => void
 * @param {function} [props.onOpenPlan]          — (planId) => void
 * @param {function} [props.onGeneratePlan]      — () => void
 * @param {function} [props.onUpgrade]           — () => void
 * @param {function} [props.onBack]              — () => void
 */
import React, { useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACBtn, ACChip, ACSpark,
} from '../lib/paper.jsx';

/* ── templates ─────────────────────────────────────────────────── */

const TEMPLATES = [
  {
    id: 'cutting',
    name: 'Cutting (-500 kcal)',
    kcal: '1 600 - 1 800',
    split: { p: 40, c: 35, f: 25 },
    desc: 'High protein, moderate carbs to preserve muscle while losing fat.',
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    kcal: '2 000 - 2 400',
    split: { p: 30, c: 40, f: 30 },
    desc: 'Balanced macros designed to hold your current weight and training volume.',
  },
  {
    id: 'lean-bulk',
    name: 'Lean bulking (+300 kcal)',
    kcal: '2 500 - 2 900',
    split: { p: 30, c: 45, f: 25 },
    desc: 'Small surplus with enough carbs to fuel hard lifts without added fat.',
  },
  {
    id: 'endurance',
    name: 'Endurance carb-heavy',
    kcal: '2 800 - 3 400',
    split: { p: 20, c: 60, f: 20 },
    desc: 'High-carb fuel for long-duration sessions — runners, cyclists, triathletes.',
  },
  {
    id: 'low-fodmap',
    name: 'Low FODMAP',
    kcal: '1 900 - 2 200',
    split: { p: 30, c: 40, f: 30 },
    desc: 'IBS-friendly substitutions with minimal fermentable carbs.',
  },
  {
    id: 'plant-protein',
    name: 'Plant-based high-protein',
    kcal: '2 100 - 2 400',
    split: { p: 30, c: 45, f: 25 },
    desc: 'Soy, legumes, and complete grains combined for full amino profiles.',
  },
];

/* ── demo data ─────────────────────────────────────────────────── */

const DEMO_MY_PLANS = [
  { id: 'u1', name: 'My cutting plan', kcalRange: '1 700', split: { p: 40, c: 35, f: 25 } },
];

/* ── pro gate perks ────────────────────────────────────────────── */

const PERKS = [
  ['AI-tailored plans',     'Built from your goals, weight, and training load.'],
  ['Weekly adaptation',     'Macros adjust based on adherence and progress.'],
  ['Template library',      'Six evidence-based presets to start instantly.'],
  ['Preference-aware',      'Respects allergies, intolerances, and diet style.'],
];

/* ── macro split colors (from system accent + complementary) ──── */
const MACRO_COLORS = { p: '#e8b500', c: '#c2a04a', f: '#8a7a52' };

/* ── main component ────────────────────────────────────────────── */

export default function S68_Meal_Plans({
  dark = false,
  isPro = false,
  myPlans: myPlansProp,
  onStartTemplate,
  onOpenPlan,
  onGeneratePlan,
  onUpgrade,
  onBack,
}) {
  const c = useACT(dark);
  const [tab, setTab] = useState('mine');

  const myPlans = myPlansProp === undefined ? (isPro ? DEMO_MY_PLANS : []) : myPlansProp;

  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
      background: c.bg, color: c.fg,
    }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 22px 0', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          type="button"
          onClick={typeof onBack === 'function' ? onBack : undefined}
          style={{
            width: 28, height: 28, borderRadius: 999,
            background: c.card, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{
          fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25,
          textTransform: 'uppercase',
        }}>
          Nutrition
        </ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* Header */}
      <div style={{ padding: '12px 22px 6px' }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
          letterSpacing: -0.8, color: c.fg, lineHeight: 1.1,
        }}>
          Meal plans
        </div>
        <div style={{
          marginTop: 6, fontFamily: ACFonts.body, fontSize: 13,
          color: c.dim, lineHeight: 1.45,
        }}>
          AI-tailored plans that adapt to your goals, training load, and food preferences.
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto',
        WebkitOverflowScrolling: 'touch', padding: '10px 22px 24px',
      }}>
        {!isPro ? (
          /* ── Locked state ────────────────────────────────────────── */
          <div>
            {/* Pro gate hero */}
            <div style={{
              position: 'relative', background: c.fg, color: c.bg,
              padding: '24px 20px 22px', borderRadius: ACRadii.card,
              marginTop: 4,
            }}>
              <ACMono size={9} track={3} color={c.accent}>PRO · REQUIRED</ACMono>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 30, fontWeight: 800,
                letterSpacing: -1.2, lineHeight: 1, marginTop: 10,
              }}>
                Your nutrition,{'\n'}
                <span style={{ color: c.accent }}>planned properly.</span>
              </div>
              <div style={{
                marginTop: 12, fontFamily: ACFonts.body, fontSize: 13,
                lineHeight: 1.5, opacity: 0.8,
              }}>
                Get unlimited plans tailored to your goals — adapt weekly based on your training, weight, and preferences.
              </div>
              <div style={{ marginTop: 16 }}>
                <ACSpark w={260} h={28} color={c.accent} dark={true} stroke={2.2} />
              </div>
            </div>

            {/* Perks list */}
            <div style={{ padding: '16px 0 12px' }}>
              {PERKS.map(([title, sub], i) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, padding: '12px 0',
                  borderBottom: i < PERKS.length - 1 ? `1px solid ${c.hair}` : 'none',
                }}>
                  <div style={{
                    flexShrink: 0, width: 6, height: 6,
                    background: c.accent, marginTop: 8,
                  }} />
                  <div>
                    <div style={{
                      fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700,
                      letterSpacing: -0.2, color: c.fg,
                    }}>
                      {title}
                    </div>
                    <div style={{
                      fontFamily: ACFonts.body, fontSize: 12, color: c.dim, marginTop: 2,
                    }}>
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upgrade CTA */}
            <div style={{ marginBottom: 10 }}>
              <ACBtn primary dark={dark} block size="lg"
                onClick={typeof onUpgrade === 'function' ? onUpgrade : undefined}>
                Upgrade to Pro
              </ACBtn>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ACMono size={10} color={c.dim}>$9.99 / MO · CANCEL ANYTIME</ACMono>
            </div>
          </div>
        ) : (
          /* ── Unlocked state ──────────────────────────────────────── */
          <div>
            {/* Tab toggle */}
            <div style={{
              display: 'flex', gap: 1, background: c.hair, padding: 2,
              borderRadius: ACRadii.chip, marginBottom: 16,
            }}>
              {[['mine', 'My plans'], ['templates', 'Templates']].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  style={{
                    flex: 1, padding: '9px 0', textAlign: 'center',
                    cursor: 'pointer',
                    background: tab === k ? c.fg : 'transparent',
                    color: tab === k ? c.bg : c.dim,
                    fontFamily: ACFonts.body, fontSize: 12, fontWeight: 600,
                    letterSpacing: 0.3, textTransform: 'uppercase',
                    border: 'none', borderRadius: ACRadii.chip - 2,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'mine' ? (
              /* ── My plans tab ─────────────────────────────────────── */
              myPlans.length === 0 ? (
                /* Empty state */
                <div style={{
                  padding: '32px 16px', textAlign: 'center',
                  background: c.card, borderRadius: ACRadii.card,
                }}>
                  {/* Plate pictogram */}
                  <svg width="56" height="56" viewBox="0 0 56 56" style={{ display: 'block', margin: '0 auto 16px' }}>
                    <circle cx="28" cy="28" r="22" stroke={c.fg} strokeWidth="2" fill="none" />
                    <circle cx="28" cy="28" r="10" stroke={c.fg} strokeWidth="1.5" fill="none" />
                    <circle cx="28" cy="28" r="3" fill={c.accent} />
                  </svg>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
                    letterSpacing: -0.5, color: c.fg, lineHeight: 1.15,
                  }}>
                    No plans yet
                  </div>
                  <div style={{
                    fontFamily: ACFonts.body, fontSize: 13, color: c.dim,
                    maxWidth: 260, margin: '8px auto 0', lineHeight: 1.45,
                  }}>
                    Generate your first adaptive plan or start from a template.
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <ACBtn primary dark={dark} pill size="md"
                      onClick={typeof onGeneratePlan === 'function' ? onGeneratePlan : undefined}>
                      Generate your first plan
                    </ACBtn>
                  </div>
                </div>
              ) : (
                /* User plans list */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {myPlans.map((plan, i) => (
                    <button
                      key={plan.id ?? i}
                      type="button"
                      onClick={typeof onOpenPlan === 'function' ? () => onOpenPlan(plan.id) : undefined}
                      style={{
                        padding: '14px 16px', background: c.card,
                        borderRadius: ACRadii.card,
                        display: 'flex', alignItems: 'center', gap: 14,
                        border: 'none', width: '100%', textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Index badge */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: c.fg, color: c.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: ACFonts.display, fontWeight: 700, fontSize: 14,
                        flexShrink: 0,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: ACFonts.display, fontSize: 15, fontWeight: 600,
                          letterSpacing: -0.3, color: c.fg,
                        }}>
                          {plan.name}
                        </div>
                        <div style={{
                          marginTop: 3, fontFamily: ACFonts.body, fontSize: 11,
                          fontWeight: 600, color: c.dim, letterSpacing: 0.2,
                        }}>
                          {plan.kcalRange ? `${plan.kcalRange} kcal` : ''}
                          {plan.split ? ` · P${plan.split.p} C${plan.split.c} F${plan.split.f}` : ''}
                        </div>
                      </div>
                      {/* Chevron */}
                      <svg width="8" height="12" viewBox="0 0 8 12">
                        <path d="M2 1l4 5-4 5" stroke={c.mute} strokeWidth="1.6" fill="none"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}

                  {/* Generate another CTA */}
                  <button
                    type="button"
                    onClick={typeof onGeneratePlan === 'function' ? onGeneratePlan : undefined}
                    style={{
                      marginTop: 4, padding: 16,
                      border: `1px dashed ${c.faint}`, borderRadius: ACRadii.card,
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: 'transparent', cursor: 'pointer',
                      textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: c.card, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 2v14M2 9h14" stroke={c.fg} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>
                        Generate new plan
                      </div>
                      <ACLabel size={11} color={c.dim} style={{ marginTop: 2 }}>
                        AI builds it from your current goals and preferences.
                      </ACLabel>
                    </div>
                  </button>
                </div>
              )
            ) : (
              /* ── Templates tab ────────────────────────────────────── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TEMPLATES.map(t => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    dark={dark}
                    onStart={typeof onStartTemplate === 'function'
                      ? () => onStartTemplate(t.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── sub-components ────────────────────────────────────────────── */

function TemplateCard({ template, dark, onStart }) {
  const c = useACT(dark);
  const { p, c: carb, f } = template.split;
  return (
    <div style={{
      padding: 16, background: c.card,
      borderRadius: ACRadii.card,
    }}>
      {/* Title + kcal */}
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', gap: 10,
      }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700,
          letterSpacing: -0.3, color: c.fg,
        }}>
          {template.name}
        </div>
        <ACMono size={10} color={c.dim} style={{ flexShrink: 0, fontWeight: 600 }}>
          {template.kcal} kcal
        </ACMono>
      </div>

      {/* Macro split bar */}
      <div style={{
        display: 'flex', height: 6, borderRadius: 6,
        overflow: 'hidden', marginTop: 10,
        background: c.hair,
      }}>
        <div style={{ width: `${p}%`, background: c.accent }} />
        <div style={{ width: `${carb}%`, background: c.fg, opacity: 0.45 }} />
        <div style={{ width: `${f}%`, background: c.fg, opacity: 0.22 }} />
      </div>

      {/* Macro legend */}
      <div style={{
        display: 'flex', gap: 12, marginTop: 6,
        fontFamily: ACFonts.body, fontSize: 10, fontWeight: 600,
        color: c.dim, fontVariantNumeric: 'tabular-nums',
      }}>
        <span>
          <span style={{ display: 'inline-block', width: 6, height: 6, background: c.accent, marginRight: 4 }} />
          P {p}%
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 6, height: 6, background: c.fg, opacity: 0.45, marginRight: 4 }} />
          C {carb}%
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 6, height: 6, background: c.fg, opacity: 0.22, marginRight: 4 }} />
          F {f}%
        </span>
      </div>

      {/* Description */}
      <div style={{
        marginTop: 10, fontFamily: ACFonts.body, fontSize: 12.5,
        color: c.dim, lineHeight: 1.45,
      }}>
        {template.desc}
      </div>

      {/* Start CTA */}
      <div style={{ marginTop: 12 }}>
        <ACBtn primary dark={dark} pill size="sm" onClick={onStart}>
          Start
        </ACBtn>
      </div>
    </div>
  );
}
