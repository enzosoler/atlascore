import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACBtn,
  ACSpark, ACHeader, ACBrandMark, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

/**
 * S44_Protocols_Empty_Locked — empty + locked/paywall states for protocols.
 *
 * Gallery mode:  <S44_Protocols_Empty_Locked dark />
 * Production:    <S44_Protocols_Empty_Locked dark state="empty"
 *                  onAddQuickStart={fn} onCreateCustom={fn} onStartTrial={fn} />
 *
 * Props:
 *   dark             — light/dark variant
 *   state            — 'empty' | 'locked'
 *   onAddQuickStart  — (template) => void
 *   onCreateCustom   — () => void
 *   onStartTrial     — () => void
 *   showTabBar       — boolean (default true)
 */

const TEMPLATES = [
  { name: 'Creatine monohydrate', meta: '5 g \u00b7 daily' },
  { name: 'Vitamin D3 + K2',      meta: '5 000 IU \u00b7 M/W/F' },
  { name: 'Omega-3',              meta: '3 g \u00b7 daily' },
  { name: 'Magnesium glycinate',  meta: '400 mg \u00b7 before bed' },
];

const PERKS = [
  ['Unlimited protocols', 'One stack or twenty.'],
  ['Cycle-aware cadence',  'On-weeks, off-weeks, loading phases.'],
  ['AI washout warnings',  'Avoid overlapping half-lives.'],
  ['Clinician-ready PDF',  'Export for labs + TRT appointments.'],
];

function S44_Protocols_Empty_Locked({
  dark = false,
  state: stateProp,
  onAddQuickStart,
  onCreateCustom,
  onStartTrial,
  showTabBar = true,
}) {
  const c = useACT(dark);
  const [tab, setTab] = React.useState(stateProp || 'empty');

  // Sync external prop
  React.useEffect(() => {
    if (stateProp) setTab(stateProp);
  }, [stateProp]);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* Brand */}
      <div style={{ padding: '14px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrandMark size={20} dark={dark} HeartMarkComp={HeartMark} />
        <ACMono size={9} color={c.dim}>PRO</ACMono>
      </div>

      <ACHeader dark={dark} sub="PROTOCOLS" title="Protocols." />

      {/* Sub-state toggle */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ display: 'flex', gap: 1, background: c.hair, padding: 2 }}>
          {[['empty', 'Empty'], ['locked', 'Locked']].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              style={{
                flex: 1, padding: '8px 0', textAlign: 'center', cursor: 'pointer',
                background: tab === k ? c.fg : 'transparent',
                color: tab === k ? c.bg : c.dim,
                fontFamily: ACFonts.body, fontSize: 11, fontWeight: 600,
                letterSpacing: 1, textTransform: 'uppercase',
                border: 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '0 20px', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'empty' ? (
          <div>
            {/* Empty state -- first-run */}
            <div style={{ padding: '28px 0 24px', textAlign: 'center' }}>
              {/* Vial / capsule pictogram */}
              <svg width="92" height="92" viewBox="0 0 92 92" style={{ display: 'block', margin: '0 auto 18px' }}>
                <rect x="34" y="14" width="24" height="64" stroke={c.fg} strokeWidth="2.5" fill="none" />
                <line x1="34" y1="40" x2="58" y2="40" stroke={c.fg} strokeWidth="2" />
                <rect x="34" y="40" width="24" height="38" fill={c.fg} opacity="0.08" />
                <circle cx="46" cy="58" r="3" fill={c.accent} />
                <circle cx="46" cy="68" r="3" fill={c.accent} />
                <line x1="14" y1="8" x2="22" y2="8" stroke={c.accent} strokeWidth="2" />
                <line x1="70" y1="8" x2="78" y2="8" stroke={c.accent} strokeWidth="2" />
              </svg>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
                letterSpacing: -0.6, lineHeight: 1.05, color: c.fg,
              }}>
                No protocols yet.
              </div>
              <div style={{
                fontFamily: ACFonts.body, fontSize: 14, color: c.dim,
                maxWidth: 260, margin: '10px auto 0', lineHeight: 1.5,
              }}>
                Track supplements, peptides, and anything you're cycling. Cadence, dose, adherence — in one place.
              </div>
            </div>

            {/* Quick-add templates */}
            <div style={{ marginBottom: 14 }}>
              <ACMono size={9} color={c.dim} track={2}>QUICK START</ACMono>
            </div>
            {TEMPLATES.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={onAddQuickStart ? () => onAddQuickStart(t) : undefined}
                style={{
                  display: 'flex',
                  width: '100%',
                  padding: '14px 16px',
                  marginBottom: 6,
                  background: c.card,
                  borderRadius: ACRadii.card,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 14, fontWeight: 700,
                    letterSpacing: -0.2, color: c.fg,
                  }}>
                    {t.name}
                  </div>
                  <ACMono size={10} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{t.meta}</ACMono>
                </div>
                <span style={{
                  fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, color: c.accent,
                }}>
                  +
                </span>
              </button>
            ))}

            <div style={{ marginTop: 14, paddingBottom: 20 }}>
              <ACBtn primary dark={dark} block size="lg" onClick={onCreateCustom}>
                Create custom protocol
              </ACBtn>
            </div>
          </div>
        ) : (
          <div>
            {/* Locked / paywall hero */}
            <div style={{
              position: 'relative', background: c.fg, color: c.bg,
              padding: '24px 20px 22px', marginTop: 4,
            }}>
              <ACMono size={9} track={3} color={c.accent}>PRO \u00b7 REQUIRED</ACMono>
              <div style={{
                fontFamily: ACFonts.display, fontSize: 34, fontWeight: 800,
                letterSpacing: -1.2, lineHeight: 0.98, marginTop: 10,
              }}>
                Your stack,<br />
                <span style={{ color: c.accent }}>recorded properly.</span>
              </div>
              <div style={{
                marginTop: 12, fontFamily: ACFonts.body, fontSize: 13,
                lineHeight: 1.5, opacity: 0.8,
              }}>
                Peptides. Hormones. Supplements. Anything you cycle — logged, scheduled, visualized.
                Pro is where protocols live.
              </div>
              <div style={{ marginTop: 16 }}>
                <ACSpark w={280} h={30} color={c.accent} dark={true} stroke={2.2} />
              </div>
            </div>

            {/* Perks */}
            <div style={{ padding: '16px 0 12px' }}>
              {PERKS.map(([t, s], i) => (
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
                      {t}
                    </div>
                    <div style={{
                      fontFamily: ACFonts.body, fontSize: 12, color: c.dim, marginTop: 2,
                    }}>
                      {s}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 10 }}>
              <ACBtn primary dark={dark} block size="lg" onClick={onStartTrial}>
                Continue
              </ACBtn>
            </div>
            <div style={{ textAlign: 'center', paddingBottom: 20 }}>
              <ACMono size={10} color={c.dim}>PLAN TERMS SHOWN BEFORE PURCHASE</ACMono>
            </div>
          </div>
        )}
      </div>

      {showTabBar ? <ACTabBar active="body" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}

export default S44_Protocols_Empty_Locked;
