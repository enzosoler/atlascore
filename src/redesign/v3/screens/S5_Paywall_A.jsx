import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

const PLANS = [
  { k: 'yearly',  t: '12 months', p: '$79',   pm: '$6.58 / mo',  save: 'Save 62%' },
  { k: 'monthly', t: '1 month',   p: '$9.99', pm: '$9.99 / mo',  save: null },
];

const FEATURES = [
  'AI coach & daily brief',
  'Unlimited workout & food logs',
  'Readiness + recovery tracking',
  'Lab results & biomarker trends',
  'Full data export · CSV + JSON',
];

/**
 * S5_Paywall_A — onboarding trial gate (mobile).
 *
 * Gallery mode:  <S5_Paywall_A dark />
 * Production:    <S5_Paywall_A dark onStartTrial={fn} onRestore={fn} onSkip={fn} platform="native" />
 *
 * Props:
 *   dark          — light/dark variant
 *   onClose       — X button top-left (defaults to onSkip)
 *   onStartTrial  — CTA ({planId}) → start trial flow
 *   onRestore     — restore purchases link
 *   onSkip        — "Not now" / dismiss
 *   platform      — 'native' | 'web' (changes disclaimer copy)
 */
function S5_Paywall_A({ dark = false, onClose, onStartTrial, onRestore, onSkip, platform = 'native' }) {
  const c = useACT(dark);
  const [plan, setPlan] = React.useState('yearly');
  const handleClose = onClose || onSkip;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={handleClose} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
        {onSkip && (
          <button type="button" onClick={onSkip} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ACLabel size={12} color={c.dim}>Not now</ACLabel>
          </button>
        )}
        {!onSkip && <ACLabel size={11} color={c.dim}>Step 3 of 3</ACLabel>}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <HeartMark size={44} color={c.fg} accent={c.accent} />
        <div style={{
          marginTop: 18, fontFamily: ACFonts.display, fontSize: 38, fontWeight: 700,
          letterSpacing: -1.4, lineHeight: 1.05, color: c.fg,
        }}>
          Unlock<br/>your <span style={{ background: c.accent, color: c.ink, padding: '2px 8px', borderRadius: 8 }}>core</span>.
        </div>
        <div style={{ marginTop: 16, fontSize: 15, lineHeight: 1.5, color: c.dim }}>
          3-day free trial. Cancel in one tap. Your data is yours to export forever.
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FEATURES.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: 7, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 14.5, color: c.fg }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PLANS.map(p => {
            const on = p.k === plan;
            return (
              <button key={p.k} type="button" onClick={() => setPlan(p.k)}
                style={{
                  padding: 18, borderRadius: ACRadii.card,
                  border: `2px solid ${on ? c.accent : c.hair}`,
                  background: on ? (dark ? 'rgba(232,181,0,0.08)' : 'rgba(232,181,0,0.1)') : 'transparent',
                  position: 'relative', cursor: 'pointer',
                  width: '100%', textAlign: 'left',
                }}>
                {p.save && <div style={{
                  position: 'absolute', top: -10, right: 14,
                  background: c.accent, color: c.ink, padding: '3px 10px', borderRadius: 6,
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.2,
                }}>{p.save}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: c.fg }}>{p.t}</div>
                    <ACLabel size={11} color={c.dim}>{p.pm}</ACLabel>
                  </div>
                  <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>{p.p}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={() => onStartTrial?.({ planId: plan })}>Start 3-day free trial →</ACBtn>
        <div style={{ textAlign: 'center', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ACLabel size={11} color={c.dim}>
            {platform === 'web'
              ? 'Secure checkout by Stripe · Cancel anytime'
              : 'No charge today · remind before billing'}
          </ACLabel>
          {onRestore && (
            <button type="button" onClick={onRestore} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <ACLabel size={11} color={c.dim} style={{ textDecoration: 'underline' }}>Restore purchases</ACLabel>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default S5_Paywall_A;
