import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono,
} from '../lib/paper.jsx';
import { OnboardingCard, OnboardingHero, OnboardingPrimaryAction, OnboardingShell } from './onboardingShared.jsx';

function TrendIcon({ k, color, size = 28 }) {
  if (k === 'down') return <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 10l8 6 6-4 6 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 20v-6h-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
  if (k === 'up') return <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 20l8-6 6 4 6-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 8v6h-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
  return <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 14h20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 9l5 5-5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

function S8_Onboard_Goal({ dark = false, onBack, onContinue, onChange, value }) {
  const c = useACT(dark);
  const [goal, setGoal] = React.useState(value?.goal || 'recomp');
  const goals = [
    { k: 'lose',     t: 'Lose fat',        d: 'Cut body fat, hold strength',      trend: 'down' },
    { k: 'recomp',   t: 'Recomp',          d: 'Replace fat with muscle',          trend: 'level' },
    { k: 'maintain', t: 'Maintain',        d: 'Hold weight, optimize readiness',  trend: 'level' },
    { k: 'gain',     t: 'Build muscle',    d: 'Lean bulk, track PRs',             trend: 'up' },
  ];
  return (
    <OnboardingShell
      dark={dark}
      step={2}
      total={10}
      onBack={onBack}
      eyebrow="Direction"
      footer={<OnboardingPrimaryAction dark={dark} onClick={onContinue}>Continue →</OnboardingPrimaryAction>}
    >
      <OnboardingHero
        dark={dark}
        label="Your goal"
        title={<>Choose the dominant outcome.</>}
        body="Atlas can only make clean tradeoffs if one direction wins. This sets the bias for calories, recovery, and progression."
        aside={(
          <>
            <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>Focus</ACLabel>
            <div style={{ marginTop: 8, fontSize: 12, color: c.dim, lineHeight: 1.45 }}>One target. Less drift.</div>
          </>
        )}
      />

      <div style={{ display: 'grid', gap: 10 }}>
        {goals.map((g) => {
          const on = goal === g.k;
          return (
            <button
              key={g.k}
              type="button"
              onClick={() => { setGoal(g.k); onChange?.({ goal: g.k }); }}
              style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
            >
              <OnboardingCard dark={dark} accent={on} style={{
                background: on
                  ? (dark ? 'rgba(239,233,218,0.08)' : 'rgba(255,255,255,0.48)')
                  : undefined,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: on ? c.accent : (dark ? 'rgba(239,233,218,0.06)' : 'rgba(10,10,10,0.05)'),
                    color: on ? c.ink : c.fg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <TrendIcon k={g.trend} color={on ? c.ink : c.fg} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 650, letterSpacing: -0.25 }}>{g.t}</div>
                    <div style={{ fontSize: 12, marginTop: 4, color: c.dim, lineHeight: 1.45 }}>{g.d}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <ACMono size={10} color={on ? c.accent : c.mute}>{g.trend.toUpperCase()}</ACMono>
                    <div style={{
                      width: 20,
                      height: 20,
                      marginTop: 7,
                      marginLeft: 'auto',
                      borderRadius: 999,
                      border: `1.5px solid ${on ? c.accent : c.faint}`,
                      background: on ? c.accent : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {on ? (
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <path d="M2 5l2 2 4-4" stroke={c.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </div>
                  </div>
                </div>
              </OnboardingCard>
            </button>
          );
        })}
      </div>
    </OnboardingShell>
  );
}

export default S8_Onboard_Goal;
